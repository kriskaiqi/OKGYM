import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { formatResponse, formatErrorResponseAndSend, formatSuccessResponse } from '../utils/response-formatter';
import { MetricTrackingService } from '../services/MetricTrackingService';
import { BodyMetricData } from '../models/BodyMetric';
import { MetricTrackingData } from '../models/MetricTracking';
import { AppError, ErrorType } from '../utils/errors';
import { BodyArea, MetricCategory, UserRole } from '../models/shared/Enums';
import logger from '../utils/logger';

// Define AuthRequest interface since it's missing
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        isAdmin?: boolean;
    };
}

/**
 * Controller for managing metric tracking
 */
export class MetricTrackingController {
    constructor(
        private readonly metricService = new MetricTrackingService()
    ) {}

    /**
     * Record a new body metric
     */
    async recordBodyMetric(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            // Parse and validate data
            const data: BodyMetricData = {
                ...req.body,
                userId
            };

            // Validate required fields
            if (!data.bodyArea || !data.valueType || data.value === undefined) {
                throw new AppError(
                    ErrorType.VALIDATION_ERROR, 
                    'Missing required fields: bodyArea, valueType, value',
                    400
                );
            }

            // Record the metric
            const metric = await this.metricService.recordBodyMetric(data);
            
            formatResponse(res, { data: metric }, 201);
        } catch (error) {
            logger.error('Error in recordBodyMetric controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to record body metric', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Record a new performance metric
     */
    async recordPerformanceMetric(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            // Parse and validate data
            const data: MetricTrackingData = {
                ...req.body,
                userId
            };

            // Validate required fields
            if (!data.category || !data.name || data.value === undefined) {
                throw new AppError(
                    ErrorType.VALIDATION_ERROR, 
                    'Missing required fields: category, name, value',
                    400
                );
            }

            // Record the metric
            const metric = await this.metricService.recordPerformanceMetric(data);
            
            formatResponse(res, { data: metric }, 201);
        } catch (error) {
            logger.error('Error in recordPerformanceMetric controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to record performance metric', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Record multiple metrics at once
     */
    async recordMultipleMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            // Parse and validate data
            const metrics: MetricTrackingData[] = req.body.metrics;
            
            if (!Array.isArray(metrics) || metrics.length === 0) {
                throw new AppError(
                    ErrorType.VALIDATION_ERROR, 
                    'Request must include an array of metrics',
                    400
                );
            }

            // Add user ID to each metric
            const metricsWithUser = metrics.map(metric => ({
                ...metric,
                userId
            }));

            // Record the metrics
            const savedMetrics = await this.metricService.recordMultipleMetrics(metricsWithUser);
            
            formatResponse(res, { data: savedMetrics }, 201);
        } catch (error) {
            logger.error('Error in recordMultipleMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to record multiple metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get the latest body metrics for a user
     */
    async getLatestBodyMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const bodyArea = req.query.bodyArea as BodyArea | undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

            const metrics = await this.metricService.getLatestBodyMetrics(userId, bodyArea, limit);
            
            formatResponse(res, { data: metrics });
        } catch (error) {
            logger.error('Error in getLatestBodyMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get latest body metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get body metric history for time series analysis
     */
    async getBodyMetricHistory(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const bodyArea = req.params.bodyArea as BodyArea;
            const days = req.query.days ? parseInt(req.query.days as string, 10) : 90;

            if (!bodyArea) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Body area is required', 400);
            }

            const metrics = await this.metricService.getBodyMetricHistory(userId, bodyArea, days);
            
            formatResponse(res, { data: metrics });
        } catch (error) {
            logger.error('Error in getBodyMetricHistory controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get body metric history', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get the latest performance metrics for a user
     */
    async getLatestPerformanceMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const category = req.query.category as MetricCategory || MetricCategory.PERFORMANCE;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

            const metrics = await this.metricService.getLatestPerformanceMetrics(userId, category, limit);
            
            formatResponse(res, { data: metrics });
        } catch (error) {
            logger.error('Error in getLatestPerformanceMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get latest performance metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get performance metrics for a specific exercise
     */
    async getExercisePerformanceMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const exerciseId = req.params.exerciseId;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

            if (!exerciseId) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Exercise ID is required', 400);
            }

            const metrics = await this.metricService.getExercisePerformanceMetrics(userId, exerciseId, limit);
            
            formatResponse(res, { data: metrics });
        } catch (error) {
            logger.error('Error in getExercisePerformanceMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get exercise performance metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get historical metrics with filtering
     */
    async getHistoricalMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            // Parse query parameters
            const category = req.query.category as MetricCategory | undefined;
            const name = req.query.name as string | undefined;
            const dateStart = req.query.dateStart ? new Date(req.query.dateStart as string) : undefined;
            const dateEnd = req.query.dateEnd ? new Date(req.query.dateEnd as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

            // Get metrics with filters
            const [metrics, total] = await this.metricService.getHistoricalMetrics(userId, {
                category,
                name,
                dateStart,
                dateEnd,
                limit,
                offset
            });
            
            formatResponse(res, { 
                data: metrics,
                metadata: {
                    total,
                    page: offset ? Math.floor(offset / limit) + 1 : 1,
                    limit
                } 
            });
        } catch (error) {
            logger.error('Error in getHistoricalMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get historical metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Set a metric as baseline
     */
    async setMetricAsBaseline(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Only authenticated users can set metrics as baseline
            if (!req.user?.id) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const metricId = req.params.metricId;
            if (!metricId) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Metric ID is required', 400);
            }

            const updatedMetric = await this.metricService.setMetricAsBaseline(metricId);
            
            formatResponse(res, { data: updatedMetric });
        } catch (error) {
            logger.error('Error in setMetricAsBaseline controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to set metric as baseline', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Delete a metric
     */
    async deleteMetric(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Only authenticated users can delete metrics
            if (!req.user?.id) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const metricId = req.params.metricId;
            const metricType = req.params.type as 'body' | 'performance';
            
            if (!metricId) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Metric ID is required', 400);
            }
            
            if (metricType !== 'body' && metricType !== 'performance') {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Invalid metric type. Must be "body" or "performance"', 400);
            }

            await this.metricService.deleteMetric(metricId, metricType);
            
            formatResponse(res, { message: `${metricType} metric deleted successfully` });
        } catch (error) {
            logger.error('Error in deleteMetric controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to delete metric', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }

    /**
     * Get metrics for a specific workout session
     */
    async getWorkoutSessionMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Only authenticated users can access workout session metrics
            if (!req.user?.id) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }

            const workoutSessionId = req.params.workoutSessionId;
            
            if (!workoutSessionId) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Workout session ID is required', 400);
            }

            const metrics = await this.metricService.getWorkoutSessionMetrics(workoutSessionId);
            
            formatResponse(res, { data: metrics });
        } catch (error) {
            logger.error('Error in getWorkoutSessionMetrics controller', { error });
            const appError = error instanceof AppError 
                ? error 
                : new AppError(ErrorType.INTERNAL_ERROR, 'Failed to get workout session metrics', 500);
            
            formatErrorResponseAndSend(res, { 
                type: appError.type,
                message: appError.message 
            }, appError.statusCode);
        }
    }
} 