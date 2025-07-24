"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const cache_metrics_1 = require("../../utils/cache-metrics");
(0, globals_1.describe)('CacheMetrics', () => {
    let cacheMetrics;
    globals_1.jest.mock('../../utils/logger', () => ({
        __esModule: true,
        default: {
            info: globals_1.jest.fn(),
            warn: globals_1.jest.fn(),
            error: globals_1.jest.fn(),
            debug: globals_1.jest.fn()
        }
    }));
    (0, globals_1.beforeEach)(() => {
        cacheMetrics = cache_metrics_1.CacheMetrics.getInstance();
        cacheMetrics.reset();
    });
    (0, globals_1.describe)('hit rate calculation', () => {
        (0, globals_1.it)('should calculate hit rate correctly', () => {
            for (let i = 0; i < 7; i++) {
                cacheMetrics.recordHit();
            }
            for (let i = 0; i < 3; i++) {
                cacheMetrics.recordMiss();
            }
            (0, globals_1.expect)(cacheMetrics.getHitRate()).toBe(70);
        });
        (0, globals_1.it)('should return 0 hit rate when no operations recorded', () => {
            (0, globals_1.expect)(cacheMetrics.getHitRate()).toBe(0);
        });
        (0, globals_1.it)('should calculate domain-specific hit rates', () => {
            cacheMetrics.recordHit('user', 5);
            cacheMetrics.recordHit('user', 10);
            cacheMetrics.recordHit('user', 15);
            cacheMetrics.recordHit('user', 20);
            cacheMetrics.recordMiss('user', 25);
            cacheMetrics.recordHit('post', 5);
            cacheMetrics.recordMiss('post', 10);
            cacheMetrics.recordMiss('post', 15);
            cacheMetrics.recordMiss('post', 20);
            cacheMetrics.recordMiss('post', 25);
            const domainRates = cacheMetrics.getDomainHitRates();
            (0, globals_1.expect)(domainRates['user']).toBe(80);
            (0, globals_1.expect)(domainRates['post']).toBe(20);
        });
    });
    (0, globals_1.describe)('latency tracking', () => {
        (0, globals_1.it)('should calculate average get latency', () => {
            cacheMetrics.recordHit('domain', 10);
            cacheMetrics.recordHit('domain', 20);
            cacheMetrics.recordMiss('domain', 30);
            cacheMetrics.recordMiss('domain', 40);
            (0, globals_1.expect)(cacheMetrics.getAverageGetLatency()).toBe(25);
        });
        (0, globals_1.it)('should calculate average set latency', () => {
            cacheMetrics.recordSet(10);
            cacheMetrics.recordSet(20);
            cacheMetrics.recordSet(30);
            (0, globals_1.expect)(cacheMetrics.getAverageSetLatency()).toBe(20);
        });
        (0, globals_1.it)('should calculate average delete latency', () => {
            cacheMetrics.recordDelete(15);
            cacheMetrics.recordDelete(25);
            (0, globals_1.expect)(cacheMetrics.getAverageDeleteLatency()).toBe(20);
        });
        (0, globals_1.it)('should return 0 for latency with no operations', () => {
            (0, globals_1.expect)(cacheMetrics.getAverageGetLatency()).toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageSetLatency()).toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageDeleteLatency()).toBe(0);
        });
    });
    (0, globals_1.describe)('reset functionality', () => {
        (0, globals_1.it)('should reset all metrics to zero', () => {
            cacheMetrics.recordHit('domain', 10);
            cacheMetrics.recordMiss('domain', 20);
            cacheMetrics.recordSet(30);
            cacheMetrics.recordDelete(40);
            cacheMetrics.recordError();
            (0, globals_1.expect)(cacheMetrics.getHitRate()).not.toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageGetLatency()).not.toBe(0);
            cacheMetrics.reset();
            (0, globals_1.expect)(cacheMetrics.getHitRate()).toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageGetLatency()).toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageSetLatency()).toBe(0);
            (0, globals_1.expect)(cacheMetrics.getAverageDeleteLatency()).toBe(0);
            (0, globals_1.expect)(Object.keys(cacheMetrics.getDomainHitRates()).length).toBe(0);
        });
    });
});
//# sourceMappingURL=cache-metrics.test.js.map