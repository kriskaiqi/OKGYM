import { WorkoutPlan } from '../../models/WorkoutPlan';
import { WorkoutExercise } from '../../models/WorkoutExercise';
import { Exercise } from '../../models/Exercise';
import { WorkoutPlanService } from '../../services/WorkoutPlanService';
import { Difficulty, WorkoutCategory } from '../../models/shared/Enums';
import { WorkoutPlanRepository } from '../../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../../repositories/ExerciseRepository';
import { patchWorkoutPlanService } from './fixWorkoutPlanService';

// Import this first to ensure all mocks are loaded
import './fixWorkoutPlanService';

// Helper type to create a mock with all properties as jest.Mock
type MockRepository<T> = {
  [K in keyof T]: jest.Mock;
};

/**
 * Creates a test-ready version of WorkoutPlanService with mocked dependencies
 */
export function createTestWorkoutPlanService() {
  // Mock exercise data
  const mockExercise = {
    id: 1,
    name: 'Test Exercise',
    description: 'Test exercise description'
  } as unknown as Exercise;

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
  } as unknown as WorkoutExercise;

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
    canBeModifiedBy: jest.fn().mockImplementation(userId => userId === 'user1')
  } as unknown as WorkoutPlan;

  // Create service with mocked repositories
  const workoutPlanRepo = new WorkoutPlanRepository();
  const workoutExerciseRepo = new WorkoutExerciseRepository();
  const exerciseRepo = new ExerciseRepository();
  
  // Mock repository methods
  workoutPlanRepo.findById = jest.fn().mockResolvedValue(mockWorkoutPlan);
  workoutPlanRepo.create = jest.fn().mockResolvedValue(mockWorkoutPlan);
  workoutPlanRepo.update = jest.fn().mockResolvedValue(mockWorkoutPlan);
  workoutPlanRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
  workoutPlanRepo.findWithFilters = jest.fn().mockResolvedValue([[mockWorkoutPlan], 1]);
  
  workoutExerciseRepo.create = jest.fn().mockResolvedValue(mockWorkoutExercise);
  workoutExerciseRepo.find = jest.fn().mockResolvedValue([mockWorkoutExercise]);
  workoutExerciseRepo.update = jest.fn().mockResolvedValue(undefined);
  workoutExerciseRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
  exerciseRepo.findById = jest.fn().mockResolvedValue(mockExercise);
  
  // Create the service
  const service = new WorkoutPlanService(
    workoutPlanRepo,
    workoutExerciseRepo,
    exerciseRepo
  );

  // Patch the service for testing
  const patchedService = patchWorkoutPlanService(service);

  return {
    service: patchedService,
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
} 