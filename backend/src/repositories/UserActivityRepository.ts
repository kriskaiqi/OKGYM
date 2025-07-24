import { Between, FindManyOptions, LessThan, MoreThan } from 'typeorm';
import { UserActivity, ActivityType, ActivityPlatform } from '../models/UserActivity';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying user activities
 */
export interface UserActivityFilters {
    userId?: string;
    type?: ActivityType;
    platform?: ActivityPlatform;
    timestampMin?: Date;
    timestampMax?: Date;
    ipAddress?: string;
    sessionId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for UserActivity entity
 */
export class UserActivityRepository extends GenericRepository<UserActivity> {
    constructor() {
        super(UserActivity);
    }

    /**
     * Find user activities with detailed filtering options
     */
    async findWithFilters(filters: UserActivityFilters): Promise<[UserActivity[], number]> {
        try {
            const queryOptions: FindManyOptions<UserActivity> = createQueryOptions<UserActivity>({});

            // Set pagination
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { timestamp: 'DESC' };

            // Add relations
            queryOptions.relations = ['user'];

            // Apply filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.platform) {
                addWhereCondition(queryOptions, 'platform', filters.platform);
            }

            // Timestamp range filters
            if (filters.timestampMin && filters.timestampMax) {
                addWhereCondition(queryOptions, 'timestamp', Between(filters.timestampMin, filters.timestampMax));
            } else if (filters.timestampMin) {
                addWhereCondition(queryOptions, 'timestamp', MoreThan(filters.timestampMin));
            } else if (filters.timestampMax) {
                addWhereCondition(queryOptions, 'timestamp', LessThan(filters.timestampMax));
            }

            // Context field filters (using JSONB queries)
            if (filters.ipAddress) {
                addWhereCondition(queryOptions, 'context.ip', filters.ipAddress);
            }

            if (filters.sessionId) {
                addWhereCondition(queryOptions, 'context.sessionId', filters.sessionId);
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in UserActivityRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find activities for a specific user
     */
    async findByUser(userId: string, limit: number = 50): Promise<UserActivity[]> {
        try {
            const queryOptions: FindManyOptions<UserActivity> = createQueryOptions<UserActivity>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };

            addWhereCondition(queryOptions, 'user_id', userId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserActivityRepository.findByUser', { error, userId });
            throw error;
        }
    }

    /**
     * Find activities by type
     */
    async findByType(type: ActivityType, limit: number = 50): Promise<UserActivity[]> {
        try {
            const queryOptions: FindManyOptions<UserActivity> = createQueryOptions<UserActivity>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };

            addWhereCondition(queryOptions, 'type', type);
            queryOptions.relations = ['user'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserActivityRepository.findByType', { error, type });
            throw error;
        }
    }

    /**
     * Find activities by platform
     */
    async findByPlatform(platform: ActivityPlatform, limit: number = 50): Promise<UserActivity[]> {
        try {
            const queryOptions: FindManyOptions<UserActivity> = createQueryOptions<UserActivity>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };

            addWhereCondition(queryOptions, 'platform', platform);
            queryOptions.relations = ['user'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserActivityRepository.findByPlatform', { error, platform });
            throw error;
        }
    }

    /**
     * Find activities related to a specific entity
     */
    async findByEntityId(entityId: string, limit: number = 50): Promise<UserActivity[]> {
        try {
            const queryOptions: FindManyOptions<UserActivity> = createQueryOptions<UserActivity>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };

            addWhereCondition(queryOptions, 'details.entityId', entityId);
            queryOptions.relations = ['user'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserActivityRepository.findByEntityId', { error, entityId });
            throw error;
        }
    }

    /**
     * Log a new activity
     */
    async logActivity(activity: Partial<UserActivity>): Promise<UserActivity> {
        try {
            const newActivity = this.repository.create(activity);
            return await this.repository.save(newActivity);
        } catch (error) {
            logger.error('Error in UserActivityRepository.logActivity', { error, activity });
            throw error;
        }
    }

    /**
     * Get activity statistics for a user
     */
    async getUserActivityStats(userId: string, days: number = 30): Promise<any> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const activities = await this.findWithFilters({
                userId,
                timestampMin: startDate
            });

            // Group activities by type
            const typeStats = activities[0].reduce((acc, activity) => {
                const type = activity.type;
                if (!acc[type]) {
                    acc[type] = 0;
                }
                acc[type]++;
                return acc;
            }, {} as Record<ActivityType, number>);

            // Group activities by platform
            const platformStats = activities[0].reduce((acc, activity) => {
                const platform = activity.platform;
                if (!acc[platform]) {
                    acc[platform] = 0;
                }
                acc[platform]++;
                return acc;
            }, {} as Record<ActivityPlatform, number>);

            // Group activities by day
            const dailyStats = activities[0].reduce((acc, activity) => {
                const date = activity.timestamp.toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date]++;
                return acc;
            }, {} as Record<string, number>);

            return {
                total: activities[1],
                byType: typeStats,
                byPlatform: platformStats,
                byDay: dailyStats
            };
        } catch (error) {
            logger.error('Error in UserActivityRepository.getUserActivityStats', { error, userId, days });
            throw error;
        }
    }
} 