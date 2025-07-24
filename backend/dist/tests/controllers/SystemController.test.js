"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const SystemController_1 = require("../../controllers/SystemController");
const CacheManager_1 = require("../../services/CacheManager");
globals_1.jest.mock('../../services/CacheManager', () => ({
    cacheManager: {
        getStats: globals_1.jest.fn(),
        clear: globals_1.jest.fn(),
        deleteByPattern: globals_1.jest.fn(),
        setEnabled: globals_1.jest.fn(),
        keys: globals_1.jest.fn(),
        getMetricsReport: globals_1.jest.fn(),
        resetStats: globals_1.jest.fn()
    }
}));
globals_1.jest.mock('../../utils/cache-metrics', () => {
    const mockReset = globals_1.jest.fn();
    return {
        __esModule: true,
        CacheMetrics: {
            getInstance: globals_1.jest.fn().mockReturnValue({
                reset: mockReset,
                getHitRate: globals_1.jest.fn().mockReturnValue(75),
                getDomainHitRates: globals_1.jest.fn().mockReturnValue({ user: 80, post: 60 }),
                getAverageGetLatency: globals_1.jest.fn().mockReturnValue(15),
                getAverageSetLatency: globals_1.jest.fn().mockReturnValue(20),
                getAverageDeleteLatency: globals_1.jest.fn().mockReturnValue(10)
            })
        },
        cacheMetrics: {
            reset: mockReset,
            getHitRate: globals_1.jest.fn().mockReturnValue(75),
            getDomainHitRates: globals_1.jest.fn().mockReturnValue({ user: 80, post: 60 }),
            getAverageGetLatency: globals_1.jest.fn().mockReturnValue(15),
            getAverageSetLatency: globals_1.jest.fn().mockReturnValue(20),
            getAverageDeleteLatency: globals_1.jest.fn().mockReturnValue(10)
        }
    };
});
globals_1.jest.mock('../../utils/performance', () => ({
    simplePerformance: {
        getBasicReport: globals_1.jest.fn().mockReturnValue({
            slowOperations: [],
            errorRates: {},
            averageResponseTimes: {}
        }),
        reset: globals_1.jest.fn()
    }
}));
globals_1.jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        info: globals_1.jest.fn(),
        error: globals_1.jest.fn(),
        warn: globals_1.jest.fn(),
        debug: globals_1.jest.fn()
    }
}));
(0, globals_1.describe)('SystemController', () => {
    let systemController;
    let mockRequest;
    let mockResponse;
    let jsonMock;
    let statusMock;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        jsonMock = globals_1.jest.fn().mockReturnThis();
        statusMock = globals_1.jest.fn().mockReturnThis();
        mockRequest = {
            body: {},
            query: {}
        };
        mockResponse = {
            status: statusMock,
            json: jsonMock
        };
        CacheManager_1.cacheManager.getStats.mockReturnValue({
            size: 10,
            hits: 75,
            misses: 25
        });
        const mockReset = globals_1.jest.fn();
        CacheManager_1.cacheManager.clear.mockResolvedValue(undefined);
        CacheManager_1.cacheManager.setEnabled.mockImplementation(() => { });
        CacheManager_1.cacheManager.deleteByPattern.mockResolvedValue(5);
        CacheManager_1.cacheManager.keys.mockResolvedValue(['user:1', 'user:2', 'post:1']);
        CacheManager_1.cacheManager.resetStats.mockImplementation(() => { });
        CacheManager_1.cacheManager.getMetricsReport.mockReturnValue({
            enabled: true,
            hitRate: '75%',
            domainHitRates: { user: 80, post: 60 },
            avgLatency: {
                get: '15ms',
                set: '20ms',
                delete: '10ms'
            }
        });
        systemController = new SystemController_1.SystemController();
    });
    (0, globals_1.describe)('getCacheMetrics', () => {
        (0, globals_1.it)('should return cache metrics and stats with 200 status', async () => {
            await systemController.getCacheMetrics(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                metrics: {
                    enabled: true,
                    hitRate: '75%',
                    domainHitRates: { user: 80, post: 60 },
                    avgLatency: {
                        get: '15ms',
                        set: '20ms',
                        delete: '10ms'
                    }
                },
                stats: {
                    size: 10,
                    hits: 75,
                    misses: 25
                }
            });
        });
        (0, globals_1.it)('should return 500 status on error', async () => {
            CacheManager_1.cacheManager.getMetricsReport.mockImplementation(() => {
                throw new Error('Test error');
            });
            await systemController.getCacheMetrics(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error retrieving cache metrics')
            });
        });
    });
    (0, globals_1.describe)('resetCacheMetrics', () => {
        (0, globals_1.it)('should reset cache metrics and return 200 status', async () => {
            const { cacheMetrics } = require('../../utils/cache-metrics');
            await systemController.resetCacheMetrics(mockRequest, mockResponse);
            (0, globals_1.expect)(cacheMetrics.reset).toHaveBeenCalled();
            (0, globals_1.expect)(CacheManager_1.cacheManager.resetStats).toHaveBeenCalled();
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: globals_1.expect.stringContaining('Cache metrics reset')
            });
        });
        (0, globals_1.it)('should reset 500 status on error', async () => {
            const { cacheMetrics } = require('../../utils/cache-metrics');
            cacheMetrics.reset.mockImplementation(() => {
                throw new Error('Test error');
            });
            await systemController.resetCacheMetrics(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error resetting cache metrics')
            });
        });
    });
    (0, globals_1.describe)('clearCache', () => {
        (0, globals_1.it)('should clear cache and return 200 status', async () => {
            await systemController.clearCache(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.clear).toHaveBeenCalled();
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: globals_1.expect.stringContaining('Cache cleared')
            });
        });
        (0, globals_1.it)('should return 500 status on error', async () => {
            CacheManager_1.cacheManager.clear.mockRejectedValue(new Error('Test error'));
            await systemController.clearCache(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error clearing cache')
            });
        });
    });
    (0, globals_1.describe)('setCacheEnabled', () => {
        (0, globals_1.it)('should enable cache when enabled is true', async () => {
            mockRequest.body = { enabled: true };
            await systemController.setCacheEnabled(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.setEnabled).toHaveBeenCalledWith(true);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: globals_1.expect.stringContaining('Cache enabled')
            });
        });
        (0, globals_1.it)('should disable cache when enabled is false', async () => {
            mockRequest.body = { enabled: false };
            await systemController.setCacheEnabled(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.setEnabled).toHaveBeenCalledWith(false);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: globals_1.expect.stringContaining('Cache disabled')
            });
        });
        (0, globals_1.it)('should return 400 status when enabled parameter is missing', async () => {
            mockRequest.body = {};
            await systemController.setCacheEnabled(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Missing required parameter')
            });
        });
        (0, globals_1.it)('should return 500 status on error', async () => {
            mockRequest.body = { enabled: true };
            CacheManager_1.cacheManager.setEnabled.mockImplementation(() => {
                throw new Error('Test error');
            });
            await systemController.setCacheEnabled(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error setting cache state')
            });
        });
    });
    (0, globals_1.describe)('deleteCacheByPattern', () => {
        (0, globals_1.it)('should delete cache entries by pattern and return 200 status', async () => {
            mockRequest.body = { pattern: 'user:*' };
            await systemController.deleteCacheByPattern(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.deleteByPattern).toHaveBeenCalledWith('user:*');
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: globals_1.expect.stringContaining('Cache entries matching pattern')
            });
        });
        (0, globals_1.it)('should return 400 status when pattern parameter is missing', async () => {
            mockRequest.body = {};
            await systemController.deleteCacheByPattern(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Missing required parameter')
            });
        });
        (0, globals_1.it)('should return 500 status on error', async () => {
            mockRequest.body = { pattern: 'user:*' };
            CacheManager_1.cacheManager.deleteByPattern.mockRejectedValue(new Error('Test error'));
            await systemController.deleteCacheByPattern(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error deleting cache entries')
            });
        });
    });
    (0, globals_1.describe)('listCacheKeys', () => {
        (0, globals_1.it)('should list cache keys matching pattern and return 200 status', async () => {
            mockRequest.query = { pattern: 'user:*' };
            await systemController.listCacheKeys(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.keys).toHaveBeenCalledWith('user:*');
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: true,
                keys: ['user:1', 'user:2', 'post:1']
            });
        });
        (0, globals_1.it)('should use default pattern when not provided', async () => {
            mockRequest.query = {};
            await systemController.listCacheKeys(mockRequest, mockResponse);
            (0, globals_1.expect)(CacheManager_1.cacheManager.keys).toHaveBeenCalledWith('*');
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(200);
        });
        (0, globals_1.it)('should return 500 status on error', async () => {
            mockRequest.query = { pattern: 'user:*' };
            CacheManager_1.cacheManager.keys.mockRejectedValue(new Error('Test error'));
            await systemController.listCacheKeys(mockRequest, mockResponse);
            (0, globals_1.expect)(statusMock).toHaveBeenCalledWith(500);
            (0, globals_1.expect)(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: globals_1.expect.stringContaining('Error listing cache keys')
            });
        });
    });
});
//# sourceMappingURL=SystemController.test.js.map