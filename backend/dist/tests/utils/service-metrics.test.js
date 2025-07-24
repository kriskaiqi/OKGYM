"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const service_metrics_1 = require("../../utils/service-metrics");
(0, globals_1.describe)('ServiceMetrics', () => {
    let serviceMetrics;
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
        serviceMetrics = service_metrics_1.ServiceMetrics.getInstance();
        serviceMetrics.reset();
    });
    (0, globals_1.describe)('tracking async operations', () => {
        (0, globals_1.it)('should track successful async operations', async () => {
            const mockFn = globals_1.jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));
            const result = await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
            (0, globals_1.expect)(result).toEqual({ status: 'success' });
            (0, globals_1.expect)(mockFn).toHaveBeenCalled();
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod).toBeDefined();
            (0, globals_1.expect)(metrics.testMethod.calls).toBe(1);
            (0, globals_1.expect)(metrics.testMethod.successRate).toBe(100);
        });
        (0, globals_1.it)('should track failed async operations', async () => {
            const mockError = new Error('Test error');
            const mockFn = globals_1.jest.fn().mockImplementation(() => Promise.reject(mockError));
            try {
                await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
                fail('Should have thrown an error');
            }
            catch (error) {
                (0, globals_1.expect)(error).toBe(mockError);
            }
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod).toBeDefined();
            (0, globals_1.expect)(metrics.testMethod.calls).toBe(1);
            (0, globals_1.expect)(metrics.testMethod.successRate).toBe(0);
        });
        (0, globals_1.it)('should track multiple async operations and calculate success rate', async () => {
            const successFn = globals_1.jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));
            const failureFn = globals_1.jest.fn().mockImplementation(() => Promise.reject(new Error('Test error')));
            await serviceMetrics.trackAsync('TestService', 'multiMethod', successFn);
            await serviceMetrics.trackAsync('TestService', 'multiMethod', successFn);
            try {
                await serviceMetrics.trackAsync('TestService', 'multiMethod', failureFn);
            }
            catch (error) {
            }
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.multiMethod.calls).toBe(3);
            (0, globals_1.expect)(metrics.multiMethod.successRate).toBeCloseTo(67, 0);
        });
        (0, globals_1.it)('should handle errors in trackAsync', async () => {
            const errorFn = globals_1.jest.fn().mockImplementation(() => Promise.reject(new Error('Test error')));
            await (0, globals_1.expect)(serviceMetrics.trackAsync('TestService', 'errorMethod', errorFn))
                .rejects.toThrow('Test error');
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.errorMethod).toBeDefined();
            (0, globals_1.expect)(metrics.errorMethod.calls).toBe(1);
            (0, globals_1.expect)(metrics.errorMethod.successRate).toBe(0);
        });
    });
    (0, globals_1.describe)('tracking sync operations', () => {
        (0, globals_1.it)('should track successful sync operations', () => {
            const mockFn = globals_1.jest.fn().mockReturnValue('success');
            const result = serviceMetrics.track('TestService', 'testMethod', mockFn);
            (0, globals_1.expect)(result).toBe('success');
            (0, globals_1.expect)(mockFn).toHaveBeenCalled();
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod).toBeDefined();
            (0, globals_1.expect)(metrics.testMethod.calls).toBe(1);
            (0, globals_1.expect)(metrics.testMethod.successRate).toBe(100);
        });
        (0, globals_1.it)('should track failed sync operations', () => {
            const mockError = new Error('Test error');
            const mockFn = globals_1.jest.fn().mockImplementation(() => {
                throw mockError;
            });
            try {
                serviceMetrics.track('TestService', 'testMethod', mockFn);
                fail('Expected an error to be thrown');
            }
            catch (error) {
                (0, globals_1.expect)(error).toBe(mockError);
            }
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod).toBeDefined();
            (0, globals_1.expect)(metrics.testMethod.calls).toBe(1);
            (0, globals_1.expect)(metrics.testMethod.successRate).toBe(0);
        });
    });
    (0, globals_1.describe)('metrics collection', () => {
        (0, globals_1.it)('should calculate success rate correctly', async () => {
            const successFn = globals_1.jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));
            const failFn = globals_1.jest.fn().mockImplementation(() => Promise.reject(new Error('fail')));
            await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
            await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
            await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
            try {
                await serviceMetrics.trackAsync('TestService', 'testMethod', failFn);
            }
            catch (error) {
            }
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod.calls).toBe(4);
            (0, globals_1.expect)(metrics.testMethod.successRate).toBe(75);
        });
        (0, globals_1.it)('should calculate average duration correctly', async () => {
            globals_1.jest.spyOn(Date, 'now')
                .mockImplementationOnce(() => 1000)
                .mockImplementationOnce(() => 1050)
                .mockImplementationOnce(() => 1100)
                .mockImplementationOnce(() => 1200);
            const mockFn = globals_1.jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));
            await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
            await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
            Date.now.mockRestore();
            const metrics = serviceMetrics.getServiceMetrics('TestService');
            (0, globals_1.expect)(metrics.testMethod.avgDuration).toBe(75);
        });
    });
    (0, globals_1.describe)('metrics reporting', () => {
        (0, globals_1.it)('should return metrics for specific service', async () => {
            await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
            await serviceMetrics.trackAsync('ServiceA', 'method2', () => Promise.resolve('a2'));
            await serviceMetrics.trackAsync('ServiceB', 'method1', () => Promise.resolve('b1'));
            const metricsA = serviceMetrics.getServiceMetrics('ServiceA');
            (0, globals_1.expect)(Object.keys(metricsA)).toContain('method1');
            (0, globals_1.expect)(Object.keys(metricsA)).toContain('method2');
            (0, globals_1.expect)(Object.keys(metricsA).length).toBe(2);
            const metricsB = serviceMetrics.getServiceMetrics('ServiceB');
            (0, globals_1.expect)(Object.keys(metricsB)).toContain('method1');
            (0, globals_1.expect)(Object.keys(metricsB).length).toBe(1);
        });
        (0, globals_1.it)('should return all metrics', async () => {
            await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
            await serviceMetrics.trackAsync('ServiceB', 'method1', () => Promise.resolve('b1'));
            const allMetrics = serviceMetrics.getAllMetrics();
            (0, globals_1.expect)(Object.keys(allMetrics)).toContain('ServiceA');
            (0, globals_1.expect)(Object.keys(allMetrics)).toContain('ServiceB');
            (0, globals_1.expect)(Object.keys(allMetrics.ServiceA)).toContain('method1');
            (0, globals_1.expect)(Object.keys(allMetrics.ServiceB)).toContain('method1');
        });
        (0, globals_1.it)('should reset all metrics', async () => {
            await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
            (0, globals_1.expect)(Object.keys(serviceMetrics.getAllMetrics())).toContain('ServiceA');
            serviceMetrics.reset();
            (0, globals_1.expect)(Object.keys(serviceMetrics.getAllMetrics()).length).toBe(0);
        });
    });
});
//# sourceMappingURL=service-metrics.test.js.map