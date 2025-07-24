"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = void 0;
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
const cache_metrics_1 = require("../utils/cache-metrics");
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            totalGetTime: 0,
            getRequests: 0,
            totalSetTime: 0,
            setRequests: 0
        };
    }
    get(key) {
        const start = Date.now();
        const item = this.cache.get(key);
        this.stats.getRequests++;
        this.stats.totalGetTime += Date.now() - start;
        if (!item) {
            this.stats.misses++;
            return null;
        }
        if (item.expiry && item.expiry < Date.now()) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        this.stats.hits++;
        return item.value;
    }
    set(key, value, options = {}) {
        const start = Date.now();
        const ttl = options.ttl || 0;
        const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : null;
        this.cache.set(key, { value, expiry });
        this.stats.setRequests++;
        this.stats.totalSetTime += Date.now() - start;
    }
    delete(key) {
        this.cache.delete(key);
    }
    deleteByPattern(pattern) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    clear() {
        this.cache.clear();
    }
    keys(pattern = '*') {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        const keys = [];
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keys.push(key);
            }
        }
        return keys;
    }
    getStats() {
        const { hits, misses, totalGetTime, getRequests, totalSetTime, setRequests } = this.stats;
        const totalRequests = hits + misses;
        return {
            hits,
            misses,
            totalRequests,
            hitRatio: totalRequests > 0 ? hits / totalRequests : 0,
            avgGetTime: getRequests > 0 ? totalGetTime / getRequests : 0,
            avgSetTime: setRequests > 0 ? totalSetTime / setRequests : 0
        };
    }
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            totalGetTime: 0,
            getRequests: 0,
            totalSetTime: 0,
            setRequests: 0
        };
    }
}
class CacheManager {
    constructor() {
        var _a, _b;
        this.provider = new MemoryCache();
        this.defaultTTL = ((_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.defaultTTL) || 3600;
        this.enabled = ((_b = config_1.config.cache) === null || _b === void 0 ? void 0 : _b.enabled) || true;
        logger_1.default.info('Cache Manager initialized with Memory Cache');
    }
    async get(key, options = {}) {
        if (!this.enabled)
            return null;
        const domain = this.extractDomain(key, options);
        const start = Date.now();
        try {
            const value = this.provider.get(key);
            const duration = Date.now() - start;
            if (value !== null) {
                cache_metrics_1.cacheMetrics.recordHit(domain, duration);
            }
            else {
                cache_metrics_1.cacheMetrics.recordMiss(domain, duration);
            }
            return value;
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
            logger_1.default.warn('Cache get error', { key, domain, error: error instanceof Error ? error.message : String(error) });
            return null;
        }
    }
    async set(key, value, options = {}) {
        if (!this.enabled)
            return;
        if (value === undefined || value === null)
            return;
        const domain = this.extractDomain(key, options);
        const start = Date.now();
        try {
            const ttl = options.ttl !== undefined ? options.ttl : this.defaultTTL;
            this.provider.set(key, value, { ttl });
            const duration = Date.now() - start;
            cache_metrics_1.cacheMetrics.recordSet(duration);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
            logger_1.default.warn('Cache set error', { key, domain, error: error instanceof Error ? error.message : String(error) });
        }
    }
    async delete(key, options = {}) {
        if (!this.enabled)
            return;
        const domain = this.extractDomain(key, options);
        const start = Date.now();
        try {
            this.provider.delete(key);
            const duration = Date.now() - start;
            cache_metrics_1.cacheMetrics.recordDelete(duration);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
            logger_1.default.warn('Cache delete error', { key, domain, error: error instanceof Error ? error.message : String(error) });
        }
    }
    async deleteByPattern(pattern, options = {}) {
        if (!this.enabled)
            return;
        const domain = this.extractDomain(pattern, options);
        const start = Date.now();
        try {
            this.provider.deleteByPattern(pattern);
            const duration = Date.now() - start;
            cache_metrics_1.cacheMetrics.recordDelete(duration);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
            logger_1.default.warn('Cache delete pattern error', { pattern, domain, error: error instanceof Error ? error.message : String(error) });
        }
    }
    async clear() {
        if (!this.enabled)
            return;
        try {
            this.provider.clear();
        }
        catch (error) {
            logger_1.default.warn('Cache clear error', { error: error instanceof Error ? error.message : String(error) });
        }
    }
    async keys(pattern = '*') {
        if (!this.enabled)
            return [];
        try {
            return this.provider.keys(pattern);
        }
        catch (error) {
            logger_1.default.warn('Cache keys error', { pattern, error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }
    getStats() {
        return this.provider.getStats();
    }
    resetStats() {
        this.provider.resetStats();
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        logger_1.default.info(`Cache ${enabled ? 'enabled' : 'disabled'}`);
    }
    extractDomain(key, options) {
        if (options.domain) {
            return options.domain;
        }
        const firstPart = key.split(':')[0];
        if (firstPart) {
            return firstPart;
        }
        return 'default';
    }
    getMetricsReport() {
        const providerStats = this.provider.getStats();
        return {
            enabled: this.enabled,
            providerStats,
            hitRate: `${cache_metrics_1.cacheMetrics.getHitRate()}%`,
            domainHitRates: cache_metrics_1.cacheMetrics.getDomainHitRates(),
            avgLatency: {
                get: `${cache_metrics_1.cacheMetrics.getAverageGetLatency()}ms`,
                set: `${cache_metrics_1.cacheMetrics.getAverageSetLatency()}ms`,
                delete: `${cache_metrics_1.cacheMetrics.getAverageDeleteLatency()}ms`
            }
        };
    }
}
exports.cacheManager = new CacheManager();
//# sourceMappingURL=CacheManager.js.map