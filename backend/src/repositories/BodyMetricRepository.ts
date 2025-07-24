import { Between, FindManyOptions, In, IsNull, LessThan, Like, MoreThan, Not } from 'typeorm';
import { BodyMetric, BodyMetricData } from '../models/BodyMetric';
import { GenericRepository } from './GenericRepository';
import { BodyMetricFilters } from './interfaces/BodyMetricFilters';
import logger from '../utils/logger';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { BodyArea, MetricValueType, MeasurementUnit, TrendDirection } from '../models/shared/Enums';

/**
 * Cache key generation for BodyMetric repository
 */
class BodyMetricCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: BodyMetricFilters): string {
        const keyParts = ['bodymetric:filters'];
        
        // Add filter properties to key
        if (filters.userId) keyParts.push(`user:${filters.userId}`);
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Date range filters
        if (filters.dateRange?.start) keyParts.push(`dateStart:${filters.dateRange.start.toISOString()}`);
        if (filters.dateRange?.end) keyParts.push(`dateEnd:${filters.dateRange.end.toISOString()}`);
        
        // Value range filters
        if (filters.valueRange?.min !== undefined) keyParts.push(`valMin:${filters.valueRange.min}`);
        if (filters.valueRange?.max !== undefined) keyParts.push(`valMax:${filters.valueRange.max}`);
        
        // Entity-specific filters
        if (filters.bodyArea) {
            if (Array.isArray(filters.bodyArea)) {
                keyParts.push(`area:${filters.bodyArea.sort().join(',')}`);
            } else {
                keyParts.push(`area:${filters.bodyArea}`);
            }
        }
        if (filters.valueType) keyParts.push(`type:${filters.valueType}`);
        if (filters.unit) keyParts.push(`unit:${filters.unit}`);
        if (filters.source) keyParts.push(`source:${filters.source}`);
        if (filters.desiredTrend) keyParts.push(`trend:${filters.desiredTrend}`);
        if (filters.hasTarget !== undefined) keyParts.push(`hasTarget:${filters.hasTarget}`);
        if (filters.targetMet !== undefined) keyParts.push(`targetMet:${filters.targetMet}`);
        
