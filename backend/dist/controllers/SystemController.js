"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const CacheManager_1 = require("../services/CacheManager");
const cache_metrics_1 = require("../utils/cache-metrics");
const performance_1 = require("../utils/performance");
const logger_1 = __importDefault(require("../utils/logger"));
class SystemController {
    async getCacheMetrics(req, res) {
        try {
            const metrics = CacheManager_1.cacheManager.getMetricsReport();
            const stats = CacheManager_1.cacheManager.getStats();
            return res.status(200).json({
                success: true,
                metrics,
                stats
            });
        }
        catch (error) {
            logger_1.default.error('Error retrieving cache metrics', { error });
            return res.status(500).json({
                success: false,
                message: 'Error retrieving cache metrics'
            });
        }
    }
    async resetCacheMetrics(req, res) {
        try {
            cache_metrics_1.cacheMetrics.reset();
            CacheManager_1.cacheManager.resetStats();
            return res.status(200).json({
                success: true,
                message: 'Cache metrics reset successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error resetting cache metrics', { error });
            return res.status(500).json({
                success: false,
                message: 'Error resetting cache metrics'
            });
        }
    }
    async clearCache(req, res) {
        try {
            await CacheManager_1.cacheManager.clear();
            return res.status(200).json({
                success: true,
                message: 'Cache cleared successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error clearing cache', { error });
            return res.status(500).json({
                success: false,
                message: 'Error clearing cache'
            });
        }
    }
    async setCacheEnabled(req, res) {
        try {
            const { enabled } = req.body;
            if (typeof enabled !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameter: enabled (boolean)'
                });
            }
            CacheManager_1.cacheManager.setEnabled(enabled);
            return res.status(200).json({
                success: true,
                message: `Cache ${enabled ? 'enabled' : 'disabled'} successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Error setting cache enabled state', { error });
            return res.status(500).json({
                success: false,
                message: 'Error setting cache state'
            });
        }
    }
    async deleteCacheByPattern(req, res) {
        try {
            const { pattern } = req.body;
            if (typeof pattern !== 'string' || !pattern) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameter: pattern (string)'
                });
            }
            await CacheManager_1.cacheManager.deleteByPattern(pattern);
            return res.status(200).json({
                success: true,
                message: `Cache entries matching pattern "${pattern}" deleted successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting cache by pattern', { error });
            return res.status(500).json({
                success: false,
                message: 'Error deleting cache entries'
            });
        }
    }
    async listCacheKeys(req, res) {
        try {
            const pattern = req.query.pattern || '*';
            const keys = await CacheManager_1.cacheManager.keys(pattern);
            return res.status(200).json({
                success: true,
                keys
            });
        }
        catch (error) {
            logger_1.default.error('Error listing cache keys', { error });
            return res.status(500).json({
                success: false,
                message: 'Error listing cache keys'
            });
        }
    }
    async getPerformanceReport(req, res) {
        try {
            const report = performance_1.simplePerformance.getBasicReport();
            return res.status(200).json({
                success: true,
                report
            });
        }
        catch (error) {
            logger_1.default.error('Error retrieving performance report', { error });
            return res.status(500).json({
                success: false,
                message: 'Error retrieving performance report'
            });
        }
    }
    async resetPerformanceMetrics(req, res) {
        try {
            performance_1.simplePerformance.reset();
            return res.status(200).json({
                success: true,
                message: 'Performance metrics reset successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error resetting performance metrics', { error });
            return res.status(500).json({
                success: false,
                message: 'Error resetting performance metrics'
            });
        }
    }
}
exports.SystemController = SystemController;
//# sourceMappingURL=SystemController.js.map