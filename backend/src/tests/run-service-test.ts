/**
 * Run WorkoutPlanService tests with our mocks
 */

// Load setup mocks first
require('./setup-mocks');

// Import test dependencies
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';

// Mock repositories
jest.mock('../repositories/WorkoutPlanRepository');
jest.mock('../repositories/WorkoutExerciseRepository');
jest.mock('../repositories/ExerciseRepository');

// Run service tests
async function runTests() {
  console.log('Starting WorkoutPlanService tests...');
  
  // Initialize variables
  let service: WorkoutPlanService;
  let mockWorkoutPlanRepo: jest.Mocked<WorkoutPlanRepository>;
  let mockWorkoutExerciseRepo: jest.Mocked<WorkoutExerciseRepository>;
  let mockExerciseRepo: jest.Mocked<ExerciseRepository>;
  
  // Create mock plan
  const mockWorkoutPlan = new WorkoutPlan();
  Object.assign(mockWorkoutPlan, {
    id: 1,
    name: 'Test Workout',
    description: 'Test Description',
    difficulty: Difficulty.BEGINNER,
    workoutCategory: WorkoutCategory.FULL_BODY,
    estimatedDuration: 30,
    isCustom: true,
    creator_id: 'user1',
    exercises: [],
    targetMuscleGroups: [],
    rating: 0,
    ratingCount: 0,
    popularity: 0,
    canBeModifiedBy: jest.fn().mockImplementation((userId) => userId === 'user1'),
    isCustomPlan: jest.fn().mockReturnValue(true),
    updateMetricsCache: jest.fn(),
    calculateIntensity: jest.fn().mockReturnValue(3),
    calculateEstimatedTime: jest.fn().mockReturnValue(30),
    getPrimaryMuscleGroups: jest.fn().mockReturnValue([]),
    getSecondaryMuscleGroups: jest.fn().mockReturnValue([]),
    getEquipment: jest.fn().mockReturnValue([]),
    getDifficulty: jest.fn().mockReturnValue(Difficulty.BEGINNER),
    getCategory: jest.fn().mockReturnValue(WorkoutCategory.FULL_BODY),
    toJSON: jest.fn().mockReturnThis()
  });
  
  // Initialize mocks
  mockWorkoutPlanRepo = new WorkoutPlanRepository() as jest.Mocked<WorkoutPlanRepository>;
  mockWorkoutExerciseRepo = new WorkoutExerciseRepository() as jest.Mocked<WorkoutExerciseRepository>;
  mockExerciseRepo = new ExerciseRepository() as jest.Mocked<ExerciseRepository>;
  
  // Setup repository mocks
  mockWorkoutPlanRepo.create = jest.fn().mockResolvedValue(mockWorkoutPlan);
  mockWorkoutPlanRepo.findById = jest.fn().mockResolvedValue(mockWorkoutPlan);
  mockWorkoutPlanRepo.findWithFilters = jest.fn().mockResolvedValue([[mockWorkoutPlan], 1]);
  mockWorkoutPlanRepo.update = jest.fn().mockResolvedValue(mockWorkoutPlan);
  mockWorkoutPlanRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
  // Initialize service
  service = new WorkoutPlanService(
    mockWorkoutPlanRepo,
    mockWorkoutExerciseRepo,
    mockExerciseRepo
  );
  
  try {
    // Test createWorkoutPlan
    console.log('Testing createWorkoutPlan...');
    const createData = {
      name: 'Test Workout',
      description: 'Test Description',
      exercises: [{ exercise_id: 1, sets: 3, repetitions: 12 }]
    };
    
    const createdPlan = await service.createWorkoutPlan(createData, 'user1');
    console.assert(createdPlan.id === 1, 'Expected workout plan to have id 1');
    console.assert(createdPlan.name === 'Test Workout', 'Expected workout plan name to be "Test Workout"');
    console.log('✓ createWorkoutPlan passed');
    
    // Test getWorkoutPlanById
    console.log('Testing getWorkoutPlanById...');
    const retrievedPlan = await service.getWorkoutPlanById(1, 'user1');
    console.assert(retrievedPlan.id === 1, 'Expected workout plan to have id 1');
    console.log('✓ getWorkoutPlanById passed');
    
    // Test getWorkoutPlans
    console.log('Testing getWorkoutPlans...');
    const plans = await service.getWorkoutPlans();
    console.assert(plans.workoutPlans.length === 1, 'Expected 1 workout plan');
    console.assert(plans.total === 1, 'Expected total to be 1');
    console.log('✓ getWorkoutPlans passed');
    
    // Test updateWorkoutPlan
    console.log('Testing updateWorkoutPlan...');
    const updateData = { name: 'Updated Workout' };
    const updatedPlan = await service.updateWorkoutPlan(1, updateData, 'user1');
    console.assert(updatedPlan.id === 1, 'Expected workout plan to have id 1');
    console.log('✓ updateWorkoutPlan passed');
    
    // Test deleteWorkoutPlan
    console.log('Testing deleteWorkoutPlan...');
    const deleted = await service.deleteWorkoutPlan(1, 'user1');
    console.assert(deleted === true, 'Expected deletion to return true');
    console.log('✓ deleteWorkoutPlan passed');
    
    console.log('\nAll tests passed successfully! ✓');
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

// Run tests
runTests(); 