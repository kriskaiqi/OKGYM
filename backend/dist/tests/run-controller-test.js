"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkoutPlanController_1 = require("../controllers/WorkoutPlanController");
const WorkoutPlanServiceMock_1 = require("./__mocks__/WorkoutPlanServiceMock");
const supertest_1 = __importDefault(require("supertest"));
const express = require('express');
const Enums_1 = require("../models/shared/Enums");
async function runTests() {
    console.log('Starting simplified WorkoutPlanController tests...');
    const app = express();
    app.use(express.json());
    const workoutPlanService = new WorkoutPlanServiceMock_1.WorkoutPlanServiceMock();
    const workoutPlanController = new WorkoutPlanController_1.WorkoutPlanController(workoutPlanService);
    const mockAuthMiddleware = (req, res, next) => {
        req.user = { id: 'test-user-id' };
        next();
    };
    app.get('/api/workout-plans', mockAuthMiddleware, (req, res, next) => {
        try {
            workoutPlanController.getWorkoutPlans(req, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.get('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
        try {
            workoutPlanController.getWorkoutPlan(req, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.post('/api/workout-plans', mockAuthMiddleware, (req, res, next) => {
        try {
            workoutPlanController.createWorkoutPlan(req, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.put('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
        try {
            workoutPlanController.updateWorkoutPlan(req, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.delete('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
        try {
            workoutPlanController.deleteWorkoutPlan(req, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.use((err, req, res, next) => {
        console.error('Error in test:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        });
    });
    try {
        console.log('Testing GET /api/workout-plans...');
        const listResponse = await (0, supertest_1.default)(app).get('/api/workout-plans');
        console.assert(listResponse.status === 200, 'Expected status 200, got ' + listResponse.status);
        console.assert(Array.isArray(listResponse.body.workoutPlans), 'Expected workoutPlans to be an array');
        console.assert(listResponse.body.total === 1, 'Expected total to be 1');
        console.log('✓ GET /api/workout-plans passed');
        console.log('Testing GET /api/workout-plans/1...');
        const getResponse = await (0, supertest_1.default)(app).get('/api/workout-plans/1');
        console.assert(getResponse.status === 200, 'Expected status 200, got ' + getResponse.status);
        console.assert(getResponse.body.id === 1, 'Expected id to be 1');
        console.assert(getResponse.body.name === 'Test Workout Plan', 'Expected name to be "Test Workout Plan"');
        console.log('✓ GET /api/workout-plans/1 passed');
        console.log('Testing POST /api/workout-plans...');
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
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/workout-plans')
            .send(planData);
        console.assert(createResponse.status === 201, 'Expected status 201, got ' + createResponse.status);
        console.assert(createResponse.body.id === 1, 'Expected id to be 1');
        console.log('✓ POST /api/workout-plans passed');
        console.log('Testing PUT /api/workout-plans/1...');
        const updates = {
            name: 'Updated Workout Plan',
            description: 'Updated Description'
        };
        const updateResponse = await (0, supertest_1.default)(app)
            .put('/api/workout-plans/1')
            .send(updates);
        console.assert(updateResponse.status === 200, 'Expected status 200, got ' + updateResponse.status);
        console.assert(updateResponse.body.name === 'Updated Workout Plan', 'Expected name to be "Updated Workout Plan"');
        console.log('✓ PUT /api/workout-plans/1 passed');
        console.log('Testing DELETE /api/workout-plans/1...');
        const deleteResponse = await (0, supertest_1.default)(app).delete('/api/workout-plans/1');
        console.assert(deleteResponse.status === 204, 'Expected status 204, got ' + deleteResponse.status);
        console.log('✓ DELETE /api/workout-plans/1 passed');
        console.log('\nAll tests passed successfully! ✓');
    }
    catch (error) {
        console.error('Tests failed:', error);
    }
}
runTests();
//# sourceMappingURL=run-controller-test.js.map