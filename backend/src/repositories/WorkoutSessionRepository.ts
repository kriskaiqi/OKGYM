import { Between, FindManyOptions, FindOptionsWhere, LessThan, MoreThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { WorkoutSession } from '../models/WorkoutSession';
import { 
    SessionStatus, 
    ExerciseStatus, 
    MeasurementUnit, 
    WorkoutLocation 
} from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying workout sessions
 */
export interface WorkoutSessionFilters {
    userId?: string;
    workoutPlanId?: number;
    programId?: number;
    status?: SessionStatus;
    exerciseStatus?: ExerciseStatus;
    location?: WorkoutLocation;
    preferredUnit?: MeasurementUnit;
    startDateMin?: Date;
    startDateMax?: Date;
    durationMin?: number;
    durationMax?: number;
    caloriesBurnedMin?: number;
    caloriesBurnedMax?: number;
    searchTerm?: string;
    includeExerciseResults?: boolean;
    includeWorkoutPlan?: boolean;
    includeUser?: boolean;
    includeEnvironmentData?: boolean;
    includeHealthData?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for WorkoutSession entity
 */
export class WorkoutSessionRepository extends GenericRepository<WorkoutSession> {
    constructor() {
        super(WorkoutSession);
    }

    /**
     * Find workout sessions with detailed filtering options
     */
    async findWithFilters(filters: WorkoutSessionFilters): Promise<[WorkoutSession[], number]> {
        try {
            // Create base query with helper function
            const query = createQueryOptions<WorkoutSession>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(query, "userId", filters.userId);
            }
            
            if (filters.workoutPlanId) {
                addWhereCondition(query, "workoutPlanId", filters.workoutPlanId);
            }
            
            if (filters.programId) {
                addWhereCondition(query, "programId", filters.programId);
            }
            
            if (filters.status) {
                addWhereCondition(query, "status", filters.status);
            }
            
            if (filters.location) {
                addWhereCondition(query, "locationData", createRawQuery(
                    alias => `${alias}->>'type' = :locationType`,
                    { locationType: filters.location }
                ));
            }
            
            // Apply date range filters
            if (filters.startDateMin && filters.startDateMax) {
                addWhereCondition(query, "startTime", Between(filters.startDateMin, filters.startDateMax));
            } else if (filters.startDateMin) {
                addWhereCondition(query, "startTime", MoreThanOrEqual(filters.startDateMin));
            } else if (filters.startDateMax) {
                addWhereCondition(query, "startTime", LessThanOrEqual(filters.startDateMax));
            }
            
            // Apply duration range filters
            if (filters.durationMin !== undefined) {
                addWhereCondition(query, "totalDuration", MoreThanOrEqual(filters.durationMin));
            }
            
            if (filters.durationMax !== undefined) {
                addWhereCondition(query, "totalDuration", LessThanOrEqual(filters.durationMax));
            }
            
            // Apply calories range filters
            if (filters.caloriesBurnedMin !== undefined) {
                addWhereCondition(query, "caloriesBurned", MoreThanOrEqual(filters.caloriesBurnedMin));
            }
            
            if (filters.caloriesBurnedMax !== undefined) {
                addWhereCondition(query, "caloriesBurned", LessThanOrEqual(filters.caloriesBurnedMax));
            }
            
            // Apply exercise status filter to exercise results
            if (filters.exerciseStatus) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT ws.id FROM workout_sessions ws
                        JOIN exercise_results er ON ws.id = er.session_id
                        WHERE er.status = :status
                    )`,
                    { status: filters.exerciseStatus }
                ));
            }
            
            // Apply search term
            if (filters.searchTerm) {
                // Search in user feedback or workout plan name
                addWhereCondition(query, "userFeedback", createRawQuery(
                    alias => `${alias} LIKE :term`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'DESC');
            } else {
                // Default sort by start time descending (newest first)
                addOrderBy(query, "startTime", "DESC");
            }
            
            // Execute query
            const [sessions, total] = await this.repository.findAndCount(query);
            return [sessions, total];
        } catch (error) {
            logger.error(`Error finding workout sessions with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: WorkoutSessionFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeExerciseResults) {
            relations.push('exerciseResults');
            relations.push('exerciseResults.exercise');
        }
        
        if (filters.includeWorkoutPlan) {
            relations.push('workoutPlan');
        }
        
        if (filters.includeUser) {
            relations.push('user');
        }
        
        if (filters.includeEnvironmentData) {
            relations.push('environmentData');
        }
        
        if (filters.includeHealthData) {
            relations.push('healthData');
        }
        
        return relations;
    }

    /**
     * Find recent sessions for a user
     */
    async findRecentByUser(userId: string, limit: number = 10): Promise<WorkoutSession[]> {
        const query = createQueryOptions<WorkoutSession>({
            relations: ['workoutPlan', 'exerciseLogs'],
            take: limit
        });
        
        addWhereCondition(query, 'user', { id: userId });
        addOrderBy(query, 'startTime', 'DESC');
        
        return this.repository.find(query);
    }

    /**
     * Find sessions in a date range for a user
     */
    async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
        const query = createQueryOptions<WorkoutSession>({
            relations: ['workoutPlan', 'exerciseLogs']
        });
        
        addWhereCondition(query, 'user', { id: userId });
        addWhereCondition(query, 'startTime', Between(startDate, endDate));
        addOrderBy(query, 'startTime', 'ASC');
        
        return this.repository.find(query);
    }

    /**
     * Find sessions for a specific workout plan
     */
    async findByWorkoutPlan(workoutPlanId: number, limit: number = 20): Promise<WorkoutSession[]> {
        const query = createQueryOptions<WorkoutSession>({
            relations: ['user', 'exerciseLogs'],
            take: limit
        });
        
        addWhereCondition(query, 'workoutPlan', { id: workoutPlanId });
        addOrderBy(query, 'startTime', 'DESC');
        
        return this.repository.find(query);
    }

    /**
     * Find sessions for a specific training program
     */
    async findByProgram(programId: number, limit: number = 20): Promise<WorkoutSession[]> {
        const query = createQueryOptions<WorkoutSession>({
            relations: ['user', 'workoutPlan', 'exerciseLogs'],
            take: limit
        });
        
        // Use trainingProgram relation with type assertion
        addWhereCondition(query, 'trainingProgram', { id: programId } as any);
        addOrderBy(query, 'startTime', 'DESC');
        
        return this.repository.find(query);
    }

    /**
     * Get a workout session with full details
     */
    async getWithFullDetails(sessionId: string): Promise<WorkoutSession | null> {
        const query = createQueryOptions<WorkoutSession>({
            relations: [
                'user', 
                'workoutPlan', 
                'workoutPlan.exercises',
                'workoutPlan.exercises.exercise'
            ]
        });
        
        addWhereCondition(query, 'id', sessionId);
        
        return this.repository.findOne(query);
    }

    /**
     * Get user workout statistics
     */
    async getUserStats(userId: string): Promise<{
        totalSessions: number;
        totalDuration: number;
        totalCaloriesBurned: number;
        avgIntensity: number;
        avgRating: number;
        completedWorkouts: number;
    }> {
        const result = await this.repository
            .createQueryBuilder('session')
            .select('COUNT(*)', 'totalSessions')
            .addSelect('SUM(session.totalDuration)', 'totalDuration')
            .addSelect('SUM(session.caloriesBurned)', 'totalCaloriesBurned')
            .addSelect('AVG(session.difficultyRating)', 'avgIntensity')
            .addSelect('AVG(session.difficultyRating)', 'avgRating')
            .addSelect('SUM(CASE WHEN session.status = :completed THEN 1 ELSE 0 END)', 'completedWorkouts')
            .where('session.user.id = :userId', { userId, completed: SessionStatus.COMPLETED })
            .getRawOne();

        return {
            totalSessions: parseInt(result.totalSessions) || 0,
            totalDuration: parseInt(result.totalDuration) || 0,
            totalCaloriesBurned: parseInt(result.totalCaloriesBurned) || 0,
            avgIntensity: parseFloat(result.avgIntensity) || 0,
            avgRating: parseFloat(result.avgRating) || 0,
            completedWorkouts: parseInt(result.completedWorkouts) || 0,
        };
    }

    /**
     * Get weekly session count
     */
    async getWeeklyCount(userId: string, weeks: number = 12): Promise<{ week: string; count: number }[]> {
        // Calculate the start date (weeks ago from now)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeks * 7));
        
        const sessions = await this.repository.find({
            where: {
                user: { id: userId } as any,
                startTime: MoreThan(startDate)
            } as any,
            select: ['startTime']
        });

        // Group sessions by week
        const weekMap = new Map<string, number>();
        
        // Initialize all weeks with 0 count
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekKey = this.getWeekKey(weekStart);
            weekMap.set(weekKey, 0);
        }
        
        // Count sessions by week
        for (const session of sessions) {
            if (session.startTime) {
                const weekKey = this.getWeekKey(session.startTime);
                const count = weekMap.get(weekKey) || 0;
                weekMap.set(weekKey, count + 1);
            }
        }
        
        // Convert map to array of objects
        return Array.from(weekMap.entries())
            .map(([week, count]) => ({ week, count }))
            .sort((a, b) => a.week.localeCompare(b.week));
    }

    /**
     * Get a week key in the format "YYYY-WW"
     */
    private getWeekKey(date: Date): string {
        const year = date.getFullYear();
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    }

    /**
     * Get the ISO week number for a date
     */
    private getWeekNumber(date: Date): number {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    }
} 