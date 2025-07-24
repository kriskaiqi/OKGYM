"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const typeorm_1 = require("typeorm");
const Notification_1 = require("../models/Notification");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(Notification_1.Notification);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { scheduledFor: 'DESC' };
            if (filters.includeUser) {
                queryOptions.relations = ['user'];
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', filters.userId);
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.types && filters.types.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', (0, typeorm_1.In)(filters.types));
            }
            if (filters.priority) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'priority', filters.priority);
            }
            if (filters.priorities && filters.priorities.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'priority', (0, typeorm_1.In)(filters.priorities));
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', filters.status);
            }
            if (filters.statuses && filters.statuses.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', (0, typeorm_1.In)(filters.statuses));
            }
            if (filters.channel) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'channel', filters.channel);
            }
            if (filters.channels && filters.channels.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'channel', (0, typeorm_1.In)(filters.channels));
            }
            if (filters.isRead !== undefined) {
                if (filters.isRead) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.isDismissible !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isDismissible', filters.isDismissible);
            }
            if (filters.hasExpiration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'hasExpiration', filters.hasExpiration);
            }
            if (filters.isExpired !== undefined) {
                const now = new Date();
                if (filters.isExpired) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'hasExpiration', true);
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'expiresAt', (0, typeorm_1.LessThan)(now));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'hasExpiration', false);
                    const notExpiredCondition = {
                        expiresAt: (0, typeorm_1.MoreThan)(now)
                    };
                    if (!queryOptions.where) {
                        queryOptions.where = notExpiredCondition;
                    }
                    else if (Array.isArray(queryOptions.where)) {
                        queryOptions.where.push(notExpiredCondition);
                    }
                    else {
                        queryOptions.where = [queryOptions.where, notExpiredCondition];
                    }
                }
            }
            if (filters.relatedEntityType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relatedEntityType', filters.relatedEntityType);
            }
            if (filters.relatedEntityId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relatedEntityId', filters.relatedEntityId);
            }
            if (filters.scheduledMinDate && filters.scheduledMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'scheduledFor', (0, typeorm_1.Between)(filters.scheduledMinDate, filters.scheduledMaxDate));
            }
            else if (filters.scheduledMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'scheduledFor', (0, typeorm_1.MoreThan)(filters.scheduledMinDate));
            }
            else if (filters.scheduledMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'scheduledFor', (0, typeorm_1.LessThan)(filters.scheduledMaxDate));
            }
            if (filters.deliveredMinDate && filters.deliveredMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'deliveredAt', (0, typeorm_1.Between)(filters.deliveredMinDate, filters.deliveredMaxDate));
            }
            else if (filters.deliveredMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'deliveredAt', (0, typeorm_1.MoreThan)(filters.deliveredMinDate));
            }
            else if (filters.deliveredMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'deliveredAt', (0, typeorm_1.LessThan)(filters.deliveredMaxDate));
            }
            if (filters.readMinDate && filters.readMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.Between)(filters.readMinDate, filters.readMaxDate));
            }
            else if (filters.readMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.MoreThan)(filters.readMinDate));
            }
            else if (filters.readMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.LessThan)(filters.readMaxDate));
            }
            if (filters.createdMinDate && filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.Between)(filters.createdMinDate, filters.createdMaxDate));
            }
            else if (filters.createdMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.MoreThan)(filters.createdMinDate));
            }
            else if (filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.LessThan)(filters.createdMaxDate));
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ title: searchPattern }, { message: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findPendingNotifications() {
        try {
            const now = new Date();
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                priority: 'DESC',
                scheduledFor: 'ASC'
            };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', Notification_1.NotificationStatus.PENDING);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'scheduledFor', (0, typeorm_1.LessThan)(now));
            const notExpiredCondition = [
                { hasExpiration: false },
                {
                    hasExpiration: true,
                    expiresAt: (0, typeorm_1.MoreThan)(now)
                }
            ];
            if (!queryOptions.where) {
                queryOptions.where = notExpiredCondition;
            }
            else if (Array.isArray(queryOptions.where)) {
                queryOptions.where = [...queryOptions.where, ...notExpiredCondition];
            }
            else {
                queryOptions.where = [queryOptions.where, ...notExpiredCondition];
            }
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.findPendingNotifications', { error });
            throw error;
        }
    }
    async findUnreadByUser(userId, limit = 20) {
        try {
            const now = new Date();
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = {
                priority: 'DESC',
                scheduledFor: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', (0, typeorm_1.In)([Notification_1.NotificationStatus.DELIVERED, Notification_1.NotificationStatus.PENDING]));
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'readAt', (0, typeorm_1.IsNull)());
            const notExpiredCondition = [
                { hasExpiration: false },
                {
                    hasExpiration: true,
                    expiresAt: (0, typeorm_1.MoreThan)(now)
                }
            ];
            if (!queryOptions.where) {
                queryOptions.where = notExpiredCondition;
            }
            else if (Array.isArray(queryOptions.where)) {
                queryOptions.where = [...queryOptions.where, ...notExpiredCondition];
            }
            else {
                queryOptions.where = [queryOptions.where, ...notExpiredCondition];
            }
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.findUnreadByUser', { error, userId, limit });
            throw error;
        }
    }
    async findByType(type, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { scheduledFor: 'DESC' };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.findByType', { error, type, limit });
            throw error;
        }
    }
    async markAsDelivered(notificationId) {
        try {
            await this.repository.update(notificationId, {
                status: Notification_1.NotificationStatus.DELIVERED,
                deliveredAt: new Date()
            });
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.markAsDelivered', { error, notificationId });
            throw error;
        }
    }
    async markAsRead(notificationId) {
        try {
            await this.repository.update(notificationId, {
                status: Notification_1.NotificationStatus.READ,
                readAt: new Date()
            });
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.markAsRead', { error, notificationId });
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const now = new Date();
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                status: Notification_1.NotificationStatus.READ,
                readAt: now
            })
                .where('user_id = :userId', { userId })
                .andWhere('status IN (:...statuses)', {
                statuses: [Notification_1.NotificationStatus.DELIVERED, Notification_1.NotificationStatus.PENDING]
            })
                .andWhere('readAt IS NULL')
                .execute();
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.markAllAsRead', { error, userId });
            throw error;
        }
    }
    async cancelNotification(notificationId) {
        try {
            await this.repository.update(notificationId, {
                status: Notification_1.NotificationStatus.CANCELLED
            });
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.cancelNotification', { error, notificationId });
            throw error;
        }
    }
    async getNotificationCounts(userId) {
        try {
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
                    status: (0, typeorm_1.In)([Notification_1.NotificationStatus.DELIVERED, Notification_1.NotificationStatus.PENDING]),
                    readAt: (0, typeorm_1.IsNull)()
                }
            });
            return {
                total: counts.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0),
                unread: unreadCount,
                byType: counts
            };
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.getNotificationCounts', { error, userId });
            throw error;
        }
    }
    async scheduleNotifications(notifications) {
        try {
            const notificationEntities = [];
            for (const notification of notifications) {
                const entity = this.repository.create(notification);
                notificationEntities.push(entity);
            }
            const savedNotifications = await this.repository.save(notificationEntities);
            return savedNotifications;
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.scheduleNotifications', { error, count: notifications.length });
            throw error;
        }
    }
    async cleanupExpiredNotifications() {
        try {
            const now = new Date();
            const result = await this.repository
                .createQueryBuilder()
                .delete()
                .where('hasExpiration = :hasExpiration', { hasExpiration: true })
                .andWhere('expiresAt < :now', { now })
                .execute();
            return result.affected || 0;
        }
        catch (error) {
            logger_1.default.error('Error in NotificationRepository.cleanupExpiredNotifications', { error });
            throw error;
        }
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=NotificationRepository.js.map