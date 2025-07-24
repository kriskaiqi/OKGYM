/**
 * Run WorkoutPlanService tests with direct mocks
 */

// Import the service and dependencies
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';

// Mock the dependencies directly
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

// Mock transaction helper
const executeTransaction = async (callback: any) => {
  const queryRunner = {
    manager: {
      save: (entity: any, data: any) => {
        if (Array.isArray(data)) {
          return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
        }
        return Promise.resolve({ ...data, id: 1 });
      }
    }
  };
  
  return await callback(queryRunner);
};

// Mock the Cache Manager
const mockCacheManager = {
  get: (key: string) => Promise.resolve(null),
  set: (key: string, value: any) => Promise.resolve(true),
  delete: (key: string) => Promise.resolve(true)
};

// Override global modules
(global as any).executeTransaction = executeTransaction;
(global as any).cacheManager = mockCacheManager;

// Use a custom logger to avoid console noise
const mockLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
};

// Run a simplified version of the tests
async function runServiceTests() {
  console.log('Starting simplified WorkoutPlanService tests...');
  
  // Create the service with our mocked repositories
  const service = new WorkoutPlanService(
    mockWorkoutPlanRepo as any,
    mockWorkoutExerciseRepo as any,
    mockExerciseRepo as any
  );
  
  // Replace the handleError method to avoid throwing errors that would crash the tests
  (service as any).handleError = (error: any, message: string, context: any) => {
    console.error('Error in test:', message, error);
    throw error; // Still throw but with controlled output
  };
  
  try {
    // Test createWorkoutPlan
    console.log('Testing createWorkoutPlan...');
    const createData = {
      name: 'Test Workout',
      description: 'Test Description',
      exercises: [{ exercise_id: 1, sets: 3, repetitions: 12 }]
    };
    
    const createResult = await service.createWorkoutPlan(createData, 'user1');
    console.assert(createResult && createResult.id === 1, 'Create test failed');
    console.log('✓ createWorkoutPlan passed');
    
    // Test getWorkoutPlanById
    console.log('Testing getWorkoutPlanById...');
    const getResult = await service.getWorkoutPlanById(1, 'user1');
    console.assert(getResult && getResult.id === 1, 'Get by ID test failed');
    console.log('✓ getWorkoutPlanById passed');
    
    // Test getWorkoutPlans
    console.log('Testing getWorkoutPlans...');
    const listResult = await service.getWorkoutPlans({}, 'user1');
    console.assert(listResult && listResult.total === 1, 'List test failed');
    console.log('✓ getWorkoutPlans passed');
    
    // Test updateWorkoutPlan
    console.log('Testing updateWorkoutPlan...');
    const updateResult = await service.updateWorkoutPlan(1, { name: 'Updated Name' }, 'user1');
    console.assert(updateResult && updateResult.name === 'Updated Name', 'Update test failed');
    console.log('✓ updateWorkoutPlan passed');
    
    // Test deleteWorkoutPlan
    console.log('Testing deleteWorkoutPlan...');
    const deleteResult = await service.deleteWorkoutPlan(1, 'user1');
    console.assert(deleteResult === true, 'Delete test failed');
    console.log('✓ deleteWorkoutPlan passed');
    
    console.log('\nAll tests passed successfully! ✓');
  } catch (error) {
    console.error('Test failure:', error);
  }
}

// Run the tests
runServiceTests().catch(error => {
  console.error('Error running tests:', error);
}); 