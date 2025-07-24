import { FindManyOptions, In, Like } from 'typeorm';
import { GenericRepository } from '../GenericRepository';
import logger from '../../utils/logger';
import { cacheManager } from '../../services/CacheManager';
import { config } from '../../config';

/**
 * Filter options for querying entities
 * Replace with your specific entity filter interface
 */
export interface EntityFilters {
    searchTerm?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    includeRelations?: string[];
    // Add entity-specific filters
}

/**
 * Cache key generation for Entity repository
 */
class EntityCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: EntityFilters): string {
        const keyParts = ['entity:filters'];
        
        // Add filter properties to key
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add relation inclusion
        if (filters.includeRelations?.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single entity
     */
    static forEntity(id: string | number, relations: string[] = []): string {
        if (relations.length === 0) return `entity:${id}`;
        return `entity:${id}:${relations.sort().join('-')}`;
    }
}

/**
 * Repository for Entity
 * Replace Entity with your actual entity class
 */
export class EntityRepository extends GenericRepository<any> {
    private cacheKeyPrefix = 'entity';
    private cacheTTL: number;
    
    constructor() {
        super(Object); // Temporary placeholder, replace in actual implementation
        // Default TTL to 1 hour if config is not available
        this.cacheTTL = 3600; // 1 hour default
        
        // Try to get the TTL from config if available
        if (config.cache?.ttl) {
            if (typeof config.cache.ttl === 'object') {
                // If ttl is an object of settings by entity type
                const entityTTL = (config.cache.ttl as Record<string, number>)[this.cacheKeyPrefix];
                if (entityTTL) {
                    this.cacheTTL = entityTTL;
                } else if ((config.cache.ttl as Record<string, number>)['default']) {
                    this.cacheTTL = (config.cache.ttl as Record<string, number>)['default'];
                }
            } else if (typeof config.cache.ttl === 'number') {
                // If ttl is a global number setting
                this.cacheTTL = config.cache.ttl;
            }
        }
    }

    /**
     * Find entities with filtering options
     */
    async findWithFilters(filters: EntityFilters): Promise<[any[], number]> {
        // Generate cache key based on filters
        const cacheKey = EntityCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[any[], number]>(cacheKey);
        if (cached) {
            logger.debug('Entity filter results served from cache', { cacheKey });
            return cached;
        }
        
        // Not in cache, query database
        const start = Date.now();

        // Base query options
        const query: FindManyOptions<any> = {
            where: {},
            relations: filters.includeRelations || [],
            take: filters.limit || 20,
            skip: filters.offset || 0,
            order: {}
        };

        // Apply text search if provided
        if (filters.searchTerm) {
            query.where = {
                ...query.where,
                name: Like(`%${filters.searchTerm}%`) // Replace 'name' with your searchable field
            };
        }

        // Apply entity-specific filters
        // Example: if (filters.status) query.where = { ...query.where, status: filters.status };

        // Apply sorting
        if (filters.sortBy) {
            query.order = {
                [filters.sortBy]: filters.sortDirection || 'ASC'
            };
        } else {
            // Default sort
            query.order = { 
                createdAt: 'DESC' // Replace with your default sort field
            };
        }

        // Execute query
        const result = await this.repository.findAndCount(query);
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 200) {
            logger.warn(`Slow query detected in EntityRepository.findWithFilters: ${duration}ms`, { 
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
     * Get a single entity by ID with specified relations
     */
    async findById(id: string | number, relations: string[] = []): Promise<any | null> {
        // Generate cache key
        const cacheKey = EntityCacheKeys.forEntity(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<any>(cacheKey);
        if (cached) {
            logger.debug('Entity detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const entity = await this.repository.findOne({
            where: { id },
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in EntityRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the entity
        if (entity) {
            await cacheManager.set(cacheKey, entity, { ttl: this.cacheTTL });
        }
        
        return entity;
    }

    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<any>): Promise<any> {
        const entity = await super.create(data);
        await this.invalidateListCaches();
        return entity;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: string | number, data: Partial<any>): Promise<any | null> {
        const entity = await super.update(id, data);
        if (entity) {
            await this.invalidateEntityCache(id);
            await this.invalidateListCaches();
        }
        return entity;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: string | number): Promise<any> {
        const result = await super.delete(id);
        await this.invalidateEntityCache(id);
        await this.invalidateListCaches();
        return result;
    }

    /**
     * Invalidate cache for a specific entity
     */
    private async invalidateEntityCache(id: string | number): Promise<void> {
        const pattern = `entity:${id}*`;
        await cacheManager.deleteByPattern(pattern);
        logger.debug(`Invalidated cache for entity: ${id}`);
    }

    /**
     * Invalidate list caches
     */
    private async invalidateListCaches(): Promise<void> {
        const pattern = 'entity:filters*';
        await cacheManager.deleteByPattern(pattern);
        await cacheManager.deleteByPattern('entity:list*');
        logger.debug('Invalidated entity list caches');
    }
} 