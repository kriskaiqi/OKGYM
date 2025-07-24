import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  startSession,
  getUserSessions,
  getSessionById,
  getSessionExercises,
  getSessionSummary,
  recordExerciseCompletion,
  skipExercise,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
  getActiveSession,
  updateSessionStatus,
  submitSessionFeedback,
  saveSessionExerciseResults,
  updateSessionUserFeedback
} from '../controllers/WorkoutSessionController';
import {
  StartSessionDto,
  GetUserSessionsDto,
  RecordExerciseCompletionDto,
  SkipExerciseDto,
  UpdateSessionStatusDto,
  SubmitSessionFeedbackDto
} from '../dto/workoutSession.dto';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Session management routes
router.post('/', validateRequest(StartSessionDto), startSession);
router.get('/', validateRequest(GetUserSessionsDto), getUserSessions);
router.get('/active', getActiveSession);
router.get('/:sessionId', getSessionById);
router.get('/:sessionId/exercises', getSessionExercises);
router.get('/:sessionId/summary', getSessionSummary);

// Exercise completion routes
router.post('/:sessionId/exercises/:exerciseId/complete', validateRequest(RecordExerciseCompletionDto), recordExerciseCompletion);
router.post('/:sessionId/exercises/:exerciseId/skip', validateRequest(SkipExerciseDto), skipExercise);
router.post('/:sessionId/exercise-results', saveSessionExerciseResults);

// Session status management routes
router.post('/:sessionId/pause', pauseSession);
router.post('/:sessionId/resume', resumeSession);
router.post('/:sessionId/complete', completeSession);
router.post('/:sessionId/cancel', cancelSession);
router.patch('/:sessionId/status', validateRequest(UpdateSessionStatusDto), updateSessionStatus);

// Session feedback
router.post('/:sessionId/feedback', validateRequest(SubmitSessionFeedbackDto), submitSessionFeedback);
router.post('/:sessionId/user-feedback', updateSessionUserFeedback);

export default router; 