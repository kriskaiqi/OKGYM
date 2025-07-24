"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkoutSessionService_1 = require("../services/WorkoutSessionService");
const router = (0, express_1.Router)();
const sessionService = new WorkoutSessionService_1.WorkoutSessionService();
router.post("/start/:workoutPlanId", async (req, res) => {
    try {
        console.log(`Received request to start workout with plan ID: ${req.params.workoutPlanId}`);
        const workoutPlanId = parseInt(req.params.workoutPlanId);
        if (isNaN(workoutPlanId)) {
            console.error(`Invalid workout plan ID: ${req.params.workoutPlanId}`);
            return res.status(400).json({ error: 'Invalid workout plan ID' });
        }
        console.log(`Starting workout session with plan ID: ${workoutPlanId}`);
        const userId = 1;
        const session = await sessionService.startSession(userId, workoutPlanId);
        console.log(`Successfully started session:`, session);
        return res.json(session);
    }
    catch (error) {
        console.error('Error starting workout session:', error);
        return res.status(500).json({
            error: 'Failed to start workout session',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post("/:sessionId/exercise/:exerciseId", async (req, res) => {
    try {
        const { sessionId, exerciseId } = req.params;
        console.log(`Updating exercise result for session ${sessionId}, exercise ${exerciseId}`, req.body);
        const session = await sessionService.updateExerciseResult(sessionId, exerciseId, req.body);
        return res.json(session);
    }
    catch (error) {
        console.error('Error updating exercise result:', error);
        return res.status(500).json({ error: error.message });
    }
});
router.post("/:sessionId/end", async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`Ending session ${sessionId}`);
        const session = await sessionService.endSession(sessionId);
        return res.json(session);
    }
    catch (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({ error: error.message });
    }
});
router.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`Getting session ${sessionId}`);
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        return res.json(session);
    }
    catch (error) {
        console.error('Error getting session:', error);
        return res.status(500).json({ error: 'Failed to get session' });
    }
});
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const userId = 1;
        const sessions = await sessionService.getRecentSessions(userId, limit);
        return res.json(sessions);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=workout-session.routes.js.map