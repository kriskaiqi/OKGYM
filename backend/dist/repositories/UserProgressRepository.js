"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProgressRepository = void 0;
const typeorm_1 = require("typeorm");
const UserProgress_1 = require("../models/UserProgress");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class UserProgressRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(UserProgress_1.UserProgress);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { date: 'DESC' };
            if (filters.includeMetricTracking) {
                queryOptions.relations = ['metricTracking'];
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.trend) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'trend', filters.trend);
            }
            if (filters.metricName) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'metricName', filters.metricName);
            }
            if (filters.dateMin && filters.dateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.Between)(filters.dateMin, filters.dateMax));
            }
            else if (filters.dateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.MoreThan)(filters.dateMin));
            }
            else if (filters.dateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.LessThan)(filters.dateMax));
            }
            if (filters.valueMin && filters.valueMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.Between)(filters.valueMin, filters.valueMax));
            }
            else if (filters.valueMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.MoreThan)(filters.valueMin));
            }
            else if (filters.valueMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.LessThan)(filters.valueMax));
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserProgressRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByUser(userId, includeMetricTracking = false) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { date: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            if (includeMetricTracking) {
                queryOptions.relations = ['metricTracking'];
            }
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserProgressRepository.findByUser', { error, userId });
            throw error;
        }
    }
    async findByMetric(userId, metricName, limit = 30) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { date: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'metricName', metricName);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserProgressRepository.findByMetric', { error, userId, metricName });
            throw error;
        }
    }
    async findByType(userId, type, limit = 30) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { date: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserProgressRepository.findByType', { error, userId, type });
            throw error;
        }
    }
    async updateTrend(progressId, trend) {
        try {
            await this.repository.update(progressId, { trend });
        }
        catch (error) {
            logger_1.default.error('Error in UserProgressRepository.updateTrend', { error, progressId, trend });
            throw error;
        }
    }
}
exports.UserProgressRepository = UserProgressRepository;
//# sourceMappingURL=UserProgressRepository.js.map