import { FindManyOptions, FindOptionsWhere, In, Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { 
    Difficulty, 
    WorkoutCategory, 
    FitnessGoal, 
    ProgressionType, 
    MeasurementType, 
    SplitType 
} from '../models/shared/Enums';
import { WorkoutPlanFilters } from '../models/shared/Interfaces';
import { GenericRepository } from './GenericRepository';
import logger from '../utils/logger';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import { WorkoutPlanId, prepareIdForQuery, createIdWhereCondition } from '../utils/idCompatibility';

/**
 * Extended filter options for querying workout plans
 */
export interface EnhancedWorkoutPlanFilters extends WorkoutPlanFilters {
    // Additional filter options
    fitnessGoals?: FitnessGoal[];
    progressionType?: ProgressionType;
    splitType?: SplitType;
    measurementType?: MeasurementType;
    includeExercises?: boolean;
    includePrograms?: boolean;
    includeCategories?: boolean;
    includeTags?: boolean;
    includeMedia?: boolean;
    includeMetrics?: boolean;
    userPlansOnly?: boolean;  // Filter to show only user's custom plans
}

/**
 * Specialized repository for WorkoutPlan entity
 * Optimized with standardized indexes and query patterns
 */
export class WorkoutPlanRepository extends GenericRepository<WorkoutPlan> {
    constructor() {
        super(WorkoutPlan);
    }

    /**
     * Find workout plans with detailed filtering options
     * Optimized to use our standardized indexes:
     * - idx_workout_search: for name, category, difficulty searches
     * - idx_workout_filter: for difficulty, category, duration filters
     * - idx_workout_popularity: for sorting by popularity within categories
     * - idx_workout_rating: for sorting by rating
     */
    async findWithFilters(filters: EnhancedWorkoutPlanFilters): Promise<[WorkoutPlan[], number]> {
        try {
            // Create base query with helper function
            const query = createQueryOptions<WorkoutPlan>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply basic filters
            if (filters.difficulty) {
                addWhereCondition(query, "difficulty", filters.difficulty);
            }
            
            if (filters.workoutCategory) {
                addWhereCondition(query, "workoutCategory", filters.workoutCategory);
            }
            
            if (filters.isCustom !== undefined) {
                addWhereCondition(query, "isCustom", filters.isCustom);
            }
            
            if (filters.creatorId) {
                addWhereCondition(query, "creatorId", filters.creatorId);
            }
            
            // Add duration range filters
            if (filters.minDuration !== undefined) {
                addWhereCondition(query, "estimatedDuration", MoreThanOrEqual(filters.minDuration));
            }
            
            if (filters.maxDuration !== undefined) {
                addWhereCondition(query, "estimatedDuration", LessThanOrEqual(filters.maxDuration));
            }
            
            // Add search term
            if (filters.searchTerm) {
                addWhereCondition(query, "name", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            // Add fitness goals filter (stored in JSONB)
            if (filters.fitnessGoals?.length) {
                addWhereCondition(query, "fitnessGoals", createRawQuery(
                    alias => `${alias} ?| ARRAY[:...goals]`,
                    { goals: filters.fitnessGoals }
                ));
            }
            
            // Add progression type filter
            if (filters.progressionType) {
                addWhereCondition(query, "progressionModel", createRawQuery(
                    alias => `${alias}->>'type' = :progType`,
                    { progType: filters.progressionType }
                ));
            }
            
            // Add split type filter
            if (filters.splitType) {
                addWhereCondition(query, "workoutStructure", createRawQuery(
                    alias => `${alias}->>'splitType' = :splitType`,
                    { splitType: filters.splitType }
                ));
            }
            
            // Add many-to-many relationship filters
            if (filters.categoryIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_muscle_group wcm ON wp.id = wcm.workout_id
                        WHERE wcm.category_id IN (:...categoryIds)
                    )`,
                    { categoryIds: filters.categoryIds }
                ));
            }
            
            if (filters.equipmentIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_equipment we ON wp.id = we.workout_id
                        WHERE we.equipment_id IN (:...equipmentIds)
                    )`,
                    { equipmentIds: filters.equipmentIds }
                ));
            }
            
            if (filters.tagIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_tag_map wtm ON wp.id = wtm.workout_id
                        WHERE wtm.tag_id IN (:...tagIds)
                    )`,
                    { tagIds: filters.tagIds }
                ));
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort
                addOrderBy(query, "createdAt", "DESC");
            }
            
            // Execute query
            const [workouts, total] = await this.repository.findAndCount(query);
            return [workouts, total];
        } catch (error) {
            logger.error(`Error finding workout plans with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Find popular workout plans
     * Optimized to use idx_workout_popularity index
     */
    async findPopular(limit: number = 10): Promise<WorkoutPlan[]> {
        return this.repository.find({
            where: { isCustom: false },
            order: { popularity: 'DESC', rating: 'DESC' },
            take: limit,
            // Only load necessary relations
            relations: ['targetMuscleGroups', 'tags']
        });
    }

    /**
     * Find workouts by muscle group category
     * Optimized for the many-to-many relationship
     */
    async findByMuscleGroup(categoryId: number, limit: number = 20, offset: number = 0): Promise<[WorkoutPlan[], number]> {
        // Use query builder for optimized join
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.targetMuscleGroups', 'category')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipment')
            .where('category.id = :categoryId', { categoryId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }

    /**
     * Find workouts that use specific equipment
     * Optimized for the many-to-many relationship
     */
    async findByEquipment(equipmentId: string, limit: number = 20, offset: number = 0): Promise<[WorkoutPlan[], number]> {
        // Use query builder for optimized join
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.equipmentNeeded', 'equipment')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipmentFull')
            .where('equipment.id = :equipmentId', { equipmentId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }

    /**
     * Find workouts by tag
     * Optimized for the many-to-many relationship
     */
    async findByTag(tagId: number, limit: number = 20, offset: number = 0): Promise<[WorkoutPlan[], number]> {
        // Use query builder for optimized join
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.tags', 'tag')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipment')
            .where('tag.id = :tagId', { tagId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }

    /**
     * Find workouts created by a specific user
     * Optimized to use the idx_user_created_workouts index
     */
    async findByCreator(userId: string, limit: number = 20, offset: number = 0): Promise<[WorkoutPlan[], number]> {
        // Use creator_id to leverage the indexed foreign key
        return this.repository.findAndCount({
            where: { creator_id: userId },
            relations: [
                'exercises',
                'exercises.exercise',
                'targetMuscleGroups',
                'tags',
                'equipmentNeeded'
            ],
            take: limit,
            skip: offset
        });
    }

    /**
     * Get a workout plan with full details including exercises
     * Selective relation loading with controlled depth
     */
    async getWithFullDetails(id: WorkoutPlanId): Promise<WorkoutPlan | null> {
        const start = Date.now();
        
        const result = await this.repository.findOne({
            where: createIdWhereCondition<WorkoutPlan>(id),
            relations: [
                'exercises', 
                'exercises.exercise', 
                'exercises.exercise.categories',
                'exercises.exercise.equipmentOptions',
                'targetMuscleGroups', 
                'tags', 
                'equipmentNeeded',
                'creator'
            ]
        });
        
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in WorkoutPlanRepository.getWithFullDetails: ${duration}ms`, { 
                id,
                duration
            });
        }
        
        return result;
    }

    /**
     * Count workouts matching specific criteria
     * Optimized counting operations
     */
    async countByCategory(category: WorkoutCategory): Promise<number> {
        return this.repository.countBy({ workoutCategory: category });
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: EnhancedWorkoutPlanFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeExercises) {
            relations.push('exercises');
            relations.push('exercises.exercise');
        }
        
        if (filters.includePrograms) {
            relations.push('programs');
        }
        
        if (filters.includeCategories) {
            relations.push('categories');
        }
        
        if (filters.includeTags) {
            relations.push('tags');
        }
        
        if (filters.includeMedia) {
            relations.push('thumbnail');
            relations.push('video');
        }
        
        if (filters.includeMetrics) {
            relations.push('metrics');
        }
        
        return relations;
    }
} 