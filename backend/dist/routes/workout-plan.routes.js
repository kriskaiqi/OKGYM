"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const router = (0, express_1.Router)();
const workoutPlanService = new WorkoutPlanService_1.WorkoutPlanService();
router.get('/', async (req, res) => {
    try {
        const plans = await workoutPlanService.getAllWorkoutPlans();
        res.json(plans);
    }
    catch (error) {
        console.error('Error fetching workout plans:', error);
        res.status(500).json({ error: 'Failed to fetch workout plans' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const plan = await workoutPlanService.getWorkoutPlanById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        res.json(plan);
    }
    catch (error) {
        console.error('Error fetching workout plan:', error);
        res.status(500).json({ error: 'Failed to fetch workout plan' });
    }
});
router.post('/', async (req, res) => {
    try {
        const plan = await workoutPlanService.createWorkoutPlan(req.body);
        res.status(201).json(plan);
    }
    catch (error) {
        console.error('Error creating workout plan:', error);
        res.status(500).json({ error: 'Failed to create workout plan' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const plan = await workoutPlanService.updateWorkoutPlan(req.params.id, req.body);
        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        res.json(plan);
    }
    catch (error) {
        console.error('Error updating workout plan:', error);
        res.status(500).json({ error: 'Failed to update workout plan' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const success = await workoutPlanService.deleteWorkoutPlan(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting workout plan:', error);
        res.status(500).json({ error: 'Failed to delete workout plan' });
    }
});
exports.default = router;
//# sourceMappingURL=workout-plan.routes.js.map