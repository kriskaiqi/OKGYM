import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { SystemController } from '../../controllers/SystemController';
import { cacheManager } from '../../services/CacheManager';

// Mock dependencies
jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    getStats: jest.fn(),
    clear: jest.fn(),
    deleteByPattern: jest.fn(),
    setEnabled: jest.fn(),
    keys: jest.fn(),
    getMetricsReport: jest.fn(),
    resetStats: jest.fn()
  }
}));
jest.mock('../../utils/cache-metrics', () => {
  const mockReset = jest.fn();
  return {
    __esModule: true,
    CacheMetrics: {
      getInstance: jest.fn().mockReturnValue({
        reset: mockReset,
        getHitRate: jest.fn().mockReturnValue(75),
        getDomainHitRates: jest.fn().mockReturnValue({ user: 80, post: 60 }),
        getAverageGetLatency: jest.fn().mockReturnValue(15),
        getAverageSetLatency: jest.fn().mockReturnValue(20),
        getAverageDeleteLatency: jest.fn().mockReturnValue(10)
      })
    },
    cacheMetrics: {
      reset: mockReset,
      getHitRate: jest.fn().mockReturnValue(75),
      getDomainHitRates: jest.fn().mockReturnValue({ user: 80, post: 60 }),
      getAverageGetLatency: jest.fn().mockReturnValue(15),
      getAverageSetLatency: jest.fn().mockReturnValue(20),
      getAverageDeleteLatency: jest.fn().mockReturnValue(10)
    }
  };
});
jest.mock('../../utils/performance', () => ({
  simplePerformance: {
    getBasicReport: jest.fn().mockReturnValue({
      slowOperations: [],
      errorRates: {},
      averageResponseTimes: {}
    }),
    reset: jest.fn()
  }
}));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('SystemController', () => {
  let systemController: SystemController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock request and response objects
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();
    
    mockRequest = {
      body: {},
      query: {}
    };
    
    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any
    };
    
    // Mock CacheManager implementation
    (cacheManager.getStats as jest.Mock).mockReturnValue({
      size: 10,
      hits: 75,
      misses: 25
    });
    
    // Create a mock reset function
    const mockReset = jest.fn();
    
    // Set up mock implementations
    (cacheManager.clear as jest.Mock<any>).mockResolvedValue(undefined);
    (cacheManager.setEnabled as jest.Mock<any>).mockImplementation(() => {});
    (cacheManager.deleteByPattern as jest.Mock<any>).mockResolvedValue(5);
    (cacheManager.keys as jest.Mock<any>).mockResolvedValue(['user:1', 'user:2', 'post:1']);
    (cacheManager.resetStats as jest.Mock<any>).mockImplementation(() => {});
    (cacheManager.getMetricsReport as jest.Mock<any>).mockReturnValue({
      enabled: true,
      hitRate: '75%',
      domainHitRates: { user: 80, post: 60 },
      avgLatency: {
        get: '15ms',
        set: '20ms',
        delete: '10ms'
      }
    });
    
    // Create controller instance
    systemController = new SystemController();
  });
  
  describe('getCacheMetrics', () => {
    it('should return cache metrics and stats with 200 status', async () => {
      await systemController.getCacheMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
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
    
    it('should return 500 status on error', async () => {
      // Mock error scenario
      (cacheManager.getMetricsReport as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await systemController.getCacheMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error retrieving cache metrics')
      });
    });
  });
  
  describe('resetCacheMetrics', () => {
    it('should reset cache metrics and return 200 status', async () => {
      // Import the mocked cacheMetrics
      const { cacheMetrics } = require('../../utils/cache-metrics');
      
      await systemController.resetCacheMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(cacheMetrics.reset).toHaveBeenCalled();
      expect(cacheManager.resetStats).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('Cache metrics reset')
      });
    });
    
    it('should reset 500 status on error', async () => {
      // Mock error scenario
      const { cacheMetrics } = require('../../utils/cache-metrics');
      (cacheMetrics.reset as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await systemController.resetCacheMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error resetting cache metrics')
      });
    });
  });
  
  describe('clearCache', () => {
    it('should clear cache and return 200 status', async () => {
      await systemController.clearCache(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.clear).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('Cache cleared')
      });
    });
    
    it('should return 500 status on error', async () => {
      // Mock error scenario
      (cacheManager.clear as jest.Mock<any>).mockRejectedValue(new Error('Test error'));
      
      await systemController.clearCache(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error clearing cache')
      });
    });
  });
  
  describe('setCacheEnabled', () => {
    it('should enable cache when enabled is true', async () => {
      mockRequest.body = { enabled: true };
      
      await systemController.setCacheEnabled(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.setEnabled).toHaveBeenCalledWith(true);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('Cache enabled')
      });
    });
    
    it('should disable cache when enabled is false', async () => {
      mockRequest.body = { enabled: false };
      
      await systemController.setCacheEnabled(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.setEnabled).toHaveBeenCalledWith(false);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('Cache disabled')
      });
    });
    
    it('should return 400 status when enabled parameter is missing', async () => {
      mockRequest.body = {};
      
      await systemController.setCacheEnabled(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Missing required parameter')
      });
    });
    
    it('should return 500 status on error', async () => {
      mockRequest.body = { enabled: true };
      
      // Mock error scenario
      (cacheManager.setEnabled as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await systemController.setCacheEnabled(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error setting cache state')
      });
    });
  });
  
  describe('deleteCacheByPattern', () => {
    it('should delete cache entries by pattern and return 200 status', async () => {
      mockRequest.body = { pattern: 'user:*' };
      
      await systemController.deleteCacheByPattern(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('user:*');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('Cache entries matching pattern')
      });
    });
    
    it('should return 400 status when pattern parameter is missing', async () => {
      mockRequest.body = {};
      
      await systemController.deleteCacheByPattern(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Missing required parameter')
      });
    });
    
    it('should return 500 status on error', async () => {
      mockRequest.body = { pattern: 'user:*' };
      
      // Mock error scenario
      (cacheManager.deleteByPattern as jest.Mock<any>).mockRejectedValue(new Error('Test error'));
      
      await systemController.deleteCacheByPattern(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error deleting cache entries')
      });
    });
  });
  
  describe('listCacheKeys', () => {
    it('should list cache keys matching pattern and return 200 status', async () => {
      mockRequest.query = { pattern: 'user:*' };
      
      await systemController.listCacheKeys(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.keys).toHaveBeenCalledWith('user:*');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        keys: ['user:1', 'user:2', 'post:1']
      });
    });
    
    it('should use default pattern when not provided', async () => {
      mockRequest.query = {};
      
      await systemController.listCacheKeys(mockRequest as Request, mockResponse as Response);
      
      expect(cacheManager.keys).toHaveBeenCalledWith('*');
      expect(statusMock).toHaveBeenCalledWith(200);
    });
    
    it('should return 500 status on error', async () => {
      mockRequest.query = { pattern: 'user:*' };
      
      // Mock error scenario
      (cacheManager.keys as jest.Mock<any>).mockRejectedValue(new Error('Test error'));
      
      await systemController.listCacheKeys(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error listing cache keys')
      });
    });
  });
}); 