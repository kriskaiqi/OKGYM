"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutRoutes = void 0;
const express_1 = require("express");
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const validation_middleware_1 = require("../middleware/validation.middleware");
const workout_dto_1 = require("../dtos/workout.dto");
exports.workoutRoutes = (0, express_1.Router)();
const workoutPlanService = new WorkoutPlanService_1.WorkoutPlanService();
exports.workoutRoutes.get('/', async (_, res) => {
    try {
        const plans = await workoutPlanService.getAllWorkoutPlans();
        return res.json(plans);
    }
    catch (error) {
        console.error('Error fetching workout plans:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.workoutRoutes.get('/:id', async (req, res) => {
    try {
        const plan = await workoutPlanService.getWorkoutPlanById(parseInt(req.params.id));
        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        return res.json(plan);
    }
    catch (error) {
        console.error('Error fetching workout plan:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.workoutRoutes.post('/', (0, validation_middleware_1.validateDto)(workout_dto_1.CreateWorkoutPlanDto), async (req, res) => {
    try {
        const plan = await workoutPlanService.createWorkoutPlan(req.body);
        return res.status(201).json(plan);
    }
    catch (error) {
        console.error('Error creating workout plan:', error);
        if (error instanceof Error && error.message.includes('Exercise with ID')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.workoutRoutes.put('/:id', (0, validation_middleware_1.validateDto)(workout_dto_1.UpdateWorkoutPlanDto), async (req, res) => {
    try {
        const plan = await workoutPlanService.updateWorkoutPlan(parseInt(req.params.id), req.body);
        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        return res.json(plan);
    }
    catch (error) {
        console.error('Error updating workout plan:', error);
        if (error instanceof Error && error.message.includes('Exercise with ID')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.workoutRoutes.delete('/:id', async (req, res) => {
    try {
        const deleted = await workoutPlanService.deleteWorkoutPlan(parseInt(req.params.id));
        if (!deleted) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting workout plan:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=workout.routes.js.map