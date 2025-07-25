"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MetricTrackingController_1 = require("../controllers/MetricTrackingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const metricController = new MetricTrackingController_1.MetricTrackingController();
router.use(auth_1.authenticate);
router.post('/body', (req, res) => metricController.recordBodyMetric(req, res));
router.get('/body', (req, res) => metricController.getLatestBodyMetrics(req, res));
router.get('/body/history/:bodyArea', (req, res) => metricController.getBodyMetricHistory(req, res));
router.post('/performance', (req, res) => metricController.recordPerformanceMetric(req, res));
router.get('/performance', (req, res) => metricController.getLatestPerformanceMetrics(req, res));
router.get('/performance/exercise/:exerciseId', (req, res) => metricController.getExercisePerformanceMetrics(req, res));
router.get('/performance/workout/:workoutSessionId', (req, res) => metricController.getWorkoutSessionMetrics(req, res));
router.post('/bulk', (req, res) => metricController.recordMultipleMetrics(req, res));
router.get('/history', (req, res) => metricController.getHistoricalMetrics(req, res));
router.post('/baseline/:metricId', (req, res) => metricController.setMetricAsBaseline(req, res));
router.delete('/:type/:metricId', (req, res) => metricController.deleteMetric(req, res));
exports.default = router;
//# sourceMappingURL=metricRoutes.js.map