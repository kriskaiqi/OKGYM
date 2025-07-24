"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricTrackingService = void 0;
const BodyMetric_1 = require("../models/BodyMetric");
const MetricTracking_1 = require("../models/MetricTracking");
const repositories_1 = require("../repositories");
const Enums_1 = require("../models/shared/Enums");
const errors_1 = require("../utils/errors");
const transaction_helper_1 = require("../utils/transaction-helper");
const performance_1 = require("../utils/performance");
const logger_1 = __importDefault(require("../utils/logger"));
class MetricTrackingService {
    constructor(bodyMetricRepo = new repositories_1.BodyMetricRepository(), metricRepo = new repositories_1.MetricTrackingRepository()) {
        this.bodyMetricRepo = bodyMetricRepo;
        this.metricRepo = metricRepo;
    }
    async recordBodyMetric(data) {
        try {
            logger_1.default.info(`Recording body metric for user ${data.userId}, area: ${data.bodyArea}`);
            if (data.value < 0) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Metric value cannot be negative', 400);
            }
            const previousMetrics = await this.bodyMetricRepo.getLatestMetrics(data.userId, [data.bodyArea]);
            const previousMetric = previousMetrics[data.bodyArea];
            if (previousMetric) {
                if (!data.metadata) {
                    data.metadata = new BodyMetric_1.BodyMetricMetadata();
                }
                data.metadata.previousValue = previousMetric.value;
                data.metadata.previousDate = previousMetric.measurementDate;
                const changeAmount = data.value - previousMetric.value;
                data.metadata.changeAmount = changeAmount;
                if (previousMetric.value > 0) {
                    const changePercent = (changeAmount / previousMetric.value) * 100;
                    data.metadata.changePercent = parseFloat(changePercent.toFixed(2));
                }
            }
            return this.bodyMetricRepo.addMeasurement(data);
        }
        catch (error) {
            logger_1.default.error('Error recording body metric', { error, userId: data.userId, bodyArea: data.bodyArea });
            throw error;
        }
    }
    async recordPerformanceMetric(data) {
        var _a;
        try {
            logger_1.default.info(`Recording performance metric for user ${data.userId}, category: ${data.category}`);
            if (data.category !== Enums_1.MetricCategory.PERFORMANCE &&
                data.category !== Enums_1.MetricCategory.WORKOUT &&
                data.category !== Enums_1.MetricCategory.FORM) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Invalid category for performance metric: ${data.category}`, 400);
            }
            const previousMetrics = await this.metricRepo.findByNameAndCategory(data.userId, data.name, data.category, 1);
            const metric = new MetricTracking_1.MetricTracking();
            metric.user = { id: data.userId };
            metric.category = data.category;
            metric.name = data.name;
            metric.valueType = data.valueType || Enums_1.MetricValueType.NUMERIC;
            metric.value = data.value;
            metric.compoundValues = data.compoundValues || {};
            metric.unit = data.unit || '';
            metric.recordedAt = data.recordedAt || new Date();
            metric.source = data.source || '';
            metric.notes = data.notes || '';
            metric.target = (_a = data.target) !== null && _a !== void 0 ? _a : 0;
            metric.isBaseline = data.isBaseline || false;
            metric.confidence = data.confidence || 1.0;
            if (data.exerciseId) {
                metric.exercise = { id: data.exerciseId };
            }
            if (data.workoutSessionId) {
                metric.workoutSession = { id: data.workoutSessionId };
            }
            if (previousMetrics.length > 0) {
                const previousMetric = previousMetrics[0];
                const metaData = new MetricTracking_1.MetricMetadata();
                metaData.previousValue = previousMetric.value;
                metaData.previousDate = previousMetric.recordedAt;
                if (previousMetric.value > 0) {
                    const changePercent = ((data.value - previousMetric.value) / previousMetric.value) * 100;
                    metaData.changePercent = parseFloat(changePercent.toFixed(2));
                }
                metric.metadata = metaData;
            }
            else if (data.metadata) {
                metric.metadata = data.metadata;
            }
            else {
                metric.metadata = new MetricTracking_1.MetricMetadata();
            }
            const savedMetric = await this.metricRepo.save(metric);
            return Array.isArray(savedMetric) ? savedMetric[0] : savedMetric;
        }
        catch (error) {
            logger_1.default.error('Error recording performance metric', {
                error,
                userId: data.userId,
                category: data.category,
                name: data.name
            });
            throw error;
        }
    }
    async recordMultipleMetrics(metrics) {
        try {
            logger_1.default.info(`Recording ${metrics.length} metrics in bulk`);
            return await (0, transaction_helper_1.executeTransaction)(async () => {
                var _a, _b, _c;
                const metricEntities = [];
                for (const data of metrics) {
                    const metric = new MetricTracking_1.MetricTracking();
                    metric.user = { id: data.userId };
                    metric.category = data.category;
                    metric.name = data.name;
                    metric.valueType = data.valueType || Enums_1.MetricValueType.NUMERIC;
                    metric.value = data.value;
                    metric.compoundValues = data.compoundValues || {};
                    metric.unit = data.unit || '';
                    metric.recordedAt = data.recordedAt || new Date();
                    metric.source = data.source || '';
                    metric.notes = data.notes || '';
                    metric.target = (_a = data.target) !== null && _a !== void 0 ? _a : 0;
                    metric.isBaseline = data.isBaseline || false;
                    metric.confidence = (_b = data.confidence) !== null && _b !== void 0 ? _b : 1.0;
                    metric.metadata = (_c = data.metadata) !== null && _c !== void 0 ? _c : new MetricTracking_1.MetricMetadata();
                    if (data.exerciseId) {
                        metric.exercise = { id: data.exerciseId };
                    }
                    if (data.workoutSessionId) {
                        metric.workoutSession = { id: data.workoutSessionId };
                    }
                    metricEntities.push(metric);
                }
                return await this.metricRepo.createBulk(metricEntities);
            });
        }
        catch (error) {
            logger_1.default.error('Error recording multiple metrics', { error, count: metrics.length });
            throw error;
        }
    }
    async getLatestBodyMetrics(userId, bodyArea, limit = 10) {
        try {
            logger_1.default.info(`Getting latest body metrics for user ${userId}`);
            if (bodyArea) {
                const metrics = await this.bodyMetricRepo.getLatestMetrics(userId, [bodyArea]);
                return Object.values(metrics).filter(m => m !== null);
            }
            else {
                const [metrics] = await this.bodyMetricRepo.findWithFilters({
                    userId,
                    limit,
                    sortBy: 'measurementDate',
                    sortDirection: 'DESC'
                });
                return metrics;
            }
        }
        catch (error) {
            logger_1.default.error('Error getting latest body metrics', { error, userId, bodyArea });
            throw error;
        }
    }
    async getBodyMetricHistory(userId, bodyArea, days = 90) {
        try {
            logger_1.default.info(`Getting body metric history for user ${userId}, area: ${bodyArea}, days: ${days}`);
            return this.bodyMetricRepo.getMetricHistory(userId, bodyArea, days);
        }
        catch (error) {
            logger_1.default.error('Error getting body metric history', { error, userId, bodyArea, days });
            throw error;
        }
    }
    async getLatestPerformanceMetrics(userId, category = Enums_1.MetricCategory.PERFORMANCE, limit = 10) {
        try {
            logger_1.default.info(`Getting latest performance metrics for user ${userId}, category: ${category}`);
            const metrics = await this.metricRepo.findByCategory(userId, category, limit);
            return metrics;
        }
        catch (error) {
            logger_1.default.error('Error getting latest performance metrics', { error, userId, category });
            throw error;
        }
    }
    async getExercisePerformanceMetrics(userId, exerciseId, limit = 20) {
        try {
            logger_1.default.info(`Getting performance metrics for user ${userId}, exercise: ${exerciseId}`);
            const [metrics] = await this.metricRepo.findWithFilters({
                userId,
                exerciseId,
                category: Enums_1.MetricCategory.PERFORMANCE,
                limit,
                sortBy: 'recordedAt',
                sortDirection: 'DESC'
            });
            return metrics;
        }
        catch (error) {
            logger_1.default.error('Error getting exercise performance metrics', { error, userId, exerciseId });
            throw error;
        }
    }
    async getHistoricalMetrics(userId, filters = {}) {
        try {
            logger_1.default.info(`Getting historical metrics for user ${userId}`);
            return this.metricRepo.findWithFilters({
                userId,
                category: filters.category,
                name: filters.name,
                recordedMinDate: filters.dateStart,
                recordedMaxDate: filters.dateEnd,
                limit: filters.limit || 50,
                offset: filters.offset || 0,
                sortBy: 'recordedAt',
                sortDirection: 'DESC',
                includeExercise: true,
                includeWorkoutSession: true
            });
        }
        catch (error) {
            logger_1.default.error('Error getting historical metrics', { error, userId, filters });
            throw error;
        }
    }
    async setMetricAsBaseline(metricId) {
        try {
            logger_1.default.info(`Setting metric ${metricId} as baseline`);
            const metric = await this.metricRepo.findOne({
                where: { id: metricId },
                relations: ['user']
            });
            if (!metric) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Metric with ID ${metricId} not found`, 404);
            }
            await this.metricRepo.setAsBaseline(metricId);
            const updatedMetric = await this.metricRepo.findOne({
                where: { id: metricId }
            });
            if (!updatedMetric) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Metric with ID ${metricId} not found after update`, 404);
            }
            return updatedMetric;
        }
        catch (error) {
            logger_1.default.error('Error setting metric as baseline', { error, metricId });
            throw error;
        }
    }
    async deleteMetric(metricId, metricType) {
        try {
            logger_1.default.info(`Deleting ${metricType} metric ${metricId}`);
            if (metricType === 'body') {
                const metric = await this.bodyMetricRepo.findOne({
                    where: { id: metricId }
                });
                if (!metric) {
                    throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Body metric with ID ${metricId} not found`, 404);
                }
                await this.bodyMetricRepo.delete(metricId);
            }
            else {
                const metric = await this.metricRepo.findOne({
                    where: { id: metricId }
                });
                if (!metric) {
                    throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Performance metric with ID ${metricId} not found`, 404);
                }
                await this.metricRepo.delete(metricId);
            }
        }
        catch (error) {
            logger_1.default.error('Error deleting metric', { error, metricId, metricType });
            throw error;
        }
    }
    async getWorkoutSessionMetrics(workoutSessionId) {
        try {
            logger_1.default.info(`Getting metrics for workout session ${workoutSessionId}`);
            const [metrics] = await this.metricRepo.findWithFilters({
                workoutSessionId,
                sortBy: 'recordedAt',
                sortDirection: 'ASC',
                includeExercise: true
            });
            return metrics;
        }
        catch (error) {
            logger_1.default.error('Error getting workout session metrics', { error, workoutSessionId });
            throw error;
        }
    }
}
exports.MetricTrackingService = MetricTrackingService;
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "recordBodyMetric", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "recordPerformanceMetric", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "recordMultipleMetrics", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getLatestBodyMetrics", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getBodyMetricHistory", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getLatestPerformanceMetrics", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getExercisePerformanceMetrics", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getHistoricalMetrics", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "setMetricAsBaseline", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "deleteMetric", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricTrackingService.prototype, "getWorkoutSessionMetrics", null);
//# sourceMappingURL=MetricTrackingService.js.map