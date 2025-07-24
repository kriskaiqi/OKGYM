import { Request, Response } from 'express';
import { cacheManager } from '../services/CacheManager';
import { cacheMetrics } from '../utils/cache-metrics';
import { simplePerformance } from '../utils/performance';
import logger from '../utils/logger';

/**
 * Controller for system administration and monitoring endpoints
 */
export class SystemController {
  /**
   * Get cache metrics and statistics
   * 
   * @param req Request
   * @param res Response
   */
  async getCacheMetrics(req: Request, res: Response): Promise<Response> {
    try {
      const metrics = cacheManager.getMetricsReport();
      const stats = cacheManager.getStats();
      
      return res.status(200).json({
        success: true,
        metrics,
        stats
      });
    } catch (error) {
      logger.error('Error retrieving cache metrics', { error });
      return res.status(500).json({
        success: false,
        message: 'Error retrieving cache metrics'
      });
    }
  }

  /**
   * Reset cache metrics
   * 
   * @param req Request
   * @param res Response
   */
  async resetCacheMetrics(req: Request, res: Response): Promise<Response> {
    try {
      cacheMetrics.reset();
      cacheManager.resetStats();
      
      return res.status(200).json({
        success: true,
        message: 'Cache metrics reset successfully'
      });
    } catch (error) {
      logger.error('Error resetting cache metrics', { error });
      return res.status(500).json({
        success: false,
        message: 'Error resetting cache metrics'
      });
    }
  }

  /**
   * Clear the entire cache
   * 
   * @param req Request
   * @param res Response
   */
  async clearCache(req: Request, res: Response): Promise<Response> {
    try {
      await cacheManager.clear();
      
      return res.status(200).json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      logger.error('Error clearing cache', { error });
      return res.status(500).json({
        success: false,
        message: 'Error clearing cache'
      });
    }
  }

  /**
   * Toggle cache enabled state
   * 
   * @param req Request with body.enabled boolean flag
   * @param res Response
   */
  async setCacheEnabled(req: Request, res: Response): Promise<Response> {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameter: enabled (boolean)'
        });
      }
      
      cacheManager.setEnabled(enabled);
      
      return res.status(200).json({
        success: true,
        message: `Cache ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      logger.error('Error setting cache enabled state', { error });
      return res.status(500).json({
        success: false,
        message: 'Error setting cache state'
      });
    }
  }

  /**
   * Remove specific cache keys by pattern
   * 
   * @param req Request with body.pattern string
   * @param res Response
   */
  async deleteCacheByPattern(req: Request, res: Response): Promise<Response> {
    try {
      const { pattern } = req.body;
      
      if (typeof pattern !== 'string' || !pattern) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameter: pattern (string)'
        });
      }
      
      await cacheManager.deleteByPattern(pattern);
      
      return res.status(200).json({
        success: true,
        message: `Cache entries matching pattern "${pattern}" deleted successfully`
      });
    } catch (error) {
      logger.error('Error deleting cache by pattern', { error });
      return res.status(500).json({
        success: false,
        message: 'Error deleting cache entries'
      });
    }
  }

  /**
   * List cache keys matching a pattern
   * 
   * @param req Request with query.pattern string
   * @param res Response
   */
  async listCacheKeys(req: Request, res: Response): Promise<Response> {
    try {
      const pattern = (req.query.pattern as string) || '*';
      
      const keys = await cacheManager.keys(pattern);
      
      return res.status(200).json({
        success: true,
        keys
      });
    } catch (error) {
      logger.error('Error listing cache keys', { error });
      return res.status(500).json({
        success: false,
        message: 'Error listing cache keys'
      });
    }
  }

  /**
   * Get basic performance report 
   * Shows slow operations and error rates
   * 
   * @param req Request
   * @param res Response
   */
  async getPerformanceReport(req: Request, res: Response): Promise<Response> {
    try {
      const report = simplePerformance.getBasicReport();
      
      return res.status(200).json({
        success: true,
        report
      });
    } catch (error) {
      logger.error('Error retrieving performance report', { error });
      return res.status(500).json({
        success: false,
        message: 'Error retrieving performance report'
      });
    }
  }

  /**
   * Reset performance metrics
   * 
   * @param req Request
   * @param res Response
   */
  async resetPerformanceMetrics(req: Request, res: Response): Promise<Response> {
    try {
      simplePerformance.reset();
      
      return res.status(200).json({
        success: true,
        message: 'Performance metrics reset successfully'
      });
    } catch (error) {
      logger.error('Error resetting performance metrics', { error });
      return res.status(500).json({
        success: false,
        message: 'Error resetting performance metrics'
      });
    }
  }
} 