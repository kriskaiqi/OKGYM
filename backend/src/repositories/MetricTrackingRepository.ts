import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In, ILike } from 'typeorm';
import { MetricTracking } from '../models/MetricTracking';
import { MetricCategory, MetricValueType, TrendDirection } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying metric tracking data
 */
export interface MetricTrackingFilters {
    userId?: string;
    category?: MetricCategory;
    categories?: MetricCategory[];
    name?: string;
    names?: string[];
    valueType?: MetricValueType;
    valueTypes?: MetricValueType[];
    exerciseId?: string;
    workoutSessionId?: string;
    minValue?: number;
    maxValue?: number;
    unit?: string;
    source?: string;
    isBaseline?: boolean;
    minConfidence?: number;
    maxConfidence?: number;
    trend?: TrendDirection;
    trends?: TrendDirection[];
    recordedMinDate?: Date;
    recordedMaxDate?: Date;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    hasCompoundValues?: boolean;
    hasTarget?: boolean;
    targetMet?: boolean;
    searchTerm?: string;
    includeUser?: boolean;
    includeExercise?: boolean;
    includeWorkoutSession?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for MetricTracking entity
 */
export class MetricTrackingRepository extends GenericRepository<MetricTracking> {
    constructor() {
        super(MetricTracking);
    }

