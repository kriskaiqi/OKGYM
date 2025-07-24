import { FindManyOptions, In, Like, Raw } from 'typeorm';
import { Exercise } from '../models/Exercise';
import { 
    Difficulty as ExerciseDifficulty, 
    MovementPattern, 
    MeasurementType,
    TrackingFeature,
    ExerciseType
} from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import logger from '../utils/logger';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { RelationType } from '../models/ExerciseRelation';
import { createQueryOptions, addWhereCondition, addOrderBy, createRawQuery } from '../utils/typeorm-helpers';

/**
 * Filter options for querying exercises
 */
export interface ExerciseFilters {
    // Core filters
    difficulty?: ExerciseDifficulty;
    muscleGroups?: string[];
    movementPattern?: MovementPattern;
    exerciseTypes?: ExerciseType[];
    measurementType?: MeasurementType;
    trackingFeatures?: TrackingFeature[];
    equipmentIds?: string[];
    categoryIds?: string[];
    
    // Search
    searchTerm?: string;
    
    // Related exercises
    includeVariations?: boolean;
    includeAlternatives?: boolean;
    includeProgressions?: boolean;
    includeRegressions?: boolean;
    
    // Relations to include
    includeEquipment?: boolean;
    includeCategories?: boolean;
    includeMedia?: boolean;
    includeDetails?: boolean;
    includeMetrics?: boolean;
    includeFeedback?: boolean;
    
    // Pagination
    limit?: number;
    offset?: number;
    
    // Sorting
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Cache key generation for Exercise repository
 */
class ExerciseCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: ExerciseFilters): string {
        const keyParts = ['exercises:filters'];
        
        // Add filter properties to key
        if (filters.difficulty) keyParts.push(`diff:${filters.difficulty}`);
        if (filters.movementPattern) keyParts.push(`mp:${filters.movementPattern}`);
        if (filters.measurementType) keyParts.push(`mt:${filters.measurementType}`);
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add array properties
        if (filters.categoryIds?.length) keyParts.push(`cats:${filters.categoryIds.sort().join(',')}`);
        if (filters.equipmentIds?.length) keyParts.push(`equip:${filters.equipmentIds.sort().join(',')}`);
        if (filters.muscleGroups?.length) keyParts.push(`musc:${filters.muscleGroups.sort().join(',')}`);
        if (filters.exerciseTypes?.length) keyParts.push(`types:${filters.exerciseTypes.sort().join(',')}`);
        if (filters.trackingFeatures?.length) keyParts.push(`track:${filters.trackingFeatures.sort().join(',')}`);
        
