/**
 * Debug tests for WorkoutPlanService
 * This file provides a simple way to test the WorkoutPlanService without using Jest
 */
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { cacheManager } from '../services/CacheManager';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';

// Mock the cache manager
(cacheManager as any).get = async () => null;
(cacheManager as any).set = async () => {};
(cacheManager as any).delete = async () => {};
(cacheManager as any).deleteByPattern = async () => {};

// Mock transaction helper
const originalModuleTransaction = require('../utils/transaction-helper');
originalModuleTransaction.executeTransaction = async (callback: any) => {
  try {
    // Call the callback directly without a query runner
    return await callback();
  } catch (error) {
    console.error('Transaction failed', error);
    throw error;
  }
};

// Mock logger
const originalLogger = require('../utils/logger');
originalLogger.default.info = (...args: any[]) => console.log(...args);
originalLogger.default.error = (...args: any[]) => console.error(...args);
originalLogger.default.warn = (...args: any[]) => console.warn(...args);
originalLogger.default.debug = (...args: any[]) => {};

// Create mock data
const mockExercise = {
  id: 1,
  name: 'Test Exercise',
  description: 'A test exercise',
  difficulty: Difficulty.BEGINNER,
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
  order: 0,
  duration: 0,
  notes: '',
  setType: 'STRAIGHT'
} as unknown as WorkoutExercise;

const mockWorkoutPlan = {
  id: 1,
  name: 'Test Workout',
  description: 'A test workout plan',
  difficulty: Difficulty.BEGINNER,
  workoutCategory: WorkoutCategory.FULL_BODY,
  targetMuscleGroups: [],
  exercises: [mockWorkoutExercise],
  estimatedDuration: 30,
  isCustom: true,
  creator_id: 'user1',
  popularity: 0,
  rating: 0,
  ratingCount: 0,
  canBeModifiedBy: (userId: string) => userId === 'user1'
} as unknown as WorkoutPlan;

// Create mock repositories
const workoutPlanRepo = {
  findById: async (id: number) => {
    console.log(`Finding workout plan with ID ${id}`);
    return { ...mockWorkoutPlan, id };
  },
  findWithFilters: async () => {
    return [[mockWorkoutPlan], 1];
  },
  create: async (data: any) => {
    console.log(`Creating workout plan: ${data.name}`);
    return { ...mockWorkoutPlan, ...data };
  },
  save: async (entity: any) => {
    return entity;
  },
  update: async (id: number, data: any) => {
    console.log(`Updating workout plan ${id} with`, data);
    Object.assign(mockWorkoutPlan, data);
    return;
  },
  delete: async (id: number) => {
    console.log(`Deleting workout plan ${id}`);
    return { affected: 1 };
  }
};

const workoutExerciseRepo = {
  findById: async (id: number) => {
    console.log(`Finding workout exercise with ID ${id}`);
    return { ...mockWorkoutExercise, id };
  },
  find: async () => {
    return [mockWorkoutExercise];
  },
  create: async (data: any) => {
    console.log(`Creating workout exercise`, data);
    return { ...mockWorkoutExercise, ...data };
  },
  save: async (entity: any) => {
    return entity;
  },
  update: async (id: number, data: any) => {
    console.log(`Updating workout exercise ${id} with`, data);
    return;
  },
  delete: async (id: number) => {
    console.log(`Deleting workout exercise ${id}`);
    return { affected: 1 };
  }
};

const exerciseRepo = {
  findById: async (id: number) => {
    console.log(`Finding exercise with ID ${id}`);
    return { ...mockExercise, id };
  }
};

/**
 * Run tests for the WorkoutPlanService
 */
async function runTests() {
  console.log('===== Running WorkoutPlanService Tests =====');
  
  // Create the service with mock repositories
  const service = new WorkoutPlanService(
    workoutPlanRepo as unknown as WorkoutPlanRepository,
    workoutExerciseRepo as unknown as WorkoutExerciseRepository,
    exerciseRepo as unknown as ExerciseRepository
  );
  
  // Override the handleError method
  (service as any).handleError = (error: any, message: string, context: any) => {
    console.error(`ERROR: ${message}`, error);
    return null;
  };

  try {
    // Test getWorkoutPlanById
    console.log('\n----- Test: getWorkoutPlanById -----');
    const workoutPlan = await service.getWorkoutPlanById(1, 'user1');
    console.log('Result:', workoutPlan?.name);
    
    // Test createWorkoutPlan
    console.log('\n----- Test: createWorkoutPlan -----');
    const newPlan = await service.createWorkoutPlan({
      name: 'New Workout',
      description: 'A new workout plan'
    }, 'user1');
    console.log('Result:', newPlan?.name);

    // Test updateWorkoutPlan
    console.log('\n----- Test: updateWorkoutPlan -----');
    const updatedPlan = await service.updateWorkoutPlan(1, {
      name: 'Updated Workout',
      difficulty: Difficulty.ADVANCED
    }, 'user1');
    console.log('Result:', updatedPlan?.name, updatedPlan?.difficulty);

    // Test addExerciseToWorkoutPlan
    console.log('\n----- Test: addExerciseToWorkoutPlan -----');
    const planWithNewExercise = await service.addExerciseToWorkoutPlan(1, {
      exercise_id: 2,
      sets: 4,
      repetitions: 12
    }, 'user1');
    console.log('Result:', planWithNewExercise?.exercises?.length);

    // Test updateExerciseInWorkoutPlan
    console.log('\n----- Test: updateExerciseInWorkoutPlan -----');
    const planWithUpdatedExercise = await service.updateExerciseInWorkoutPlan(1, 1, {
      sets: 5,
      repetitions: 8
    }, 'user1');
    console.log('Result:', planWithUpdatedExercise?.exercises?.[0]?.sets);

  } catch (error) {
    console.error('Test failed:', error);
  }

  console.log('\n===== Tests completed =====');
}

// Run the tests
runTests().catch(console.error); 