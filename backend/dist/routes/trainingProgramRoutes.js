"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TrainingProgramService_1 = require("../services/TrainingProgramService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const trainingProgramService = new TrainingProgramService_1.TrainingProgramService();
router.get('/', async (req, res) => {
    try {
        const programs = await trainingProgramService.getAllPrograms();
        res.json(programs);
    }
    catch (error) {
        logger_1.default.error('Error fetching training programs:', error);
        res.status(500).json({ message: 'Error fetching training programs' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const program = await trainingProgramService.getProgramById(parseInt(req.params.id));
        res.json(program);
    }
    catch (error) {
        logger_1.default.error(`Error fetching training program ${req.params.id}:`, error);
        res.status(404).json({ message: 'Training program not found' });
    }
});
router.get('/:id/workouts', async (req, res) => {
    try {
        const workouts = await trainingProgramService.getProgramWorkouts(parseInt(req.params.id));
        res.json(workouts);
    }
    catch (error) {
        logger_1.default.error(`Error fetching workouts for program ${req.params.id}:`, error);
        res.status(404).json({ message: 'Workout schedule not found' });
    }
});
router.post('/', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const newProgram = await trainingProgramService.createProgram(req.body);
        res.status(201).json(newProgram);
    }
    catch (error) {
        logger_1.default.error('Error creating training program:', error);
        res.status(400).json({ message: 'Error creating training program' });
    }
});
router.post('/:id/workouts', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const workout = await trainingProgramService.addWorkoutToProgram(parseInt(req.params.id), req.body);
        res.status(201).json(workout);
    }
    catch (error) {
        logger_1.default.error(`Error adding workout to program ${req.params.id}:`, error);
        res.status(400).json({ message: 'Error adding workout to program' });
    }
});
router.put('/:id', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const updatedProgram = await trainingProgramService.updateProgram(parseInt(req.params.id), req.body);
        res.json(updatedProgram);
    }
    catch (error) {
        logger_1.default.error(`Error updating training program ${req.params.id}:`, error);
        res.status(404).json({ message: 'Training program not found' });
    }
});
router.put('/:id/workouts/:week/:day', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const updatedWorkout = await trainingProgramService.updateProgramWorkout(parseInt(req.params.id), parseInt(req.params.week), req.params.day, req.body);
        res.json(updatedWorkout);
    }
    catch (error) {
        logger_1.default.error(`Error updating workout in program ${req.params.id}:`, error);
        res.status(404).json({ message: 'Workout not found in program' });
    }
});
router.delete('/:id', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        await trainingProgramService.deleteProgram(parseInt(req.params.id));
        res.status(204).end();
    }
    catch (error) {
        logger_1.default.error(`Error deleting training program ${req.params.id}:`, error);
        res.status(404).json({ message: 'Training program not found' });
    }
});
router.post('/:id/enroll', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const programId = parseInt(req.params.id);
        const enrollment = await trainingProgramService.enrollUserInProgram(userId, programId);
        res.status(201).json(enrollment);
    }
    catch (error) {
        logger_1.default.error(`Error enrolling in program ${req.params.id}:`, error);
        res.status(400).json({ message: error.message || 'Error enrolling in program' });
    }
});
router.get('/enrollments', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await trainingProgramService.getUserEnrollments(userId);
        res.json(enrollments);
    }
    catch (error) {
        logger_1.default.error(`Error fetching enrollments for user ${req.user.id}:`, error);
        res.status(500).json({ message: 'Error fetching enrollments' });
    }
});
router.put('/enrollments/:id', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const enrollmentId = parseInt(req.params.id);
        const updatedEnrollment = await trainingProgramService.updateEnrollmentProgress(enrollmentId, req.body);
        res.json(updatedEnrollment);
    }
    catch (error) {
        logger_1.default.error(`Error updating enrollment ${req.params.id}:`, error);
        res.status(404).json({ message: 'Enrollment not found' });
    }
});
router.post('/enrollments/:id/complete-workout', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const enrollmentId = parseInt(req.params.id);
        const _a = req.body, { week, day } = _a, completionData = __rest(_a, ["week", "day"]);
        if (!week || !day) {
            return res.status(400).json({ message: 'Week and day are required' });
        }
        const updatedEnrollment = await trainingProgramService.completeWorkout(enrollmentId, week, day, completionData);
        res.json(updatedEnrollment);
    }
    catch (error) {
        logger_1.default.error(`Error completing workout for enrollment ${req.params.id}:`, error);
        res.status(404).json({ message: 'Enrollment not found' });
    }
});
router.post('/enrollments/:id/rate', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const enrollmentId = parseInt(req.params.id);
        const { rating, feedback } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Valid rating (1-5) is required' });
        }
        const updatedEnrollment = await trainingProgramService.rateProgram(enrollmentId, rating, feedback);
        res.json(updatedEnrollment);
    }
    catch (error) {
        logger_1.default.error(`Error rating program for enrollment ${req.params.id}:`, error);
        res.status(404).json({ message: 'Enrollment not found' });
    }
});
exports.default = router;
//# sourceMappingURL=trainingProgramRoutes.js.map