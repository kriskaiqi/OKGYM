"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestWorkoutPlanService = createTestWorkoutPlanService;
const WorkoutPlanService_1 = require("../../services/WorkoutPlanService");
const Enums_1 = require("../../models/shared/Enums");
const WorkoutPlanRepository_1 = require("../../repositories/WorkoutPlanRepository");
const WorkoutExerciseRepository_1 = require("../../repositories/WorkoutExerciseRepository");
const ExerciseRepository_1 = require("../../repositories/ExerciseRepository");
const fixWorkoutPlanService_1 = require("./fixWorkoutPlanService");
require("./fixWorkoutPlanService");
function createTestWorkoutPlanService() {
    const mockExercise = {
        id: 1,
        name: 'Test Exercise',
        description: 'Test exercise description'
    };
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
    const mockWorkoutPlan = {
        id: 1,
        name: 'Test Workout',
        description: 'Test workout description',
        difficulty: Enums_1.Difficulty.BEGINNER,
        workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
        exercises: [mockWorkoutExercise],
        creator_id: 'user1',
        isCustom: true,
        canBeModifiedBy: jest.fn().mockImplementation(userId => userId === 'user1')
    };
    const workoutPlanRepo = new WorkoutPlanRepository_1.WorkoutPlanRepository();
    const workoutExerciseRepo = new WorkoutExerciseRepository_1.WorkoutExerciseRepository();
    const exerciseRepo = new ExerciseRepository_1.ExerciseRepository();
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
    const service = new WorkoutPlanService_1.WorkoutPlanService(workoutPlanRepo, workoutExerciseRepo, exerciseRepo);
    const patchedService = (0, fixWorkoutPlanService_1.patchWorkoutPlanService)(service);
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
//# sourceMappingURL=WorkoutPlanTestHelper.js.map