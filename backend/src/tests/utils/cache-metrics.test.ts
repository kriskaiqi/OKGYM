import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { CacheMetrics } from '../../utils/cache-metrics';

describe('CacheMetrics', () => {
  let cacheMetrics: CacheMetrics;
  
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
    cacheMetrics = CacheMetrics.getInstance();
    cacheMetrics.reset();
  });
  
  describe('hit rate calculation', () => {
    it('should calculate hit rate correctly', () => {
      // Record 7 hits and 3 misses (70% hit rate)
      for (let i = 0; i < 7; i++) {
        cacheMetrics.recordHit();
      }
      
      for (let i = 0; i < 3; i++) {
        cacheMetrics.recordMiss();
      }
      
      expect(cacheMetrics.getHitRate()).toBe(70);
    });
    
    it('should return 0 hit rate when no operations recorded', () => {
      expect(cacheMetrics.getHitRate()).toBe(0);
    });
    
    it('should calculate domain-specific hit rates', () => {
      // User domain: 4 hits, 1 miss (80%)
      cacheMetrics.recordHit('user', 5);
      cacheMetrics.recordHit('user', 10);
      cacheMetrics.recordHit('user', 15);
      cacheMetrics.recordHit('user', 20);
      cacheMetrics.recordMiss('user', 25);
      
      // Post domain: 1 hit, 4 misses (20%)
      cacheMetrics.recordHit('post', 5);
      cacheMetrics.recordMiss('post', 10);
      cacheMetrics.recordMiss('post', 15);
      cacheMetrics.recordMiss('post', 20);
      cacheMetrics.recordMiss('post', 25);
      
      const domainRates = cacheMetrics.getDomainHitRates();
      expect(domainRates['user']).toBe(80);
      expect(domainRates['post']).toBe(20);
    });
  });
  
  describe('latency tracking', () => {
    it('should calculate average get latency', () => {
      cacheMetrics.recordHit('domain', 10);
      cacheMetrics.recordHit('domain', 20);
      cacheMetrics.recordMiss('domain', 30);
      cacheMetrics.recordMiss('domain', 40);
      
      // Average = (10 + 20 + 30 + 40) / 4 = 25
      expect(cacheMetrics.getAverageGetLatency()).toBe(25);
    });
    
    it('should calculate average set latency', () => {
      cacheMetrics.recordSet(10);
      cacheMetrics.recordSet(20);
      cacheMetrics.recordSet(30);
      
      // Average = (10 + 20 + 30) / 3 = 20
      expect(cacheMetrics.getAverageSetLatency()).toBe(20);
    });
    
    it('should calculate average delete latency', () => {
      cacheMetrics.recordDelete(15);
      cacheMetrics.recordDelete(25);
      
      // Average = (15 + 25) / 2 = 20
      expect(cacheMetrics.getAverageDeleteLatency()).toBe(20);
    });
    
    it('should return 0 for latency with no operations', () => {
      expect(cacheMetrics.getAverageGetLatency()).toBe(0);
      expect(cacheMetrics.getAverageSetLatency()).toBe(0);
      expect(cacheMetrics.getAverageDeleteLatency()).toBe(0);
    });
  });
  
  describe('reset functionality', () => {
    it('should reset all metrics to zero', () => {
      // Record some operations
      cacheMetrics.recordHit('domain', 10);
      cacheMetrics.recordMiss('domain', 20);
      cacheMetrics.recordSet(30);
      cacheMetrics.recordDelete(40);
      cacheMetrics.recordError();
      
      // Verify metrics are recorded
      expect(cacheMetrics.getHitRate()).not.toBe(0);
      expect(cacheMetrics.getAverageGetLatency()).not.toBe(0);
      
      // Reset metrics
      cacheMetrics.reset();
      
      // Verify all metrics are reset
      expect(cacheMetrics.getHitRate()).toBe(0);
      expect(cacheMetrics.getAverageGetLatency()).toBe(0);
      expect(cacheMetrics.getAverageSetLatency()).toBe(0);
      expect(cacheMetrics.getAverageDeleteLatency()).toBe(0);
      expect(Object.keys(cacheMetrics.getDomainHitRates()).length).toBe(0);
    });
  });
}); 