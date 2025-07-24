// Import directly from node_modules to avoid path issues
import request from 'supertest';
const express = require('express');
import { WorkoutPlanController } from '../controllers/WorkoutPlanController';
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { Difficulty, WorkoutCategory, ExerciseIntensity, SetType } from '../models/shared/Enums';

// Mock repositories and services
jest.mock('../services/WorkoutPlanService');
jest.mock('../repositories/WorkoutPlanRepository');
jest.mock('../repositories/WorkoutExerciseRepository');
jest.mock('../repositories/ExerciseRepository');

describe('WorkoutPlanController Unit Tests', () => {
  let app: any;
  let workoutPlanService: jest.Mocked<WorkoutPlanService>;
  let workoutPlanController: WorkoutPlanController;
  
  // Mock auth middleware
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id' };
    next();
  };

  // Mock error handler middleware
  const errorHandler = (err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    });
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create an Express app
    app = express();
    app.use(express.json());
    
    // Setup mocked service with typed mock
    workoutPlanService = new WorkoutPlanService(
      new WorkoutPlanRepository(),
      new WorkoutExerciseRepository(),
      new ExerciseRepository()
    ) as jest.Mocked<WorkoutPlanService>;
    
    // Mock service methods
    workoutPlanService.getWorkoutPlans = jest.fn().mockResolvedValue({
      workoutPlans: [
        {
          id: 1,
          name: 'Test Workout Plan',
          description: 'Test Description',
          difficulty: Difficulty.BEGINNER,
          workoutCategory: WorkoutCategory.FULL_BODY,
          exercises: []
        } as any
      ],
      total: 1
    });
    
    workoutPlanService.getWorkoutPlanById = jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Workout Plan',
      description: 'Test Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      exercises: []
    } as any);
    
    workoutPlanService.createWorkoutPlan = jest.fn().mockResolvedValue({
      id: 1,
      name: 'New Workout Plan',
      description: 'New Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      exercises: []
    } as any);
    
    workoutPlanService.updateWorkoutPlan = jest.fn().mockResolvedValue({
      id: 1,
      name: 'Updated Workout Plan',
      description: 'Updated Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      exercises: []
    } as any);
    
    workoutPlanService.deleteWorkoutPlan = jest.fn().mockResolvedValue(true);
    
    // Create controller with mocked service
    workoutPlanController = new WorkoutPlanController(workoutPlanService);
    
    // Set up routes
    app.get('/api/workout-plans', mockAuthMiddleware, workoutPlanController.getWorkoutPlans.bind(workoutPlanController));
    app.get('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.getWorkoutPlan.bind(workoutPlanController));
    app.post('/api/workout-plans', mockAuthMiddleware, workoutPlanController.createWorkoutPlan.bind(workoutPlanController));
    app.put('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.updateWorkoutPlan.bind(workoutPlanController));
    app.delete('/api/workout-plans/:id', mockAuthMiddleware, workoutPlanController.deleteWorkoutPlan.bind(workoutPlanController));
    
    // Add error handler middleware at the end
    app.use(errorHandler);
  });

  describe('GET /api/workout-plans', () => {
    it('should return a list of workout plans', async () => {
      const response = await request(app).get('/api/workout-plans');
      
      expect(response.status).toBe(200);
      expect(response.body.workoutPlans).toBeDefined();
      expect(Array.isArray(response.body.workoutPlans)).toBe(true);
      expect(response.body.total).toBeDefined();
      expect(workoutPlanService.getWorkoutPlans).toHaveBeenCalled();
    });
  });

  describe('GET /api/workout-plans/:id', () => {
    it('should return a specific workout plan', async () => {
      const response = await request(app).get('/api/workout-plans/1');
      
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
      
      const response = await request(app)
        .post('/api/workout-plans')
        .send(planData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(workoutPlanService.createWorkoutPlan).toHaveBeenCalledWith(
        expect.objectContaining(planData),
        'test-user-id'
      );
    });
  });

  describe('PUT /api/workout-plans/:id', () => {
    it('should update an existing workout plan', async () => {
      const updates = {
        name: 'Updated Workout Plan',
        description: 'Updated Description'
      };
      
      const response = await request(app)
        .put('/api/workout-plans/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Workout Plan');
      expect(workoutPlanService.updateWorkoutPlan).toHaveBeenCalledWith(
        1,
        expect.objectContaining(updates),
        'test-user-id'
      );
    });
  });

  describe('DELETE /api/workout-plans/:id', () => {
    it('should delete a workout plan', async () => {
      // Ensure the mock is properly set up for this test
      workoutPlanService.deleteWorkoutPlan.mockResolvedValue(true);
      
      const response = await request(app).delete('/api/workout-plans/1');
      
      expect(response.status).toBe(200);
      expect(workoutPlanService.deleteWorkoutPlan).toHaveBeenCalledWith(1, 'test-user-id');
    });
  });
}); 