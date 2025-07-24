"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricTrackingRepository = void 0;
const typeorm_1 = require("typeorm");
const MetricTracking_1 = require("../models/MetricTracking");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class MetricTrackingRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(MetricTracking_1.MetricTracking);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { recordedAt: 'DESC' };
            const relations = [];
            if (filters.includeUser)
                relations.push('user');
            if (filters.includeExercise)
                relations.push('exercise');
            if (filters.includeWorkoutSession)
                relations.push('workoutSession');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', filters.userId);
            }
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', filters.category);
            }
            if (filters.categories && filters.categories.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', (0, typeorm_1.In)(filters.categories));
            }
            if (filters.name) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'name', filters.name);
            }
            if (filters.names && filters.names.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'name', (0, typeorm_1.In)(filters.names));
            }
            if (filters.valueType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'valueType', filters.valueType);
            }
            if (filters.valueTypes && filters.valueTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'valueType', (0, typeorm_1.In)(filters.valueTypes));
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise.id', filters.exerciseId);
            }
            if (filters.workoutSessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutSession.id', filters.workoutSessionId);
            }
            if (filters.unit) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'unit', filters.unit);
            }
            if (filters.source) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'source', filters.source);
            }
            if (filters.isBaseline !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isBaseline', filters.isBaseline);
            }
            if (filters.trend) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'trend', filters.trend);
            }
            if (filters.trends && filters.trends.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'trend', (0, typeorm_1.In)(filters.trends));
            }
            if (filters.minValue !== undefined && filters.maxValue !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.Between)(filters.minValue, filters.maxValue));
            }
            else if (filters.minValue !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.MoreThan)(filters.minValue));
            }
            else if (filters.maxValue !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'value', (0, typeorm_1.LessThan)(filters.maxValue));
            }
            if (filters.minConfidence !== undefined && filters.maxConfidence !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidence', (0, typeorm_1.Between)(filters.minConfidence, filters.maxConfidence));
            }
            else if (filters.minConfidence !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidence', (0, typeorm_1.MoreThan)(filters.minConfidence));
            }
            else if (filters.maxConfidence !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidence', (0, typeorm_1.LessThan)(filters.maxConfidence));
            }
            if (filters.recordedMinDate && filters.recordedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'recordedAt', (0, typeorm_1.Between)(filters.recordedMinDate, filters.recordedMaxDate));
            }
            else if (filters.recordedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'recordedAt', (0, typeorm_1.MoreThan)(filters.recordedMinDate));
            }
            else if (filters.recordedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'recordedAt', (0, typeorm_1.LessThan)(filters.recordedMaxDate));
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
            if (filters.hasCompoundValues !== undefined) {
                if (filters.hasCompoundValues) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'compoundValues', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'compoundValues', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.hasTarget !== undefined) {
                if (filters.hasTarget) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'target', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'target', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.targetMet !== undefined && filters.hasTarget !== false) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'target', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                const [metrics, count] = await this.repository.findAndCount(queryOptions);
                const filteredMetrics = metrics.filter(metric => {
                    const isTargetMet = metric.isTargetMet();
                    return filters.targetMet ? isTargetMet : !isTargetMet;
                });
                return [filteredMetrics, filteredMetrics.length];
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ name: searchPattern }, { notes: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByCategory(userId, category, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.findByCategory', { error, userId, category, limit });
            throw error;
        }
    }
    async findByNameAndCategory(userId, name, category, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'name', name);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.findByNameAndCategory', { error, userId, name, category, limit });
            throw error;
        }
    }
    async findByExercise(userId, exerciseId, limit = 50) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise.id', exerciseId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.findByExercise', { error, userId, exerciseId, limit });
            throw error;
        }
    }
    async findByWorkoutSession(userId, workoutSessionId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { recordedAt: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutSession.id', workoutSessionId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.findByWorkoutSession', { error, userId, workoutSessionId });
            throw error;
        }
    }
    async getMostRecent(userId, name, category) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = 1;
            queryOptions.order = { recordedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'name', name);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            const results = await this.repository.find(queryOptions);
            return results.length > 0 ? results[0] : null;
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.getMostRecent', { error, userId, name, category });
            throw error;
        }
    }
    async getBaseline(userId, name, category) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'name', name);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isBaseline', true);
            return await this.repository.findOne(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.getBaseline', { error, userId, name, category });
            throw error;
        }
    }
    async getTrendAnalysis(userId, name, category, timeSpan = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (timeSpan * 24 * 60 * 60 * 1000));
            const metrics = await this.repository.find({
                where: {
                    user: { id: userId },
                    name,
                    category,
                    recordedAt: (0, typeorm_1.Between)(startDate, endDate)
                },
                order: { recordedAt: 'ASC' }
            });
            if (metrics.length === 0) {
                return {
                    trendDirection: null,
                    changeRate: 0,
                    minValue: 0,
                    maxValue: 0,
                    averageValue: 0,
                    totalChange: 0,
                    percentChange: 0,
                    dataPoints: 0
                };
            }
            const values = metrics.map(m => m.value);
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            const totalChange = lastValue - firstValue;
            const percentChange = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
            let trendDirection = Enums_1.TrendDirection.STABLE;
            if (percentChange > 5) {
                trendDirection = Enums_1.TrendDirection.INCREASING;
            }
            else if (percentChange < -5) {
                trendDirection = Enums_1.TrendDirection.DECREASING;
            }
            else {
                const stdDev = this.calculateStandardDeviation(values);
                if (stdDev > (averageValue * 0.1)) {
                    trendDirection = Enums_1.TrendDirection.FLUCTUATING;
                }
            }
            const timeDiffDays = (metrics[metrics.length - 1].recordedAt.getTime() -
                metrics[0].recordedAt.getTime()) / (24 * 60 * 60 * 1000);
            const changeRate = timeDiffDays > 0 ? totalChange / timeDiffDays : 0;
            return {
                trendDirection,
                changeRate,
                minValue,
                maxValue,
                averageValue,
                totalChange,
                percentChange,
                dataPoints: metrics.length,
                stdDev: this.calculateStandardDeviation(values),
                values: metrics.map(m => ({
                    date: m.recordedAt,
                    value: m.value
                }))
            };
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.getTrendAnalysis', { error, userId, name, category, timeSpan });
            throw error;
        }
    }
    async updateTrendDirections(userId, category) {
        try {
            const metrics = await this.repository
                .createQueryBuilder('metric')
                .select('DISTINCT metric.name', 'name')
                .where('metric.user_id = :userId', { userId })
                .andWhere('metric.category = :category', { category })
                .getRawMany();
            let updatedCount = 0;
            for (const metric of metrics) {
                const name = metric.name;
                const analysis = await this.getTrendAnalysis(userId, name, category);
                if (analysis.dataPoints >= 2) {
                    const result = await this.repository
                        .createQueryBuilder()
                        .update()
                        .set({ trend: analysis.trendDirection })
                        .where('user_id = :userId', { userId })
                        .andWhere('category = :category', { category })
                        .andWhere('name = :name', { name })
                        .execute();
                    updatedCount += result.affected || 0;
                }
            }
            return updatedCount;
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.updateTrendDirections', { error, userId, category });
            throw error;
        }
    }
    async setAsBaseline(metricId) {
        try {
            const metric = await this.repository.findOne({
                where: { id: metricId },
                relations: ['user']
            });
            if (!metric) {
                throw new Error(`Metric with ID ${metricId} not found`);
            }
            await this.repository
                .createQueryBuilder()
                .update()
                .set({ isBaseline: false })
                .where('user_id = :userId', { userId: metric.user.id })
                .andWhere('category = :category', { category: metric.category })
                .andWhere('name = :name', { name: metric.name })
                .andWhere('isBaseline = :isBaseline', { isBaseline: true })
                .execute();
            await this.repository.update(metricId, { isBaseline: true });
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.setAsBaseline', { error, metricId });
            throw error;
        }
    }
    async getProgressFromBaseline(userId, name, category) {
        try {
            const baseline = await this.getBaseline(userId, name, category);
            if (!baseline) {
                return {
                    hasBaseline: false,
                    progress: 0,
                    percentChange: 0
                };
            }
            const current = await this.getMostRecent(userId, name, category);
            if (!current || current.id === baseline.id) {
                return {
                    hasBaseline: true,
                    progress: 0,
                    percentChange: 0,
                    baselineValue: baseline.value,
                    currentValue: baseline.value,
                    baselineDate: baseline.recordedAt
                };
            }
            const change = current.value - baseline.value;
            const percentChange = baseline.value > 0 ? (change / baseline.value) * 100 : 0;
            return {
                hasBaseline: true,
                progress: change,
                percentChange,
                baselineValue: baseline.value,
                currentValue: current.value,
                baselineDate: baseline.recordedAt,
                currentDate: current.recordedAt
            };
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.getProgressFromBaseline', { error, userId, name, category });
            throw error;
        }
    }
    async createBulk(metrics) {
        try {
            const metricEntities = [];
            for (const metric of metrics) {
                const entity = this.repository.create(metric);
                metricEntities.push(entity);
            }
            const savedMetrics = await this.repository.save(metricEntities);
            return savedMetrics;
        }
        catch (error) {
            logger_1.default.error('Error in MetricTrackingRepository.createBulk', { error, count: metrics.length });
            throw error;
        }
    }
    calculateStandardDeviation(values) {
        if (values.length <= 1)
            return 0;
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }
}
exports.MetricTrackingRepository = MetricTrackingRepository;
//# sourceMappingURL=MetricTrackingRepository.js.map