import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { cacheManager } from '../../services/CacheManager';
import { CacheMetrics } from '../../utils/cache-metrics';

// Mock the cache-metrics module
jest.mock('../../utils/cache-metrics', () => {
  const mockRecordHit = jest.fn();
  const mockRecordMiss = jest.fn();
  const mockRecordSet = jest.fn();
  const mockRecordDelete = jest.fn();
  const mockRecordError = jest.fn();
  const mockReset = jest.fn();
  const mockGetHitRate = jest.fn().mockReturnValue(75);
  const mockGetAverageGetLatency = jest.fn().mockReturnValue(15);
  const mockGetAverageSetLatency = jest.fn().mockReturnValue(20);
  const mockGetAverageDeleteLatency = jest.fn().mockReturnValue(10);
  const mockGetDomainHitRates = jest.fn().mockReturnValue({ user: 80, post: 60 });
  
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
      getInstance: jest.fn().mockReturnValue(mockInstance)
    },
    cacheMetrics: mockInstance
  };
});

// Mock the logger
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('CacheManager', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset the cache
    cacheManager.clear();
  });
  
  describe('get operations with metrics', () => {
    it('should record a cache hit when item exists', async () => {
      // Set up cache with a test value
      await cacheManager.set('user:123', { id: 123, name: 'Test User' }, { ttl: 60, domain: 'user' });
      
      // Reset mocks after setup
      jest.clearAllMocks();
      
      // Get the cached item
      const result = await cacheManager.get('user:123');
      
      // Check that the hit was recorded
      expect(CacheMetrics.getInstance().recordHit).toHaveBeenCalled();
      expect(CacheMetrics.getInstance().recordMiss).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 123, name: 'Test User' });
    });
    
    it('should record a cache miss when item does not exist', async () => {
      // Get a non-existent item
      const result = await cacheManager.get('user:nonexistent');
      
      // Check that the miss was recorded
      expect(CacheMetrics.getInstance().recordMiss).toHaveBeenCalled();
      expect(CacheMetrics.getInstance().recordHit).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
    
    it('should record an error when cache operation fails', async () => {
      // Import the mocked cacheMetrics directly
      const { cacheMetrics } = require('../../utils/cache-metrics');
      
      // Create a spy on the recordError method
      const recordErrorSpy = jest.spyOn(cacheMetrics, 'recordError');
      
      // Mock a cache error by temporarily replacing the provider.get method
      const originalProvider = (cacheManager as any).provider;
      (cacheManager as any).provider = {
        get: jest.fn().mockImplementation(() => {
          throw new Error('Test cache error');
        })
      };
      
      // Call the get method which should trigger the error
      await cacheManager.get('user:123');
      
      // Check that the error was recorded
      expect(recordErrorSpy).toHaveBeenCalled();
      
      // Restore the original provider
      (cacheManager as any).provider = originalProvider;
      
      // Restore the spy
      recordErrorSpy.mockRestore();
    });
  });
  
  describe('set operations with metrics', () => {
    it('should record set operation metrics', async () => {
      await cacheManager.set('user:456', { id: 456, name: 'Another User' }, { ttl: 60, domain: 'user' });
      
      // Check that the set operation was recorded
      expect(CacheMetrics.getInstance().recordSet).toHaveBeenCalled();
    });
  });
  
  describe('delete operations with metrics', () => {
    it('should record delete operation metrics', async () => {
      // Set up cache with a test value
      await cacheManager.set('user:789', { id: 789, name: 'Delete Test' });
      
      // Reset mocks after setup
      jest.clearAllMocks();
      
      // Delete the cached item
      await cacheManager.delete('user:789');
      
      // Check that the delete operation was recorded
      expect(CacheMetrics.getInstance().recordDelete).toHaveBeenCalled();
    });
    
    it('should record metrics for deleteByPattern operation', async () => {
      // Set up cache with test values
      await cacheManager.set('user:1', { id: 1 });
      await cacheManager.set('user:2', { id: 2 });
      await cacheManager.set('post:1', { id: 1 });
      
      // Reset mocks after setup
      jest.clearAllMocks();
      
      // Delete by pattern
      await cacheManager.deleteByPattern('user:*');
      
      // Check that the delete operation was recorded
      expect(CacheMetrics.getInstance().recordDelete).toHaveBeenCalled();
    });
  });
  
  describe('getMetricsReport', () => {
    it('should return a comprehensive metrics report', async () => {
      // Set up some cache operations to generate metrics
      await cacheManager.set('test:1', { id: 1, name: 'Test 1' });
      await cacheManager.get('test:1'); // Hit
      await cacheManager.get('test:2'); // Miss
      
      // Get the metrics report
      const report = cacheManager.getMetricsReport();
      
      // Verify the report structure
      expect(report).toHaveProperty('enabled');
      expect(report).toHaveProperty('providerStats');
      expect(report).toHaveProperty('hitRate');
      expect(report).toHaveProperty('domainHitRates');
      expect(report).toHaveProperty('avgLatency');
      // The actual property is avgLatency, not latency
      expect(report.avgLatency).toHaveProperty('get');
      expect(report.avgLatency).toHaveProperty('set');
      expect(report.avgLatency).toHaveProperty('delete');
    });
  });
});