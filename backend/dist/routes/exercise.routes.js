"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExerciseService_1 = require("../services/ExerciseService");
const router = (0, express_1.Router)();
const exerciseService = new ExerciseService_1.ExerciseService();
router.get('/', async (req, res) => {
    try {
        const exercises = await exerciseService.getAllExercises();
        res.json(exercises);
    }
    catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const exercise = await exerciseService.getExerciseById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json(exercise);
    }
    catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
});
router.post('/', async (req, res) => {
    try {
        const exercise = await exerciseService.createExercise(req.body);
        res.status(201).json(exercise);
    }
    catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const exercise = await exerciseService.updateExercise(req.params.id, req.body);
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json(exercise);
    }
    catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const success = await exerciseService.deleteExercise(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});
router.post('/analyze', async (req, res) => {
    try {
        res.json({ message: 'Exercise analysis endpoint' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=exercise.routes.js.map