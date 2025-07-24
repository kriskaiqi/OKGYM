"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyMetricRepository = void 0;
const typeorm_1 = require("typeorm");
const BodyMetric_1 = require("../models/BodyMetric");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const Enums_1 = require("../models/shared/Enums");
class BodyMetricCacheKeys {
    static forFilters(filters) {
        var _a, _b, _c, _d, _e;
        const keyParts = ['bodymetric:filters'];
        if (filters.userId)
            keyParts.push(`user:${filters.userId}`);
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if ((_a = filters.dateRange) === null || _a === void 0 ? void 0 : _a.start)
            keyParts.push(`dateStart:${filters.dateRange.start.toISOString()}`);
        if ((_b = filters.dateRange) === null || _b === void 0 ? void 0 : _b.end)
            keyParts.push(`dateEnd:${filters.dateRange.end.toISOString()}`);
        if (((_c = filters.valueRange) === null || _c === void 0 ? void 0 : _c.min) !== undefined)
            keyParts.push(`valMin:${filters.valueRange.min}`);
        if (((_d = filters.valueRange) === null || _d === void 0 ? void 0 : _d.max) !== undefined)
            keyParts.push(`valMax:${filters.valueRange.max}`);
        if (filters.bodyArea) {
            if (Array.isArray(filters.bodyArea)) {
                keyParts.push(`area:${filters.bodyArea.sort().join(',')}`);
            }
            else {
                keyParts.push(`area:${filters.bodyArea}`);
            }
        }
        if (filters.valueType)
            keyParts.push(`type:${filters.valueType}`);
        if (filters.unit)
            keyParts.push(`unit:${filters.unit}`);
        if (filters.source)
            keyParts.push(`source:${filters.source}`);
        if (filters.desiredTrend)
            keyParts.push(`trend:${filters.desiredTrend}`);
        if (filters.hasTarget !== undefined)
            keyParts.push(`hasTarget:${filters.hasTarget}`);
        if (filters.targetMet !== undefined)
            keyParts.push(`targetMet:${filters.targetMet}`);
        if ((_e = filters.includeRelations) === null || _e === void 0 ? void 0 : _e.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        return keyParts.join(':');
    }
    static forBodyMetric(id, relations = []) {
        if (relations.length === 0)
            return `bodymetric:${id}`;
        return `bodymetric:${id}:${relations.sort().join('-')}`;
    }
    static forLatestMetrics(userId, bodyArea) {
        return bodyArea
            ? `bodymetric:latest:${userId}:${bodyArea}`
            : `bodymetric:latest:${userId}`;
    }
    static forHistory(userId, bodyArea, days) {
        return `bodymetric:history:${userId}:${bodyArea}:${days}`;
    }
}
class BodyMetricRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a;
        super(BodyMetric_1.BodyMetric);
        this.cacheTTL = ((_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.defaultTTL) || 3600;
    }
    async findWithFilters(filters) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const cacheKey = BodyMetricCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('BodyMetric filter results served from cache', { cacheKey });
            return cached;
        }
        const start = Date.now();
        const query = {
            where: {},
            relations: filters.includeRelations || ['user'],
            take: filters.limit || 20,
            skip: filters.offset || 0,
            order: {}
        };
        if (filters.userId) {
            query.where = Object.assign(Object.assign({}, query.where), { user: { id: filters.userId } });
        }
        if (filters.bodyArea) {
            if (Array.isArray(filters.bodyArea)) {
                query.where = Object.assign(Object.assign({}, query.where), { bodyArea: (0, typeorm_1.In)(filters.bodyArea) });
            }
            else {
                query.where = Object.assign(Object.assign({}, query.where), { bodyArea: filters.bodyArea });
            }
        }
        if (filters.valueType) {
            query.where = Object.assign(Object.assign({}, query.where), { valueType: filters.valueType });
        }
        if (filters.unit) {
            query.where = Object.assign(Object.assign({}, query.where), { unit: filters.unit });
        }
        if (filters.source) {
            query.where = Object.assign(Object.assign({}, query.where), { source: (0, typeorm_1.Like)(`%${filters.source}%`) });
        }
        if (filters.desiredTrend) {
            query.where = Object.assign(Object.assign({}, query.where), { desiredTrend: filters.desiredTrend });
        }
        if (filters.hasTarget !== undefined) {
            query.where = Object.assign(Object.assign({}, query.where), { targetValue: filters.hasTarget ? (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) : (0, typeorm_1.IsNull)() });
        }
        if (((_a = filters.dateRange) === null || _a === void 0 ? void 0 : _a.start) && ((_b = filters.dateRange) === null || _b === void 0 ? void 0 : _b.end)) {
            query.where = Object.assign(Object.assign({}, query.where), { measurementDate: (0, typeorm_1.Between)(filters.dateRange.start, filters.dateRange.end) });
        }
        else if ((_c = filters.dateRange) === null || _c === void 0 ? void 0 : _c.start) {
            query.where = Object.assign(Object.assign({}, query.where), { measurementDate: (0, typeorm_1.MoreThan)(filters.dateRange.start) });
        }
        else if ((_d = filters.dateRange) === null || _d === void 0 ? void 0 : _d.end) {
            query.where = Object.assign(Object.assign({}, query.where), { measurementDate: (0, typeorm_1.LessThan)(filters.dateRange.end) });
        }
        if (((_e = filters.valueRange) === null || _e === void 0 ? void 0 : _e.min) !== undefined && ((_f = filters.valueRange) === null || _f === void 0 ? void 0 : _f.max) !== undefined) {
            query.where = Object.assign(Object.assign({}, query.where), { value: (0, typeorm_1.Between)(filters.valueRange.min, filters.valueRange.max) });
        }
        else if (((_g = filters.valueRange) === null || _g === void 0 ? void 0 : _g.min) !== undefined) {
            query.where = Object.assign(Object.assign({}, query.where), { value: (0, typeorm_1.MoreThan)(filters.valueRange.min) });
        }
        else if (((_h = filters.valueRange) === null || _h === void 0 ? void 0 : _h.max) !== undefined) {
            query.where = Object.assign(Object.assign({}, query.where), { value: (0, typeorm_1.LessThan)(filters.valueRange.max) });
        }
        if (filters.sortBy) {
            const direction = filters.sortDirection || 'DESC';
            const validSortFields = ['measurementDate', 'value', 'bodyArea', 'createdAt', 'updatedAt'];
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
        }
        else {
            query.order = { measurementDate: 'DESC' };
        }
        const result = await this.repository.findAndCount(query);
        const duration = Date.now() - start;
        if (duration > 200) {
            logger_1.default.warn(`Slow query detected in BodyMetricRepository.findWithFilters: ${duration}ms`, {
                filters: JSON.stringify(filters),
                duration,
                resultCount: result[1]
            });
        }
        await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        return result;
    }
    async findById(id, relations = []) {
        const cacheKey = BodyMetricCacheKeys.forBodyMetric(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('BodyMetric detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const metric = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in BodyMetricRepository.findById: ${duration}ms`, { id, duration });
        }
        if (metric) {
            await CacheManager_1.cacheManager.set(cacheKey, metric, { ttl: this.cacheTTL });
        }
        return metric;
    }
    async getLatestMetric(userId, bodyArea) {
        const cacheKey = BodyMetricCacheKeys.forLatestMetrics(userId, bodyArea);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
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
        if (metric) {
            await CacheManager_1.cacheManager.set(cacheKey, metric, { ttl: this.cacheTTL });
        }
        return metric;
    }
    async getLatestMetrics(userId, bodyAreas) {
        const result = {};
        const areas = bodyAreas || Object.values(Enums_1.BodyArea).filter(value => typeof value === 'string');
        await Promise.all(areas.map(async (area) => {
            const metric = await this.getLatestMetric(userId, area);
            result[area] = metric;
        }));
        return result;
    }
    async getMetricHistory(userId, bodyArea, days = 90) {
        const cacheKey = BodyMetricCacheKeys.forHistory(userId, bodyArea, days);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const metrics = await this.repository.find({
            where: {
                user: { id: userId },
                bodyArea,
                measurementDate: (0, typeorm_1.MoreThan)(startDate)
            },
            order: { measurementDate: 'ASC' }
        });
        await CacheManager_1.cacheManager.set(cacheKey, metrics, { ttl: this.cacheTTL });
        return metrics;
    }
    async calculateChange(userId, bodyArea, timeframeDays = 30) {
        const current = await this.getLatestMetric(userId, bodyArea);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframeDays);
        const past = await this.repository.findOne({
            where: {
                user: { id: userId },
                bodyArea,
                measurementDate: (0, typeorm_1.LessThan)(startDate)
            },
            order: { measurementDate: 'DESC' }
        });
        const startValue = (past === null || past === void 0 ? void 0 : past.value) || null;
        const currentValue = (current === null || current === void 0 ? void 0 : current.value) || null;
        let change = null;
        let percentChange = null;
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
    async addMeasurement(data) {
        const metric = this.repository.create({
            user: { id: data.userId },
            bodyArea: data.bodyArea,
            valueType: data.valueType || Enums_1.MetricValueType.NUMERIC,
            value: data.value,
            unit: data.unit,
            measurementDate: data.measurementDate || new Date(),
            targetValue: data.targetValue,
            desiredTrend: data.desiredTrend,
            metadata: data.metadata,
            source: data.source
        });
        const savedMetric = await this.repository.save(metric);
        await this.invalidateUserMetricCaches(data.userId, data.bodyArea);
        return Array.isArray(savedMetric) ? savedMetric[0] : savedMetric;
    }
    async calculateBMI(userId) {
        const weight = await this.getLatestMetric(userId, 'FULL_BODY');
        const height = await this.getLatestMetric(userId, 'FULL_BODY');
        if (!(weight === null || weight === void 0 ? void 0 : weight.value) || !(height === null || height === void 0 ? void 0 : height.value))
            return null;
        const heightInMeters = height.value / 100;
        return weight.value / (heightInMeters * heightInMeters);
    }
    async create(data) {
        const metric = await super.create(data);
        if (data.user && typeof data.user === 'object' && data.user.id) {
            await this.invalidateUserMetricCaches(data.user.id, data.bodyArea);
        }
        return metric;
    }
    async update(id, data) {
        var _a;
        const originalMetric = await this.findById(id, ['user']);
        const metric = await super.update(id, data);
        if ((_a = originalMetric === null || originalMetric === void 0 ? void 0 : originalMetric.user) === null || _a === void 0 ? void 0 : _a.id) {
            await this.invalidateUserMetricCaches(originalMetric.user.id, originalMetric.bodyArea);
        }
        return metric;
    }
    async delete(id) {
        var _a;
        const originalMetric = await this.findById(id, ['user']);
        const result = await super.delete(id);
        if ((_a = originalMetric === null || originalMetric === void 0 ? void 0 : originalMetric.user) === null || _a === void 0 ? void 0 : _a.id) {
            await this.invalidateUserMetricCaches(originalMetric.user.id, originalMetric.bodyArea);
        }
        return result;
    }
    async invalidateUserMetricCaches(userId, bodyArea) {
        if (bodyArea) {
            await CacheManager_1.cacheManager.deleteByPattern(`bodymetric:latest:${userId}:${bodyArea}`);
            await CacheManager_1.cacheManager.deleteByPattern(`bodymetric:history:${userId}:${bodyArea}*`);
        }
        await CacheManager_1.cacheManager.deleteByPattern(`bodymetric:latest:${userId}*`);
        await CacheManager_1.cacheManager.deleteByPattern(`bodymetric:filters*user:${userId}*`);
        logger_1.default.debug(`Invalidated cache for user metrics: ${userId}${bodyArea ? `, area: ${bodyArea}` : ''}`);
    }
}
exports.BodyMetricRepository = BodyMetricRepository;
//# sourceMappingURL=BodyMetricRepository.js.map