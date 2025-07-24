import { FindManyOptions, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProgramWorkout } from '../models/ProgramWorkout';
import { DayOfWeek } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying program workouts
 */
export interface ProgramWorkoutFilters {
    programId?: number;
    workoutId?: number;
    minWeek?: number;
    maxWeek?: number;
    dayOfWeek?: DayOfWeek;
    isOptional?: boolean;
    isDeload?: boolean;
    includeProgram?: boolean;
    includeWorkout?: boolean;
    includeWorkoutDetails?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ProgramWorkout entity
 */
export class ProgramWorkoutRepository extends GenericRepository<ProgramWorkout> {
    constructor() {
        super(ProgramWorkout);
    }

    /**
     * Find program workouts with detailed filtering options
     */
    async findWithFilters(filters: ProgramWorkoutFilters): Promise<[ProgramWorkout[], number]> {
        try {
            const query = createQueryOptions<ProgramWorkout>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });

            // Apply program filter
            if (filters.programId) {
                addWhereCondition(query, 'program', { id: filters.programId });
            }

            // Apply workout filter
            if (filters.workoutId) {
                addWhereCondition(query, 'workout', { id: filters.workoutId });
            }

            // Apply week range filters
            if (filters.minWeek !== undefined) {
                addWhereCondition(query, 'week', MoreThanOrEqual(filters.minWeek));
            }

            if (filters.maxWeek !== undefined) {
                addWhereCondition(query, 'week', LessThanOrEqual(filters.maxWeek));
            }

            // Apply day of week filter
            if (filters.dayOfWeek) {
                addWhereCondition(query, 'day', filters.dayOfWeek);
            }
            
            // Apply optional and deload filters
            if (filters.isOptional !== undefined) {
                addWhereCondition(query, 'isOptional', filters.isOptional);
            }
            
            if (filters.isDeload !== undefined) {
                addWhereCondition(query, 'isDeload', filters.isDeload);
            }

            // Apply sorting
            if (filters.sortBy) {
                const direction = filters.sortDirection || 'ASC';
                const validSortFields = ['week', 'day', 'order'];
                
                if (validSortFields.includes(filters.sortBy)) {
                    addOrderBy(query, filters.sortBy, direction as "ASC" | "DESC");
                }
            } else {
                // Default sorting by week and day
                addOrderBy(query, 'week', 'ASC');
                addOrderBy(query, 'day', 'ASC');
                addOrderBy(query, 'order', 'ASC');
            }

            return await this.repository.findAndCount(query);
        } catch (error) {
            logger.error(`Error finding program workouts with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }
    
    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: ProgramWorkoutFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeProgram) {
            relations.push('program');
        }
        
        if (filters.includeWorkout) {
            relations.push('workout');
        }
        
        if (filters.includeWorkoutDetails) {
            relations.push('workout.exercises');
            relations.push('workout.exercises.exercise');
        }
        
        return relations;
    }

    /**
     * Find workouts for a specific week in a program
     */
    async findByWeek(programId: number, weekNumber: number): Promise<ProgramWorkout[]> {
        try {
            const query = createQueryOptions<ProgramWorkout>({
                relations: ['workout', 'workout.exercises', 'workout.exercises.exercise']
            });
            
            addWhereCondition(query, 'program', { id: programId });
            addWhereCondition(query, 'week', weekNumber);
            addOrderBy(query, 'day', 'ASC');
            addOrderBy(query, 'order', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding program workouts by week: ${error.message}`, { 
                programId, 
                weekNumber 
            });
            throw error;
        }
    }

    /**
     * Find workouts for a specific day in a program
     */
    async findByDay(programId: number, weekNumber: number, dayOfWeek: DayOfWeek): Promise<ProgramWorkout[]> {
        try {
            const query = createQueryOptions<ProgramWorkout>({
                relations: ['workout', 'workout.exercises', 'workout.exercises.exercise']
            });
            
            addWhereCondition(query, 'program', { id: programId });
            addWhereCondition(query, 'week', weekNumber);
            addWhereCondition(query, 'day', dayOfWeek);
            addOrderBy(query, 'order', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding program workouts by day: ${error.message}`, { 
                programId, 
                weekNumber,
                dayOfWeek 
            });
            throw error;
        }
    }

    /**
     * Find workouts for a specific workout plan
     */
    async findByWorkoutPlan(workoutPlanId: number): Promise<ProgramWorkout[]> {
        try {
            const query = createQueryOptions<ProgramWorkout>({
                relations: ['program']
            });
            
            addWhereCondition(query, 'workout', { id: workoutPlanId });
            addOrderBy(query, 'program.name', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding program workouts by workout plan: ${error.message}`, { 
                workoutPlanId 
            });
            throw error;
        }
    }

    /**
     * Create multiple program workouts at once
     */
    async createMany(programWorkouts: Partial<ProgramWorkout>[]): Promise<ProgramWorkout[]> {
        try {
            const entities = this.repository.create(programWorkouts);
            return await this.repository.save(entities);
        } catch (error) {
            logger.error(`Error creating multiple program workouts: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get program schedule organized by weeks and days
     */
    async getProgramSchedule(programId: number): Promise<Record<string, Record<string, ProgramWorkout[]>>> {
        try {
            const workouts = await this.findWithFilters({
                programId,
                includeWorkout: true,
                includeWorkoutDetails: true,
                limit: 1000
            });
            
            // Initialize empty schedule
            const schedule: Record<string, Record<string, ProgramWorkout[]>> = {};
            
            // Group workouts by week and day
            workouts[0].forEach(workout => {
                const weekKey = `Week ${workout.week}`;
                const dayKey = DayOfWeek[workout.day];
                
                if (!schedule[weekKey]) {
                    schedule[weekKey] = {};
                }
                
                if (!schedule[weekKey][dayKey]) {
                    schedule[weekKey][dayKey] = [];
                }
                
                schedule[weekKey][dayKey].push(workout);
            });
            
            // Sort workouts within each day by order
            Object.keys(schedule).forEach(week => {
                Object.keys(schedule[week]).forEach(day => {
                    schedule[week][day].sort((a, b) => a.order - b.order);
                });
            });
            
            return schedule;
        } catch (error) {
            logger.error(`Error getting program schedule: ${error.message}`, { programId });
            throw error;
        }
    }

    /**
     * Get workout with full details
     */
    async getWithFullDetails(programWorkoutId: string): Promise<ProgramWorkout | null> {
        try {
            const query = createQueryOptions<ProgramWorkout>({
                relations: [
                    'program',
                    'workout',
                    'workout.exercises',
                    'workout.exercises.exercise',
                    'workout.targetMuscleGroups'
                ]
            });
            
            addWhereCondition(query, 'id', programWorkoutId);
            
            return await this.repository.findOne(query);
        } catch (error) {
            logger.error(`Error getting program workout details: ${error.message}`, { 
                programWorkoutId 
            });
            throw error;
        }
    }
} 