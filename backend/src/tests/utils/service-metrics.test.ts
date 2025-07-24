import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ServiceMetrics } from '../../utils/service-metrics';

describe('ServiceMetrics', () => {
  let serviceMetrics: ServiceMetrics;
  
  // Mock the logger to prevent actual logging during tests
  jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }
  }));
  
  beforeEach(() => {
    // Get a fresh instance for each test
    serviceMetrics = ServiceMetrics.getInstance();
    serviceMetrics.reset();
  });
  
  describe('tracking async operations', () => {
    it('should track successful async operations', async () => {
      // Create a mock function that will succeed with proper type
      const mockFn = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' })) as () => Promise<{ status: string }>;
      
      // Use the track method
      const result = await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
      
      // Verify result
      expect(result).toEqual({ status: 'success' });
      expect(mockFn).toHaveBeenCalled();
      
      // Verify metrics were recorded
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod).toBeDefined();
      expect(metrics.testMethod.calls).toBe(1);
      expect(metrics.testMethod.successRate).toBe(100);
    });
    
    it('should track failed async operations', async () => {
      // Create a mock error
      const mockError = new Error('Test error');
      
      // Create a mock function that will fail with proper type
      const mockFn = jest.fn().mockImplementation(() => Promise.reject(mockError)) as () => Promise<unknown>;
      
      // Use the track method and expect it to throw
      try {
        await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
      
      // Verify metrics were recorded
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod).toBeDefined();
      expect(metrics.testMethod.calls).toBe(1);
      expect(metrics.testMethod.successRate).toBe(0);
    });
    
    it('should track multiple async operations and calculate success rate', async () => {
      // Create mock functions with proper types
      const successFn = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' })) as () => Promise<{ status: string }>;
      const failureFn = jest.fn().mockImplementation(() => Promise.reject(new Error('Test error'))) as () => Promise<unknown>;
      
      // Track successful operations
      await serviceMetrics.trackAsync('TestService', 'multiMethod', successFn);
      await serviceMetrics.trackAsync('TestService', 'multiMethod', successFn);
      
      // Track a failed operation
      try {
        await serviceMetrics.trackAsync('TestService', 'multiMethod', failureFn);
      } catch (error) {
        // Expected error
      }
      
      // Verify metrics
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.multiMethod.calls).toBe(3);
      expect(metrics.multiMethod.successRate).toBeCloseTo(67, 0); // 2 out of 3 = 66.67%
    });
    
    it('should handle errors in trackAsync', async () => {
      // Create a function that will fail
      const errorFn = jest.fn().mockImplementation(() => Promise.reject(new Error('Test error'))) as () => Promise<unknown>;
      
      // Use the track method and expect it to throw
      await expect(serviceMetrics.trackAsync('TestService', 'errorMethod', errorFn))
        .rejects.toThrow('Test error');
      
      // Verify metrics were recorded
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.errorMethod).toBeDefined();
      expect(metrics.errorMethod.calls).toBe(1);
      expect(metrics.errorMethod.successRate).toBe(0); // 0% success rate
    });
  });
  
  describe('tracking sync operations', () => {
    it('should track successful sync operations', () => {
      // Create a mock function that will succeed
      const mockFn = jest.fn().mockReturnValue('success');
      
      // Use the track method
      const result = serviceMetrics.track('TestService', 'testMethod', mockFn);
      
      // Verify result
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
      
      // Verify metrics were recorded
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod).toBeDefined();
      expect(metrics.testMethod.calls).toBe(1);
      expect(metrics.testMethod.successRate).toBe(100);
    });
    
    it('should track failed sync operations', () => {
      // Create a mock function that will fail
      const mockError = new Error('Test error');
      const mockFn = jest.fn().mockImplementation(() => {
        throw mockError;
      });
      
      // Use the track method and catch the error
      try {
        serviceMetrics.track('TestService', 'testMethod', mockFn);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBe(mockError);
      }
      
      // Verify metrics were recorded
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod).toBeDefined();
      expect(metrics.testMethod.calls).toBe(1);
      expect(metrics.testMethod.successRate).toBe(0);
    });
  });
  
  describe('metrics collection', () => {
    it('should calculate success rate correctly', async () => {
      // Create 3 successful and 1 failed operations with proper types
      const successFn = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' })) as () => Promise<{ status: string }>;
      const failFn = jest.fn().mockImplementation(() => Promise.reject(new Error('fail'))) as () => Promise<unknown>;
      
      await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
      await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
      await serviceMetrics.trackAsync('TestService', 'testMethod', successFn);
      
      try {
        await serviceMetrics.trackAsync('TestService', 'testMethod', failFn);
      } catch (error) {
        // Expected error
      }
      
      // Verify metrics
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod.calls).toBe(4);
      expect(metrics.testMethod.successRate).toBe(75); // 3 out of 4 = 75%
    });
    
    it('should calculate average duration correctly', async () => {
      // Mock Date.now to return controlled values for timing
      jest.spyOn(Date, 'now')
        .mockImplementationOnce(() => 1000) // Start timestamp
        .mockImplementationOnce(() => 1050) // End timestamp (+50ms)
        .mockImplementationOnce(() => 1100) // Start timestamp
        .mockImplementationOnce(() => 1200); // End timestamp (+100ms)
      
      const mockFn = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' })) as () => Promise<{ status: string }>;
      
      // Execute operations
      await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
      await serviceMetrics.trackAsync('TestService', 'testMethod', mockFn);
      
      // Reset Date.now mock to avoid affecting other tests
      (Date.now as jest.Mock).mockRestore();
      
      // Verify metrics
      const metrics = serviceMetrics.getServiceMetrics('TestService');
      expect(metrics.testMethod.avgDuration).toBe(75); // The actual implementation calculates (50 + 100) / 2 = 75ms
    });
  });
  
  describe('metrics reporting', () => {
    it('should return metrics for specific service', async () => {
      // Create operations for multiple services
      await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
      await serviceMetrics.trackAsync('ServiceA', 'method2', () => Promise.resolve('a2'));
      await serviceMetrics.trackAsync('ServiceB', 'method1', () => Promise.resolve('b1'));
      
      // Get metrics for ServiceA
      const metricsA = serviceMetrics.getServiceMetrics('ServiceA');
      
      // Verify structure
      expect(Object.keys(metricsA)).toContain('method1');
      expect(Object.keys(metricsA)).toContain('method2');
      expect(Object.keys(metricsA).length).toBe(2);
      
      // Get metrics for ServiceB
      const metricsB = serviceMetrics.getServiceMetrics('ServiceB');
      
      // Verify structure
      expect(Object.keys(metricsB)).toContain('method1');
      expect(Object.keys(metricsB).length).toBe(1);
    });
    
    it('should return all metrics', async () => {
      // Create operations for multiple services
      await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
      await serviceMetrics.trackAsync('ServiceB', 'method1', () => Promise.resolve('b1'));
      
      // Get all metrics
      const allMetrics = serviceMetrics.getAllMetrics();
      
      // Verify structure
      expect(Object.keys(allMetrics)).toContain('ServiceA');
      expect(Object.keys(allMetrics)).toContain('ServiceB');
      expect(Object.keys(allMetrics.ServiceA)).toContain('method1');
      expect(Object.keys(allMetrics.ServiceB)).toContain('method1');
    });
    
    it('should reset all metrics', async () => {
      // Create some operations
      await serviceMetrics.trackAsync('ServiceA', 'method1', () => Promise.resolve('a1'));
      
      // Verify metrics exist
      expect(Object.keys(serviceMetrics.getAllMetrics())).toContain('ServiceA');
      
      // Reset metrics
      serviceMetrics.reset();
      
      // Verify metrics are reset
      expect(Object.keys(serviceMetrics.getAllMetrics()).length).toBe(0);
    });
  });
}); 