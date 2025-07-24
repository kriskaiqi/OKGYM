"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkoutPlanTestHelper_1 = require("./WorkoutPlanTestHelper");
const Enums_1 = require("../../models/shared/Enums");
require("./fixWorkoutPlanService");
describe('WorkoutPlanService (Simple)', () => {
    let testEnv;
    beforeEach(() => {
        jest.clearAllMocks();
        testEnv = (0, WorkoutPlanTestHelper_1.createTestWorkoutPlanService)();
    });
    describe('getWorkoutPlanById', () => {
        it('should return a workout plan by id', async () => {
            const { service } = testEnv;
            const { workoutPlanRepo } = testEnv.mockRepos;
            const { workoutPlan } = testEnv.mockData;
            const result = await service.getWorkoutPlanById(1, 'user1');
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
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
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
                difficulty: Enums_1.Difficulty.ADVANCED
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
//# sourceMappingURL=WorkoutPlanService.simple.test.js.map