"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfig = void 0;
exports.cacheConfig = {
    enabled: process.env.CACHE_ENABLED === 'true',
    namespace: process.env.CACHE_NAMESPACE || 'okgym',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        connectTimeout: 10000,
        maxRetriesPerRequest: 3
    },
    ttl: {
        exercise: parseInt(process.env.CACHE_TTL_EXERCISE || '86400', 10),
        search: parseInt(process.env.CACHE_TTL_SEARCH || '900', 10),
        popular: parseInt(process.env.CACHE_TTL_POPULAR || '1800', 10),
        user: parseInt(process.env.CACHE_TTL_USER || '300', 10),
        workoutPlan: parseInt(process.env.CACHE_TTL_WORKOUT_PLAN || '3600', 10),
        reference: parseInt(process.env.CACHE_TTL_REFERENCE || '172800', 10)
    },
    monitoring: {
        logHitMiss: process.env.CACHE_LOG_HIT_MISS === 'true',
        slowOperationThreshold: parseInt(process.env.CACHE_SLOW_THRESHOLD || '50', 10)
    }
};
//# sourceMappingURL=cache.config.js.map