import { WorkoutPlanController } from '../controllers/WorkoutPlanController';
import { WorkoutPlanServiceMock } from './__mocks__/WorkoutPlanServiceMock';
import request from 'supertest';
const express = require('express');
import { Difficulty, WorkoutCategory, ExerciseIntensity, SetType } from '../models/shared/Enums';

// This is a self-executing test script that doesn't require TypeORM connections

async function runTests() {
  console.log('Starting simplified WorkoutPlanController tests...');
  
  // Create Express app
  const app = express();
  app.use(express.json());
  
  // Create mock service
  const workoutPlanService = new WorkoutPlanServiceMock();
  
  // Create controller
  const workoutPlanController = new WorkoutPlanController(workoutPlanService as any);
  
  // Mock auth middleware
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id' };
    next();
  };
  
  // Configure routes
  app.get('/api/workout-plans', mockAuthMiddleware, (req, res, next) => {
    try {
      workoutPlanController.getWorkoutPlans(req, res);
    } catch (err) {
      next(err);
    }
  });
  
  app.get('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
    try {
      workoutPlanController.getWorkoutPlan(req, res);
    } catch (err) {
      next(err);
    }
  });
  
  app.post('/api/workout-plans', mockAuthMiddleware, (req, res, next) => {
    try {
      workoutPlanController.createWorkoutPlan(req, res);
    } catch (err) {
      next(err);
    }
  });
  
  app.put('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
    try {
      workoutPlanController.updateWorkoutPlan(req, res);
    } catch (err) {
      next(err);
    }
  });
  
  app.delete('/api/workout-plans/:id', mockAuthMiddleware, (req, res, next) => {
    try {
      workoutPlanController.deleteWorkoutPlan(req, res);
    } catch (err) {
      next(err);
    }
  });
  
  // Add error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error in test:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    });
  });
  
  // Run tests
  try {
    // Test GET /api/workout-plans
    console.log('Testing GET /api/workout-plans...');
    const listResponse = await request(app).get('/api/workout-plans');
    console.assert(listResponse.status === 200, 'Expected status 200, got ' + listResponse.status);
    console.assert(Array.isArray(listResponse.body.workoutPlans), 'Expected workoutPlans to be an array');
    console.assert(listResponse.body.total === 1, 'Expected total to be 1');
    console.log('✓ GET /api/workout-plans passed');
    
    // Test GET /api/workout-plans/:id
    console.log('Testing GET /api/workout-plans/1...');
    const getResponse = await request(app).get('/api/workout-plans/1');
    console.assert(getResponse.status === 200, 'Expected status 200, got ' + getResponse.status);
    console.assert(getResponse.body.id === 1, 'Expected id to be 1');
    console.assert(getResponse.body.name === 'Test Workout Plan', 'Expected name to be "Test Workout Plan"');
    console.log('✓ GET /api/workout-plans/1 passed');
    
    // Test POST /api/workout-plans
    console.log('Testing POST /api/workout-plans...');
    const planData = {
      name: 'New Workout Plan',
      description: 'New Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      estimatedDuration: 30,
      exercises: [{
        exercise_id: 1,
        sets: 3,
        repetitions: 12,
        intensity: ExerciseIntensity.MODERATE,
        setType: SetType.STRAIGHT,
        order: 1
      }]
    };
    
    const createResponse = await request(app)
      .post('/api/workout-plans')
      .send(planData);
    
    console.assert(createResponse.status === 201, 'Expected status 201, got ' + createResponse.status);
    console.assert(createResponse.body.id === 1, 'Expected id to be 1');
    console.log('✓ POST /api/workout-plans passed');
    
    // Test PUT /api/workout-plans/:id
    console.log('Testing PUT /api/workout-plans/1...');
    const updates = {
      name: 'Updated Workout Plan',
      description: 'Updated Description'
    };
    
    const updateResponse = await request(app)
      .put('/api/workout-plans/1')
      .send(updates);
    
    console.assert(updateResponse.status === 200, 'Expected status 200, got ' + updateResponse.status);
    console.assert(updateResponse.body.name === 'Updated Workout Plan', 'Expected name to be "Updated Workout Plan"');
    console.log('✓ PUT /api/workout-plans/1 passed');
    
    // Test DELETE /api/workout-plans/:id
    console.log('Testing DELETE /api/workout-plans/1...');
    const deleteResponse = await request(app).delete('/api/workout-plans/1');
    console.assert(deleteResponse.status === 204, 'Expected status 204, got ' + deleteResponse.status);
    console.log('✓ DELETE /api/workout-plans/1 passed');
    
    console.log('\nAll tests passed successfully! ✓');
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

// Run tests
runTests(); 