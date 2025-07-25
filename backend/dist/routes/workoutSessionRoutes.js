"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const WorkoutSessionController_1 = require("../controllers/WorkoutSessionController");
const workoutSession_dto_1 = require("../dto/workoutSession.dto");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.StartSessionDto), WorkoutSessionController_1.startSession);
router.get('/', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.GetUserSessionsDto), WorkoutSessionController_1.getUserSessions);
router.get('/active', WorkoutSessionController_1.getActiveSession);
router.get('/:sessionId', WorkoutSessionController_1.getSessionById);
router.get('/:sessionId/exercises', WorkoutSessionController_1.getSessionExercises);
router.get('/:sessionId/summary', WorkoutSessionController_1.getSessionSummary);
router.post('/:sessionId/exercises/:exerciseId/complete', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.RecordExerciseCompletionDto), WorkoutSessionController_1.recordExerciseCompletion);
router.post('/:sessionId/exercises/:exerciseId/skip', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.SkipExerciseDto), WorkoutSessionController_1.skipExercise);
router.post('/:sessionId/exercise-results', WorkoutSessionController_1.saveSessionExerciseResults);
router.post('/:sessionId/pause', WorkoutSessionController_1.pauseSession);
router.post('/:sessionId/resume', WorkoutSessionController_1.resumeSession);
router.post('/:sessionId/complete', WorkoutSessionController_1.completeSession);
router.post('/:sessionId/cancel', WorkoutSessionController_1.cancelSession);
router.patch('/:sessionId/status', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.UpdateSessionStatusDto), WorkoutSessionController_1.updateSessionStatus);
router.post('/:sessionId/feedback', (0, validateRequest_1.validateRequest)(workoutSession_dto_1.SubmitSessionFeedbackDto), WorkoutSessionController_1.submitSessionFeedback);
exports.default = router;
//# sourceMappingURL=workoutSessionRoutes.js.map