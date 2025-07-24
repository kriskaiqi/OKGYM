"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRepository = void 0;
const typeorm_1 = require("typeorm");
const GenericRepository_1 = require("../GenericRepository");
const logger_1 = __importDefault(require("../../utils/logger"));
const CacheManager_1 = require("../../services/CacheManager");
const config_1 = require("../../config");
class EntityCacheKeys {
    static forFilters(filters) {
        var _a;
        const keyParts = ['entity:filters'];
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if ((_a = filters.includeRelations) === null || _a === void 0 ? void 0 : _a.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        return keyParts.join(':');
    }
    static forEntity(id, relations = []) {
        if (relations.length === 0)
            return `entity:${id}`;
        return `entity:${id}:${relations.sort().join('-')}`;
    }
}
class EntityRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a;
        super(Object);
        this.cacheKeyPrefix = 'entity';
        this.cacheTTL = 3600;
        if ((_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) {
            if (typeof config_1.config.cache.ttl === 'object') {
                const entityTTL = config_1.config.cache.ttl[this.cacheKeyPrefix];
                if (entityTTL) {
                    this.cacheTTL = entityTTL;
                }
                else if (config_1.config.cache.ttl['default']) {
                    this.cacheTTL = config_1.config.cache.ttl['default'];
                }
            }
            else if (typeof config_1.config.cache.ttl === 'number') {
                this.cacheTTL = config_1.config.cache.ttl;
            }
        }
    }
    async findWithFilters(filters) {
        const cacheKey = EntityCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('Entity filter results served from cache', { cacheKey });
            return cached;
        }
        const start = Date.now();
        const query = {
            where: {},
            relations: filters.includeRelations || [],
            take: filters.limit || 20,
            skip: filters.offset || 0,
            order: {}
        };
        if (filters.searchTerm) {
            query.where = Object.assign(Object.assign({}, query.where), { name: (0, typeorm_1.Like)(`%${filters.searchTerm}%`) });
        }
        if (filters.sortBy) {
            query.order = {
                [filters.sortBy]: filters.sortDirection || 'ASC'
            };
        }
        else {
            query.order = {
                createdAt: 'DESC'
            };
        }
        const result = await this.repository.findAndCount(query);
        const duration = Date.now() - start;
        if (duration > 200) {
            logger_1.default.warn(`Slow query detected in EntityRepository.findWithFilters: ${duration}ms`, {
                filters: JSON.stringify(filters),
                duration,
                resultCount: result[1]
            });
        }
        await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        return result;
    }
    async findById(id, relations = []) {
        const cacheKey = EntityCacheKeys.forEntity(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('Entity detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const entity = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in EntityRepository.findById: ${duration}ms`, { id, duration });
        }
        if (entity) {
            await CacheManager_1.cacheManager.set(cacheKey, entity, { ttl: this.cacheTTL });
        }
        return entity;
    }
    async create(data) {
        const entity = await super.create(data);
        await this.invalidateListCaches();
        return entity;
    }
    async update(id, data) {
        const entity = await super.update(id, data);
        if (entity) {
            await this.invalidateEntityCache(id);
            await this.invalidateListCaches();
        }
        return entity;
    }
    async delete(id) {
        const result = await super.delete(id);
        await this.invalidateEntityCache(id);
        await this.invalidateListCaches();
        return result;
    }
    async invalidateEntityCache(id) {
        const pattern = `entity:${id}*`;
        await CacheManager_1.cacheManager.deleteByPattern(pattern);
        logger_1.default.debug(`Invalidated cache for entity: ${id}`);
    }
    async invalidateListCaches() {
        const pattern = 'entity:filters*';
        await CacheManager_1.cacheManager.deleteByPattern(pattern);
        await CacheManager_1.cacheManager.deleteByPattern('entity:list*');
        logger_1.default.debug('Invalidated entity list caches');
    }
}
exports.EntityRepository = EntityRepository;
//# sourceMappingURL=EntityRepository.js.map