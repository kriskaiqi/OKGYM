import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In, ILike } from 'typeorm';
import { Notification, NotificationType, NotificationPriority, NotificationStatus, NotificationChannel } from '../models/Notification';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying notifications
 */
export interface NotificationFilters {
    userId?: string;
    type?: NotificationType;
    types?: NotificationType[];
    priority?: NotificationPriority;
    priorities?: NotificationPriority[];
    status?: NotificationStatus;
    statuses?: NotificationStatus[];
    channel?: NotificationChannel;
    channels?: NotificationChannel[];
    scheduledMinDate?: Date;
    scheduledMaxDate?: Date;
    deliveredMinDate?: Date;
    deliveredMaxDate?: Date;
    readMinDate?: Date;
    readMaxDate?: Date;
    isRead?: boolean;
    isDismissible?: boolean;
    hasExpiration?: boolean;
    isExpired?: boolean;
    searchTerm?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    includeUser?: boolean;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for Notification entity
 */
export class NotificationRepository extends GenericRepository<Notification> {
    constructor() {
        super(Notification);
    }

    /**
     * Find notifications with detailed filtering options
     */
    async findWithFilters(filters: NotificationFilters): Promise<[Notification[], number]> {
        try {
            const queryOptions: FindManyOptions<Notification> = createQueryOptions<Notification>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { scheduledFor: 'DESC' };

            // Add relations if needed
            if (filters.includeUser) {
                queryOptions.relations = ['user'];
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user.id', filters.userId);
            }

            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.types && filters.types.length > 0) {
                addWhereCondition(queryOptions, 'type', In(filters.types));
            }

            if (filters.priority) {
                addWhereCondition(queryOptions, 'priority', filters.priority);
            }

            if (filters.priorities && filters.priorities.length > 0) {
                addWhereCondition(queryOptions, 'priority', In(filters.priorities));
            }

            if (filters.status) {
                addWhereCondition(queryOptions, 'status', filters.status);
            }

            if (filters.statuses && filters.statuses.length > 0) {
                addWhereCondition(queryOptions, 'status', In(filters.statuses));
            }

            if (filters.channel) {
                addWhereCondition(queryOptions, 'channel', filters.channel);
            }

            if (filters.channels && filters.channels.length > 0) {
                addWhereCondition(queryOptions, 'channel', In(filters.channels));
            }

            if (filters.isRead !== undefined) {
                if (filters.isRead) {
                    addWhereCondition(queryOptions, 'readAt', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'readAt', IsNull());
                }
            }

            if (filters.isDismissible !== undefined) {
                addWhereCondition(queryOptions, 'isDismissible', filters.isDismissible);
            }

            if (filters.hasExpiration !== undefined) {
                addWhereCondition(queryOptions, 'hasExpiration', filters.hasExpiration);
            }

            if (filters.isExpired !== undefined) {
                const now = new Date();
                if (filters.isExpired) {
                    addWhereCondition(queryOptions, 'hasExpiration', true);
                    addWhereCondition(queryOptions, 'expiresAt', LessThan(now));
                } else {
                    addWhereCondition(queryOptions, 'hasExpiration', false);
                    // Or not expired yet
                    const notExpiredCondition = { 
                        expiresAt: MoreThan(now) 
                    };
                    
                    if (!queryOptions.where) {
                        queryOptions.where = notExpiredCondition;
                    } else if (Array.isArray(queryOptions.where)) {
                        queryOptions.where.push(notExpiredCondition);
                    } else {
                        queryOptions.where = [queryOptions.where, notExpiredCondition];
                    }
                }
            }

            if (filters.relatedEntityType) {
                addWhereCondition(queryOptions, 'relatedEntityType', filters.relatedEntityType);
            }

            if (filters.relatedEntityId) {
                addWhereCondition(queryOptions, 'relatedEntityId', filters.relatedEntityId);
            }

            // Scheduled date range filters
            if (filters.scheduledMinDate && filters.scheduledMaxDate) {
                addWhereCondition(queryOptions, 'scheduledFor', 
                    Between(filters.scheduledMinDate, filters.scheduledMaxDate));
            } else if (filters.scheduledMinDate) {
                addWhereCondition(queryOptions, 'scheduledFor', 
                    MoreThan(filters.scheduledMinDate));
            } else if (filters.scheduledMaxDate) {
                addWhereCondition(queryOptions, 'scheduledFor', 
                    LessThan(filters.scheduledMaxDate));
            }

            // Delivered date range filters
            if (filters.deliveredMinDate && filters.deliveredMaxDate) {
                addWhereCondition(queryOptions, 'deliveredAt', 
                    Between(filters.deliveredMinDate, filters.deliveredMaxDate));
            } else if (filters.deliveredMinDate) {
                addWhereCondition(queryOptions, 'deliveredAt', 
                    MoreThan(filters.deliveredMinDate));
            } else if (filters.deliveredMaxDate) {
                addWhereCondition(queryOptions, 'deliveredAt', 
                    LessThan(filters.deliveredMaxDate));
            }

            // Read date range filters
            if (filters.readMinDate && filters.readMaxDate) {
                addWhereCondition(queryOptions, 'readAt', 
                    Between(filters.readMinDate, filters.readMaxDate));
            } else if (filters.readMinDate) {
                addWhereCondition(queryOptions, 'readAt', 
                    MoreThan(filters.readMinDate));
            } else if (filters.readMaxDate) {
                addWhereCondition(queryOptions, 'readAt', 
                    LessThan(filters.readMaxDate));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    LessThan(filters.createdMaxDate));
            }

