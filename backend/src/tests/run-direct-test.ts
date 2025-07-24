/**
 * Direct test for WorkoutPlanService with all mocked dependencies
 */

import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';

// Create minimal mocks without TypeORM dependencies
const mockWorkoutPlanRepo = {
  create: (data: any) => Promise.resolve({ ...data, id: 1 }),
  findById: (id: number) => Promise.resolve({ 
    id, 
    name: 'Test Workout', 
    description: 'Test Description',
    difficulty: Difficulty.BEGINNER,
    workoutCategory: WorkoutCategory.FULL_BODY,
    isCustom: true,
    creator_id: 'user1',
    exercises: [],
    canBeModifiedBy: (userId: string) => userId === 'user1'
  }),
  update: (id: number, data: any) => Promise.resolve({ id, ...data }),
  delete: (id: number) => Promise.resolve({ affected: 1 }),
  findWithFilters: (filters: any) => Promise.resolve([[{ id: 1, name: 'Test Workout' }], 1])
};

const mockWorkoutExerciseRepo = {
  create: (data: any) => Promise.resolve({ ...data, id: 1 }),
  update: (id: number, data: any) => Promise.resolve({ id, ...data }),
  delete: (id: number) => Promise.resolve({ affected: 1 })
};

const mockExerciseRepo = {
  findById: (id: number) => Promise.resolve({ id, name: 'Test Exercise' })
};

// Replace the transaction helper with a direct function that doesn't use TypeORM
// @ts-ignore - Ignore the executeTransaction import that may be in the service
global.executeTransaction = async function(callback: any) {
  // Simple mock that provides the expected structure without TypeORM dependency
  const queryRunner = {
    manager: {
      save: (entity: any, data: any) => {
        if (Array.isArray(data)) {
          return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
        }
        return Promise.resolve({ ...data, id: 1 });
      }
    },
    connect: () => Promise.resolve(),
    startTransaction: () => Promise.resolve(),
    commitTransaction: () => Promise.resolve(),
    rollbackTransaction: () => Promise.resolve(),
    release: () => Promise.resolve()
  };
  
  try {
    // Connect and start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    // Execute the callback
    const result = await callback(queryRunner);
    
    // Commit and release
    await queryRunner.commitTransaction();
    await queryRunner.release();
    
    return result;
  } catch (error) {
    // Rollback and release on error
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    throw error;
  }
};

// Mock the Cache Manager
// @ts-ignore - Ignore the cacheManager import
global.cacheManager = {
  get: (key: string) => Promise.resolve(null),
  set: (key: string, value: any, options: any) => Promise.resolve(true),
  delete: (key: string) => Promise.resolve(true)
};

async function runDirectTest() {
  console.log('Starting direct WorkoutPlanService test...');
  
  try {
    // Create the service with mocked repositories
    const service = new WorkoutPlanService(
      mockWorkoutPlanRepo as any,
      mockWorkoutExerciseRepo as any,
      mockExerciseRepo as any
    );
    
    // Test the createWorkoutPlan method
    const createData = {
      name: 'Test Workout',
      description: 'Test Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      isCustom: true,
      exercises: [
        { exercise_id: 1, sets: 3, repetitions: 12, order: 1 }
      ]
    };
    
    console.log('Testing createWorkoutPlan...');
    const result = await service.createWorkoutPlan(createData, 'user1');
    console.log('Result:', result);
    console.log('✓ createWorkoutPlan test passed');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the direct test
runDirectTest().catch(error => {
  console.error('Uncaught error:', error);
}); 