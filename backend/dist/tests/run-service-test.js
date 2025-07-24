"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./setup-mocks');
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const WorkoutPlanRepository_1 = require("../repositories/WorkoutPlanRepository");
const WorkoutExerciseRepository_1 = require("../repositories/WorkoutExerciseRepository");
const ExerciseRepository_1 = require("../repositories/ExerciseRepository");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const Enums_1 = require("../models/shared/Enums");
jest.mock('../repositories/WorkoutPlanRepository');
jest.mock('../repositories/WorkoutExerciseRepository');
jest.mock('../repositories/ExerciseRepository');
async function runTests() {
    console.log('Starting WorkoutPlanService tests...');
    let service;
    let mockWorkoutPlanRepo;
    let mockWorkoutExerciseRepo;
    let mockExerciseRepo;
    const mockWorkoutPlan = new WorkoutPlan_1.WorkoutPlan();
    Object.assign(mockWorkoutPlan, {
        id: 1,
        name: 'Test Workout',
        description: 'Test Description',
        difficulty: Enums_1.Difficulty.BEGINNER,
        workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
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
        getDifficulty: jest.fn().mockReturnValue(Enums_1.Difficulty.BEGINNER),
        getCategory: jest.fn().mockReturnValue(Enums_1.WorkoutCategory.FULL_BODY),
        toJSON: jest.fn().mockReturnThis()
    });
    mockWorkoutPlanRepo = new WorkoutPlanRepository_1.WorkoutPlanRepository();
    mockWorkoutExerciseRepo = new WorkoutExerciseRepository_1.WorkoutExerciseRepository();
    mockExerciseRepo = new ExerciseRepository_1.ExerciseRepository();
    mockWorkoutPlanRepo.create = jest.fn().mockResolvedValue(mockWorkoutPlan);
    mockWorkoutPlanRepo.findById = jest.fn().mockResolvedValue(mockWorkoutPlan);
    mockWorkoutPlanRepo.findWithFilters = jest.fn().mockResolvedValue([[mockWorkoutPlan], 1]);
    mockWorkoutPlanRepo.update = jest.fn().mockResolvedValue(mockWorkoutPlan);
    mockWorkoutPlanRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
    service = new WorkoutPlanService_1.WorkoutPlanService(mockWorkoutPlanRepo, mockWorkoutExerciseRepo, mockExerciseRepo);
    try {
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
        console.log('Testing getWorkoutPlanById...');
        const retrievedPlan = await service.getWorkoutPlanById(1, 'user1');
        console.assert(retrievedPlan.id === 1, 'Expected workout plan to have id 1');
        console.log('✓ getWorkoutPlanById passed');
        console.log('Testing getWorkoutPlans...');
        const plans = await service.getWorkoutPlans();
        console.assert(plans.workoutPlans.length === 1, 'Expected 1 workout plan');
        console.assert(plans.total === 1, 'Expected total to be 1');
        console.log('✓ getWorkoutPlans passed');
        console.log('Testing updateWorkoutPlan...');
        const updateData = { name: 'Updated Workout' };
        const updatedPlan = await service.updateWorkoutPlan(1, updateData, 'user1');
        console.assert(updatedPlan.id === 1, 'Expected workout plan to have id 1');
        console.log('✓ updateWorkoutPlan passed');
        console.log('Testing deleteWorkoutPlan...');
        const deleted = await service.deleteWorkoutPlan(1, 'user1');
        console.assert(deleted === true, 'Expected deletion to return true');
        console.log('✓ deleteWorkoutPlan passed');
        console.log('\nAll tests passed successfully! ✓');
    }
    catch (error) {
        console.error('Tests failed:', error);
    }
}
runTests();
//# sourceMappingURL=run-service-test.js.map