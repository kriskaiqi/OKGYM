import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DeepPartial, SelectQueryBuilder, In } from 'typeorm';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { ExerciseRelation, RelationType } from '../models/ExerciseRelation';
import { AppError, ErrorType } from '../utils/errors';
import { cacheMetrics } from '../utils/cache-metrics';
import { SimpleTrack } from '../utils/performance';
import { 
    ExerciseDTO, 
    ExerciseResponseDTO,
    CategoryDTO,
    CategoryResponseDTO,
    EquipmentDTO,
    EquipmentResponseDTO,
    ExerciseRelationDTO,
    ExerciseRelationResponseDTO,
    ExerciseFilterOptions,
    CategoryFilterOptions,
    EquipmentFilterOptions,
    MediaResponseDTO,
    WorkoutExerciseInfo
} from '../dto/ExerciseDTO';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MuscleGroup } from '../models/shared/Validation';
import { cacheManager } from './CacheManager';
import logger from '../utils/logger';
import { ExerciseType } from '../models/shared/Enums';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { QueryBuilderExtensions } from '../utils/QueryBuilderExtensions';
import { DataSource } from 'typeorm';

// Extend the Cache type to include our custom methods
interface CustomCache extends Cache {
  deleteByPattern(pattern: string): Promise<void>;
}

@Injectable()
export class ExerciseService {
    private readonly CACHE_TTL = 3600; // 1 hour in seconds
    private readonly CATEGORY_CACHE_TTL = 7200; // 2 hours in seconds
    private readonly EQUIPMENT_CACHE_TTL = 7200; // 2 hours in seconds
    private readonly MEDIA_CACHE_TTL = 86400; // 24 hours in seconds

    constructor(
        @InjectRepository(Exercise)
        private exerciseRepository: Repository<Exercise>,
        @InjectRepository(ExerciseCategory)
        private categoryRepository: Repository<ExerciseCategory>,
        @InjectRepository(Equipment)
        private equipmentRepository: Repository<Equipment>,
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
        @InjectRepository(ExerciseRelation)
        private relationRepository: Repository<ExerciseRelation>,
        @Inject(CACHE_MANAGER)
        private cacheManager: CustomCache,
        private dataSource: DataSource
    ) {}

    @SimpleTrack({ slowThreshold: 200 })
    async createExercise(exerciseData: ExerciseDTO): Promise<ExerciseResponseDTO> {
        try {
            // Validate input data
            const exercise = this.exerciseRepository.create({
                ...exerciseData,
                types: [exerciseData.type]  // Wrap the type in an array
            });
            await this.validateExercise(exercise);

            // Handle associations
            if (exerciseData.categoryIds) {
                exercise.categories = await this.categoryRepository.findByIds(exerciseData.categoryIds);
            }
            if (exerciseData.equipmentIds) {
                exercise.equipmentOptions = await this.equipmentRepository.findByIds(exerciseData.equipmentIds);
            }
            if (exerciseData.mediaIds) {
                exercise.media = await this.mediaRepository.findByIds(exerciseData.mediaIds);
            }

            // Save exercise
            const savedExercise = await this.exerciseRepository.save(exercise);
            
            // Invalidate cache
            await this.invalidateExerciseCache();
            
            return this.mapToResponseDTO(savedExercise);
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create exercise', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async getExerciseById(id: string): Promise<ExerciseResponseDTO> {
        try {
            // Try to get from cache first
            const cacheKey = `exercise:${id}`;
            const cachedExercise = await this.getFromCache<ExerciseResponseDTO>(cacheKey);
            if (cachedExercise) {
                return cachedExercise;
            }

            // If not in cache, get from database
            const exercise = await this.exerciseRepository.findOne({
                where: { id }
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            try {
                // Load relationships manually using the RelationshipLoader
                const [categories, equipmentOptions, media] = await Promise.all([
                    RelationshipLoader.loadCategoriesForExercise(
                        id, this.categoryRepository
                    ),
                    RelationshipLoader.loadEquipmentForExercise(
                        id, this.equipmentRepository
                    ),
                    RelationshipLoader.loadRelationship(
                        'Exercise', 'media', id, this.mediaRepository
                    )
                ]);
                
                // Add loaded relationships to exercise
                exercise.categories = categories;
                exercise.equipmentOptions = equipmentOptions;
                exercise.media = media;
                
                // Log what we found for debugging
                logger.debug(`Loaded relationships for exercise ${id}:`, {
                    categories: categories.length,
                    equipment: equipmentOptions.length,
                    media: media.length
                });
            } catch (error) {
                logger.error(`Failed to load relationships for exercise ${id}, trying direct query fallback`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                
                try {
                    // Direct query fallback
                    // First try to load categories
                    const categoriesQuery = `
                        SELECT ec.id, ec.name, ec.description, ec.type, ec.is_active
                        FROM exercise_categories ec
                        JOIN exercise_category ec_join ON ec.id = ec_join.category_id
                        WHERE ec_join.exercise_id = $1
                    `;
                    
                    // Direct query for equipment using the exercise_equipment table
                    const equipmentQuery = `
                        SELECT e.id, e.name, e.description, e.category 
                        FROM equipment e
                        JOIN exercise_equipment ee ON e.id = ee.equipment_id
                        WHERE ee.exercise_id = $1
                    `;
                    
                    const [categoriesResult, equipmentResult] = await Promise.all([
                        this.exerciseRepository.query(categoriesQuery, [id]),
                        this.exerciseRepository.query(equipmentQuery, [id])
                    ]);
                    
                    // Map the results to entity-like objects
                    exercise.categories = categoriesResult.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        type: row.type,
                        isActive: row.is_active
                    }));
                    
                    exercise.equipmentOptions = equipmentResult.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        category: row.category
                    }));
                    
                    // For media, use empty array as fallback
                    exercise.media = [];
                    
                    // Log the results of direct queries
                    logger.debug(`Direct query fallback for exercise ${id}:`, {
                        categories: exercise.categories.length,
                        equipment: exercise.equipmentOptions.length
                    });
                } catch (directError) {
                    logger.error(`Direct query fallback also failed for exercise ${id}`, {
                        error: directError instanceof Error ? directError.message : String(directError)
                    });
                    
                    // If all else fails, use empty arrays
                    exercise.categories = [];
                    exercise.equipmentOptions = [];
                    exercise.media = [];
                }
            }

            // Map to response DTO and cache the result
            const responseDTO = this.mapToResponseDTO(exercise);
            await this.setCache(cacheKey, responseDTO);

            return responseDTO;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercise', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async updateExercise(id: string, exerciseData: Partial<ExerciseDTO>): Promise<ExerciseResponseDTO> {
        try {
            const exercise = await this.exerciseRepository.findOne({ where: { id } });
            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Update fields
            Object.assign(exercise, exerciseData);
            await this.validateExercise(exercise);

            // Handle associations
            if (exerciseData.categoryIds) {
                exercise.categories = await this.categoryRepository.findByIds(exerciseData.categoryIds);
            }
            if (exerciseData.equipmentIds) {
                exercise.equipmentOptions = await this.equipmentRepository.findByIds(exerciseData.equipmentIds);
            }
            if (exerciseData.mediaIds) {
                exercise.media = await this.mediaRepository.findByIds(exerciseData.mediaIds);
            }

            // Save updates
            const updatedExercise = await this.exerciseRepository.save(exercise);
            
            // Invalidate cache
            await this.invalidateExerciseCache();
            
            return this.mapToResponseDTO(updatedExercise);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to update exercise', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async deleteExercise(id: string): Promise<void> {
        try {
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id },
                relations: ['workoutExercises']
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Check if exercise is used in any workouts
            if (exercise.workoutExercises && exercise.workoutExercises.length > 0) {
                throw new AppError(ErrorType.BUSINESS_RULE_VIOLATION, 'Cannot delete exercise that is used in workouts', 400);
            }

            await this.exerciseRepository.remove(exercise);
            
            // Invalidate cache
            await this.invalidateExerciseCache();
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to delete exercise', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async getAllExercises(filterOptions?: ExerciseFilterOptions): Promise<[ExerciseResponseDTO[], number]> {
        try {
            // Check if data is in cache
            const cacheKey = `exercises:all:${JSON.stringify(filterOptions || {})}`;
            const cachedData = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
            
            if (cachedData) {
                logger.debug(`Cache hit for getAllExercises with filters ${JSON.stringify(filterOptions)}`);
                return cachedData;
            }

            logger.debug(`Cache miss for getAllExercises with filters ${JSON.stringify(filterOptions)}`);
            
            // Convert string limit/page to numbers if needed
            let page = 1;
            let limit = 20;
            
            if (filterOptions?.page) {
                page = typeof filterOptions.page === 'string' ? 
                    parseInt(filterOptions.page, 10) : filterOptions.page;
                    
                if (isNaN(page) || page < 1) {
                    throw AppError.validation('Invalid page parameter', { page: filterOptions.page });
                }
            }
            
            if (filterOptions?.limit) {
                limit = typeof filterOptions.limit === 'string' ? 
                    parseInt(filterOptions.limit, 10) : filterOptions.limit;
                    
                if (isNaN(limit) || limit < 1) {
                    throw AppError.validation('Invalid limit parameter', { limit: filterOptions.limit });
                }
            }
            
            // Build query
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .skip((page - 1) * limit)
                .take(limit);
                
            // Apply filters
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            
            // Execute query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Load relationships in batch for better performance
            const exerciseIds = exercises.map(ex => ex.id);
            
            try {
                // Try to load relationships in parallel
            const [categoriesMap, equipmentMap, mediaMap] = await Promise.all([
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'categories', exerciseIds, this.categoryRepository
                ),
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'equipmentOptions', exerciseIds, this.equipmentRepository
                ),
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'media', exerciseIds, this.mediaRepository
                )
            ]);
            