        // Handle relation inclusion
        if (filters.includeRelations?.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single body metric
     */
    static forBodyMetric(id: string, relations: string[] = []): string {
        if (relations.length === 0) return `bodymetric:${id}`;
        return `bodymetric:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for latest metrics by user
     */
    static forLatestMetrics(userId: string, bodyArea?: BodyArea): string {
        return bodyArea 
            ? `bodymetric:latest:${userId}:${bodyArea}`
            : `bodymetric:latest:${userId}`;
    }
    
    /**
     * Generate cache key for metrics history
     */
    static forHistory(userId: string, bodyArea: BodyArea, days: number): string {
        return `bodymetric:history:${userId}:${bodyArea}:${days}`;
    }
}

/**
 * Specialized repository for BodyMetric entity
 * Optimized with standardized indexes and query patterns
 */
export class BodyMetricRepository extends GenericRepository<BodyMetric> {
    private cacheTTL: number;
    
    constructor() {
        super(BodyMetric);
        this.cacheTTL = config.cache?.defaultTTL || 3600; // 1 hour default
    }

    /**
     * Find body metrics with detailed filtering options
     */
    async findWithFilters(filters: BodyMetricFilters): Promise<[BodyMetric[], number]> {
        // Generate cache key based on filters
        const cacheKey = BodyMetricCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[BodyMetric[], number]>(cacheKey);
        if (cached) {
            logger.debug('BodyMetric filter results served from cache', { cacheKey });
            return cached;
        }
        
        // Not in cache, query database
        const start = Date.now();

        // Base query options with selective relation loading
        const query: FindManyOptions<BodyMetric> = {
            where: {},
            relations: filters.includeRelations || ['user'],
            take: filters.limit || 20,
            skip: filters.offset || 0,
            order: {}
        };

        // Apply user filter
        if (filters.userId) {
            query.where = { 
                ...query.where, 
                user: { id: filters.userId } 
            };
        }

        // Apply body area filter
        if (filters.bodyArea) {
            if (Array.isArray(filters.bodyArea)) {
                query.where = { 
                    ...query.where, 
                    bodyArea: In(filters.bodyArea) 
                };
            } else {
                query.where = { 
                    ...query.where, 
                    bodyArea: filters.bodyArea 
                };
            }
        }

        // Apply value type filter
        if (filters.valueType) {
            query.where = { 
                ...query.where, 
                valueType: filters.valueType 
            };
        }

        // Apply unit filter
        if (filters.unit) {
            query.where = { 
                ...query.where, 
                unit: filters.unit 
            };
        }

        // Apply source filter
        if (filters.source) {
            query.where = { 
                ...query.where, 
                source: Like(`%${filters.source}%`) 
            };
        }

        // Apply trend filter
        if (filters.desiredTrend) {
            query.where = { 
                ...query.where, 
                desiredTrend: filters.desiredTrend 
            };
        }

        // Apply target filters
        if (filters.hasTarget !== undefined) {
            query.where = { 
                ...query.where, 
                targetValue: filters.hasTarget ? Not(IsNull()) : IsNull() 
            };
        }

        // Date range filters
        if (filters.dateRange?.start && filters.dateRange?.end) {
            query.where = { 
                ...query.where, 
                measurementDate: Between(filters.dateRange.start, filters.dateRange.end)
            };
        } else if (filters.dateRange?.start) {
            query.where = { 
                ...query.where, 
                measurementDate: MoreThan(filters.dateRange.start)
            };
        } else if (filters.dateRange?.end) {
            query.where = { 
                ...query.where, 
                measurementDate: LessThan(filters.dateRange.end)
            };
        }

        // Value range filters
        if (filters.valueRange?.min !== undefined && filters.valueRange?.max !== undefined) {
            query.where = { 
                ...query.where, 
                value: Between(filters.valueRange.min, filters.valueRange.max)
            };
        } else if (filters.valueRange?.min !== undefined) {
            query.where = { 
                ...query.where, 
                value: MoreThan(filters.valueRange.min)
            };
        } else if (filters.valueRange?.max !== undefined) {
            query.where = { 
                ...query.where, 
                value: LessThan(filters.valueRange.max)
            };
        }

        // Apply sorting
        if (filters.sortBy) {
            const direction = filters.sortDirection || 'DESC';
            const validSortFields = ['measurementDate', 'value', 'bodyArea', 'createdAt', 'updatedAt'];
            
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
        } else {
            // Default sorting by measurement date descending (newest first)
            query.order = { measurementDate: 'DESC' };
        }

        // Execute query
        const result = await this.repository.findAndCount(query);
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 200) {
            logger.warn(`Slow query detected in BodyMetricRepository.findWithFilters: ${duration}ms`, { 
                filters: JSON.stringify(filters),
                duration,
                resultCount: result[1]
            });
        }
        
        // Cache the results
        await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        
        return result;
    }

    /**
     * Override findById to implement caching
     */
    async findById(id: string, relations: string[] = []): Promise<BodyMetric | null> {
        // Generate cache key
        const cacheKey = BodyMetricCacheKeys.forBodyMetric(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<BodyMetric>(cacheKey);
        if (cached) {
            logger.debug('BodyMetric detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const metric = await this.repository.findOne({
            where: { id },
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in BodyMetricRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the metric
        if (metric) {
            await cacheManager.set(cacheKey, metric, { ttl: this.cacheTTL });
        }
        
        return metric;
    }

    /**
     * Get the latest metric for a user by body area
     */
    async getLatestMetric(userId: string, bodyArea: BodyArea): Promise<BodyMetric | null> {
        // Generate cache key
        const cacheKey = BodyMetricCacheKeys.forLatestMetrics(userId, bodyArea);
        
        // Try to get from cache first
        const cached = await cacheManager.get<BodyMetric>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const metric = await this.repository.findOne({
            where: { 
                user: { id: userId },
                bodyArea
            },
            order: { measurementDate: 'DESC' }
        });
        
        // Cache the result
        if (metric) {
            await cacheManager.set(cacheKey, metric, { ttl: this.cacheTTL });
        }
        
        return metric;
    }

    /**
     * Get latest metrics for multiple body areas for a user
     */
    async getLatestMetrics(userId: string, bodyAreas?: BodyArea[]): Promise<Record<BodyArea, BodyMetric | null>> {
        const result: Partial<Record<BodyArea, BodyMetric | null>> = {};
        
        // Get all BodyArea enum values or use provided ones
        const areas = bodyAreas || Object.values(BodyArea).filter(value => typeof value === 'string');
        
        // Execute all queries in parallel for efficiency
        await Promise.all(
            areas.map(async (area) => {
                const metric = await this.getLatestMetric(userId, area as BodyArea);
                result[area as BodyArea] = metric;
            })
        );
        
        return result as Record<BodyArea, BodyMetric | null>;
    }

    /**
     * Get metric history for time series analysis
     */
    async getMetricHistory(userId: string, bodyArea: BodyArea, days: number = 90): Promise<BodyMetric[]> {
        // Generate cache key
        const cacheKey = BodyMetricCacheKeys.forHistory(userId, bodyArea, days);
        
        // Try to get from cache first
        const cached = await cacheManager.get<BodyMetric[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Calculate the start date (days ago from now)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const metrics = await this.repository.find({
            where: { 
                user: { id: userId },
                bodyArea,
                measurementDate: MoreThan(startDate)
            },
            order: { measurementDate: 'ASC' }
        });
        
        // Cache the results
        await cacheManager.set(cacheKey, metrics, { ttl: this.cacheTTL });
        
        return metrics;
    }

    /**
     * Calculate change in metric over time
     */
    async calculateChange(userId: string, bodyArea: BodyArea, timeframeDays: number = 30): Promise<{
        startValue: number | null;
        currentValue: number | null;
        change: number | null;
        percentChange: number | null;
    }> {
        // Get current value
        const current = await this.getLatestMetric(userId, bodyArea);
        
        // Calculate the start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframeDays);
        
        // Get value from timeframeDays ago
        const past = await this.repository.findOne({
            where: { 
                user: { id: userId },
                bodyArea,
                measurementDate: LessThan(startDate)
            },
            order: { measurementDate: 'DESC' }
        });
        
        // Calculate changes
        const startValue = past?.value || null;
        const currentValue = current?.value || null;
        
        let change: number | null = null;
        let percentChange: number | null = null;
        
        if (startValue !== null && currentValue !== null) {
            change = Number(currentValue - startValue);
            percentChange = startValue !== 0 ? Number((change / startValue) * 100) : null;
        }
        
        return {
            startValue,
            currentValue,
            change,
            percentChange
        };
    }

    /**
     * Add a new body metric measurement with enhanced data
     */
    async addMeasurement(data: BodyMetricData): Promise<BodyMetric> {
        const metric = this.repository.create({
            user: { id: data.userId },
            bodyArea: data.bodyArea,
            valueType: data.valueType || MetricValueType.NUMERIC,
            value: data.value,
            unit: data.unit,
            measurementDate: data.measurementDate || new Date(),
            targetValue: data.targetValue,
            desiredTrend: data.desiredTrend,
            metadata: data.metadata,
            source: data.source
        } as any);
        
        // TypeORM's save returns the entity or an array of entities
        // We know we're saving a single entity, so we use await directly
        const savedMetric = await this.repository.save(metric);
        
        // Invalidate relevant caches
        await this.invalidateUserMetricCaches(data.userId, data.bodyArea);
        
        // Handle possible array return (though in this context, it should be a single entity)
        return Array.isArray(savedMetric) ? savedMetric[0] : savedMetric;
    }

    /**
     * Calculate BMI (if weight and height are available)
     */
    async calculateBMI(userId: string): Promise<number | null> {
        // Get weight and height metrics
        // Using string literals since these may not be in the BodyArea enum
        const weight = await this.getLatestMetric(userId, 'FULL_BODY' as any); // Use appropriate BodyArea value
        const height = await this.getLatestMetric(userId, 'FULL_BODY' as any); // Use appropriate BodyArea value
        
        if (!weight?.value || !height?.value) return null;
        
        // Convert height from cm to meters
        const heightInMeters = height.value / 100;
        // BMI = weight (kg) / height² (m)
        return weight.value / (heightInMeters * heightInMeters);
    }

    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<BodyMetric>): Promise<BodyMetric> {
        const metric = await super.create(data);
        
        if (data.user && typeof data.user === 'object' && data.user.id) {
            await this.invalidateUserMetricCaches(data.user.id, data.bodyArea);
        }
        
        return metric;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: string, data: Partial<BodyMetric>): Promise<BodyMetric | null> {
        // First get the original metric to know what caches to invalidate
        const originalMetric = await this.findById(id, ['user']);
        
        const metric = await super.update(id, data);
        
        if (originalMetric?.user?.id) {
            await this.invalidateUserMetricCaches(
                originalMetric.user.id, 
                originalMetric.bodyArea
            );
        }
        
        return metric;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: string): Promise<any> {
        // First get the original metric to know what caches to invalidate
        const originalMetric = await this.findById(id, ['user']);
        
        const result = await super.delete(id);
        
        if (originalMetric?.user?.id) {
            await this.invalidateUserMetricCaches(
                originalMetric.user.id, 
                originalMetric.bodyArea
            );
        }
        
        return result;
    }

    /**
     * Invalidate cache for specific user metrics
     */
    private async invalidateUserMetricCaches(userId: string, bodyArea?: BodyArea): Promise<void> {
        // Invalidate single metric cache if body area is specified
        if (bodyArea) {
            await cacheManager.deleteByPattern(`bodymetric:latest:${userId}:${bodyArea}`);
            await cacheManager.deleteByPattern(`bodymetric:history:${userId}:${bodyArea}*`);
        }
        
        // Invalidate all latest metrics for this user
        await cacheManager.deleteByPattern(`bodymetric:latest:${userId}*`);
        
        // Invalidate filter results that include this user
        await cacheManager.deleteByPattern(`bodymetric:filters*user:${userId}*`);
        
        logger.debug(`Invalidated cache for user metrics: ${userId}${bodyArea ? `, area: ${bodyArea}` : ''}`);
    }
} 