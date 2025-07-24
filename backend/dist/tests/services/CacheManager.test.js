"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const CacheManager_1 = require("../../services/CacheManager");
const cache_metrics_1 = require("../../utils/cache-metrics");
globals_1.jest.mock('../../utils/cache-metrics', () => {
    const mockRecordHit = globals_1.jest.fn();
    const mockRecordMiss = globals_1.jest.fn();
    const mockRecordSet = globals_1.jest.fn();
    const mockRecordDelete = globals_1.jest.fn();
    const mockRecordError = globals_1.jest.fn();
    const mockReset = globals_1.jest.fn();
    const mockGetHitRate = globals_1.jest.fn().mockReturnValue(75);
    const mockGetAverageGetLatency = globals_1.jest.fn().mockReturnValue(15);
    const mockGetAverageSetLatency = globals_1.jest.fn().mockReturnValue(20);
    const mockGetAverageDeleteLatency = globals_1.jest.fn().mockReturnValue(10);
    const mockGetDomainHitRates = globals_1.jest.fn().mockReturnValue({ user: 80, post: 60 });
    const mockInstance = {
        recordHit: mockRecordHit,
        recordMiss: mockRecordMiss,
        recordSet: mockRecordSet,
        recordDelete: mockRecordDelete,
        recordError: mockRecordError,
        reset: mockReset,
        getHitRate: mockGetHitRate,
        getAverageGetLatency: mockGetAverageGetLatency,
        getAverageSetLatency: mockGetAverageSetLatency,
        getAverageDeleteLatency: mockGetAverageDeleteLatency,
        getDomainHitRates: mockGetDomainHitRates
    };
    return {
        __esModule: true,
        CacheMetrics: {
            getInstance: globals_1.jest.fn().mockReturnValue(mockInstance)
        },
        cacheMetrics: mockInstance
    };
});
globals_1.jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        info: globals_1.jest.fn(),
        error: globals_1.jest.fn(),
        warn: globals_1.jest.fn(),
        debug: globals_1.jest.fn()
    }
}));
(0, globals_1.describe)('CacheManager', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        CacheManager_1.cacheManager.clear();
    });
    (0, globals_1.describe)('get operations with metrics', () => {
        (0, globals_1.it)('should record a cache hit when item exists', async () => {
            await CacheManager_1.cacheManager.set('user:123', { id: 123, name: 'Test User' }, { ttl: 60, domain: 'user' });
            globals_1.jest.clearAllMocks();
            const result = await CacheManager_1.cacheManager.get('user:123');
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordHit).toHaveBeenCalled();
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordMiss).not.toHaveBeenCalled();
            (0, globals_1.expect)(result).toEqual({ id: 123, name: 'Test User' });
        });
        (0, globals_1.it)('should record a cache miss when item does not exist', async () => {
            const result = await CacheManager_1.cacheManager.get('user:nonexistent');
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordMiss).toHaveBeenCalled();
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordHit).not.toHaveBeenCalled();
            (0, globals_1.expect)(result).toBeNull();
        });
        (0, globals_1.it)('should record an error when cache operation fails', async () => {
            const { cacheMetrics } = require('../../utils/cache-metrics');
            const recordErrorSpy = globals_1.jest.spyOn(cacheMetrics, 'recordError');
            const originalProvider = CacheManager_1.cacheManager.provider;
            CacheManager_1.cacheManager.provider = {
                get: globals_1.jest.fn().mockImplementation(() => {
                    throw new Error('Test cache error');
                })
            };
            await CacheManager_1.cacheManager.get('user:123');
            (0, globals_1.expect)(recordErrorSpy).toHaveBeenCalled();
            CacheManager_1.cacheManager.provider = originalProvider;
            recordErrorSpy.mockRestore();
        });
    });
    (0, globals_1.describe)('set operations with metrics', () => {
        (0, globals_1.it)('should record set operation metrics', async () => {
            await CacheManager_1.cacheManager.set('user:456', { id: 456, name: 'Another User' }, { ttl: 60, domain: 'user' });
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordSet).toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('delete operations with metrics', () => {
        (0, globals_1.it)('should record delete operation metrics', async () => {
            await CacheManager_1.cacheManager.set('user:789', { id: 789, name: 'Delete Test' });
            globals_1.jest.clearAllMocks();
            await CacheManager_1.cacheManager.delete('user:789');
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordDelete).toHaveBeenCalled();
        });
        (0, globals_1.it)('should record metrics for deleteByPattern operation', async () => {
            await CacheManager_1.cacheManager.set('user:1', { id: 1 });
            await CacheManager_1.cacheManager.set('user:2', { id: 2 });
            await CacheManager_1.cacheManager.set('post:1', { id: 1 });
            globals_1.jest.clearAllMocks();
            await CacheManager_1.cacheManager.deleteByPattern('user:*');
            (0, globals_1.expect)(cache_metrics_1.CacheMetrics.getInstance().recordDelete).toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('getMetricsReport', () => {
        (0, globals_1.it)('should return a comprehensive metrics report', async () => {
            await CacheManager_1.cacheManager.set('test:1', { id: 1, name: 'Test 1' });
            await CacheManager_1.cacheManager.get('test:1');
            await CacheManager_1.cacheManager.get('test:2');
            const report = CacheManager_1.cacheManager.getMetricsReport();
            (0, globals_1.expect)(report).toHaveProperty('enabled');
            (0, globals_1.expect)(report).toHaveProperty('providerStats');
            (0, globals_1.expect)(report).toHaveProperty('hitRate');
            (0, globals_1.expect)(report).toHaveProperty('domainHitRates');
            (0, globals_1.expect)(report).toHaveProperty('avgLatency');
            (0, globals_1.expect)(report.avgLatency).toHaveProperty('get');
            (0, globals_1.expect)(report.avgLatency).toHaveProperty('set');
            (0, globals_1.expect)(report.avgLatency).toHaveProperty('delete');
        });
    });
});
//# sourceMappingURL=CacheManager.test.js.map