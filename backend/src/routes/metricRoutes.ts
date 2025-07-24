import { Router } from 'express';
import { MetricTrackingController } from '../controllers/MetricTrackingController';
import { authenticate } from '../middleware/auth';

const router = Router();
const metricController = new MetricTrackingController();

// Apply authentication to all routes
router.use(authenticate);

// Body metric routes
router.post('/body', (req, res) => metricController.recordBodyMetric(req, res));
router.get('/body', (req, res) => metricController.getLatestBodyMetrics(req, res));
router.get('/body/history/:bodyArea', (req, res) => metricController.getBodyMetricHistory(req, res));

// Performance metric routes
router.post('/performance', (req, res) => metricController.recordPerformanceMetric(req, res));
router.get('/performance', (req, res) => metricController.getLatestPerformanceMetrics(req, res));
router.get('/performance/exercise/:exerciseId', (req, res) => metricController.getExercisePerformanceMetrics(req, res));
router.get('/performance/workout/:workoutSessionId', (req, res) => metricController.getWorkoutSessionMetrics(req, res));

// Bulk operations
router.post('/bulk', (req, res) => metricController.recordMultipleMetrics(req, res));

// Historical data with filtering
router.get('/history', (req, res) => metricController.getHistoricalMetrics(req, res));

// Baseline management
router.post('/baseline/:metricId', (req, res) => metricController.setMetricAsBaseline(req, res));

// Deletion
router.delete('/:type/:metricId', (req, res) => metricController.deleteMetric(req, res));

export default router; 