"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricTrackingController = void 0;
const response_formatter_1 = require("../utils/response-formatter");
const MetricTrackingService_1 = require("../services/MetricTrackingService");
const errors_1 = require("../utils/errors");
const Enums_1 = require("../models/shared/Enums");
const logger_1 = __importDefault(require("../utils/logger"));
class MetricTrackingController {
    constructor(metricService = new MetricTrackingService_1.MetricTrackingService()) {
        this.metricService = metricService;
    }
    async recordBodyMetric(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const data = Object.assign(Object.assign({}, req.body), { userId });
            if (!data.bodyArea || !data.valueType || data.value === undefined) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Missing required fields: bodyArea, valueType, value', 400);
            }
            const metric = await this.metricService.recordBodyMetric(data);
            (0, response_formatter_1.formatResponse)(res, { data: metric }, 201);
        }
        catch (error) {
            logger_1.default.error('Error in recordBodyMetric controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to record body metric', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async recordPerformanceMetric(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const data = Object.assign(Object.assign({}, req.body), { userId });
            if (!data.category || !data.name || data.value === undefined) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Missing required fields: category, name, value', 400);
            }
            const metric = await this.metricService.recordPerformanceMetric(data);
            (0, response_formatter_1.formatResponse)(res, { data: metric }, 201);
        }
        catch (error) {
            logger_1.default.error('Error in recordPerformanceMetric controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to record performance metric', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async recordMultipleMetrics(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const metrics = req.body.metrics;
            if (!Array.isArray(metrics) || metrics.length === 0) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Request must include an array of metrics', 400);
            }
            const metricsWithUser = metrics.map(metric => (Object.assign(Object.assign({}, metric), { userId })));
            const savedMetrics = await this.metricService.recordMultipleMetrics(metricsWithUser);
            (0, response_formatter_1.formatResponse)(res, { data: savedMetrics }, 201);
        }
        catch (error) {
            logger_1.default.error('Error in recordMultipleMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to record multiple metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getLatestBodyMetrics(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const bodyArea = req.query.bodyArea;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const metrics = await this.metricService.getLatestBodyMetrics(userId, bodyArea, limit);
            (0, response_formatter_1.formatResponse)(res, { data: metrics });
        }
        catch (error) {
            logger_1.default.error('Error in getLatestBodyMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get latest body metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getBodyMetricHistory(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const bodyArea = req.params.bodyArea;
            const days = req.query.days ? parseInt(req.query.days, 10) : 90;
            if (!bodyArea) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Body area is required', 400);
            }
            const metrics = await this.metricService.getBodyMetricHistory(userId, bodyArea, days);
            (0, response_formatter_1.formatResponse)(res, { data: metrics });
        }
        catch (error) {
            logger_1.default.error('Error in getBodyMetricHistory controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get body metric history', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getLatestPerformanceMetrics(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const category = req.query.category || Enums_1.MetricCategory.PERFORMANCE;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const metrics = await this.metricService.getLatestPerformanceMetrics(userId, category, limit);
            (0, response_formatter_1.formatResponse)(res, { data: metrics });
        }
        catch (error) {
            logger_1.default.error('Error in getLatestPerformanceMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get latest performance metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getExercisePerformanceMetrics(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const exerciseId = req.params.exerciseId;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            if (!exerciseId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Exercise ID is required', 400);
            }
            const metrics = await this.metricService.getExercisePerformanceMetrics(userId, exerciseId, limit);
            (0, response_formatter_1.formatResponse)(res, { data: metrics });
        }
        catch (error) {
            logger_1.default.error('Error in getExercisePerformanceMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get exercise performance metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getHistoricalMetrics(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const category = req.query.category;
            const name = req.query.name;
            const dateStart = req.query.dateStart ? new Date(req.query.dateStart) : undefined;
            const dateEnd = req.query.dateEnd ? new Date(req.query.dateEnd) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const [metrics, total] = await this.metricService.getHistoricalMetrics(userId, {
                category,
                name,
                dateStart,
                dateEnd,
                limit,
                offset
            });
            (0, response_formatter_1.formatResponse)(res, {
                data: metrics,
                metadata: {
                    total,
                    page: offset ? Math.floor(offset / limit) + 1 : 1,
                    limit
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error in getHistoricalMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get historical metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async setMetricAsBaseline(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const metricId = req.params.metricId;
            if (!metricId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Metric ID is required', 400);
            }
            const updatedMetric = await this.metricService.setMetricAsBaseline(metricId);
            (0, response_formatter_1.formatResponse)(res, { data: updatedMetric });
        }
        catch (error) {
            logger_1.default.error('Error in setMetricAsBaseline controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to set metric as baseline', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async deleteMetric(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const metricId = req.params.metricId;
            const metricType = req.params.type;
            if (!metricId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Metric ID is required', 400);
            }
            if (metricType !== 'body' && metricType !== 'performance') {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid metric type. Must be "body" or "performance"', 400);
            }
            await this.metricService.deleteMetric(metricId, metricType);
            (0, response_formatter_1.formatResponse)(res, { message: `${metricType} metric deleted successfully` });
        }
        catch (error) {
            logger_1.default.error('Error in deleteMetric controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to delete metric', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
    async getWorkoutSessionMetrics(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const workoutSessionId = req.params.workoutSessionId;
            if (!workoutSessionId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Workout session ID is required', 400);
            }
            const metrics = await this.metricService.getWorkoutSessionMetrics(workoutSessionId);
            (0, response_formatter_1.formatResponse)(res, { data: metrics });
        }
        catch (error) {
            logger_1.default.error('Error in getWorkoutSessionMetrics controller', { error });
            const appError = error instanceof errors_1.AppError
                ? error
                : new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get workout session metrics', 500);
            (0, response_formatter_1.formatErrorResponseAndSend)(res, {
                type: appError.type,
                message: appError.message
            }, appError.statusCode);
        }
    }
}
exports.MetricTrackingController = MetricTrackingController;
//# sourceMappingURL=MetricTrackingController.js.map