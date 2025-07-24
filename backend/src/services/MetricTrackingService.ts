import { 
    BodyMetric, 
    User,
    Exercise,
    WorkoutSession
} from '../models';
import { 
    BodyMetricData,
    BodyMetricMetadata 
} from '../models/BodyMetric';
import { MetricTracking, MetricTrackingData, MetricMetadata } from '../models/MetricTracking';
import { 
    BodyMetricRepository,
    MetricTrackingRepository
} from '../repositories';
import { 
    BodyArea,
    MetricCategory,
    MetricValueType,
    MeasurementUnit,
    TrendDirection
} from '../models/shared/Enums';
import { AppError, ErrorType } from '../utils/errors';
import { executeTransaction } from '../utils/transaction-helper';
import { SimpleTrack } from '../utils/performance';
import logger from '../utils/logger';

/**
 * Service for tracking and managing body metrics and performance metrics
 */
export class MetricTrackingService {
    constructor(
        private readonly bodyMetricRepo = new BodyMetricRepository(),
        private readonly metricRepo = new MetricTrackingRepository()
    ) {}

    /**
     * Record a new body metric measurement
     * 
     * @param data Body metric data to record
     * @returns The saved body metric
     */
    @SimpleTrack()
    async recordBodyMetric(data: BodyMetricData): Promise<BodyMetric> {
        try {
            logger.info(`Recording body metric for user ${data.userId}, area: ${data.bodyArea}`);

            // Validate measurement
            if (data.value < 0) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Metric value cannot be negative', 400);
            }

            // Check for previous measurements to calculate trends
            const previousMetrics = await this.bodyMetricRepo.getLatestMetrics(
                data.userId, 
                [data.bodyArea]
            );
            const previousMetric = previousMetrics[data.bodyArea];

            // Handle metadata with trend calculations
            if (previousMetric) {
                if (!data.metadata) {
                    data.metadata = new BodyMetricMetadata();
                }
                
                data.metadata.previousValue = previousMetric.value;
                data.metadata.previousDate = previousMetric.measurementDate;
                
                // Calculate change
                const changeAmount = data.value - previousMetric.value;
                data.metadata.changeAmount = changeAmount;
                
                if (previousMetric.value > 0) {
                    const changePercent = (changeAmount / previousMetric.value) * 100;
                    data.metadata.changePercent = parseFloat(changePercent.toFixed(2));
                }
            }

            // Save the metric
            return this.bodyMetricRepo.addMeasurement(data);
        } catch (error) {
            logger.error('Error recording body metric', { error, userId: data.userId, bodyArea: data.bodyArea });
            throw error;
        }
    }

    /**
     * Record a performance metric
     * 
     * @param data Performance metric data to record
     * @returns The saved metric
     */
    @SimpleTrack()
    async recordPerformanceMetric(data: MetricTrackingData): Promise<MetricTracking> {
        try {
            logger.info(`Recording performance metric for user ${data.userId}, category: ${data.category}`);

            // Validate the metric category
            if (data.category !== MetricCategory.PERFORMANCE && 
                data.category !== MetricCategory.WORKOUT &&
                data.category !== MetricCategory.FORM) {
                throw new AppError(
                    ErrorType.VALIDATION_ERROR, 
                    `Invalid category for performance metric: ${data.category}`,
                    400
                );
            }

            // Check for previous measurements to calculate trends
            const previousMetrics = await this.metricRepo.findByNameAndCategory(
                data.userId,
                data.name,
                data.category,
                1
            );

            // Create metric entity
            const metric = new MetricTracking();
            metric.user = { id: data.userId } as User;
            metric.category = data.category;
            metric.name = data.name;
            metric.valueType = data.valueType || MetricValueType.NUMERIC;
            metric.value = data.value;
            metric.compoundValues = data.compoundValues || {};
            metric.unit = data.unit || '';
            metric.recordedAt = data.recordedAt || new Date();
            metric.source = data.source || '';
            metric.notes = data.notes || '';
            metric.target = data.target ?? 0;
            metric.isBaseline = data.isBaseline || false;
            metric.confidence = data.confidence || 1.0;
            
            // Set exercise relation if provided
            if (data.exerciseId) {
                metric.exercise = { id: data.exerciseId } as Exercise;
            }
            
            // Set workout session relation if provided
            if (data.workoutSessionId) {
                metric.workoutSession = { id: data.workoutSessionId } as WorkoutSession;
            }
            
            // Handle metadata with trend calculations
            if (previousMetrics.length > 0) {
                const previousMetric = previousMetrics[0];
                
                const metaData = new MetricMetadata();
                
                metaData.previousValue = previousMetric.value;
                metaData.previousDate = previousMetric.recordedAt;
                
                if (previousMetric.value > 0) {
                    const changePercent = ((data.value - previousMetric.value) / previousMetric.value) * 100;
                    metaData.changePercent = parseFloat(changePercent.toFixed(2));
                }
                
                metric.metadata = metaData;
            } else if (data.metadata) {
                metric.metadata = data.metadata;
            } else {
                metric.metadata = new MetricMetadata();
            }

            // Save the metric
            const savedMetric = await this.metricRepo.save(metric);
            // Handle potential array return
            return Array.isArray(savedMetric) ? savedMetric[0] : savedMetric;
        } catch (error) {
            logger.error('Error recording performance metric', { 
                error, 
                userId: data.userId, 
                category: data.category,
                name: data.name 
            });
            throw error;
        }
    }

    /**
     * Record multiple metrics in a single transaction
     * 
     * @param metrics Array of performance metrics to record
     * @returns The saved metrics
     */
    @SimpleTrack()
    async recordMultipleMetrics(metrics: MetricTrackingData[]): Promise<MetricTracking[]> {
        try {
            logger.info(`Recording ${metrics.length} metrics in bulk`);

            return await executeTransaction(async () => {
                const metricEntities: MetricTracking[] = [];
                
                for (const data of metrics) {
                    // Create metric entity
                    const metric = new MetricTracking();
                    metric.user = { id: data.userId } as User;
                    metric.category = data.category;
                    metric.name = data.name;
                    metric.valueType = data.valueType || MetricValueType.NUMERIC;
                    metric.value = data.value;
                    metric.compoundValues = data.compoundValues || {};
                    metric.unit = data.unit || '';
                    metric.recordedAt = data.recordedAt || new Date();
                    metric.source = data.source || '';
                    metric.notes = data.notes || '';
                    metric.target = data.target ?? 0;
                    metric.isBaseline = data.isBaseline || false;
                    metric.confidence = data.confidence ?? 1.0;
                    metric.metadata = data.metadata ?? new MetricMetadata();
                    
                    // Set exercise relation if provided
                    if (data.exerciseId) {
                        metric.exercise = { id: data.exerciseId } as Exercise;
                    }
                    
                    // Set workout session relation if provided
                    if (data.workoutSessionId) {
                        metric.workoutSession = { id: data.workoutSessionId } as WorkoutSession;
                    }
                    
                    metricEntities.push(metric);
                }
                
                // Save all metrics in one go
                return await this.metricRepo.createBulk(metricEntities);
            });
        } catch (error) {
            logger.error('Error recording multiple metrics', { error, count: metrics.length });
            throw error;
        }
    }

    /**
     * Get the latest body metrics for a user
     * 
     * @param userId User ID
     * @param bodyArea Optional body area to filter by
     * @param limit Maximum number of metrics to return
     * @returns Latest body metrics
     */
    @SimpleTrack()
    async getLatestBodyMetrics(
        userId: string, 
        bodyArea?: BodyArea, 
        limit: number = 10
    ): Promise<BodyMetric[]> {
        try {
            logger.info(`Getting latest body metrics for user ${userId}`);
            
            if (bodyArea) {
                const metrics = await this.bodyMetricRepo.getLatestMetrics(userId, [bodyArea]);
                return Object.values(metrics).filter(m => m !== null) as BodyMetric[];
            } else {
                // Use findWithFilters to get latest metrics across all body areas
                const [metrics] = await this.bodyMetricRepo.findWithFilters({
                    userId,
                    limit,
                    sortBy: 'measurementDate',
                    sortDirection: 'DESC'
                });
                return metrics;
            }
        } catch (error) {
            logger.error('Error getting latest body metrics', { error, userId, bodyArea });
            throw error;
        }
    }

    /**
     * Get body metric history for time series analysis
     * 
     * @param userId User ID
     * @param bodyArea Body area to get history for
     * @param days Number of days to include in history
     * @returns Array of metrics in chronological order
     */
    @SimpleTrack()
    async getBodyMetricHistory(
        userId: string, 
        bodyArea: BodyArea, 
        days: number = 90
    ): Promise<BodyMetric[]> {
        try {
            logger.info(`Getting body metric history for user ${userId}, area: ${bodyArea}, days: ${days}`);
            
            return this.bodyMetricRepo.getMetricHistory(userId, bodyArea, days);
        } catch (error) {
            logger.error('Error getting body metric history', { error, userId, bodyArea, days });
            throw error;
        }
    }

    /**
     * Get the latest performance metrics for a user
     * 
     * @param userId User ID
     * @param category Metric category to filter by
     * @param limit Maximum number of metrics to return
     * @returns Latest performance metrics
     */
    @SimpleTrack()
    async getLatestPerformanceMetrics(
        userId: string, 
        category: MetricCategory = MetricCategory.PERFORMANCE,
        limit: number = 10
    ): Promise<MetricTracking[]> {
        try {
            logger.info(`Getting latest performance metrics for user ${userId}, category: ${category}`);
            
            const metrics = await this.metricRepo.findByCategory(userId, category, limit);
            return metrics;
        } catch (error) {
            logger.error('Error getting latest performance metrics', { error, userId, category });
            throw error;
        }
    }

    /**
     * Get performance metrics for a specific exercise
     * 
     * @param userId User ID
     * @param exerciseId Exercise ID
     * @param limit Maximum number of metrics to return
     * @returns Performance metrics for the exercise
     */
    @SimpleTrack()
    async getExercisePerformanceMetrics(
        userId: string, 
        exerciseId: string, 
        limit: number = 20
    ): Promise<MetricTracking[]> {
        try {
            logger.info(`Getting performance metrics for user ${userId}, exercise: ${exerciseId}`);
            
            const [metrics] = await this.metricRepo.findWithFilters({
                userId,
                exerciseId,
                category: MetricCategory.PERFORMANCE,
                limit,
                sortBy: 'recordedAt',
                sortDirection: 'DESC'
            });
            return metrics;
        } catch (error) {
            logger.error('Error getting exercise performance metrics', { error, userId, exerciseId });
            throw error;
        }
    }

    /**
     * Get historical metrics for a user with filters
     * 
     * @param userId User ID
     * @param filters Filters for metrics
     * @returns Array of metrics and total count
     */
    @SimpleTrack()
    async getHistoricalMetrics(
        userId: string, 
        filters: {
            category?: MetricCategory;
            name?: string;
            dateStart?: Date;
            dateEnd?: Date;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<[MetricTracking[], number]> {
        try {
            logger.info(`Getting historical metrics for user ${userId}`);
            
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
        } catch (error) {
            logger.error('Error getting historical metrics', { error, userId, filters });
            throw error;
        }
    }

    /**
     * Set a metric as the baseline for its category and name
     * 
     * @param metricId ID of the metric to set as baseline
     * @returns Updated metric
     */
    @SimpleTrack()
    async setMetricAsBaseline(metricId: string): Promise<MetricTracking> {
        try {
            logger.info(`Setting metric ${metricId} as baseline`);
            
            // Find the metric first
            const metric = await this.metricRepo.findOne({
                where: { id: metricId },
                relations: ['user']
            });
            
            if (!metric) {
                throw new AppError(ErrorType.NOT_FOUND, `Metric with ID ${metricId} not found`, 404);
            }
            
            // Set as baseline
            await this.metricRepo.setAsBaseline(metricId);
            
            // Get the updated metric
            const updatedMetric = await this.metricRepo.findOne({
                where: { id: metricId }
            });
            
            if (!updatedMetric) {
                throw new AppError(ErrorType.NOT_FOUND, `Metric with ID ${metricId} not found after update`, 404);
            }
            
            return updatedMetric;
        } catch (error) {
            logger.error('Error setting metric as baseline', { error, metricId });
            throw error;
        }
    }

    /**
     * Delete a metric entry
     * 
     * @param metricId ID of the metric to delete
     * @param metricType Type of metric ('body' or 'performance')
     */
    @SimpleTrack()
    async deleteMetric(metricId: string, metricType: 'body' | 'performance'): Promise<void> {
        try {
            logger.info(`Deleting ${metricType} metric ${metricId}`);
            
            if (metricType === 'body') {
                // Check if the metric exists
                const metric = await this.bodyMetricRepo.findOne({
                    where: { id: metricId }
                });
                
                if (!metric) {
                    throw new AppError(ErrorType.NOT_FOUND, `Body metric with ID ${metricId} not found`, 404);
                }
                
                await this.bodyMetricRepo.delete(metricId);
            } else {
                // Check if the metric exists
                const metric = await this.metricRepo.findOne({
                    where: { id: metricId }
                });
                
                if (!metric) {
                    throw new AppError(ErrorType.NOT_FOUND, `Performance metric with ID ${metricId} not found`, 404);
                }
                
                await this.metricRepo.delete(metricId);
            }
        } catch (error) {
            logger.error('Error deleting metric', { error, metricId, metricType });
            throw error;
        }
    }

    /**
     * Get metrics for a specific workout session
     * 
     * @param workoutSessionId Workout session ID
     * @returns Metrics recorded during the session
     */
    @SimpleTrack()
    async getWorkoutSessionMetrics(workoutSessionId: string): Promise<MetricTracking[]> {
        try {
            logger.info(`Getting metrics for workout session ${workoutSessionId}`);
            
            const [metrics] = await this.metricRepo.findWithFilters({
                workoutSessionId,
                sortBy: 'recordedAt',
                sortDirection: 'ASC',
                includeExercise: true
            });
            return metrics;
        } catch (error) {
            logger.error('Error getting workout session metrics', { error, workoutSessionId });
            throw error;
        }
    }
} 