            // Search term for title and message
            if (filters.searchTerm) {
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { title: searchPattern },
                    { message: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in NotificationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find pending notifications to be sent
     */
    async findPendingNotifications(): Promise<Notification[]> {
        try {
            const now = new Date();
            const queryOptions: FindManyOptions<Notification> = createQueryOptions<Notification>({});
            
            // Set sorting
            queryOptions.order = { 
                priority: 'DESC',
                scheduledFor: 'ASC'
            };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'status', NotificationStatus.PENDING);
            addWhereCondition(queryOptions, 'scheduledFor', LessThan(now));

            // Not expired
            const notExpiredCondition = [
                { hasExpiration: false },
                { 
                    hasExpiration: true,
                    expiresAt: MoreThan(now) 
                }
            ];
            
            if (!queryOptions.where) {
                queryOptions.where = notExpiredCondition;
            } else if (Array.isArray(queryOptions.where)) {
                queryOptions.where = [...queryOptions.where, ...notExpiredCondition];
            } else {
                queryOptions.where = [queryOptions.where, ...notExpiredCondition];
            }

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in NotificationRepository.findPendingNotifications', { error });
            throw error;
        }
    }

    /**
     * Find user's unread notifications
     */
    async findUnreadByUser(userId: string, limit: number = 20): Promise<Notification[]> {
        try {
            const now = new Date();
            const queryOptions: FindManyOptions<Notification> = createQueryOptions<Notification>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { 
                priority: 'DESC',
                scheduledFor: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'status', In([NotificationStatus.DELIVERED, NotificationStatus.PENDING]));
            addWhereCondition(queryOptions, 'readAt', IsNull());

            // Not expired
            const notExpiredCondition = [
                { hasExpiration: false },
                { 
                    hasExpiration: true,
                    expiresAt: MoreThan(now) 
                }
            ];
            
            if (!queryOptions.where) {
                queryOptions.where = notExpiredCondition;
            } else if (Array.isArray(queryOptions.where)) {
                queryOptions.where = [...queryOptions.where, ...notExpiredCondition];
            } else {
                queryOptions.where = [queryOptions.where, ...notExpiredCondition];
            }

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in NotificationRepository.findUnreadByUser', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find notifications by type
     */
    async findByType(type: NotificationType, limit: number = 20): Promise<Notification[]> {
        try {
            const queryOptions: FindManyOptions<Notification> = createQueryOptions<Notification>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { scheduledFor: 'DESC' };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'type', type);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in NotificationRepository.findByType', { error, type, limit });
            throw error;
        }
    }

    /**
     * Mark a notification as delivered
     */
    async markAsDelivered(notificationId: string): Promise<void> {
        try {
            await this.repository.update(notificationId, {
                status: NotificationStatus.DELIVERED,
                deliveredAt: new Date()
            });
        } catch (error) {
            logger.error('Error in NotificationRepository.markAsDelivered', { error, notificationId });
            throw error;
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await this.repository.update(notificationId, {
                status: NotificationStatus.READ,
                readAt: new Date()
            });
        } catch (error) {
            logger.error('Error in NotificationRepository.markAsRead', { error, notificationId });
            throw error;
        }
    }

    /**
     * Mark all user's notifications as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const now = new Date();
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                    status: NotificationStatus.READ,
                    readAt: now
                })
                .where('user_id = :userId', { userId })
                .andWhere('status IN (:...statuses)', { 
                    statuses: [NotificationStatus.DELIVERED, NotificationStatus.PENDING] 
                })
                .andWhere('readAt IS NULL')
                .execute();
        } catch (error) {
            logger.error('Error in NotificationRepository.markAllAsRead', { error, userId });
            throw error;
        }
    }

    /**
     * Cancel a notification
     */
    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await this.repository.update(notificationId, {
                status: NotificationStatus.CANCELLED
            });
        } catch (error) {
            logger.error('Error in NotificationRepository.cancelNotification', { error, notificationId });
            throw error;
        }
    }

    /**
     * Get notification counts by type
     */
    async getNotificationCounts(userId: string): Promise<any> {
        try {
            // Perform the calculation using TypeORM query builder for raw SQL
            const counts = await this.repository
                .createQueryBuilder('notification')
                .select('notification.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .where('notification.user_id = :userId', { userId })
                .groupBy('notification.type')
                .orderBy('count', 'DESC')
                .getRawMany();
            
            const unreadCount = await this.repository.count({
                where: {
                    user: { id: userId },
                    status: In([NotificationStatus.DELIVERED, NotificationStatus.PENDING]),
                    readAt: IsNull()
                }
            });
            
            return {
                total: counts.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0),
                unread: unreadCount,
                byType: counts
            };
        } catch (error) {
            logger.error('Error in NotificationRepository.getNotificationCounts', { error, userId });
            throw error;
        }
    }

    /**
     * Schedule notifications in bulk
     */
    async scheduleNotifications(notifications: Partial<Notification>[]): Promise<Notification[]> {
        try {
            // Create notification entities properly
            const notificationEntities: Notification[] = [];
            
            for (const notification of notifications) {
                const entity = this.repository.create(notification);
                notificationEntities.push(entity);
            }
            
            // Save all notifications in a single transaction
            const savedNotifications = await this.repository.save(notificationEntities);
            return savedNotifications;
        } catch (error) {
            logger.error('Error in NotificationRepository.scheduleNotifications', { error, count: notifications.length });
            throw error;
        }
    }

    /**
     * Remove expired notifications
     */
    async cleanupExpiredNotifications(): Promise<number> {
        try {
            const now = new Date();
            const result = await this.repository
                .createQueryBuilder()
                .delete()
                .where('hasExpiration = :hasExpiration', { hasExpiration: true })
                .andWhere('expiresAt < :now', { now })
                .execute();
            
            return result.affected || 0;
        } catch (error) {
            logger.error('Error in NotificationRepository.cleanupExpiredNotifications', { error });
            throw error;
        }
    }
} 