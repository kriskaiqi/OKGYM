"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityRepository = void 0;
const typeorm_1 = require("typeorm");
const UserActivity_1 = require("../models/UserActivity");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class UserActivityRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(UserActivity_1.UserActivity);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { timestamp: 'DESC' };
            queryOptions.relations = ['user'];
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.platform) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'platform', filters.platform);
            }
            if (filters.timestampMin && filters.timestampMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timestamp', (0, typeorm_1.Between)(filters.timestampMin, filters.timestampMax));
            }
            else if (filters.timestampMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timestamp', (0, typeorm_1.MoreThan)(filters.timestampMin));
            }
            else if (filters.timestampMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timestamp', (0, typeorm_1.LessThan)(filters.timestampMax));
            }
            if (filters.ipAddress) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'context.ip', filters.ipAddress);
            }
            if (filters.sessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'context.sessionId', filters.sessionId);
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByUser(userId, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.findByUser', { error, userId });
            throw error;
        }
    }
    async findByType(type, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            queryOptions.relations = ['user'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.findByType', { error, type });
            throw error;
        }
    }
    async findByPlatform(platform, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'platform', platform);
            queryOptions.relations = ['user'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.findByPlatform', { error, platform });
            throw error;
        }
    }
    async findByEntityId(entityId, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { timestamp: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'details.entityId', entityId);
            queryOptions.relations = ['user'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.findByEntityId', { error, entityId });
            throw error;
        }
    }
    async logActivity(activity) {
        try {
            const newActivity = this.repository.create(activity);
            return await this.repository.save(newActivity);
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.logActivity', { error, activity });
            throw error;
        }
    }
    async getUserActivityStats(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const activities = await this.findWithFilters({
                userId,
                timestampMin: startDate
            });
            const typeStats = activities[0].reduce((acc, activity) => {
                const type = activity.type;
                if (!acc[type]) {
                    acc[type] = 0;
                }
                acc[type]++;
                return acc;
            }, {});
            const platformStats = activities[0].reduce((acc, activity) => {
                const platform = activity.platform;
                if (!acc[platform]) {
                    acc[platform] = 0;
                }
                acc[platform]++;
                return acc;
            }, {});
            const dailyStats = activities[0].reduce((acc, activity) => {
                const date = activity.timestamp.toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date]++;
                return acc;
            }, {});
            return {
                total: activities[1],
                byType: typeStats,
                byPlatform: platformStats,
                byDay: dailyStats
            };
        }
        catch (error) {
            logger_1.default.error('Error in UserActivityRepository.getUserActivityStats', { error, userId, days });
            throw error;
        }
    }
}
exports.UserActivityRepository = UserActivityRepository;
//# sourceMappingURL=UserActivityRepository.js.map