import { WorkoutPlan } from '../../models/WorkoutPlan';
import { WorkoutExercise } from '../../models/WorkoutExercise';
import { Exercise } from '../../models/Exercise';
import { Difficulty, WorkoutCategory } from '../../models/shared/Enums';
import { AppError, ErrorType } from '../../utils/errors';

// Mock the dependencies
jest.mock('../../utils/transaction-helper', () => ({
  executeTransaction: jest.fn().mockImplementation(async (callback) => {
    return await callback({
      manager: {
        save: jest.fn().mockResolvedValue([])
      }
    });
  })
}));

jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    deleteByPattern: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock performance tracking
jest.mock('../../utils/performance', () => ({
  SimpleTrack: jest.fn().mockImplementation(() => {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function(...args: any[]) {
        return originalMethod.apply(this, args);
      };
      return descriptor;
    };
  }),
  SimplePerformanceTracker: {
    getInstance: jest.fn().mockReturnValue({
      trackAsync: jest.fn().mockImplementation((name, threshold, fn) => fn()),
      track: jest.fn().mockImplementation((name, fn) => fn())
    })
  }
}));

// Mock data
const mockExercise = {
  id: 1,
  name: 'Test Exercise',
  description: 'Test exercise description'
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

const mockWorkoutPlan = {
  id: 1,
  name: 'Test Workout',
  description: 'Test workout description',
  difficulty: Difficulty.BEGINNER,
  workoutCategory: WorkoutCategory.FULL_BODY,
  exercises: [mockWorkoutExercise],
  creator_id: 'user1',
  isCustom: true,
  canBeModifiedBy: jest.fn().mockImplementation(userId => userId === 'user1')
} as unknown as WorkoutPlan;

// Import after mocks are set up
const { WorkoutPlanService } = require('../../services/WorkoutPlanService');

describe('WorkoutPlanService (Simplified)', () => {
  let service;
  let workoutPlanRepo;
  let workoutExerciseRepo;
  let exerciseRepo;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock repositories
    workoutPlanRepo = {
      findById: jest.fn().mockResolvedValue(mockWorkoutPlan),
      create: jest.fn().mockResolvedValue(mockWorkoutPlan),
      update: jest.fn().mockResolvedValue(mockWorkoutPlan),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      findWithFilters: jest.fn().mockResolvedValue([[mockWorkoutPlan], 1])
    };
    
    workoutExerciseRepo = {
      create: jest.fn().mockResolvedValue(mockWorkoutExercise),
      find: jest.fn().mockResolvedValue([mockWorkoutExercise]),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue({ affected: 1 })
    };
    
    exerciseRepo = {
      findById: jest.fn().mockResolvedValue(mockExercise)
    };
    
    // Create service with mocked repositories
    service = new WorkoutPlanService(
      workoutPlanRepo,
      workoutExerciseRepo,
      exerciseRepo
    );
    
    // Override handleError to return null instead of throwing
    service.handleError = jest.fn().mockImplementation((error, message) => {
      console.error(`Error handled: ${message}`, error);
      return null;
    });
  });
  
  test('getWorkoutPlanById should return workout plan', async () => {
    const result = await service.getWorkoutPlanById(1, 'user1');
    
    expect(result).toEqual(mockWorkoutPlan);
    expect(workoutPlanRepo.findById).toHaveBeenCalledWith(1);
  });
  
  test('createWorkoutPlan should create a workout plan', async () => {
    const workoutData = {
      name: 'New Workout',
      description: 'A new workout plan',
      difficulty: Difficulty.INTERMEDIATE,
      exercises: []
    };
    
    const result = await service.createWorkoutPlan(workoutData, 'user1');
    
    expect(workoutPlanRepo.create).toHaveBeenCalled();
    expect(result).toEqual(mockWorkoutPlan);
  });
  
  test('updateWorkoutPlan should update a workout plan', async () => {
    const updateData = {
      name: 'Updated Workout',
      difficulty: Difficulty.ADVANCED
    };
    
    const result = await service.updateWorkoutPlan(1, updateData, 'user1');
    
    expect(workoutPlanRepo.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(mockWorkoutPlan);
  });
}); 