            // Assign relationships to each exercise
            exercises.forEach(exercise => {
                exercise.categories = categoriesMap.get(exercise.id) || [];
                exercise.equipmentOptions = equipmentMap.get(exercise.id) || [];
                exercise.media = mediaMap.get(exercise.id) || [];
            });
            } catch (error) {
                logger.error('Failed to load relationships using RelationshipLoader, falling back to direct query', {
                    error: error instanceof Error ? error.message : String(error)
                });
                
                // Direct query fallback for categories
                try {
                    const categoriesQuery = `
                        SELECT e.id as exercise_id, ec.id, ec.name, ec.description, ec.type, ec.is_active
                        FROM exercises e
                        LEFT JOIN exercise_category ec_join ON e.id = ec_join.exercise_id
                        LEFT JOIN exercise_categories ec ON ec_join.category_id = ec.id
                        WHERE e.id IN (${exerciseIds.map(id => `'${id}'`).join(',')})
                    `;
                    
                    const categoriesResult = await this.exerciseRepository.query(categoriesQuery);
                    
                    // Group by exercise_id
                    const categoriesByExercise = new Map();
                    categoriesResult.forEach(row => {
                        if (!row.id) return; // Skip null category entries
                        
                        const exerciseId = row.exercise_id;
                        if (!categoriesByExercise.has(exerciseId)) {
                            categoriesByExercise.set(exerciseId, []);
                        }
                        
                        categoriesByExercise.get(exerciseId).push({
                            id: row.id,
                            name: row.name,
                            description: row.description,
                            type: row.type,
                            isActive: row.is_active
                        });
                    });
                    
                    // Assign categories to exercises
                    exercises.forEach(exercise => {
                        exercise.categories = categoriesByExercise.get(exercise.id) || [];
                    });
                } catch (directError) {
                    logger.error('Direct query fallback also failed, using empty arrays for relationships', {
                        error: directError instanceof Error ? directError.message : String(directError)
                    });
                    
                    // If all else fails, use empty arrays
                    exercises.forEach(exercise => {
                        exercise.categories = [];
                        exercise.equipmentOptions = [];
                        exercise.media = [];
                    });
                }
            }
            
            // Map to response DTOs
            const responseDTOs = exercises.map(ex => this.mapToResponseDTO(ex));
            
            // Cache the result
            const result: [ExerciseResponseDTO[], number] = [responseDTOs, total];
            await this.setCache(cacheKey, result, this.CACHE_TTL);
            
            return result;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Failed to get all exercises', { 
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                filters: filterOptions
            });
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get all exercises', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async createExerciseRelation(relationData: ExerciseRelationDTO): Promise<ExerciseRelationResponseDTO> {
        try {
            // Validate both exercises exist
            const [baseExercise, relatedExercise] = await Promise.all([
                this.exerciseRepository.findOne({ where: { id: relationData.sourceExerciseId as any } as FindOptionsWhere<Exercise> }),
                this.exerciseRepository.findOne({ where: { id: relationData.targetExerciseId as any } as FindOptionsWhere<Exercise> })
            ]);

            if (!baseExercise || !relatedExercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'One or both exercises not found', 404);
            }

            // Create and save relation
            const relation = this.relationRepository.create({
                baseExercise,
                relatedExercise,
                relationType: relationData.type as RelationType,
                notes: relationData.description,
                similarityScore: 1.0 // Default similarity score
            });
            const savedRelation = await this.relationRepository.save(relation);

            // Invalidate cache
            await this.invalidateExerciseCache();

            return this.mapToRelationResponseDTO(savedRelation);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create exercise relation', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async getRelatedExercises(exerciseId: string, relationType?: string): Promise<ExerciseResponseDTO[]> {
        try {
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'related')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId });

            if (relationType) {
                queryBuilder.andWhere('relation.relationType = :type', { type: relationType as RelationType });
            }

            const relations = await queryBuilder.getMany();
            return relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get related exercises', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async removeExerciseRelation(relationId: string): Promise<void> {
        try {
            const relation = await this.relationRepository.findOne({ where: { id: relationId as any } as FindOptionsWhere<ExerciseRelation> });
            if (!relation) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise relation not found', 404);
            }

            await this.relationRepository.remove(relation);
            
            // Invalidate cache
            await this.invalidateExerciseCache();
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to remove exercise relation', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async getExerciseAlternatives(
        exerciseId: string, 
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercise:${exerciseId}:alternatives`;
            
            // Only use cache if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedAlternatives = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedAlternatives) {
                    return cachedAlternatives;
                }
            }
            
            // Check if exercise exists
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>
            });
            
            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            
            // Build query to get alternatives
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'relatedExercise')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId })
                .andWhere('relation.relationType = :relationType', { relationType: RelationType.ALTERNATIVE });
            
            // Add pagination if provided
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            
            const [relations, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            const alternatives = relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
            
            // Cache the result if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, [alternatives, total]);
            }
            
            return [alternatives, total];
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercise alternatives', 500, error);
        }
    }

    @SimpleTrack({ slowThreshold: 200 })
    async getExerciseProgressions(
        exerciseId: string,
        direction?: 'EASIER' | 'HARDER',
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercise:${exerciseId}:progressions:${direction || 'all'}`;
            
            // Only use cache if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedProgressions = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedProgressions) {
                    return cachedProgressions;
                }
            }
            
            // Check if exercise exists
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>
            });
            
            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            
            // Start building the query
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'relatedExercise')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId });
            
            // Filter by relation type based on direction
            if (direction === 'HARDER') {
                queryBuilder.andWhere('relation.relationType = :relationType', { 
                    relationType: RelationType.PROGRESSION 
                });
            } else if (direction === 'EASIER') {
                queryBuilder.andWhere('relation.relationType = :relationType', { 
                    relationType: RelationType.REGRESSION 
                });
            } else {
                // Both directions
                queryBuilder.andWhere('relation.relationType IN (:...relationTypes)', { 
                    relationTypes: [RelationType.PROGRESSION, RelationType.REGRESSION] 
                });
            }
            
            // Add pagination if provided
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            
            const [relations, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            const progressions = relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
            
            // Cache the result if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, [progressions, total]);
            }
            
            return [progressions, total];
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercise progressions', 500, error);
        }
    }

    private async validateExercise(exercise: Exercise): Promise<void> {
        // Add validation logic here
        // This could include checking for required fields, valid relationships, etc.
    }

    /**
     * Map an Exercise entity to an ExerciseResponseDTO
     * @param exercise Exercise entity to map
     * @returns Mapped ExerciseResponseDTO
     */
    mapToResponseDTO(exercise: Exercise): ExerciseResponseDTO {
        // Handle the case where the arrays might be null or undefined
        const primaryMuscles: string[] = exercise.targetMuscleGroups ? 
            exercise.targetMuscleGroups.map(m => String(m)) : [];
        const secondaryMuscles: string[] = exercise.synergistMuscleGroups ? 
            exercise.synergistMuscleGroups.map(m => String(m)) : [];

        // Deep-copy the stats object if it exists and format Date fields as strings
        let formattedStats: any = undefined;
        if (exercise.stats) {
            formattedStats = { 
                duration: { ...exercise.stats.duration },
                calories: { ...exercise.stats.calories },
                completion: { ...exercise.stats.completion },
                rating: { ...exercise.stats.rating },
                popularity: { 
                    ...exercise.stats.popularity,
                    // Safely convert lastUpdated to string regardless of its type
                    lastUpdated: exercise.stats.popularity.lastUpdated ? 
                        (typeof exercise.stats.popularity.lastUpdated === 'object' && 
                         exercise.stats.popularity.lastUpdated instanceof Date ?
                            exercise.stats.popularity.lastUpdated.toISOString() : 
                            String(exercise.stats.popularity.lastUpdated)) : 
                        undefined
                }
            };
        }

        // Map workout exercises if available
        let workoutExerciseInfos: WorkoutExerciseInfo[] | undefined = undefined;
        if (exercise.workoutExercises && exercise.workoutExercises.length > 0) {
            workoutExerciseInfos = exercise.workoutExercises.map(we => ({
                id: we.id,
                workoutPlanId: we.workout_plan_id,
                order: we.order,
                sets: we.sets,
                repetitions: we.repetitions,
                duration: we.duration,
                restTime: we.restTime,
                setType: we.setType,
                exerciseRole: we.exerciseRole,
                intensity: we.intensity,
                notes: we.notes,
                tempo: we.tempo,
                rangeOfMotion: we.rangeOfMotion,
                progressionStrategy: we.progressionStrategy,
                substitutionOptions: we.substitutionOptions,
                createdAt: we.createdAt,
                updatedAt: we.updatedAt
            }));
        }

        const dto: ExerciseResponseDTO = {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            // Use the first available type or default to a valid ExerciseType
            type: (exercise.types && exercise.types.length > 0) ? 
                exercise.types[0] : ExerciseType.STRENGTH_COMPOUND,
            difficulty: exercise.level,
            movementPattern: exercise.movementPattern,
            // Map the relationships to response DTOs
            categories: exercise.categories ? 
                exercise.categories.map(c => ({
                    id: String(c.id),
                    name: c.name,
                    description: c.description,
                    type: c.type,
                    icon: c.icon,
                    color: c.color,
                    displayOrder: c.displayOrder
                })) : [],
            equipment: exercise.equipmentOptions ? 
                exercise.equipmentOptions.map(e => ({
                    id: String(e.id),
                    name: e.name,
                    description: e.description,
                    category: e.category
                })) : [],
            media: exercise.media ? 
                exercise.media.map(m => ({
                    id: String(m.id),
                    type: m.type,
                    url: m.url
                })) : [],
            muscleGroups: {
                primary: primaryMuscles,
                secondary: secondaryMuscles
            },
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            stats: formattedStats,
            // Add newly included fields
            measurementType: exercise.measurementType,
            types: exercise.types,
            trackingFeatures: exercise.trackingFeatures,
            targetMuscleGroups: exercise.targetMuscleGroups ? 
                exercise.targetMuscleGroups.map(m => String(m)) : [],
            synergistMuscleGroups: exercise.synergistMuscleGroups ? 
                exercise.synergistMuscleGroups.map(m => String(m)) : [],
            form: exercise.form,
            aiConfig: exercise.aiConfig,
            workoutExercises: workoutExerciseInfos
        };
        
        return dto;
    }

    mapToRelationResponseDTO(relation: ExerciseRelation): ExerciseRelationResponseDTO {
        return {
            id: relation.id,
            sourceExerciseId: relation.base_exercise_id,
            targetExerciseId: relation.related_exercise_id,
            type: relation.relationType,
            description: relation.notes,
            createdAt: relation.createdAt,
            updatedAt: relation.updatedAt
        };
    }

    // Cache helper methods
    private async getFromCache<T>(key: string): Promise<T | null> {
        const start = Date.now();
        try {
            const value = await this.cacheManager.get<T>(key);
            const duration = Date.now() - start;
            if (value) {
                cacheMetrics.recordHit('exercise', duration);
            } else {
                cacheMetrics.recordMiss('exercise', duration);
            }
            return value;
        } catch (error) {
            cacheMetrics.recordError();
            return null;
        }
    }

    private async setCache(key: string, value: any, ttl: number = this.CACHE_TTL): Promise<void> {
        const start = Date.now();
        try {
            await this.cacheManager.set(key, value, ttl);
            const duration = Date.now() - start;
            cacheMetrics.recordSet(duration);
        } catch (error) {
            // Log but don't throw, as cache errors shouldn't break functionality
            logger.warn('Cache set error', { key, error: error instanceof Error ? error.message : String(error) });
        }
    }

    /**
     * Set a value in cache with custom TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds
     */
    private async setCacheWithTTL(key: string, value: any, ttl: number): Promise<void> {
        const start = Date.now();
        try {
            await this.cacheManager.set(key, value, ttl);
            const duration = Date.now() - start;
            cacheMetrics.recordSet(duration);
        } catch (error) {
            cacheMetrics.recordError();
        }
    }

    private async invalidateExerciseCache(exerciseId?: string): Promise<void> {
        try {
            if (exerciseId) {
                await this.cacheManager.del(`exercise:${exerciseId}`);
                await this.cacheManager.del(`exercise:${exerciseId}:media`);
                await this.cacheManager.del(`exercise:${exerciseId}:alternatives`);
                await this.cacheManager.del(`exercise:${exerciseId}:progressions`);
            }
            await this.cacheManager.deleteByPattern('exercise:*');
            await this.cacheManager.deleteByPattern('exercises:*');
            cacheMetrics.recordDelete(0);
        } catch (error) {
            cacheMetrics.recordError();
        }
    }

    // ============== Category Management ==============

    /**
     * Get all exercise categories with optional filtering and pagination
     * 
     * @param filterOptions Optional filters for categories
     * @returns Array of category DTOs and total count
     */
    @SimpleTrack({ slowThreshold: 100 })
    async getExerciseCategories(filterOptions?: CategoryFilterOptions): Promise<[CategoryResponseDTO[], number]> {
        try {
            // Try to get from cache if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:categories:all';
                const cachedCategories = await this.getFromCache<[CategoryResponseDTO[], number]>(cacheKey);
                if (cachedCategories) {
                    return cachedCategories;
                }
            }

            // Build query with filters
            const queryBuilder = this.categoryRepository.createQueryBuilder('category');

            if (filterOptions) {
                // Apply search filter
                if (filterOptions.search) {
                    queryBuilder.andWhere('category.name ILIKE :search OR category.description ILIKE :search', 
                        { search: `%${filterOptions.search}%` });
                }

                // Apply parent category filter
                if (filterOptions.parentCategoryId) {
                    queryBuilder.andWhere('category.parentCategoryId = :parentId', 
                        { parentId: filterOptions.parentCategoryId });
                }

                // Apply sorting
                if (filterOptions.sortBy) {
                    const order = filterOptions.sortOrder === 'DESC' ? 'DESC' : 'ASC';
                    queryBuilder.orderBy(`category.${filterOptions.sortBy}`, order);
                } else {
                    // Default sorting by display order or name
                    queryBuilder.orderBy('category.displayOrder', 'ASC')
                        .addOrderBy('category.name', 'ASC');
                }

                // Apply pagination
                if (filterOptions.page && filterOptions.limit) {
                    queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                        .take(filterOptions.limit);
                }
            } else {
                // Default sorting
                queryBuilder.orderBy('category.displayOrder', 'ASC')
                    .addOrderBy('category.name', 'ASC');
            }

            // Execute query
            const [categories, total] = await queryBuilder.getManyAndCount();
            
            // Map to DTOs
            const categoryDTOs = categories.map(category => this.mapToCategoryResponseDTO(category));
            
            // Cache results if no filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:categories:all';
                await this.setCache(cacheKey, [categoryDTOs, total]);
            }

            return [categoryDTOs, total];
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercise categories', 500, error);
        }
    }

    /**
     * Get a single exercise category by ID
     * 
     * @param id Category ID
     * @returns Category DTO or null if not found
     */
    @SimpleTrack({ slowThreshold: 100 })
    async getCategoryById(id: string): Promise<CategoryResponseDTO | null> {
        try {
            const cacheKey = `exercise:category:${id}`;
            const cachedCategory = await this.getFromCache<CategoryResponseDTO>(cacheKey);
            if (cachedCategory) {
                return cachedCategory;
            }

            const category = await this.categoryRepository.findOne({ 
                where: { id: id as any } as FindOptionsWhere<ExerciseCategory>
            });
            
            if (!category) {
                return null;
            }
            
            const categoryDTO = this.mapToCategoryResponseDTO(category);
            await this.setCache(cacheKey, categoryDTO);
            
            return categoryDTO;
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get category', 500, error);
        }
    }

    /**
     * Create a new exercise category
     * 
     * @param categoryData Category data
     * @returns Created category DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async createCategory(categoryData: CategoryDTO): Promise<CategoryResponseDTO> {
        try {
            const category = this.categoryRepository.create(categoryData);
            const savedCategory = await this.categoryRepository.save(category);
            
            // Invalidate categories cache
            await this.invalidateCategoryCache();
            
            return this.mapToCategoryResponseDTO(savedCategory);
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create category', 500, error);
        }
    }

    /**
     * Update an existing exercise category
     * 
     * @param id Category ID
     * @param categoryData Updated category data
     * @returns Updated category DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async updateCategory(id: string, categoryData: Partial<CategoryDTO>): Promise<CategoryResponseDTO> {
        try {
            const category = await this.categoryRepository.findOne({ 
                where: { id: id as any } as FindOptionsWhere<ExerciseCategory>
            });
            
            if (!category) {
                throw new AppError(ErrorType.NOT_FOUND, 'Category not found', 404);
            }
            
            Object.assign(category, categoryData);
            const updatedCategory = await this.categoryRepository.save(category);
            
            // Invalidate category cache
            await this.invalidateCategoryCache(id);
            
            return this.mapToCategoryResponseDTO(updatedCategory);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to update category', 500, error);
        }
    }

    /**
     * Delete an exercise category
     * 
     * @param id Category ID
     */
    @SimpleTrack({ slowThreshold: 200 })
    async deleteCategory(id: string): Promise<void> {
        try {
            const category = await this.categoryRepository.findOne({ 
                where: { id: id as any } as FindOptionsWhere<ExerciseCategory>,
                relations: ['exercises'] 
            });
            
            if (!category) {
                throw new AppError(ErrorType.NOT_FOUND, 'Category not found', 404);
            }
            
            // Check if category is used by exercises
            if (category.exercises && category.exercises.length > 0) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Cannot delete category that is used by exercises', 
                    400
                );
            }
            
            await this.categoryRepository.remove(category);
            
            // Invalidate category cache
            await this.invalidateCategoryCache(id);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to delete category', 500, error);
        }
    }

    /**
     * Find exercises by category
     * 
     * @param categoryId Category ID
     * @param filterOptions Optional filters for exercises
     * @returns Array of exercises and total count
     */
    @SimpleTrack({ slowThreshold: 300 })
    async findExercisesByCategory(categoryId: string, options?: ExerciseFilterOptions): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercises:category:${categoryId}:${JSON.stringify(options || {})}`;
            const cachedData = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
            
            if (cachedData) {
                return cachedData;
            }

            // Convert pagination options
            const page = options?.page ? 
                (typeof options.page === 'string' ? parseInt(options.page, 10) : options.page) : 1;
            const limit = options?.limit ?
                (typeof options.limit === 'string' ? parseInt(options.limit, 10) : options.limit) : 20;
            
            // Build query using our extensions
            const queryBuilder = this.exerciseRepository
                .createQueryBuilder('exercise')
                .orderBy('exercise.name', 'ASC')
                .skip((page - 1) * limit)
                .take(limit);
            
            // Use the QueryBuilderExtensions to filter by relationship
            QueryBuilderExtensions.whereHasRelation(
                queryBuilder, 
                'Exercise', 
                'categories',
                categoryId
            );
            
            // Apply additional filters
            if (options?.type) {
                queryBuilder.andWhere('exercise.types @> :type', { type: [options.type] });
            }
            
            if (options?.difficulty) {
                queryBuilder.andWhere('exercise.level = :level', { level: options.difficulty });
            }
            
            if (options?.search) {
                queryBuilder.andWhere(
                    `(exercise.name ILIKE :search OR exercise.description ILIKE :search)`,
                    { search: `%${options.search}%` }
                );
            }
            
            // Execute the query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Load relationships in batch for better performance
            const exerciseIds = exercises.map(ex => ex.id);
            
            // Load relationships in parallel
            const [categoriesMap, equipmentMap, mediaMap] = await Promise.all([
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'categories', exerciseIds, this.categoryRepository
                ),
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'equipmentOptions', exerciseIds, this.equipmentRepository
                ),
                RelationshipLoader.loadRelationshipBatch(
                    'Exercise', 'media', exerciseIds, this.mediaRepository
                )
            ]);
            
            // Assign relationships to each exercise
            exercises.forEach(exercise => {
                exercise.categories = categoriesMap.get(exercise.id) || [];
                exercise.equipmentOptions = equipmentMap.get(exercise.id) || [];
                exercise.media = mediaMap.get(exercise.id) || [];
            });
            
            // Map to response DTOs
            const responseDTOs = exercises.map(ex => this.mapToResponseDTO(ex));
            
            // Cache the results
            const result: [ExerciseResponseDTO[], number] = [responseDTOs, total];
            await this.setCache(cacheKey, result);
            
            return result;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                ErrorType.SERVICE_ERROR, 
                `Failed to find exercises by category: ${error.message}`,
                500,
                error
            );
        }
    }

    // Helper method to map ExerciseCategory to CategoryResponseDTO
    private mapToCategoryResponseDTO(category: ExerciseCategory): CategoryResponseDTO {
        return {
            id: category.id.toString(),
            name: category.name,
            description: category.description,
            type: category.type,
            icon: category.icon,
            color: category.color,
            displayOrder: category.displayOrder
        };
    }

    // Cache invalidation for categories
    private async invalidateCategoryCache(categoryId?: string): Promise<void> {
        try {
            if (categoryId) {
                await this.cacheManager.del(`exercise:category:${categoryId}`);
            }
            await this.cacheManager.del('exercise:categories:*');
            cacheMetrics.recordDelete(0);
        } catch (error) {
            cacheMetrics.recordError();
        }
    }

    // ============== Equipment Integration ==============

    /**
     * Get equipment by ID
     * 
     * @param id Equipment ID
     * @returns Equipment DTO or null if not found
     */
    @SimpleTrack({ slowThreshold: 100 })
    async getEquipmentById(id: string): Promise<EquipmentResponseDTO | null> {
        try {
            // Input validation
            if (!id) {
                logger.warn('Empty equipment ID provided');
                return null;
            }
            
            logger.info(`Getting equipment by ID: ${id}`);
            
            const cacheKey = `exercise:equipment:${id}`;
            const cachedEquipment = await this.getFromCache<EquipmentResponseDTO>(cacheKey);
            if (cachedEquipment) {
                logger.debug(`Returning cached equipment for ID: ${id}`);
                return cachedEquipment;
            }

            // Use a more robust approach with try-catch around the database query
            let equipment;
            try {
                equipment = await this.equipmentRepository.findOne({
                    where: { id: id as any },
                    relations: [
                        'muscleGroupsTargeted',
                        'trainingTypes',
                        'image',
                        'video'
                    ]
                });
            } catch (dbError) {
                logger.error(`Database error fetching equipment ${id}:`, {
                    error: dbError instanceof Error ? dbError.message : String(dbError),
                    stack: dbError instanceof Error ? dbError.stack : undefined
                });
                
                // Try without relations as a fallback
                try {
                    equipment = await this.equipmentRepository.findOne({
                        where: { id: id as any }
                    });
                    logger.info(`Retrieved equipment ${id} without relations as fallback`);
                } catch (fallbackError) {
                    logger.error(`Failed to retrieve equipment ${id} even without relations:`, {
                        error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
                    });
                    throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get equipment: Database error', 500, dbError);
                }
            }

            if (!equipment) {
                logger.warn(`Equipment with ID ${id} not found`);
                return null;
            }

            try {
                const equipmentDTO = this.mapToEquipmentResponseDTO(equipment);
                await this.setCache(cacheKey, equipmentDTO);
                return equipmentDTO;
            } catch (mappingError) {
                logger.error(`Error mapping equipment ${id} to DTO:`, {
                    error: mappingError instanceof Error ? mappingError.message : String(mappingError),
                    stack: mappingError instanceof Error ? mappingError.stack : undefined
                });
                throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to process equipment data', 500, mappingError);
            }
        } catch (error) {
            logger.error(`Error in getEquipmentById for ID ${id}:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            
            // Only throw AppError, convert other errors to AppError
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get equipment', 500, error);
        }
    }

    /**
     * Get all equipment with optional filtering
     * 
     * @param filterOptions Filter options like page, limit, search, sortBy, etc.
     * @returns Array of equipment and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async getAllEquipment(filterOptions?: EquipmentFilterOptions): Promise<[EquipmentResponseDTO[], number]> {
        try {
            logger.debug('Getting all equipment with filters:', filterOptions);
            
            // Only use cache for unfiltered queries
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:equipment:all';
                const cachedEquipment = await this.getFromCache<[EquipmentResponseDTO[], number]>(cacheKey);
                if (cachedEquipment) {
                    logger.debug('Returning cached equipment data', { count: cachedEquipment[0].length });
                    return cachedEquipment;
                }
            }

            // Create query builder - fixing potential join issues
            const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');
            
            // Use leftJoinAndSelect conditionally - only if the relations exist
            try {
                // First check if the equipment entity has these relations
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'muscleGroupsTargeted')) {
                    queryBuilder.leftJoinAndSelect('equipment.muscleGroupsTargeted', 'muscleGroups');
                }
                
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'trainingTypes')) {
                    queryBuilder.leftJoinAndSelect('equipment.trainingTypes', 'trainingTypes');
                }
                
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'media')) {
                    queryBuilder.leftJoinAndSelect('equipment.media', 'media');
                }
            } catch (joinError) {
                logger.warn('Error setting up joins for equipment query', { 
                    error: joinError instanceof Error ? joinError.message : String(joinError)
                });
                // Continue without the problematic joins
            }
                
            logger.debug('Created equipment query builder with joins');

            if (filterOptions) {
                // Apply filters...
                logger.debug('Applying equipment filters', { filters: filterOptions });
                
                // Apply search filter
                if (filterOptions.search) {
                    queryBuilder.andWhere('equipment.name ILIKE :search OR equipment.description ILIKE :search', 
                        { search: `%${filterOptions.search}%` });
                }

                // Apply common equipment filter
                if (filterOptions.isCommon !== undefined) {
                    queryBuilder.andWhere('equipment.isCommon = :isCommon', { isCommon: filterOptions.isCommon });
                }
                
                // Filter by category
                if (filterOptions.category) {
                    queryBuilder.andWhere('equipment.category = :category', { category: filterOptions.category });
                }
                
                // Apply other filters if columns exist
                try {
                    // Only apply filters for columns that exist in the equipment entity
                    const columns = this.equipmentRepository.metadata.columns.map(col => col.propertyName);
                    
                    // Filter by difficulty
                    if (filterOptions.difficulty && columns.includes('difficulty')) {
                        queryBuilder.andWhere('equipment.difficulty = :difficulty', { difficulty: filterOptions.difficulty });
                    }
                    
                    // Filter by cost tier
                    if (filterOptions.costTier && columns.includes('costTier')) {
                        queryBuilder.andWhere('equipment.costTier = :costTier', { costTier: filterOptions.costTier });
                    }
                    
                    // Filter by space required
                    if (filterOptions.spaceRequired && columns.includes('spaceRequired')) {
                        queryBuilder.andWhere('equipment.spaceRequired = :spaceRequired', { spaceRequired: filterOptions.spaceRequired });
                    }
                    
                    // Filter by manufacturer
                    if (filterOptions.manufacturer && columns.includes('manufacturer')) {
                        queryBuilder.andWhere('equipment.manufacturer ILIKE :manufacturer', { manufacturer: `%${filterOptions.manufacturer}%` });
                    }
                } catch (filterError) {
                    logger.warn('Error applying some filters', { 
                        error: filterError instanceof Error ? filterError.message : String(filterError)
                    });
                    // Continue with basic filters only
                }
                
                // Filter by muscle group - only if the join was successful
                if (filterOptions.muscleGroup && queryBuilder.expressionMap.joinAttributes.some(
                    join => join.entityOrProperty === 'equipment.muscleGroupsTargeted'
                )) {
                    try {
                        queryBuilder.andWhere('muscleGroups.name ILIKE :muscleGroup', { muscleGroup: `%${filterOptions.muscleGroup}%` });
                    } catch (muscleGroupError) {
                        logger.warn('Error applying muscle group filter', { 
                            error: muscleGroupError instanceof Error ? muscleGroupError.message : String(muscleGroupError)
                        });
                    }
                }
                
                // Apply sorting
                if (filterOptions.sortBy) {
                    try {
                        const order = filterOptions.sortOrder === 'DESC' ? 'DESC' : 'ASC';
                        queryBuilder.orderBy(`equipment.${filterOptions.sortBy}`, order);
                    } catch (sortError) {
                        logger.warn('Error applying sort', { 
                            error: sortError instanceof Error ? sortError.message : String(sortError)
                        });
                        // Fall back to default sorting
                        queryBuilder.orderBy('equipment.name', 'ASC');
                    }
                } else {
                    // Default sorting by name
                    queryBuilder.orderBy('equipment.name', 'ASC');
                }

                // Apply pagination
                if (filterOptions.page && filterOptions.limit) {
                    queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                        .take(filterOptions.limit);
                }
            } else {
                queryBuilder.orderBy('equipment.name', 'ASC');
            }

            // Execute query
            try {
                const [equipment, total] = await queryBuilder.getManyAndCount();
                logger.debug(`Retrieved ${equipment.length} equipment items out of ${total}`);
                
                if (equipment.length === 0) {
                    logger.warn('No equipment found in database');
                    // Return empty result rather than throwing error
                    return [[], 0];
                }
                
                // Map to DTOs safely
                const equipmentDTOs = equipment.map(eq => this.mapToEquipmentResponseDTO(eq));
                
                // Cache unfiltered results
                if (!filterOptions || Object.keys(filterOptions).length === 0) {
                    const cacheKey = 'exercise:equipment:all';
                    await this.setCache(cacheKey, [equipmentDTOs, total]);
                    logger.debug('Cached equipment results');
                }
                
                return [equipmentDTOs, total];
            } catch (queryError) {
                logger.error('Error executing equipment query', { 
                    error: queryError instanceof Error ? queryError.message : String(queryError),
                    stack: queryError instanceof Error ? queryError.stack : undefined
                });
                
                // Return empty result rather than throwing error
                return [[], 0];
            }
        } catch (error) {
            logger.error('Failed to get equipment', { 
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                filters: filterOptions
            });
            
            // Return empty result rather than throwing error
            return [[], 0];
        }
    }

    /**
     * Create new equipment
     * 
     * @param equipmentData Equipment data
     * @returns Created equipment DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async createEquipment(equipmentData: EquipmentDTO): Promise<EquipmentResponseDTO> {
        try {
            // Create equipment entity with the correct data mapping
            const equipmentEntity: DeepPartial<Equipment> = {
                name: equipmentData.name,
                description: equipmentData.description || '',
                category: equipmentData.category as any,
                // Add any other fields as needed
            };
            
            const equipment = this.equipmentRepository.create(equipmentEntity);
            const savedEquipment = await this.equipmentRepository.save(equipment);
            
            // Invalidate equipment cache
            await this.invalidateEquipmentCache();
            
            return this.mapToEquipmentResponseDTO(savedEquipment);
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create equipment', 500, error);
        }
    }

    /**
     * Update equipment
     * 
     * @param id Equipment ID
     * @param equipmentData Updated equipment data
     * @returns Updated equipment DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async updateEquipment(id: string, equipmentData: Partial<EquipmentDTO>): Promise<EquipmentResponseDTO> {
        try {
            const equipment = await this.equipmentRepository.findOne({ 
                where: { id: id as any } as FindOptionsWhere<Equipment>
            });
            
            if (!equipment) {
                throw new AppError(ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }
            
            Object.assign(equipment, equipmentData);
            const updatedEquipment = await this.equipmentRepository.save(equipment);
            
            // Invalidate equipment cache
            await this.invalidateEquipmentCache(id);
            
            return this.mapToEquipmentResponseDTO(updatedEquipment);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to update equipment', 500, error);
        }
    }

    /**
     * Delete equipment
     * 
     * @param id Equipment ID
     */
    @SimpleTrack({ slowThreshold: 200 })
    async deleteEquipment(id: string): Promise<void> {
        try {
            const equipment = await this.equipmentRepository.findOne({ 
                where: { id: id as any } as FindOptionsWhere<Equipment>,
                relations: ['exercises'] 
            });
            
            if (!equipment) {
                throw new AppError(ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }
            
            // Check if equipment is used by exercises
            if (equipment.exercises && equipment.exercises.length > 0) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Cannot delete equipment that is used by exercises', 
                    400
                );
            }
            
            await this.equipmentRepository.remove(equipment);
            
            // Invalidate equipment cache
            await this.invalidateEquipmentCache(id);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to delete equipment', 500, error);
        }
    }

    /**
     * Find exercises by equipment
     * 
     * @param equipmentId Equipment ID
     * @param filterOptions Optional filters for exercises
     * @returns Array of exercises and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async findExercisesByEquipment(equipmentId: string, filterOptions?: ExerciseFilterOptions): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercises:by-equipment:${equipmentId}`;
            
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }

            const equipment = await this.equipmentRepository.findOne({
                where: { id: equipmentId }
            });

            if (!equipment) {
                throw new AppError(ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }

            // Log more details for debugging
            logger.debug(`Finding exercises for equipment ID: ${equipmentId} (${equipment.name})`);
            
            // Check if the junction table has entries for this equipment
            try {
                const junctionEntries = await this.dataSource.query(
                    `SELECT COUNT(*) as count FROM exercise_equipment WHERE equipment_id = $1`,
                    [equipmentId]
                );
                
                logger.debug(`Found ${junctionEntries[0].count} junction table entries for equipment ${equipment.name}`);
                
                // Build a more reliable queryBuilder
                const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                  .innerJoin(
                    'exercise_equipment', 
                    'ee', 
                    'ee.exercise_id = exercise.id AND ee.equipment_id = :equipmentId', 
                    { equipmentId }
                  );
                
                // Only add joins if we're sure the relations exist
                try {
                  // Check if these relations exist before joining
                  if (this.exerciseRepository.metadata.relations.some(rel => rel.propertyName === 'categories')) {
                    queryBuilder.leftJoinAndSelect('exercise.categories', 'categories');
                  }
                  
                  if (this.exerciseRepository.metadata.relations.some(rel => rel.propertyName === 'media')) {
                    queryBuilder.leftJoinAndSelect('exercise.media', 'media');
                  }
                } catch (joinError) {
                  logger.warn('Error setting up joins for exercise query', {
                    error: joinError instanceof Error ? joinError.message : String(joinError)
                  });
                  // Continue without the problematic joins
                }

                if (filterOptions) {
                    this.applyExerciseFilters(queryBuilder, filterOptions);
                }

                if (filterOptions?.page && filterOptions?.limit) {
                    queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                              .take(filterOptions.limit);
                }

                logger.debug(`Executing query: ${queryBuilder.getSql()}`);
                
                // Execute the query with try/catch for better error handling
                try {
                    const [exercises, total] = await queryBuilder.getManyAndCount();
                    
                    logger.debug(`Found ${exercises.length} exercises for equipment ${equipment.name}`);
                    
                    // Map each exercise to DTO with error handling
                    const mappedExercises: ExerciseResponseDTO[] = [];
                    for (const exercise of exercises) {
                        try {
                            const dto = this.mapToResponseDTO(exercise);
                            mappedExercises.push(dto);
                        } catch (mappingError) {
                            logger.error(`Error mapping exercise ${exercise.id} to DTO:`, mappingError);
                            // Continue with next exercise instead of failing the whole operation
                        }
                    }
                    
                    const result: [ExerciseResponseDTO[], number] = [mappedExercises, total];

                    if (!filterOptions || Object.keys(filterOptions).length === 0) {
                        await this.setCache(cacheKey, result);
                    }

                    return result;
                } catch (queryError) {
                    logger.error(`Error executing exercise query for equipment ${equipmentId}:`, queryError);
                    throw queryError;
                }
            } catch (junctionError) {
                logger.error(`Error querying junction table for equipment ${equipmentId}:`, junctionError);
                throw junctionError;
            }
        } catch (error) {
            logger.error(`Error finding exercises by equipment ${equipmentId}:`, error);
            // Provide more details about the error
            const errorDetails = error instanceof Error 
                ? { 
                    message: error.message, 
                    name: error.name, 
                    stack: error.stack,
                    type: (error as any).type,
                    statusCode: (error as any).statusCode
                  } 
                : String(error);
            
            logger.error(`Detailed error info:`, errorDetails);
            
            throw error instanceof AppError 
                ? error 
                : new AppError(
                    ErrorType.SERVICE_ERROR, 
                    `Failed to find exercises by equipment: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                    500, 
                    error
                  );
        }
    }

    // Helper method to map Equipment to EquipmentResponseDTO
    private mapToEquipmentResponseDTO(equipment: Equipment): EquipmentResponseDTO {
        try {
            if (!equipment) {
                logger.warn('Attempting to map null or undefined equipment to DTO');
                return {
                    id: 'unknown',
                    name: 'Unknown Equipment',
                    description: '',
                    category: 'OTHER'
                };
            }
            
            // Initialize image and video URLs
            let imageUrl: string | undefined;
            let videoUrl: string | undefined;
            let mediaItems: any[] = [];
            
            // Handle image relationship safely
            try {
                if (equipment.image && equipment.image.url) {
                    imageUrl = equipment.image.url;
                } else if ((equipment as any).image_id) {
                    // If we have an image ID but no loaded relationship
                    logger.debug(`Equipment ${equipment.id} has image_id but no loaded image relation`);
                }
            } catch (imageError) {
                logger.warn(`Error accessing image in equipment ${equipment.id}:`, {
                    error: imageError instanceof Error ? imageError.message : String(imageError)
                });
            }
            
            // Handle video relationship safely
            try {
                if (equipment.video && equipment.video.url) {
                    videoUrl = equipment.video.url;
                } else if ((equipment as any).video_id) {
                    // If we have a video ID but no loaded relationship
                    logger.debug(`Equipment ${equipment.id} has video_id but no loaded video relation`);
                }
            } catch (videoError) {
                logger.warn(`Error accessing video in equipment ${equipment.id}:`, {
                    error: videoError instanceof Error ? videoError.message : String(videoError)
                });
            }
            
            // Process media array and include it in the response
            try {
                // Check if there's a media property with media items
                const media = (equipment as any).media;
                if (media && Array.isArray(media) && media.length > 0) {
                    mediaItems = media.map(m => ({
                        id: m.id,
                        type: m.type,
                        context: m.context,
                        url: m.url,
                        thumbnailUrl: m.thumbnailUrl,
                        isPrimary: m.isPrimary || false,
                        displayOrder: m.displayOrder || 0
                    }));
                    
                    // Also set imageUrl and videoUrl if not already set
                    if (!imageUrl) {
                        const image = media.find(m => m && m.type === 'IMAGE');
                        if (image && image.url) imageUrl = image.url;
                    }
                    
                    if (!videoUrl) {
                        const video = media.find(m => m && m.type === 'VIDEO');
                        if (video && video.url) videoUrl = video.url;
                    }
                    
                    logger.debug(`Found ${mediaItems.length} media items for equipment ${equipment.id}`);
                }
            } catch (mediaError) {
                logger.warn(`Error accessing media array in equipment ${equipment.id}:`, {
                    error: mediaError instanceof Error ? mediaError.message : String(mediaError)
                });
            }
            
            // Safely handle muscle groups
            let muscleGroups: any[] = [];
            try {
                if (equipment.muscleGroupsTargeted && Array.isArray(equipment.muscleGroupsTargeted)) {
                    muscleGroups = equipment.muscleGroupsTargeted
                        .filter(mg => mg && mg.id) // Ensure valid entries only
                        .map(mg => ({
                            id: String(mg.id),
                            name: mg.name || 'Unknown Muscle',
                            description: mg.description || '',
                            type: mg.type || 'OTHER'
                        }));
                }
            } catch (muscleGroupError) {
                logger.warn(`Error mapping muscle groups in equipment ${equipment.id}:`, {
                    error: muscleGroupError instanceof Error ? muscleGroupError.message : String(muscleGroupError)
                });
            }
                
            // Safely handle training types
            let trainingTypes: any[] = [];
            try {
                if ((equipment as any).trainingTypes && Array.isArray((equipment as any).trainingTypes)) {
                    trainingTypes = (equipment as any).trainingTypes
                        .filter((tt: any) => tt && tt.id) // Ensure valid entries only
                        .map((tt: any) => ({
                            id: String(tt.id),
                            name: tt.name || 'Unknown Type'
                        }));
                }
            } catch (trainingTypesError) {
                logger.warn(`Error mapping training types in equipment ${equipment.id}:`, {
                    error: trainingTypesError instanceof Error ? trainingTypesError.message : String(trainingTypesError)
                });
            }
            
            // Create the DTO with only guaranteed properties
            const dto: EquipmentResponseDTO = {
                id: String(equipment.id),
                name: equipment.name || 'Unnamed Equipment',
                description: equipment.description || '',
                category: equipment.category || 'OTHER'
            };
            
            // Conditionally add optional properties
            if (muscleGroups.length > 0) dto.muscleGroupsTargeted = muscleGroups;
            if (trainingTypes.length > 0) dto.trainingTypes = trainingTypes;
            if (imageUrl) dto.imageUrl = imageUrl;
            if (videoUrl) dto.videoUrl = videoUrl;
            if (mediaItems.length > 0) dto.media = mediaItems;
            
            // Handle scalar properties with safe validation
            if (equipment.difficulty) dto.difficulty = equipment.difficulty;
            if (equipment.costTier) dto.costTier = equipment.costTier;
            if (equipment.spaceRequired) dto.spaceRequired = equipment.spaceRequired;
            if (equipment.manufacturer) dto.manufacturer = equipment.manufacturer;
            if (equipment.purchaseUrl) dto.purchaseUrl = equipment.purchaseUrl;
            if (equipment.estimatedPrice !== undefined && equipment.estimatedPrice !== null) {
                dto.estimatedPrice = equipment.estimatedPrice;
            }
            
            // Handle complex objects with safe validation
            if (equipment.specifications && typeof equipment.specifications === 'object') {
                dto.specifications = equipment.specifications;
            } else if (typeof equipment.specifications === 'string') {
                try {
                    dto.specifications = JSON.parse(equipment.specifications);
                } catch (jsonError) {
                    logger.warn(`Failed to parse specifications JSON for equipment ${equipment.id}`);
                }
            }
            
            if (equipment.alternatives && typeof equipment.alternatives === 'object') {
                dto.alternatives = equipment.alternatives;
            } else if (typeof equipment.alternatives === 'string') {
                try {
                    dto.alternatives = JSON.parse(equipment.alternatives);
                } catch (jsonError) {
                    logger.warn(`Failed to parse alternatives JSON for equipment ${equipment.id}`);
                }
            }
            
            if (equipment.createdAt) dto.createdAt = equipment.createdAt;
            if (equipment.updatedAt) dto.updatedAt = equipment.updatedAt;
            
            return dto;
        } catch (error) {
            logger.error(`Error mapping equipment to DTO:`, {
                equipmentId: equipment?.id,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            
            // Return minimal valid DTO rather than throwing
            return {
                id: equipment?.id ? String(equipment.id) : 'error',
                name: equipment?.name || 'Error Equipment',
                description: equipment?.description || 'An error occurred while loading this equipment',
                category: equipment?.category || 'OTHER'
            };
        }
    }

    // Cache invalidation for equipment
    private async invalidateEquipmentCache(equipmentId?: string): Promise<void> {
        try {
            if (equipmentId) {
                await this.cacheManager.del(`exercise:equipment:${equipmentId}`);
            }
            await this.cacheManager.del('exercise:equipment:*');
            cacheMetrics.recordDelete(0);
        } catch (error) {
            cacheMetrics.recordError();
        }
    }

    // ============== Media Management ==============

    /**
     * Attach media to an exercise
     * 
     * @param exerciseId Exercise ID
     * @param mediaId Media ID
     * @returns Updated exercise DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async attachMediaToExercise(exerciseId: string, mediaId: string): Promise<ExerciseResponseDTO> {
        try {
            // Validate both exercise and media exist
            const [exercise, media] = await Promise.all([
                this.exerciseRepository.findOne({ 
                    where: { id: exerciseId as any } as FindOptionsWhere<Exercise>,
                    relations: ['media'] 
                }),
                this.mediaRepository.findOne({ 
                    where: { id: mediaId as any } as FindOptionsWhere<Media>
                })
            ]);

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            if (!media) {
                throw new AppError(ErrorType.NOT_FOUND, 'Media not found', 404);
            }

            // Check if media is already attached
            if (exercise.media && exercise.media.some(m => m.id === mediaId)) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Media is already attached to this exercise', 
                    400
                );
            }

            // Initialize media array if it doesn't exist
            if (!exercise.media) {
                exercise.media = [];
            }

            // Attach media to the exercise
            exercise.media.push(media);
            const updatedExercise = await this.exerciseRepository.save(exercise);

            // Invalidate cache
            await this.invalidateExerciseCache(exerciseId);

            return this.mapToResponseDTO(updatedExercise);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to attach media to exercise', 500, error);
        }
    }

    /**
     * Detach media from an exercise
     * 
     * @param exerciseId Exercise ID
     * @param mediaId Media ID
     * @returns Updated exercise DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async detachMediaFromExercise(exerciseId: string, mediaId: string): Promise<ExerciseResponseDTO> {
        try {
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>,
                relations: ['media'] 
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Check if media is attached
            if (!exercise.media || !exercise.media.some(m => m.id === mediaId)) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Media is not attached to this exercise', 
                    400
                );
            }

            // Remove media from exercise
            exercise.media = exercise.media.filter(m => m.id !== mediaId);
            const updatedExercise = await this.exerciseRepository.save(exercise);

            // Invalidate cache
            await this.invalidateExerciseCache(exerciseId);

            return this.mapToResponseDTO(updatedExercise);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to detach media from exercise', 500, error);
        }
    }

    /**
     * Get all media attached to an exercise
     * 
     * @param exerciseId Exercise ID
     * @returns Array of media DTOs
     */
    @SimpleTrack({ slowThreshold: 100 })
    async getExerciseMedia(exerciseId: string): Promise<MediaResponseDTO[]> {
        try {
            const cacheKey = `exercise:${exerciseId}:media`;
            const cachedMedia = await this.getFromCache<MediaResponseDTO[]>(cacheKey);
            if (cachedMedia) {
                return cachedMedia;
            }

            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>,
                relations: ['media'] 
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Map media entities to DTOs
            const mediaList = exercise.media ? exercise.media.map(m => this.mapToMediaResponseDTO(m)) : [];
            
            // Cache the result
            await this.setCache(cacheKey, mediaList);

            return mediaList;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercise media', 500, error);
        }
    }

    /**
     * Update the display order of media attached to an exercise
     * 
     * @param exerciseId Exercise ID
     * @param mediaOrder Array of media IDs in the desired order
     * @returns Updated exercise DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async updateExerciseMediaOrder(exerciseId: string, mediaOrder: string[]): Promise<ExerciseResponseDTO> {
        try {
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>,
                relations: ['media'] 
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Verify all media exist and are attached to the exercise
            if (!exercise.media || exercise.media.length === 0) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Exercise has no media attached', 
                    400
                );
            }

            // Check if all provided media IDs belong to the exercise
            const exerciseMediaIds = exercise.media.map(m => m.id);
            const invalidMediaIds = mediaOrder.filter(id => !exerciseMediaIds.includes(id));
            
            if (invalidMediaIds.length > 0) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    `Media IDs not attached to exercise: ${invalidMediaIds.join(', ')}`, 
                    400
                );
            }

            // Reorder media based on provided order
            const orderedMedia = mediaOrder.map(id => exercise.media.find(m => m.id === id));
            
            // Add any media that wasn't in the order array at the end
            exercise.media.forEach(media => {
                if (!mediaOrder.includes(media.id)) {
                    orderedMedia.push(media);
                }
            });

            // Update exercise with new media order
            exercise.media = orderedMedia as Media[];
            const updatedExercise = await this.exerciseRepository.save(exercise);

            // Invalidate cache
            await this.invalidateExerciseCache(exerciseId);

            return this.mapToResponseDTO(updatedExercise);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to update exercise media order', 500, error);
        }
    }

    /**
     * Set the primary media for an exercise
     * 
     * @param exerciseId Exercise ID
     * @param mediaId Media ID to set as primary
     * @returns Updated exercise DTO
     */
    @SimpleTrack({ slowThreshold: 200 })
    async setPrimaryExerciseMedia(exerciseId: string, mediaId: string): Promise<ExerciseResponseDTO> {
        try {
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: exerciseId as any } as FindOptionsWhere<Exercise>,
                relations: ['media'] 
            });

            if (!exercise) {
                throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }

            // Verify the media exists and is attached to the exercise
            if (!exercise.media || !exercise.media.some(m => m.id === mediaId)) {
                throw new AppError(
                    ErrorType.BUSINESS_RULE_VIOLATION, 
                    'Media is not attached to this exercise', 
                    400
                );
            }

            // Set primary media
            // Find the media to set as primary
            const primaryMedia = exercise.media.find(m => m.id === mediaId);

            // Reorder media to put primary first
            const otherMedia = exercise.media.filter(m => m.id !== mediaId);
            exercise.media = [primaryMedia as Media, ...otherMedia];

            const updatedExercise = await this.exerciseRepository.save(exercise);

            // Invalidate cache
            await this.invalidateExerciseCache(exerciseId);

            return this.mapToResponseDTO(updatedExercise);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to set primary exercise media', 500, error);
        }
    }

    // Helper method to map Media to MediaResponseDTO
    private mapToMediaResponseDTO(media: Media): MediaResponseDTO {
        return {
            id: String(media.id),
            type: media.type,
            url: media.url
        };
    }

    // ============== Advanced Search Methods ==============

    /**
     * Search exercises by keyword
     * 
     * @param searchQuery Search query string
     * @param filterOptions Additional filter options
     * @returns Array of exercises matching the search criteria and total count
     */
    @SimpleTrack({ slowThreshold: 300 })
    async searchExercises(
        searchQuery: string,
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            // Don't cache search results for flexibility
            
            // Start building the query
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise');
            
            // Remove problematic leftJoinAndSelect calls
            
            // Apply search filter using ILIKE for case-insensitive search
            queryBuilder.where('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
                { search: `%${searchQuery}%` });
            
            // Apply additional filters
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            
            // Apply pagination
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            } else {
                // Default pagination
                queryBuilder.take(20);
            }
            
            // Execute query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            return [exercises.map(exercise => this.mapToResponseDTO(exercise)), total];
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to search exercises', 500, error);
        }
    }

    /**
     * Get exercises by muscle group
     * 
     * @param muscleGroup Muscle group name
     * @param filterOptions Additional filter options
     * @returns Array of exercises targeting the muscle group and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async getExercisesByMuscleGroup(
        muscleGroup: string,
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercise:muscle:${muscleGroup}`;
            
            // Only use cache if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            
            // Start building the query
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .innerJoin('exercise.categories', 'targetCategory', 'targetCategory.name = :muscleGroup', { muscleGroup });
            
            // Remove problematic leftJoinAndSelect calls
            
            // Apply additional filters
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            
            // Apply pagination
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            
            // Execute query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            const result: [ExerciseResponseDTO[], number] = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)), 
                total
            ];
            
            // Cache the result if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercises by muscle group', 500, error);
        }
    }

    /**
     * Get exercises by difficulty level
     * 
     * @param difficulty Difficulty level
     * @param filterOptions Additional filter options
     * @returns Array of exercises with the specified difficulty and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async getExercisesByDifficulty(
        difficulty: string,
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercise:difficulty:${difficulty}`;
            
            // Only use cache if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            
            // Start building the query
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .where('exercise.level = :difficulty', { difficulty });
            
            // Remove problematic leftJoinAndSelect calls
            
            // Apply additional filters
            if (filterOptions) {
                // Avoid applying difficulty filter again
                const { difficulty: _, ...otherFilters } = filterOptions;
                this.applyExerciseFilters(queryBuilder, otherFilters);
            }
            
            // Apply pagination
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            
            // Execute query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            const result: [ExerciseResponseDTO[], number] = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)), 
                total
            ];
            
            // Cache the result if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercises by difficulty', 500, error);
        }
    }

    /**
     * Get exercises by movement pattern
     * 
     * @param movementPattern Movement pattern
     * @param filterOptions Additional filter options
     * @returns Array of exercises with the specified movement pattern and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async getExercisesByMovementPattern(
        movementPattern: string,
        filterOptions?: ExerciseFilterOptions
    ): Promise<[ExerciseResponseDTO[], number]> {
        try {
            const cacheKey = `exercise:movement:${movementPattern}`;
            
            // Only use cache if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache<[ExerciseResponseDTO[], number]>(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            
            // Start building the query
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .where('exercise.movementPattern = :pattern', { pattern: movementPattern });
            
            // Remove problematic leftJoinAndSelect calls
            
            // Apply additional filters
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            
            // Apply pagination
            if (filterOptions?.page && filterOptions?.limit) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            
            // Execute query
            const [exercises, total] = await queryBuilder.getManyAndCount();
            
            // Map to response DTOs
            const result: [ExerciseResponseDTO[], number] = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)), 
                total
            ];
            
            // Cache the result if no extra filters
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to get exercises by movement pattern', 500, error);
        }
    }

    /**
     * Get popular exercises based on usage in workouts
     * 
     * @param limit Maximum number of exercises to return (default: 10)
     * @returns Array of popular exercises and total count
     */
    @SimpleTrack({ slowThreshold: 200 })
    async getPopularExercises(limit: number = 10): Promise<ExerciseResponseDTO[]> {
        const cacheKey = `exercises:popular:${limit}`;
        
        // Try to get from cache first
        const cachedExercises = await this.cacheManager.get<ExerciseResponseDTO[]>(cacheKey);
        if (cachedExercises) {
            return cachedExercises;
        }

        // Get exercises from database
        const exercises = await this.exerciseRepository.find({
            take: limit,
            order: {
                stats: {
                    popularity: {
                        score: 'DESC'
                    }
                }
            }
        });

        // Map to DTOs
        const exerciseDTOs = exercises.map(exercise => this.mapToResponseDTO(exercise));

        // Cache the results
        await this.cacheManager.set(cacheKey, exerciseDTOs, 3600); // Cache for 1 hour

        return exerciseDTOs;
    }

    /**
     * Extract error details from database errors
     * 
     * @param error Database error
     * @returns Standardized error details
     */
    private extractDatabaseErrorDetails(error: any): any {
        // Handle common database errors
        const details: any = {
            originalError: error.name || 'DatabaseError'
        };
        
        // Extract constraint violation details (PostgreSQL-specific)
        if (error.code === '23505') { // Unique violation
            details.constraint = error.constraint;
            details.type = 'UniqueViolation';
            details.message = 'A record with this data already exists';
        }
        
        // Extract foreign key violation details
        if (error.code === '23503') { // Foreign key violation
            details.constraint = error.constraint;
            details.type = 'ForeignKeyViolation';
            details.message = 'Referenced record does not exist';
        }
        
        return details;
    }

    // Add this helper method back in a modified form
    private applyExerciseFilters(
        queryBuilder: SelectQueryBuilder<Exercise>,
        filterOptions: ExerciseFilterOptions
    ): void {
        // Apply type filter
        if (filterOptions.type) {
            queryBuilder.andWhere('exercise.types @> :type', { 
                type: [filterOptions.type] 
            });
        }
        
        // Apply difficulty filter
        if (filterOptions.difficulty) {
            queryBuilder.andWhere('exercise.level = :difficulty', { 
                difficulty: filterOptions.difficulty 
            });
        }
        
        // Apply equipment filter using QueryBuilderExtensions
        if (filterOptions.equipment) {
            QueryBuilderExtensions.whereHasRelation(
                queryBuilder,
                'Exercise',
                'equipmentOptions',
                filterOptions.equipment
            );
        }
        
        // Apply category filter by ID or array of IDs
        if (filterOptions.categoryIds && filterOptions.categoryIds.length > 0) {
            logger.debug('Filtering exercises by category IDs', { categoryIds: filterOptions.categoryIds });
            
            queryBuilder.innerJoin(
                'exercise_category',
                'ec',
                'ec.exercise_id = exercise.id'
            ).andWhere('ec.category_id IN (:...categoryIds)', {
                categoryIds: filterOptions.categoryIds
            });
        }
        
        // Apply category filter by name
        if (filterOptions.category) {
            logger.debug('Filtering exercises by category name', { category: filterOptions.category });
            
            queryBuilder.innerJoin(
                'exercise_category',
                'ec',
                'ec.exercise_id = exercise.id'
            ).innerJoin(
                'exercise_categories',
                'cats',
                'cats.id = ec.category_id'
            ).andWhere('LOWER(cats.name) = LOWER(:category)', {
                category: filterOptions.category
            });
        }
        
        // Apply muscle group filter 
        if (filterOptions.muscleGroup) {
            // Either use the column directly if it exists
            if (queryBuilder.expressionMap.mainAlias?.metadata?.findColumnWithPropertyName('targetMuscleGroups')) {
                queryBuilder.andWhere('exercise.targetMuscleGroups LIKE :muscleGroup', { 
                    muscleGroup: `%${filterOptions.muscleGroup}%` 
                });
            } else {
                // Or find categories that match this muscle group and filter by those
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from(ExerciseCategory, 'cat')
                        .innerJoin('exercise_categories_join', 'ecj', 'ecj.category_id = cat.id')
                        .where('ecj.exercise_id = exercise.id')
                        .andWhere('cat.muscleGroup = :muscleGroup', { muscleGroup: filterOptions.muscleGroup });
                    return 'EXISTS ' + subQuery.getQuery();
                });
            }
        }
        
        // Apply search filter
        if (filterOptions.search) {
            queryBuilder.andWhere('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
                { search: `%${filterOptions.search}%` });
        }
        
        // Default sorting by name
        queryBuilder.orderBy('exercise.name', 'ASC');
    }
} 
