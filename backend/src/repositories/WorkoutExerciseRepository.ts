import { FindManyOptions, FindOptionsOrder, MoreThanOrEqual, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { 
    SetType, 
    SetStructure, 
    ExerciseRole 
} from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';
import { WorkoutPlanId } from '../services/WorkoutPlanService';

/**
 * Type for workout exercise ID (can be number or string UUID)
 */
export type WorkoutExerciseId = string | number;

/**
 * Convert any ID to string for consistent comparison
 * @param id ID to convert
 * @returns String representation of ID
 */
function idToString(id: WorkoutExerciseId | WorkoutPlanId | null | undefined): string {
    return id?.toString() || '';
}

/**
 * Check if two IDs are equivalent regardless of type
 * @param id1 First ID
 * @param id2 Second ID
 * @returns Whether IDs are equivalent
 */
function idsAreEqual(id1: WorkoutExerciseId | WorkoutPlanId | null | undefined, 
                     id2: WorkoutExerciseId | WorkoutPlanId | null | undefined): boolean {
    return idToString(id1) === idToString(id2);
}

/**
 * Filter options for querying workout exercises
 */
export interface WorkoutExerciseFilters {
    workoutPlanId?: WorkoutPlanId;
    exerciseId?: string;
    minReps?: number;
    maxReps?: number;
    minDuration?: number;
    maxDuration?: number;
    minSets?: number;
    maxSets?: number;
    setType?: SetType;
    setStructure?: SetStructure;
    exerciseRole?: ExerciseRole;
    hasSuperset?: boolean;
    includeExercise?: boolean;
    includeWorkoutPlan?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for WorkoutExercise entity
 */
export class WorkoutExerciseRepository extends GenericRepository<WorkoutExercise> {
    constructor() {
        super(WorkoutExercise);
    }

    /**
     * Find workout exercises with detailed filtering options
     */
    async findWithFilters(filters: WorkoutExerciseFilters): Promise<[WorkoutExercise[], number]> {
        try {
            // Create base query with helper function
            const query = createQueryOptions<WorkoutExercise>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply basic filters
            if (filters.workoutPlanId) {
                addWhereCondition(query, "workoutPlanId", filters.workoutPlanId);
            }
            
            if (filters.exerciseId) {
                addWhereCondition(query, "exerciseId", filters.exerciseId);
            }
            
            // Apply set type and structure filters
            if (filters.setType) {
                addWhereCondition(query, "setType", filters.setType);
            }
            
            if (filters.setStructure) {
                addWhereCondition(query, "setStructure", filters.setStructure);
            }
            
            if (filters.exerciseRole) {
                addWhereCondition(query, "role", filters.exerciseRole);
            }
            
            // Apply range filters
            if (filters.minReps !== undefined) {
                addWhereCondition(query, "repetitions", MoreThanOrEqual(filters.minReps));
            }
            
            if (filters.maxReps !== undefined) {
                addWhereCondition(query, "repetitions", LessThanOrEqual(filters.maxReps));
            }
            
            if (filters.minDuration !== undefined) {
                addWhereCondition(query, "duration", MoreThanOrEqual(filters.minDuration));
            }
            
            if (filters.maxDuration !== undefined) {
                addWhereCondition(query, "duration", LessThanOrEqual(filters.maxDuration));
            }
            
            if (filters.minSets !== undefined) {
                addWhereCondition(query, "sets", MoreThanOrEqual(filters.minSets));
            }
            
            if (filters.maxSets !== undefined) {
                addWhereCondition(query, "sets", LessThanOrEqual(filters.maxSets));
            }
            
            // Apply superset filter
            if (filters.hasSuperset !== undefined) {
                if (filters.hasSuperset) {
                    addWhereCondition(query, "supersetWithId", Not(IsNull()));
                } else {
                    addWhereCondition(query, "supersetWithId", IsNull());
                }
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by order within workout
                addOrderBy(query, "order", "ASC");
            }
            
            // Execute query
            const [exercises, total] = await this.repository.findAndCount(query);
            return [exercises, total];
        } catch (error) {
            logger.error(`Error finding workout exercises with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: WorkoutExerciseFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeExercise) {
            relations.push('exercise');
        }
        
        if (filters.includeWorkoutPlan) {
            relations.push('workoutPlan');
        }
        
        if (filters.hasSuperset) {
            relations.push('supersetWith');
        }
        
        return relations;
    }

    /**
     * Find workout exercises by workout plan ID
     */
    async findByWorkoutPlan(workoutPlanId: WorkoutPlanId): Promise<WorkoutExercise[]> {
        return this.repository.find({
            where: { workoutPlan: { id: workoutPlanId } } as any,
            relations: ['exercise', 'exercise.categories', 'exercise.equipmentOptions'],
            order: { order: 'ASC' } as any
        });
    }

    /**
     * Find supersets in a workout
     */
    async findSupersets(workoutPlanId: WorkoutPlanId): Promise<WorkoutExercise[]> {
        const query = createQueryOptions<WorkoutExercise>({
            relations: ['exercise']
        });
        
        addWhereCondition(query, 'workoutPlan', { id: workoutPlanId });
        addWhereCondition(query, 'supersetWithExerciseId', Not(IsNull()));
        
        return this.repository.find(query);
    }

    /**
     * Find workouts that use a specific exercise
     */
    async findWorkoutsByExercise(exerciseId: string): Promise<WorkoutExercise[]> {
        const query = createQueryOptions<WorkoutExercise>({
            relations: ['workoutPlan']
        });
        
        addWhereCondition(query, 'exercise', { id: exerciseId });
        addOrderBy(query, 'createdAt', 'DESC');
        
        return this.repository.find(query);
    }

    /**
     * Update exercise order in a workout
     */
    async updateExerciseOrder(workoutExerciseId: WorkoutExerciseId, newOrder: number): Promise<void> {
        await this.repository.update(workoutExerciseId, { order: newOrder });
    }

    /**
     * Create multiple workout exercises at once
     */
    async createMany(workoutExercises: Partial<WorkoutExercise>[]): Promise<WorkoutExercise[]> {
        const entities = this.repository.create(workoutExercises as any[]);
        return this.repository.save(entities);
    }

    /**
     * Get workout exercise with related entities
     */
    async getWithFullDetails(workoutExerciseId: WorkoutExerciseId): Promise<WorkoutExercise | null> {
        return this.repository.findOne({
            where: { id: workoutExerciseId } as any,
            relations: [
                'exercise', 
                'exercise.categories',
                'exercise.equipmentOptions',
                'workoutPlan'
            ]
        });
    }
} 