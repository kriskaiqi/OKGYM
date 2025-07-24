import { Between, FindManyOptions, LessThan, MoreThan, Like } from 'typeorm';
import { FitnessGoal, GoalStatus, GoalType } from '../models/FitnessGoal';
import { MeasurementUnit } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying fitness goals
 */
export interface FitnessGoalFilters {
    userId?: string;
    status?: GoalStatus;
    type?: GoalType;
    unit?: MeasurementUnit;
    startDateMin?: Date;
    startDateMax?: Date;
    deadlineMin?: Date;
    deadlineMax?: Date;
    progressMin?: number;
    progressMax?: number;
    targetMin?: number;
    targetMax?: number;
    isActive?: boolean;
    hasCheckpoints?: boolean;
    searchTerm?: string;
    includeUser?: boolean;
    includeCheckpoints?: boolean;
    includeMetadata?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for FitnessGoal entity
 */
export class FitnessGoalRepository extends GenericRepository<FitnessGoal> {
    constructor() {
        super(FitnessGoal);
    }

    /**
     * Find fitness goals with detailed filtering options
     */
    async findWithFilters(filters: FitnessGoalFilters): Promise<[FitnessGoal[], number]> {
        try {
            const query = createQueryOptions<FitnessGoal>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(query, 'user_id', filters.userId);
            }

            if (filters.status) {
                addWhereCondition(query, 'status', filters.status);
            }

            if (filters.type) {
                addWhereCondition(query, 'type', filters.type);
            }
            
            if (filters.unit) {
                addWhereCondition(query, 'unit', filters.unit);
            }

            // Date range filters for startDate
            if (filters.startDateMin && filters.startDateMax) {
                addWhereCondition(query, 'startDate', Between(filters.startDateMin, filters.startDateMax));
            } else if (filters.startDateMin) {
                addWhereCondition(query, 'startDate', MoreThan(filters.startDateMin));
            } else if (filters.startDateMax) {
                addWhereCondition(query, 'startDate', LessThan(filters.startDateMax));
            }

            // Date range filters for deadline
            if (filters.deadlineMin && filters.deadlineMax) {
                addWhereCondition(query, 'deadline', Between(filters.deadlineMin, filters.deadlineMax));
            } else if (filters.deadlineMin) {
                addWhereCondition(query, 'deadline', MoreThan(filters.deadlineMin));
            } else if (filters.deadlineMax) {
                addWhereCondition(query, 'deadline', LessThan(filters.deadlineMax));
            }
            
            // Progress range filters
            if (filters.progressMin !== undefined) {
                addWhereCondition(query, 'progress', MoreThan(filters.progressMin));
            }
            
            if (filters.progressMax !== undefined) {
                addWhereCondition(query, 'progress', LessThan(filters.progressMax));
            }
            
            // Target range filters
            if (filters.targetMin !== undefined) {
                addWhereCondition(query, 'target', MoreThan(filters.targetMin));
            }
            
            if (filters.targetMax !== undefined) {
                addWhereCondition(query, 'target', LessThan(filters.targetMax));
            }

            // Active status filter
            if (filters.isActive !== undefined) {
                addWhereCondition(query, 'status', filters.isActive ? GoalStatus.ACTIVE : GoalStatus.COMPLETED);
            }
            
            // Has checkpoints filter
            if (filters.hasCheckpoints !== undefined) {
                if (filters.hasCheckpoints) {
                    addWhereCondition(query, 'checkpoints', createRawQuery(
                        alias => `jsonb_array_length(${alias}) > 0`,
                        {}
                    ));
                } else {
                    addWhereCondition(query, 'checkpoints', createRawQuery(
                        alias => `${alias} IS NULL OR jsonb_array_length(${alias}) = 0`,
                        {}
                    ));
                }
            }

            // Search term filter
            if (filters.searchTerm) {
                addWhereCondition(query, 'title', createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }

            // Sorting
            if (filters.sortBy) {
                const direction = filters.sortDirection || 'ASC';
                const validSortFields = ['title', 'startDate', 'deadline', 'progress', 'type', 'status', 'target', 'current'];
                
                if (validSortFields.includes(filters.sortBy)) {
                    addOrderBy(query, filters.sortBy, direction as "ASC" | "DESC");
                }
            } else {
                // Default sorting by deadline ascending (closest first)
                addOrderBy(query, 'deadline', 'ASC');
            }
            
            return await this.repository.findAndCount(query);
        } catch (error) {
            logger.error(`Error finding fitness goals with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: FitnessGoalFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeUser) {
            relations.push('user');
        }
        
        return relations;
    }

    /**
     * Find active goals for a user
     */
    async findActiveByUser(userId: string): Promise<FitnessGoal[]> {
        try {
            const query = createQueryOptions<FitnessGoal>();
            
            addWhereCondition(query, 'user_id', userId);
            addWhereCondition(query, 'status', GoalStatus.ACTIVE);
            addOrderBy(query, 'deadline', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding active goals for user: ${error.message}`, { userId });
            throw error;
        }
    }

    /**
     * Find goals of a specific type for a user
     */
    async findByType(userId: string, type: GoalType): Promise<FitnessGoal[]> {
        try {
            const query = createQueryOptions<FitnessGoal>();
            
            addWhereCondition(query, 'user_id', userId);
            addWhereCondition(query, 'type', type);
            addOrderBy(query, 'status', 'ASC');
            addOrderBy(query, 'deadline', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding goals by type: ${error.message}`, { userId, type });
            throw error;
        }
    }

    /**
     * Find goals with approaching deadlines
     */
    async findUpcomingDeadlines(userId: string, daysThreshold: number = 7): Promise<FitnessGoal[]> {
        try {
            const today = new Date();
            const threshold = new Date();
            threshold.setDate(today.getDate() + daysThreshold);
            
            const query = createQueryOptions<FitnessGoal>();
            
            addWhereCondition(query, 'user_id', userId);
            addWhereCondition(query, 'status', GoalStatus.ACTIVE);
            addWhereCondition(query, 'deadline', Between(today, threshold));
            addOrderBy(query, 'deadline', 'ASC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding goals with upcoming deadlines: ${error.message}`, { 
                userId, 
                daysThreshold 
            });
            throw error;
        }
    }

    /**
     * Update goal progress
     */
    async updateProgress(goalId: string, newValue: number): Promise<FitnessGoal | null> {
        try {
            const goal = await this.repository.findOne({ where: { id: goalId } as any });
            
            if (!goal) return null;
            
            goal.current = newValue;
            goal.calculateProgress();
            goal.isCompleted();
            
            return await this.repository.save(goal);
        } catch (error) {
            logger.error(`Error updating goal progress: ${error.message}`, { goalId, newValue });
            throw error;
        }
    }
} 