        // Add relation inclusion flags
        if (filters.includeVariations) keyParts.push('incl:variations');
        if (filters.includeAlternatives) keyParts.push('incl:alternatives');
        if (filters.includeProgressions) keyParts.push('incl:progressions');
        if (filters.includeRegressions) keyParts.push('incl:regressions');
        if (filters.includeEquipment) keyParts.push('incl:equipment');
        if (filters.includeCategories) keyParts.push('incl:categories');
        if (filters.includeMedia) keyParts.push('incl:media');
        if (filters.includeDetails) keyParts.push('incl:details');
        if (filters.includeMetrics) keyParts.push('incl:metrics');
        if (filters.includeFeedback) keyParts.push('incl:feedback');
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single exercise
     */
    static forExercise(id: string, relations: string[] = []): string {
        if (relations.length === 0) return `exercise:${id}`;
        return `exercise:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for related exercises
     */
    static forRelatedExercises(id: string, relationType: RelationType): string {
        return `exercise:${id}:related:${relationType}`;
    }
    
    /**
     * Generate cache key for popular exercises
     */
    static forPopular(limit: number): string {
        return `exercises:popular:${limit}`;
    }
}

/**
 * Specialized repository for Exercise entity
 * Implements best practices for caching, performance, and domain-specific queries
 */
export class ExerciseRepository extends GenericRepository<Exercise> {
    private cacheTTL: number;
    
    constructor() {
        super(Exercise);
        this.cacheTTL = config.cache?.ttl?.exercise || 3600; // 1 hour default
    }

    /**
     * Find exercises with detailed filtering options
     */
    async findWithFilters(filters: ExerciseFilters): Promise<[Exercise[], number]> {
        // Generate cache key based on filters
        const cacheKey = ExerciseCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[Exercise[], number]>(cacheKey);
        if (cached) {
            logger.debug(`Returning cached exercises for filters`, { filters });
            return cached;
        }
        
        try {
            // Create base query with helper function
            const query = createQueryOptions<Exercise>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply filtering conditions using type-safe helpers
            if (filters.difficulty) {
                addWhereCondition(query, "level", filters.difficulty);
            }
            
            if (filters.movementPattern) {
                addWhereCondition(query, "movementPattern", filters.movementPattern);
            }
            
            if (filters.measurementType) {
                addWhereCondition(query, "measurementType", filters.measurementType);
            }
            
            if (filters.exerciseTypes?.length) {
                // For array types, we need a different approach using createRawQuery
                addWhereCondition(query, "types", createRawQuery(
                    alias => `${alias} && ARRAY[:...types]::text[]`,
                    { types: filters.exerciseTypes }
                ));
            }
            
            // Apply search term to name and description
            if (filters.searchTerm) {
                addWhereCondition(query, "name", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            // Handle related entity filtering (equipment, categories)
            if (filters.equipmentIds?.length) {
                // Add a join condition for equipment
                // This requires a custom query addition since it's for a many-to-many relation
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT e.id FROM exercises e
                        JOIN exercise_equipment ee ON e.id = ee.exercise_id
                        WHERE ee.equipment_id IN (:...equipmentIds)
                    )`,
                    { equipmentIds: filters.equipmentIds }
                ));
            }
            
            // Handle category filtering with proper type conversion
            if (filters.categoryIds?.length) {
                // Convert all IDs to numbers since category_id is integer type
                const numericCategoryIds = filters.categoryIds.map(id => {
                    // Handle string IDs by converting to number
                    return typeof id === 'string' ? parseInt(id, 10) : id;
                }).filter(id => !isNaN(id)); // Filter out any invalid conversions
                
                if (numericCategoryIds.length > 0) {
                    logger.debug('Filtering exercises by categories', { categoryIds: numericCategoryIds });
                    
                    addWhereCondition(
                        query,
                        "id",
                        createRawQuery(
                            alias => `${alias} IN (
                            SELECT e.id FROM exercises e
                            JOIN exercise_category ecm ON e.id = ecm.exercise_id
                            WHERE ecm.category_id IN (:...categoryIds)
                        )`,
                            { categoryIds: numericCategoryIds }
                        )
                    );
                }
            }
            
            // Apply sorting
            this.applySorting(query, filters);
            
            // Execute query
            const [exercises, total] = await this.repository.findAndCount(query);
            
            // Cache results
            await cacheManager.set(cacheKey, [exercises, total], { ttl: this.cacheTTL });
            
            return [exercises, total];
        } catch (error) {
            logger.error(`Error finding exercises with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Override findById to implement caching
     */
    async findById(id: string, relations: string[] = []): Promise<Exercise | null> {
        // Generate cache key
        const cacheKey = ExerciseCacheKeys.forExercise(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Exercise>(cacheKey);
        if (cached) {
            logger.debug('Exercise detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const exercise = await this.repository.findOne({
            where: { id } as any,
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in ExerciseRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the exercise
        if (exercise) {
            await cacheManager.set(cacheKey, exercise, { ttl: this.cacheTTL });
        }
        
        return exercise;
    }

    /**
     * Find related exercises (variations, alternatives, progressions, regressions)
     */
    async findRelatedExercises(id: string, relationType: RelationType): Promise<Exercise[]> {
        // Generate cache key
        const cacheKey = ExerciseCacheKeys.forRelatedExercises(id, relationType);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Exercise[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Not in cache, need to load the exercise and use the model's method
        const exercise = await this.findById(id, ['relationsFrom', 'relationsTo']);
        
        if (!exercise) {
            return [];
        }
        
        // Use the model's method to get related exercises
        const relatedExercises = await exercise.getRelatedExercises(relationType);
        
        // Cache the result
        await cacheManager.set(cacheKey, relatedExercises, { ttl: this.cacheTTL });
        
        return relatedExercises;
    }

    /**
     * Find popular exercises
     */
    async findPopularExercises(limit: number = 10): Promise<Exercise[]> {
        // Generate cache key
        const cacheKey = ExerciseCacheKeys.forPopular(limit);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Exercise[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Query for exercises ordered by popularity score
        const exercises = await this.repository.find({
            where: {} as any,
            order: { 
                // Using Raw query to sort by JSONB field
                stats: Raw(alias => `${alias}->>'popularity'->>'score' DESC`) as any
            },
            take: limit,
            relations: ['equipmentOptions', 'categories', 'media']
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, exercises, { ttl: this.cacheTTL });
        
        return exercises;
    }

    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<Exercise>): Promise<Exercise> {
        const exercise = await super.create(data);
        await this.invalidateExerciseCaches();
        return exercise;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: string, data: Partial<Exercise>): Promise<Exercise | null> {
        const exercise = await super.update(id, data);
        if (exercise) {
            await this.invalidateExerciseCache(id);
            await this.invalidateExerciseCaches();
        }
        return exercise;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: string): Promise<any> {
        const result = await super.delete(id);
        await this.invalidateExerciseCache(id);
        await this.invalidateExerciseCaches();
        return result;
    }

    /**
     * Update exercise statistics
     */
    async updateStats(id: string, statsUpdate: Partial<any>): Promise<Exercise | null> {
        // Get current exercise
        const exercise = await this.findById(id);
        
        if (!exercise) {
            return null;
        }
        
        // Merge the stats update with existing stats
        const updatedStats = {
            ...exercise.stats,
            ...statsUpdate
        };
        
        // Update the exercise
        return this.update(id, { stats: updatedStats });
    }

    /**
     * Invalidate cache for a specific exercise
     */
    private async invalidateExerciseCache(id: string): Promise<void> {
        await cacheManager.deleteByPattern(`exercise:${id}*`);
        logger.debug(`Invalidated cache for exercise: ${id}`);
    }

    /**
     * Invalidate list caches
     */
    private async invalidateExerciseCaches(): Promise<void> {
        await cacheManager.deleteByPattern('exercises:filters*');
        await cacheManager.deleteByPattern('exercises:popular*');
        logger.debug('Invalidated exercise list caches');
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: ExerciseFilters): string[] {
        const relations: string[] = [];
        
        // Only include relationships needed for filtering and display
        if (filters.includeEquipment) {
            relations.push('equipmentOptions');
        }
        
        if (filters.includeCategories) {
            relations.push('categories');
        }
        
        if (filters.includeMedia) {
            relations.push('media');
        }
        
        if (filters.includeDetails) {
            relations.push('details');
        }
        
        if (filters.includeMetrics) {
            relations.push('metrics');
        }
        
        if (filters.includeFeedback) {
            relations.push('feedback');
        }
        
        // For related exercises, we need these relations
        if (filters.includeVariations || 
            filters.includeAlternatives || 
            filters.includeProgressions || 
            filters.includeRegressions) {
            relations.push('relationsFrom');
            relations.push('relationsTo');
        }
        
        return relations;
    }

    /**
     * Helper to apply sorting
     */
    private applySorting(query: FindManyOptions<Exercise>, filters: ExerciseFilters): void {
        if (filters.sortBy) {
            const validSortFields = ['name', 'level', 'createdAt', 'updatedAt', 'movementPattern'];
            const direction = filters.sortDirection || 'ASC';
            
            if (validSortFields.includes(filters.sortBy)) {
                (query.order as any) = { [filters.sortBy]: direction };
            } else if (filters.sortBy === 'popularity') {
                // Special case for sorting by popularity using Raw query on JSONB field
                (query.order as any) = { 
                    stats: Raw(alias => `${alias}->>'popularity'->>'score' ${direction}`) as any
                };
            }
        } else {
            // Default sort by name
            (query.order as any) = { name: 'ASC' };
        }
    }
} 