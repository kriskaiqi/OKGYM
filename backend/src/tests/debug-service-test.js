/**
 * Simple debug script to test the WorkoutPlanService directly.
 * Uses a very stripped-down approach to make it easier to debug.
 */

// Register TypeScript
require('ts-node/register');

// Define mock function
const createMockFn = () => {
  const fn = function(...args) {
    fn.mock.calls.push(args);
    return fn.mockImplementation ? fn.mockImplementation(...args) : undefined;
  };
  fn.mock = { calls: [] };
  fn.mockResolvedValue = (value) => {
    fn.mockImplementation = () => Promise.resolve(value);
    return fn;
  };
  fn.mockImplementation = (impl) => {
    fn.implementation = impl;
    return fn;
  };
  return fn;
};

// Create mock logger
const mockLogger = {
  info: function(message) { console.log('[INFO]', message); },
  error: function(message) { console.log('[ERROR]', message); },
  warn: function(message) { console.log('[WARN]', message); },
  debug: function(message) { console.log('[DEBUG]', message); }
};

// Define path to source files
const SRC_PATH = './src';

// Mock modules before they're required
require.cache[require.resolve(`${SRC_PATH}/utils/logger`)] = {
  exports: { default: mockLogger }
};

// Mock transaction helper
const mockTransactionHelper = {
  executeTransaction: async (callback) => {
    try {
      return await callback({
        manager: {
          save: async () => []
        }
      });
    } catch (error) {
      console.error("Transaction failed", error);
      throw error;
    }
  }
};

require.cache[require.resolve(`${SRC_PATH}/utils/transaction-helper`)] = {
  exports: mockTransactionHelper
};

// Mock cache manager
const mockCacheManager = {
  get: createMockFn().mockResolvedValue(null),
  set: createMockFn().mockResolvedValue(undefined),
  delete: createMockFn().mockResolvedValue(undefined),
  deleteByPattern: createMockFn().mockResolvedValue(undefined)
};

require.cache[require.resolve(`${SRC_PATH}/services/CacheManager`)] = {
  exports: { cacheManager: mockCacheManager }
};

// Now import needed classes
let WorkoutPlanService, WorkoutPlanRepository, WorkoutExerciseRepository, 
    ExerciseRepository, Difficulty, WorkoutCategory;

try {
  WorkoutPlanService = require(`${SRC_PATH}/services/WorkoutPlanService`).WorkoutPlanService;
  WorkoutPlanRepository = require(`${SRC_PATH}/repositories/WorkoutPlanRepository`).WorkoutPlanRepository;
  WorkoutExerciseRepository = require(`${SRC_PATH}/repositories/WorkoutExerciseRepository`).WorkoutExerciseRepository;
  ExerciseRepository = require(`${SRC_PATH}/repositories/ExerciseRepository`).ExerciseRepository;
  const Enums = require(`${SRC_PATH}/models/shared/Enums`);
  Difficulty = Enums.Difficulty;
  WorkoutCategory = Enums.WorkoutCategory;
} catch (error) {
  console.error("Failed to import required modules:", error);
  process.exit(1);
}

// Create test environment
function createTestEnv() {
  try {
    // Create mock repositories
    const workoutPlanRepo = new WorkoutPlanRepository();
    const workoutExerciseRepo = new WorkoutExerciseRepository();
    const exerciseRepo = new ExerciseRepository();
    
    // Mock exercise data
    const mockExercise = {
      id: 1,
      name: 'Test Exercise',
      description: 'Test exercise description'
    };

    // Mock workout exercise data
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
    };

    // Mock workout plan data
    const mockWorkoutPlan = {
      id: 1,
      name: 'Test Workout',
      description: 'Test workout description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      exercises: [mockWorkoutExercise],
      creator_id: 'user1',
      isCustom: true,
      canBeModifiedBy: (userId) => userId === 'user1'
    };
    
    // Mock repository methods
    workoutPlanRepo.findById = createMockFn().mockResolvedValue(mockWorkoutPlan);
    workoutPlanRepo.create = createMockFn().mockResolvedValue(mockWorkoutPlan);
    workoutPlanRepo.update = createMockFn().mockResolvedValue(mockWorkoutPlan);
    workoutPlanRepo.delete = createMockFn().mockResolvedValue({ affected: 1 });
    workoutPlanRepo.findWithFilters = createMockFn().mockResolvedValue([[mockWorkoutPlan], 1]);
    
    workoutExerciseRepo.create = createMockFn().mockResolvedValue(mockWorkoutExercise);
    workoutExerciseRepo.find = createMockFn().mockResolvedValue([mockWorkoutExercise]);
    workoutExerciseRepo.update = createMockFn().mockResolvedValue(undefined);
    workoutExerciseRepo.delete = createMockFn().mockResolvedValue({ affected: 1 });
    
    exerciseRepo.findById = createMockFn().mockResolvedValue(mockExercise);
    
    // Create the service
    const service = new WorkoutPlanService(
      workoutPlanRepo,
      workoutExerciseRepo,
      exerciseRepo
    );

    // Override handleError method
    service.handleError = function(error, message) {
      console.error(`Error handled: ${message}`, error);
      return null;
    };

    return {
      service,
      mockData: {
        exercise: mockExercise,
        workoutExercise: mockWorkoutExercise,
        workoutPlan: mockWorkoutPlan
      },
      mockRepos: {
        workoutPlanRepo,
        workoutExerciseRepo,
        exerciseRepo
      }
    };
  } catch (error) {
    console.error("Failed to create test environment:", error);
    throw error;
  }
}

async function runTests() {
  console.log('Starting WorkoutPlanService debug test...');

  try {
    // Create test environment
    const testEnv = createTestEnv();
    const { service } = testEnv;
    const { workoutPlanRepo } = testEnv.mockRepos;
    
    console.log('Test environment created successfully');

    // Test getWorkoutPlanById
    console.log('\nTesting getWorkoutPlanById...');
    const getResult = await service.getWorkoutPlanById(1, 'user1');
    console.log(`getWorkoutPlanById called: ${workoutPlanRepo.findById.mock.calls.length === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`getWorkoutPlanById returned result: ${getResult ? 'SUCCESS' : 'FAILED'}`);

    // Test createWorkoutPlan
    console.log('\nTesting createWorkoutPlan...');
    const createData = {
      name: 'New Workout',
      description: 'A new workout plan',
      difficulty: 'INTERMEDIATE',
      exercises: []
    };
    
    const createResult = await service.createWorkoutPlan(createData, 'user1');
    console.log(`createWorkoutPlan called: ${workoutPlanRepo.create.mock.calls.length === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`createWorkoutPlan returned result: ${createResult ? 'SUCCESS' : 'FAILED'}`);

    // Test updateWorkoutPlan
    console.log('\nTesting updateWorkoutPlan...');
    const updateData = {
      name: 'Updated Workout',
      difficulty: 'ADVANCED'
    };
    
    const updateResult = await service.updateWorkoutPlan(1, updateData, 'user1');
    console.log(`updateWorkoutPlan called: ${workoutPlanRepo.update.mock.calls.length === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`updateWorkoutPlan returned result: ${updateResult ? 'SUCCESS' : 'FAILED'}`);

    // Test deleteWorkoutPlan
    console.log('\nTesting deleteWorkoutPlan...');
    const deleteResult = await service.deleteWorkoutPlan(1, 'user1');
    console.log(`deleteWorkoutPlan called: ${workoutPlanRepo.delete.mock.calls.length === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`deleteWorkoutPlan returned result: ${deleteResult ? 'SUCCESS' : 'FAILED'}`);

    console.log('\nAll tests completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
}); 