    /**
     * Find metric tracking data with detailed filtering options
     */
    async findWithFilters(filters: MetricTrackingFilters): Promise<[MetricTracking[], number]> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { recordedAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeUser) relations.push('user');
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeWorkoutSession) relations.push('workoutSession');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user.id', filters.userId);
            }

            if (filters.category) {
                addWhereCondition(queryOptions, 'category', filters.category);
            }

            if (filters.categories && filters.categories.length > 0) {
                addWhereCondition(queryOptions, 'category', In(filters.categories));
            }

            if (filters.name) {
                addWhereCondition(queryOptions, 'name', filters.name);
            }

            if (filters.names && filters.names.length > 0) {
                addWhereCondition(queryOptions, 'name', In(filters.names));
            }

            if (filters.valueType) {
                addWhereCondition(queryOptions, 'valueType', filters.valueType);
            }

            if (filters.valueTypes && filters.valueTypes.length > 0) {
                addWhereCondition(queryOptions, 'valueType', In(filters.valueTypes));
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise.id', filters.exerciseId);
            }

            if (filters.workoutSessionId) {
                addWhereCondition(queryOptions, 'workoutSession.id', filters.workoutSessionId);
            }

            if (filters.unit) {
                addWhereCondition(queryOptions, 'unit', filters.unit);
            }

            if (filters.source) {
                addWhereCondition(queryOptions, 'source', filters.source);
            }

            if (filters.isBaseline !== undefined) {
                addWhereCondition(queryOptions, 'isBaseline', filters.isBaseline);
            }

            if (filters.trend) {
                addWhereCondition(queryOptions, 'trend', filters.trend);
            }

            if (filters.trends && filters.trends.length > 0) {
                addWhereCondition(queryOptions, 'trend', In(filters.trends));
            }

            // Value range filters
            if (filters.minValue !== undefined && filters.maxValue !== undefined) {
                addWhereCondition(queryOptions, 'value', Between(filters.minValue, filters.maxValue));
            } else if (filters.minValue !== undefined) {
                addWhereCondition(queryOptions, 'value', MoreThan(filters.minValue));
            } else if (filters.maxValue !== undefined) {
                addWhereCondition(queryOptions, 'value', LessThan(filters.maxValue));
            }

            // Confidence range filters
            if (filters.minConfidence !== undefined && filters.maxConfidence !== undefined) {
                addWhereCondition(queryOptions, 'confidence', Between(filters.minConfidence, filters.maxConfidence));
            } else if (filters.minConfidence !== undefined) {
                addWhereCondition(queryOptions, 'confidence', MoreThan(filters.minConfidence));
            } else if (filters.maxConfidence !== undefined) {
                addWhereCondition(queryOptions, 'confidence', LessThan(filters.maxConfidence));
            }

            // Recorded date range filters
            if (filters.recordedMinDate && filters.recordedMaxDate) {
                addWhereCondition(queryOptions, 'recordedAt', 
                    Between(filters.recordedMinDate, filters.recordedMaxDate));
            } else if (filters.recordedMinDate) {
                addWhereCondition(queryOptions, 'recordedAt', 
                    MoreThan(filters.recordedMinDate));
            } else if (filters.recordedMaxDate) {
                addWhereCondition(queryOptions, 'recordedAt', 
                    LessThan(filters.recordedMaxDate));
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

            // Filter for metrics with compound values
            if (filters.hasCompoundValues !== undefined) {
                if (filters.hasCompoundValues) {
                    addWhereCondition(queryOptions, 'compoundValues', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'compoundValues', IsNull());
                }
            }

            // Filter for metrics with target values
            if (filters.hasTarget !== undefined) {
                if (filters.hasTarget) {
                    addWhereCondition(queryOptions, 'target', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'target', IsNull());
                }
            }

            // Filter for target achievement
            if (filters.targetMet !== undefined && filters.hasTarget !== false) {
                // This requires a more complex query comparing value to target
                // We'll use a raw query approach for this specific case
                addWhereCondition(queryOptions, 'target', Not(IsNull()));
                
                const [metrics, count] = await this.repository.findAndCount(queryOptions);
                
                // Post-process to filter by target met
                const filteredMetrics = metrics.filter(metric => {
                    const isTargetMet = metric.isTargetMet();
                    return filters.targetMet ? isTargetMet : !isTargetMet;
                });
                
                return [filteredMetrics, filteredMetrics.length];
            }

            // Search term for name and notes
            if (filters.searchTerm) {
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { name: searchPattern },
                    { notes: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find metrics by category
     */
    async findByCategory(userId: string, category: MetricCategory, limit: number = 20): Promise<MetricTracking[]> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'category', category);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.findByCategory', { error, userId, category, limit });
            throw error;
        }
    }

    /**
     * Find metrics by specific metric name and category
     */
    async findByNameAndCategory(userId: string, name: string, category: MetricCategory, limit: number = 50): Promise<MetricTracking[]> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'name', name);
            addWhereCondition(queryOptions, 'category', category);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.findByNameAndCategory', 
                { error, userId, name, category, limit });
            throw error;
        }
    }

    /**
     * Find metrics for a specific exercise
     */
    async findByExercise(userId: string, exerciseId: string, limit: number = 50): Promise<MetricTracking[]> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { recordedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'exercise.id', exerciseId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.findByExercise', 
                { error, userId, exerciseId, limit });
            throw error;
        }
    }

    /**
     * Find metrics for a specific workout session
     */
    async findByWorkoutSession(userId: string, workoutSessionId: string): Promise<MetricTracking[]> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});
            
            // Set sorting
            queryOptions.order = { recordedAt: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'workoutSession.id', workoutSessionId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.findByWorkoutSession', 
                { error, userId, workoutSessionId });
            throw error;
        }
    }

    /**
     * Get most recent metric by name and category
     */
    async getMostRecent(userId: string, name: string, category: MetricCategory): Promise<MetricTracking | null> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});
            
            // Set limit and sorting
            queryOptions.take = 1;
            queryOptions.order = { recordedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'name', name);
            addWhereCondition(queryOptions, 'category', category);

            const results = await this.repository.find(queryOptions);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.getMostRecent', 
                { error, userId, name, category });
            throw error;
        }
    }

    /**
     * Get baseline metric by name and category
     */
    async getBaseline(userId: string, name: string, category: MetricCategory): Promise<MetricTracking | null> {
        try {
            const queryOptions: FindManyOptions<MetricTracking> = createQueryOptions<MetricTracking>({});

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'name', name);
            addWhereCondition(queryOptions, 'category', category);
            addWhereCondition(queryOptions, 'isBaseline', true);

            return await this.repository.findOne(queryOptions);
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.getBaseline', 
                { error, userId, name, category });
            throw error;
        }
    }

    /**
     * Get metric trend analysis
     */
    async getTrendAnalysis(userId: string, name: string, category: MetricCategory, timeSpan: number = 30): Promise<any> {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (timeSpan * 24 * 60 * 60 * 1000)); // timeSpan days ago
            
            const metrics = await this.repository.find({
                where: {
                    user: { id: userId },
                    name,
                    category,
                    recordedAt: Between(startDate, endDate)
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
            
            // Calculate statistics
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            const totalChange = lastValue - firstValue;
            const percentChange = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
            
            // Determine trend direction
            let trendDirection: TrendDirection = TrendDirection.STABLE;
            if (percentChange > 5) {
                trendDirection = TrendDirection.INCREASING;
            } else if (percentChange < -5) {
                trendDirection = TrendDirection.DECREASING;
            } else {
                // Check for fluctuation
                const stdDev = this.calculateStandardDeviation(values);
                if (stdDev > (averageValue * 0.1)) {
                    trendDirection = TrendDirection.FLUCTUATING;
                }
            }
            
            // Calculate change rate (per day)
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
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.getTrendAnalysis', 
                { error, userId, name, category, timeSpan });
            throw error;
        }
    }

    /**
     * Update metric trend directions
     */
    async updateTrendDirections(userId: string, category: MetricCategory): Promise<number> {
        try {
            // Get distinct metric names for the given category and user
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
                    // Update trend direction for metrics with this name
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
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.updateTrendDirections', 
                { error, userId, category });
            throw error;
        }
    }

    /**
     * Set metric as baseline
     */
    async setAsBaseline(metricId: string): Promise<void> {
        try {
            const metric = await this.repository.findOne({
                where: { id: metricId },
                relations: ['user']
            });
            
            if (!metric) {
                throw new Error(`Metric with ID ${metricId} not found`);
            }
            
            // Remove baseline flag from existing baseline metrics with same name/category
            await this.repository
                .createQueryBuilder()
                .update()
                .set({ isBaseline: false })
                .where('user_id = :userId', { userId: metric.user.id })
                .andWhere('category = :category', { category: metric.category })
                .andWhere('name = :name', { name: metric.name })
                .andWhere('isBaseline = :isBaseline', { isBaseline: true })
                .execute();
            
            // Set the new metric as baseline
            await this.repository.update(metricId, { isBaseline: true });
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.setAsBaseline', { error, metricId });
            throw error;
        }
    }

    /**
     * Get progress from baseline
     */
    async getProgressFromBaseline(userId: string, name: string, category: MetricCategory): Promise<any> {
        try {
            // Get baseline metric
            const baseline = await this.getBaseline(userId, name, category);
            if (!baseline) {
                return {
                    hasBaseline: false,
                    progress: 0,
                    percentChange: 0
                };
            }
            
            // Get most recent metric
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
            
            // Calculate progress
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
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.getProgressFromBaseline', 
                { error, userId, name, category });
            throw error;
        }
    }

    /**
     * Create metrics in bulk
     */
    async createBulk(metrics: Partial<MetricTracking>[]): Promise<MetricTracking[]> {
        try {
            // Create metric entities properly
            const metricEntities: MetricTracking[] = [];
            
            for (const metric of metrics) {
                const entity = this.repository.create(metric);
                metricEntities.push(entity);
            }
            
            // Save all entities at once
            const savedMetrics = await this.repository.save(metricEntities);
            return savedMetrics;
        } catch (error) {
            logger.error('Error in MetricTrackingRepository.createBulk', { error, count: metrics.length });
            throw error;
        }
    }

    /**
     * Calculate standard deviation (helper method)
     */
    private calculateStandardDeviation(values: number[]): number {
        if (values.length <= 1) return 0;
        
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }
} 