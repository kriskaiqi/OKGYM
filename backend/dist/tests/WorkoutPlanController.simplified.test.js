"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express = require('express');
const WorkoutPlanController_1 = require("../controllers/WorkoutPlanController");
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const WorkoutPlanRepository_1 = require("../repositories/WorkoutPlanRepository");
const WorkoutExerciseRepository_1 = require("../repositories/WorkoutExerciseRepository");
const ExerciseRepository_1 = require("../repositories/ExerciseRepository");
const Enums_1 = require("../models/shared/Enums");
jest.mock('../services/WorkoutPlanService');
jest.mock('../repositories/WorkoutPlanRepository');
jest.mock('../repositories/WorkoutExerciseRepository');
jest.mock('../repositories/ExerciseRepository');
describe('WorkoutPlanController Unit Tests', () => {
    let app;
    let workoutPlanService;
    let workoutPlanController;
    const mockAuthMiddleware = (req, res, next) => {
        req.user = { id: 'test-user-id' };
        next();
    };
    const errorHandler = (err, req, res, next) => {
        res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        });
    };
    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        workoutPlanService = new WorkoutPlanService_1.WorkoutPlanService(new WorkoutPlanRepository_1.WorkoutPlanRepository(), new WorkoutExerciseRepository_1.WorkoutExerciseRepository(), new ExerciseRepository_1.ExerciseRepository());
        workoutPlanService.getWorkoutPlans = jest.fn().mockResolvedValue({
            workoutPlans: [
                {
                    id: 1,
                    name: 'Test Workout Plan',
                    description: 'Test Description',
                    difficulty: Enums_1.Difficulty.BEGINNER,
                    workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
                    exercises: []
                }
            ],
            total: 1
        });
        workoutPlanService.getWorkoutPlanById = jest.fn().mockResolvedValue({
            id: 1,
            name: 'Test Workout Plan',
            description: 'Test Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        workoutPlanService.createWorkoutPlan = jest.fn().mockResolvedValue({
            id: 1,
            name: 'New Workout Plan',
            description: 'New Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        workoutPlanService.updateWorkoutPlan = jest.fn().mockResolvedValue({
            id: 1,
            name: 'Updated Workout Plan',
            description: 'Updated Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        workoutPlanService.deleteWorkoutPlan = jest.fn().mockResolvedValue(true);
        workoutPlanController = new WorkoutPlanController_1.WorkoutPlanController(workoutPlanService);
        app.get('/api/workout-plans', mockAuthMiddleware, workoutPlanController.getWorkoutPlans.bind(workoutPlanController));
        app.get('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.getWorkoutPlan.bind(workoutPlanController));
        app.post('/api/workout-plans', mockAuthMiddleware, workoutPlanController.createWorkoutPlan.bind(workoutPlanController));
        app.put('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.updateWorkoutPlan.bind(workoutPlanController));
        app.delete('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.deleteWorkoutPlan.bind(workoutPlanController));
        app.use(errorHandler);
    });
    describe('GET /api/workout-plans', () => {
        it('should return a list of workout plans', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/workout-plans');
            expect(response.status).toBe(200);
            expect(response.body.workoutPlans).toBeDefined();
            expect(Array.isArray(response.body.workoutPlans)).toBe(true);
            expect(response.body.total).toBeDefined();
            expect(workoutPlanService.getWorkoutPlans).toHaveBeenCalled();
        });
    });
    describe('GET /api/workout-plans/:id', () => {
        it('should return a specific workout plan', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/workout-plans/1');
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(1);
            expect(response.body.name).toBe('Test Workout Plan');
            expect(workoutPlanService.getWorkoutPlanById).toHaveBeenCalledWith(1, 'test-user-id');
        });
    });
    describe('POST /api/workout-plans', () => {
        it('should create a new workout plan', async () => {
            const planData = {
                name: 'New Workout Plan',
                description: 'New Description',
                difficulty: Enums_1.Difficulty.BEGINNER,
                workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
                estimatedDuration: 30,
                exercises: [{
                        exercise_id: 1,
                        sets: 3,
                        repetitions: 12,
                        intensity: Enums_1.ExerciseIntensity.MODERATE,
                        setType: Enums_1.SetType.STRAIGHT,
                        order: 1
                    }]
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/workout-plans')
                .send(planData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(workoutPlanService.createWorkoutPlan).toHaveBeenCalledWith(expect.objectContaining(planData), 'test-user-id');
        });
    });
    describe('PUT /api/workout-plans/:id', () => {
        it('should update an existing workout plan', async () => {
            const updates = {
                name: 'Updated Workout Plan',
                description: 'Updated Description'
            };
            const response = await (0, supertest_1.default)(app)
                .put('/api/workout-plans/1')
                .send(updates);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Workout Plan');
            expect(workoutPlanService.updateWorkoutPlan).toHaveBeenCalledWith(1, expect.objectContaining(updates), 'test-user-id');
        });
    });
    describe('DELETE /api/workout-plans/:id', () => {
        it('should delete a workout plan', async () => {
            workoutPlanService.deleteWorkoutPlan.mockResolvedValue(true);
            const response = await (0, supertest_1.default)(app).delete('/api/workout-plans/1');
            expect(response.status).toBe(200);
            expect(workoutPlanService.deleteWorkoutPlan).toHaveBeenCalledWith(1, 'test-user-id');
        });
    });
});
//# sourceMappingURL=WorkoutPlanController.simplified.test.js.map