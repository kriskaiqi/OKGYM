import { Difficulty, WorkoutCategory } from '../../models/shared/Enums';

// Mock implementation functions
const mockResolvedValue = (value: any) => {
  return () => Promise.resolve(value);
};

export class WorkoutPlanServiceMock {
  getWorkoutPlans = mockResolvedValue({
    workoutPlans: [
      {
        id: 1,
        name: 'Test Workout Plan',
        description: 'Test Description',
        difficulty: Difficulty.BEGINNER,
        workoutCategory: WorkoutCategory.FULL_BODY,
        exercises: []
      }
    ],
    total: 1
  });

  getWorkoutPlanById = mockResolvedValue({
    id: 1,
    name: 'Test Workout Plan',
    description: 'Test Description',
    difficulty: Difficulty.BEGINNER,
    workoutCategory: WorkoutCategory.FULL_BODY,
    exercises: []
  });

  createWorkoutPlan = mockResolvedValue({
    id: 1,
    name: 'New Workout Plan',
    description: 'New Description',
    difficulty: Difficulty.BEGINNER,
    workoutCategory: WorkoutCategory.FULL_BODY,
    exercises: []
  });

  updateWorkoutPlan = mockResolvedValue({
    id: 1,
    name: 'Updated Workout Plan',
    description: 'Updated Description',
    difficulty: Difficulty.BEGINNER,
    workoutCategory: WorkoutCategory.FULL_BODY,
    exercises: []
  });

  deleteWorkoutPlan = mockResolvedValue(true);
} 