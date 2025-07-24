"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRoutes = void 0;
const express = require('express');
const SystemController_1 = require("../controllers/SystemController");
const auth_1 = require("../middleware/auth");
const Enums_1 = require("../models/shared/Enums");
const router = express.Router();
exports.systemRoutes = router;
const systemController = new SystemController_1.SystemController();
router.get('/cache/metrics', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.getCacheMetrics);
router.post('/cache/reset-metrics', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.resetCacheMetrics);
router.post('/cache/clear', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.clearCache);
router.post('/cache/enabled', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.setCacheEnabled);
router.delete('/cache/pattern', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.deleteCacheByPattern);
router.get('/cache/keys', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.listCacheKeys);
router.get('/performance', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.getPerformanceReport);
router.post('/performance/reset', auth_1.authenticate, (0, auth_1.authorize)([Enums_1.UserRole.ADMIN]), systemController.resetPerformanceMetrics);
//# sourceMappingURL=system.routes.js.map