/**
 * Debug tests for WorkoutPlanService
 */
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { User } from '../models/User';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { AppError, ErrorType } from '../utils/errors';
import { cacheManager } from '../services/CacheManager';

// Mock the dependencies
jest.mock('../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn().mockImplementation(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPattern: jest.fn()
  }
}));

jest.mock('../utils/transaction-helper', () => ({
  executeTransaction: jest.fn().mockImplementation(async (callback) => {
    try {
      return await callback();
    } catch (error) {
      throw error;
    }
  })
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Create mock data
const mockExercise = {
  id: 1,
  name: 'Test Exercise',
  description: 'A test exercise',
  difficulty: 'BEGINNER',
  equipment: [],
  targetMuscleGroups: [],
  instructions: []
} as unknown as Exercise;

const mockWorkoutExercise = {
  id: 1,
  workout_plan_id: 1,
  exercise_id: 1,
  exercise: mockExercise,
  sets: 3,
  repetitions: 10,
  restTime: 60,
  intensity: 'MODERATE',
  order: 0
} as unknown as WorkoutExercise;

const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user'
} as unknown as User;

const mockWorkoutPlan = {
  id: 1,
  name: 'Test Workout',
  description: 'A test workout plan',
  difficulty: 'BEGINNER',
  workoutCategory: 'STRENGTH',
  targetMuscleGroups: [],
  exercises: [mockWorkoutExercise],
  estimatedDuration: 30,
  isCustom: true,
  creator_id: 'user1',
  creator: mockUser,
  canBeModifiedBy: jest.fn().mockReturnValue(true)
} as unknown as WorkoutPlan;

// Set up the test suite
describe('WorkoutPlanService', () => {
  let service: WorkoutPlanService;
  let workoutPlanRepo: any;
  let workoutExerciseRepo: any;
  let exerciseRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repositories with the methods needed
    workoutPlanRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn().mockResolvedValue(mockWorkoutPlan),
      findWithFilters: jest.fn().mockResolvedValue([[mockWorkoutPlan], 1]),
      create: jest.fn().mockResolvedValue(mockWorkoutPlan),
      save: jest.fn().mockResolvedValue(mockWorkoutPlan),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn()
    };

    workoutExerciseRepo = {
      find: jest.fn().mockResolvedValue([mockWorkoutExercise]),
      findOne: jest.fn().mockResolvedValue(mockWorkoutExercise),
      findById: jest.fn().mockResolvedValue(mockWorkoutExercise),
      create: jest.fn().mockResolvedValue(mockWorkoutExercise),
      save: jest.fn().mockResolvedValue(mockWorkoutExercise),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn()
    };

    exerciseRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn().mockResolvedValue(mockExercise),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn()
    };

    // Create the service
    service = new WorkoutPlanService(
      workoutPlanRepo,
      workoutExerciseRepo,
      exerciseRepo
    );

    // Override the handleError method to return instead of throwing
    (service as any).handleError = jest.fn().mockImplementation((error, message, context) => {
      console.error('Error handled:', message, error);
      return null;
    });
  });

  // Test cases
  describe('getWorkoutPlanById', () => {
    it('should return a workout plan by ID', async () => {
      const result = await service.getWorkoutPlanById(1, 'user1');
      expect(result).toEqual(mockWorkoutPlan);
      expect(workoutPlanRepo.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createWorkoutPlan', () => {
    it('should create a workout plan', async () => {
      const workoutData = {
        name: 'New Workout',
        description: 'A new workout plan',
        difficulty: 'INTERMEDIATE',
        workoutCategory: 'CARDIO',
        exercises: []
      };

      const result = await service.createWorkoutPlan(workoutData, 'user1');
      
      expect(result).toEqual(mockWorkoutPlan);
      expect(workoutPlanRepo.create).toHaveBeenCalled();
      expect(workoutPlanRepo.findById).toHaveBeenCalled();
    });
  });
}); 