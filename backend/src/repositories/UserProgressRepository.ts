import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { UserProgress, ProgressType, ProgressTrend } from '../models/UserProgress';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying user progress
 */
export interface UserProgressFilters {
    userId?: string;
    type?: ProgressType;
    trend?: ProgressTrend;
    metricName?: string;
    dateMin?: Date;
    dateMax?: Date;
    valueMin?: number;
    valueMax?: number;
    includeMetricTracking?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for UserProgress entity
 */
export class UserProgressRepository extends GenericRepository<UserProgress> {
    constructor() {
        super(UserProgress);
    }

    /**
     * Find user progress entries with detailed filtering options
     */
    async findWithFilters(filters: UserProgressFilters): Promise<[UserProgress[], number]> {
        try {
            const queryOptions: FindManyOptions<UserProgress> = createQueryOptions<UserProgress>({});

            // Set pagination
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { date: 'DESC' };

            // Add relations if needed
            if (filters.includeMetricTracking) {
                queryOptions.relations = ['metricTracking'];
            }

            // Apply filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.trend) {
                addWhereCondition(queryOptions, 'trend', filters.trend);
            }

            if (filters.metricName) {
                addWhereCondition(queryOptions, 'metricName', filters.metricName);
            }

            // Date range filters
            if (filters.dateMin && filters.dateMax) {
                addWhereCondition(queryOptions, 'date', Between(filters.dateMin, filters.dateMax));
            } else if (filters.dateMin) {
                addWhereCondition(queryOptions, 'date', MoreThan(filters.dateMin));
            } else if (filters.dateMax) {
                addWhereCondition(queryOptions, 'date', LessThan(filters.dateMax));
            }

            // Value range filters
            if (filters.valueMin && filters.valueMax) {
                addWhereCondition(queryOptions, 'value', Between(filters.valueMin, filters.valueMax));
            } else if (filters.valueMin) {
                addWhereCondition(queryOptions, 'value', MoreThan(filters.valueMin));
            } else if (filters.valueMax) {
                addWhereCondition(queryOptions, 'value', LessThan(filters.valueMax));
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in UserProgressRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find progress entries for a specific user
     */
    async findByUser(userId: string, includeMetricTracking: boolean = false): Promise<UserProgress[]> {
        try {
            const queryOptions: FindManyOptions<UserProgress> = createQueryOptions<UserProgress>({});
            
            // Set sorting
            queryOptions.order = { date: 'DESC' };

            addWhereCondition(queryOptions, 'user_id', userId);

            if (includeMetricTracking) {
                queryOptions.relations = ['metricTracking'];
            }

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserProgressRepository.findByUser', { error, userId });
            throw error;
        }
    }

    /**
     * Find progress entries for a specific metric
     */
    async findByMetric(userId: string, metricName: string, limit: number = 30): Promise<UserProgress[]> {
        try {
            const queryOptions: FindManyOptions<UserProgress> = createQueryOptions<UserProgress>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { date: 'DESC' };

            addWhereCondition(queryOptions, 'user_id', userId);
            addWhereCondition(queryOptions, 'metricName', metricName);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserProgressRepository.findByMetric', { error, userId, metricName });
            throw error;
        }
    }

    /**
     * Find progress entries by type
     */
    async findByType(userId: string, type: ProgressType, limit: number = 30): Promise<UserProgress[]> {
        try {
            const queryOptions: FindManyOptions<UserProgress> = createQueryOptions<UserProgress>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { date: 'DESC' };

            addWhereCondition(queryOptions, 'user_id', userId);
            addWhereCondition(queryOptions, 'type', type);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserProgressRepository.findByType', { error, userId, type });
            throw error;
        }
    }

    /**
     * Update the trend for a progress entry
     */
    async updateTrend(progressId: string, trend: ProgressTrend): Promise<void> {
        try {
            await this.repository.update(progressId, { trend });
        } catch (error) {
            logger.error('Error in UserProgressRepository.updateTrend', { error, progressId, trend });
            throw error;
        }
    }
} 