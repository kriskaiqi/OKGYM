// @ts-ignore to avoid TypeScript issues
const express = require('express');
import { SystemController } from '../controllers/SystemController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/shared/Enums';

const router = express.Router();
const systemController = new SystemController();

/**
 * Cache management and monitoring routes
 * These routes are admin-only as they can impact system performance
 */

// GET /api/system/cache/metrics - Get cache metrics and statistics
router.get('/cache/metrics', authenticate, authorize([UserRole.ADMIN]), systemController.getCacheMetrics);

// POST /api/system/cache/reset-metrics - Reset cache metrics counters
router.post('/cache/reset-metrics', authenticate, authorize([UserRole.ADMIN]), systemController.resetCacheMetrics);

// POST /api/system/cache/clear - Clear the entire cache
router.post('/cache/clear', authenticate, authorize([UserRole.ADMIN]), systemController.clearCache);

// POST /api/system/cache/enabled - Enable or disable the cache
router.post('/cache/enabled', authenticate, authorize([UserRole.ADMIN]), systemController.setCacheEnabled);

// DELETE /api/system/cache/pattern - Delete cache entries by pattern
router.delete('/cache/pattern', authenticate, authorize([UserRole.ADMIN]), systemController.deleteCacheByPattern);

// GET /api/system/cache/keys - List cache keys matching a pattern
router.get('/cache/keys', authenticate, authorize([UserRole.ADMIN]), systemController.listCacheKeys);

/**
 * Performance monitoring routes
 * Basic performance monitoring focused on identifying problems
 */

// GET /api/system/performance - Get basic performance report
router.get('/performance', authenticate, authorize([UserRole.ADMIN]), systemController.getPerformanceReport);

// POST /api/system/performance/reset - Reset performance metrics
router.post('/performance/reset', authenticate, authorize([UserRole.ADMIN]), systemController.resetPerformanceMetrics);

export { router as systemRoutes }; 