import { createTestWorkoutPlanService } from './WorkoutPlanTestHelper';
import { Difficulty } from '../../models/shared/Enums';

// Import fixWorkoutPlanService to ensure dependencies are mocked correctly
import './fixWorkoutPlanService';

describe('WorkoutPlanService (Simple)', () => {
  let testEnv;
  
  beforeEach(() => {
    jest.clearAllMocks();
    testEnv = createTestWorkoutPlanService();
  });
  
  describe('getWorkoutPlanById', () => {
    it('should return a workout plan by id', async () => {
      // Access the service and repositories through the test environment
      const { service } = testEnv;
      const { workoutPlanRepo } = testEnv.mockRepos;
      const { workoutPlan } = testEnv.mockData;
      
      // Call the method
      const result = await service.getWorkoutPlanById(1, 'user1');
      
      // Verify results
      expect(workoutPlanRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(workoutPlan);
    });
  });

  describe('createWorkoutPlan', () => {
    it('should create a workout plan', async () => {
      const { service } = testEnv;
      const { workoutPlanRepo } = testEnv.mockRepos;
      const { workoutPlan } = testEnv.mockData;
      
      const workoutData = {
        name: 'New Workout',
        description: 'A new workout plan',
        difficulty: Difficulty.INTERMEDIATE,
        exercises: []
      };
      
      const result = await service.createWorkoutPlan(workoutData, 'user1');
      
      expect(workoutPlanRepo.create).toHaveBeenCalled();
      expect(result).toEqual(workoutPlan);
    });
  });

  describe('updateWorkoutPlan', () => {
    it('should update a workout plan', async () => {
      const { service } = testEnv;
      const { workoutPlanRepo } = testEnv.mockRepos;
      const { workoutPlan } = testEnv.mockData;
      
      const updateData = {
        name: 'Updated Workout',
        difficulty: Difficulty.ADVANCED
      };
      
      const result = await service.updateWorkoutPlan(1, updateData, 'user1');
      
      expect(workoutPlanRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(workoutPlan);
    });
  });

  describe('deleteWorkoutPlan', () => {
    it('should delete a workout plan', async () => {
      const { service } = testEnv;
      const { workoutPlanRepo } = testEnv.mockRepos;
      
      const result = await service.deleteWorkoutPlan(1, 'user1');
      
      expect(workoutPlanRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
}); 