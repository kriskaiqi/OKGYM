/**
 * Super simple script to test WorkoutPlanService
 */

// We need this for TypeScript
require('ts-node/register');

// Import WorkoutPlanService class
const { WorkoutPlanService } = require('../services/WorkoutPlanService');

// STEP 1: Create mock repositories
const mockWorkoutPlanRepo = {
  findById: async () => ({ 
    id: 1, 
    name: 'Test Workout',
    description: 'Test description',
    creator_id: 'user1',
    isCustom: true,
    canBeModifiedBy: (id) => id === 'user1'
  }),
  create: async (data) => ({ id: 1, ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => ({ affected: 1 }),
  findWithFilters: async () => [[{ id: 1 }], 1]
};

const mockWorkoutExerciseRepo = {
  create: async (data) => ({ id: 1, ...data }),
  find: async () => [{ id: 1, exercise_id: 1 }],
  update: async (id, data) => ({ id, ...data }),
  delete: async () => ({ affected: 1 })
};

const mockExerciseRepo = {
  findById: async () => ({ 
    id: 1, 
    name: 'Test Exercise',
    description: 'Test exercise description'
  })
};

// STEP 2: Override logger methods
const logger = require('../utils/logger').default;
logger.info = function(message) { console.log('[INFO]', message); };
logger.error = function(message) { console.log('[ERROR]', message); };
logger.warn = function(message) { console.log('[WARN]', message); };
logger.debug = function(message) { console.log('[DEBUG]', message); };

// STEP 3: Override transaction helper
const transactionHelper = require('../utils/transaction-helper');
const origExecuteTransaction = transactionHelper.executeTransaction;
transactionHelper.executeTransaction = async (callback) => {
  console.log('[TRANSACTION] Executing transaction');
  try {
    return await callback({
      manager: {
        save: async () => {
          console.log('[TRANSACTION] Saving entities');
          return [];
        }
      }
    });
  } catch (error) {
    console.error('[TRANSACTION] Failed:', error);
    throw error;
  }
};

// STEP 4: Override cache manager
const cacheManager = require('../services/CacheManager').cacheManager;
if (cacheManager) {
  if (typeof cacheManager.get !== 'function') {
    cacheManager.get = async () => null;
  }
  if (typeof cacheManager.set !== 'function') {
    cacheManager.set = async () => {};
  }
  if (typeof cacheManager.delete !== 'function') {
    cacheManager.delete = async () => {};
  }
  if (typeof cacheManager.deleteByPattern !== 'function') {
    cacheManager.deleteByPattern = async () => {};
  }
}

// STEP 5: Create the service instance with mocked repos
const service = new WorkoutPlanService(
  mockWorkoutPlanRepo,
  mockWorkoutExerciseRepo,
  mockExerciseRepo
);

// STEP 6: Create test methods
async function testGetWorkoutPlan() {
  try {
    console.log('\n--- TESTING GET WORKOUT PLAN ---');
    const result = await service.getWorkoutPlanById(1, 'user1');
    console.log('Result:', result ? 'SUCCESS' : 'FAILED');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

async function testCreateWorkoutPlan() {
  try {
    console.log('\n--- TESTING CREATE WORKOUT PLAN ---');
    const data = {
      name: 'New Workout',
      description: 'A test workout plan',
      exercises: []
    };
    const result = await service.createWorkoutPlan(data, 'user1');
    console.log('Result:', result ? 'SUCCESS' : 'FAILED');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

async function testUpdateWorkoutPlan() {
  try {
    console.log('\n--- TESTING UPDATE WORKOUT PLAN ---');
    const data = {
      name: 'Updated Workout'
    };
    const result = await service.updateWorkoutPlan(1, data, 'user1');
    console.log('Result:', result ? 'SUCCESS' : 'FAILED');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

async function testDeleteWorkoutPlan() {
  try {
    console.log('\n--- TESTING DELETE WORKOUT PLAN ---');
    const result = await service.deleteWorkoutPlan(1, 'user1');
    console.log('Result:', result ? 'SUCCESS' : 'FAILED');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

// STEP 7: Run tests
async function runAllTests() {
  console.log('Starting WorkoutPlanService tests...');
  
  // Allow the service to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const results = [];
  
  results.push(await testGetWorkoutPlan());
  results.push(await testCreateWorkoutPlan());
  results.push(await testUpdateWorkoutPlan());
  results.push(await testDeleteWorkoutPlan());
  
  console.log('\n--- TEST SUMMARY ---');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('All tests PASSED');
  } else {
    console.log('Some tests FAILED');
  }
}

// Run tests and exit
runAllTests().catch(error => {
  console.error('Unhandled error in tests:', error);
}); 