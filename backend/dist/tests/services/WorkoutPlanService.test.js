"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkoutPlan_1 = require("../../models/WorkoutPlan");
const WorkoutExercise_1 = require("../../models/WorkoutExercise");
const Exercise_1 = require("../../models/Exercise");
const errors_1 = require("../../utils/errors");
const Enums_1 = require("../../models/shared/Enums");
const CacheManager_1 = require("../../services/CacheManager");
const ExerciseCategory_1 = require("../../models/ExerciseCategory");
const User_1 = require("../../models/User");
const test_helpers_1 = require("../utils/test-helpers");
(0, test_helpers_1.setupTransactionMocking)();
jest.mock('../../repositories/WorkoutPlanRepository', () => ({
    WorkoutPlanRepository: jest.fn().mockImplementation(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn()
    }))
}));
jest.mock('../../repositories/WorkoutExerciseRepository', () => ({
    WorkoutExerciseRepository: jest.fn().mockImplementation(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn()
    }))
}));
jest.mock('../../repositories/ExerciseRepository', () => ({
    ExerciseRepository: jest.fn().mockImplementation(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn()
    }))
}));
jest.mock('../../services/CacheManager', () => ({
    cacheManager: {
        get: jest.fn().mockImplementation(async () => null),
        set: jest.fn().mockImplementation(async () => { }),
        delete: jest.fn().mockImplementation(async () => { }),
        deleteByPattern: jest.fn().mockImplementation(async () => { }),
        clear: jest.fn().mockImplementation(async () => { }),
        keys: jest.fn().mockImplementation(async () => []),
        getStats: jest.fn().mockReturnValue({}),
        resetStats: jest.fn(),
        setEnabled: jest.fn()
    }
}));
let mockWorkoutPlanRepo;
let mockWorkoutExerciseRepo;
let mockExerciseRepo;
let service;
mockWorkoutPlanRepo = new (require('../../repositories/WorkoutPlanRepository').WorkoutPlanRepository)();
mockWorkoutExerciseRepo = new (require('../../repositories/WorkoutExerciseRepository').WorkoutExerciseRepository)();
mockExerciseRepo = new (require('../../repositories/ExerciseRepository').ExerciseRepository)();
const { WorkoutPlanService } = require('../../services/WorkoutPlanService');
service = new WorkoutPlanService(mockWorkoutPlanRepo, mockWorkoutExerciseRepo, mockExerciseRepo);
describe('WorkoutPlanService', () => {
    let baseWorkoutPlan;
    const createMockWorkoutPlan = (overrides = {}) => {
        const plan = new WorkoutPlan_1.WorkoutPlan();
        Object.assign(plan, Object.assign({ id: 1, name: 'Test Workout', description: 'Test Description', difficulty: Enums_1.Difficulty.BEGINNER, workoutCategory: Enums_1.WorkoutCategory.FULL_BODY, estimatedDuration: 30, isCustom: true, creator_id: 'user1', exercises: [], targetMuscleGroups: [], rating: 0, ratingCount: 0, popularity: 0, creator: null, workoutHistoryOf: [], updateMetricsCache: jest.fn(), calculateIntensity: jest.fn(), calculateEstimatedTime: jest.fn(), getPrimaryMuscleGroups: jest.fn(), getSecondaryMuscleGroups: jest.fn(), getEquipment: jest.fn(), getDifficulty: jest.fn(), getCategory: jest.fn(), isCustomPlan: jest.fn(), canBeModifiedBy: jest.fn((userId) => userId === 'user1'), toJSON: jest.fn() }, overrides));
        return plan;
    };
    const createMockWorkoutExercise = (overrides = {}) => {
        const exercise = new WorkoutExercise_1.WorkoutExercise();
        Object.assign(exercise, Object.assign({ id: 1, workoutPlan: null, exercise: null, exercise_id: 1, order: 1, sets: 3, repetitions: 12, duration: 0, restTime: 60, intensity: Enums_1.ExerciseIntensity.MODERATE, notes: '', setType: Enums_1.SetType.STRAIGHT, workout_plan_id: 1, calculateVolume: jest.fn(), calculateTotalTime: jest.fn(), getRelativeIntensity: jest.fn(), generateSessionPlanItem: jest.fn(), toJSON: jest.fn() }, overrides));
        return exercise;
    };
    const mockExerciseCategory = new ExerciseCategory_1.ExerciseCategory();
    Object.assign(mockExerciseCategory, {
        id: 1,
        name: 'Strength',
        description: 'Strength training exercises',
        type: 'muscle_group',
        parentId: null,
        icon: '💪',
        color: '#FF0000',
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const mockUser = new User_1.User();
    Object.assign(mockUser, {
        id: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const mockWorkoutPlan = createMockWorkoutPlan({
        targetMuscleGroups: [mockExerciseCategory],
        creator: mockUser
    });
    const mockExercise = new Exercise_1.Exercise();
    Object.assign(mockExercise, {
        id: 1,
        name: 'Test Exercise',
        description: 'Test Exercise Description',
        muscleGroups: ['chest', 'triceps'],
        equipment: [{ id: 1, name: 'Barbell' }],
        difficulty: Enums_1.Difficulty.BEGINNER,
        videoUrl: 'https://example.com/video',
        instructions: ['Step 1', 'Step 2'],
        tips: ['Tip 1', 'Tip 2'],
        variations: [],
        category: mockExerciseCategory,
        measurementType: 'reps',
        types: ['strength'],
        level: 'beginner',
        movementPattern: 'push',
        targetMuscleGroups: [mockExerciseCategory],
        rating: 0,
        ratingCount: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const mockWorkoutExercise = createMockWorkoutExercise({
        workoutPlan: mockWorkoutPlan,
        exercise: mockExercise
    });
    beforeEach(() => {
        jest.clearAllMocks();
        mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
        mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
        mockWorkoutExerciseRepo.findOne.mockResolvedValue(mockWorkoutExercise);
        CacheManager_1.cacheManager.get.mockImplementation(async () => {
            return null;
        });
        baseWorkoutPlan = {
            id: 1,
            name: 'Test Workout',
            description: 'Test Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            isCustom: true,
            creator_id: 'user1',
            exercises: [],
            canBeModifiedBy: (userId) => userId === 'user1'
        };
    });
    describe('createWorkoutPlan', () => {
        const createData = {
            name: 'Test Workout',
            description: 'Test Description',
            exercises: [
                {
                    exercise_id: 1,
                    sets: 3,
                    repetitions: 12,
                    order: 0
                }
            ]
        };
        it('should create a workout plan with exercises', async () => {
            const result = await service.createWorkoutPlan(createData, 'user1');
            expect(result).toEqual(mockWorkoutPlan);
            expect(mockWorkoutPlanRepo.create).toHaveBeenCalledWith(Object.assign(Object.assign({}, createData), { creator_id: 'user1', isCustom: true, difficulty: Enums_1.Difficulty.BEGINNER, workoutCategory: Enums_1.WorkoutCategory.FULL_BODY, estimatedDuration: 30 }));
        });
        it('should throw validation error if required fields are missing', async () => {
            await expect(service.createWorkoutPlan({}, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Name and description are required', 400));
        });
    });
    describe('getWorkoutPlanById', () => {
        it('should return cached workout plan if available', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(mockWorkoutPlan);
            const result = await service.getWorkoutPlanById(1);
            expect(result).toEqual(mockWorkoutPlan);
            expect(mockWorkoutPlanRepo.findById).not.toHaveBeenCalled();
        });
        it('should fetch and cache workout plan if not in cache', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            const result = await service.getWorkoutPlanById(1);
            expect(result).toEqual(mockWorkoutPlan);
            expect(mockWorkoutPlanRepo.findById).toHaveBeenCalledWith(1);
            expect(CacheManager_1.cacheManager.set).toHaveBeenCalled();
        });
        it('should throw not found error if workout plan does not exist', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            mockWorkoutPlanRepo.findById.mockResolvedValue(null);
            await expect(service.getWorkoutPlanById(1))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
        });
        it('should throw authorization error for custom plans', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            await expect(service.getWorkoutPlanById(1, 'user2'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Access denied', 403));
        });
    });
    describe('updateWorkoutPlan', () => {
        const updateData = {
            name: 'Updated Workout',
            description: 'Test Description',
            difficulty: 'BEGINNER',
            workoutCategory: 'FULL_BODY',
            targetMuscleGroups: [mockExerciseCategory]
        };
        it('should update workout plan and its exercises', async () => {
            const updatedPlan = Object.assign(Object.assign({}, mockWorkoutPlan), updateData);
            mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
            mockWorkoutPlanRepo.update.mockResolvedValue({ affected: 1 });
            mockWorkoutPlanRepo.findOne.mockResolvedValueOnce(Object.assign(Object.assign({}, mockWorkoutPlan), updateData));
            const result = await service.updateWorkoutPlan(1, updateData, 'user1');
            expect(result).toEqual(Object.assign(Object.assign({}, mockWorkoutPlan), updateData));
            expect(mockWorkoutPlanRepo.update).toHaveBeenCalledWith(1, updateData);
        });
        it('should throw not found error if workout plan does not exist', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(null);
            await expect(service.updateWorkoutPlan(1, updateData, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
        });
        it('should throw authorization error for custom plans', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            await expect(service.updateWorkoutPlan(1, updateData, 'user2'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Update denied', 403));
        });
    });
    describe('deleteWorkoutPlan', () => {
        it('should delete workout plan and invalidate cache', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            mockWorkoutPlanRepo.delete.mockResolvedValue({ affected: 1 });
            const result = await service.deleteWorkoutPlan(1, 'user1');
            expect(result).toBe(true);
            expect(mockWorkoutPlanRepo.delete).toHaveBeenCalledWith(1);
            expect(CacheManager_1.cacheManager.delete).toHaveBeenCalled();
        });
        it('should throw not found error if workout plan does not exist', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(null);
            await expect(service.deleteWorkoutPlan(1, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
        });
        it('should throw authorization error for custom plans', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            await expect(service.deleteWorkoutPlan(1, 'user2'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Delete denied', 403));
        });
    });
    describe('getWorkoutPlans', () => {
        const filters = {
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY
        };
        it('should return cached workout plans if available', async () => {
            const cachedResult = {
                workoutPlans: [mockWorkoutPlan],
                total: 1
            };
            CacheManager_1.cacheManager.get.mockResolvedValue(cachedResult);
            const result = await service.getWorkoutPlans(filters);
            expect(result).toEqual(cachedResult);
            expect(mockWorkoutPlanRepo.findWithFilters).not.toHaveBeenCalled();
        });
        it('should fetch and cache workout plans if not in cache', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            mockWorkoutPlanRepo.findWithFilters.mockResolvedValue([[mockWorkoutPlan], 1]);
            const result = await service.getWorkoutPlans(filters);
            expect(result).toEqual({
                workoutPlans: [mockWorkoutPlan],
                total: 1
            });
            expect(mockWorkoutPlanRepo.findWithFilters).toHaveBeenCalledWith(filters);
            expect(CacheManager_1.cacheManager.set).toHaveBeenCalled();
        });
        it('should filter by user if userPlansOnly is true', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            mockWorkoutPlanRepo.findWithFilters.mockResolvedValue([[mockWorkoutPlan], 1]);
            await service.getWorkoutPlans({ userPlansOnly: true }, 'user1');
            expect(mockWorkoutPlanRepo.findWithFilters).toHaveBeenCalledWith({
                userPlansOnly: true,
                creatorId: 'user1'
            });
        });
    });
    describe('addExerciseToWorkoutPlan', () => {
        const exerciseData = {
            exercise_id: 1,
            sets: 3,
            repetitions: 12,
            restTime: 60,
            intensity: 'MODERATE',
            order: 1
        };
        it('should add exercise to workout plan', async () => {
            const newWorkoutExercise = Object.assign(Object.assign({}, mockWorkoutExercise), exerciseData);
            const updatedPlan = Object.assign(Object.assign({}, mockWorkoutPlan), { exercises: [...mockWorkoutPlan.exercises, newWorkoutExercise] });
            mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
            mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
            mockWorkoutExerciseRepo.create.mockReturnValue(newWorkoutExercise);
            mockWorkoutExerciseRepo.save.mockResolvedValue(newWorkoutExercise);
            mockWorkoutPlanRepo.findOneOrFail.mockResolvedValue(updatedPlan);
            const result = await service.addExerciseToWorkoutPlan(1, exerciseData, 'user1');
            expect(result).toEqual(updatedPlan);
            expect(mockWorkoutExerciseRepo.create).toHaveBeenCalledWith(expect.objectContaining(exerciseData));
        });
        it('should throw validation error if exercise_id is missing', async () => {
            await expect(service.addExerciseToWorkoutPlan(1, {}, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Exercise ID required', 400));
        });
        it('should throw not found error if exercise does not exist', async () => {
            mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
            mockExerciseRepo.findById.mockResolvedValue(null);
            await expect(service.addExerciseToWorkoutPlan(1, exerciseData, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
        });
    });
    describe('updateExerciseInWorkoutPlan', () => {
        const exerciseData = {
            sets: 4,
            repetitions: 15,
            restTime: 60,
            intensity: 'MODERATE'
        };
        it('should update exercise in workout plan', async () => {
            const updatedWorkoutExercise = Object.assign(Object.assign({}, mockWorkoutExercise), exerciseData);
            const updatedPlan = Object.assign(Object.assign({}, mockWorkoutPlan), { exercises: [updatedWorkoutExercise] });
            mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
            mockWorkoutExerciseRepo.findOne.mockResolvedValue(mockWorkoutExercise);
            mockWorkoutExerciseRepo.update.mockResolvedValue(undefined);
            mockWorkoutPlanRepo.findOneOrFail.mockResolvedValue(updatedPlan);
            const result = await service.updateExerciseInWorkoutPlan(1, 1, exerciseData, 'user1');
            expect(result).toEqual(updatedPlan);
            expect(mockWorkoutExerciseRepo.update).toHaveBeenCalledWith(1, exerciseData);
        });
        it('should throw not found error if exercise does not exist in workout plan', async () => {
            const emptyPlan = createMockWorkoutPlan({ exercises: [] });
            mockWorkoutPlanRepo.findById.mockResolvedValue(emptyPlan);
            await expect(service.updateExerciseInWorkoutPlan(1, 1, exerciseData, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
        });
    });
    describe('removeExerciseFromWorkoutPlan', () => {
        it('should remove exercise and reorder remaining exercises', async () => {
            const mockWorkoutExercises = [
                Object.assign(Object.assign({}, mockWorkoutExercise), { id: 1, order: 0 }),
                Object.assign(Object.assign({}, mockWorkoutExercise), { id: 2, order: 1 })
            ];
            const mockWorkoutPlanWithExercises = Object.assign(Object.assign({}, mockWorkoutPlan), { exercises: mockWorkoutExercises });
            mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlanWithExercises);
            mockWorkoutExerciseRepo.delete.mockResolvedValue(undefined);
            mockWorkoutExerciseRepo.find.mockResolvedValue([mockWorkoutExercises[0]]);
            mockWorkoutPlanRepo.findOneOrFail.mockResolvedValue(Object.assign(Object.assign({}, mockWorkoutPlanWithExercises), { exercises: [mockWorkoutExercises[0]] }));
            const result = await service.removeExerciseFromWorkoutPlan(1, 2, 'user1');
            expect(result).toEqual(Object.assign(Object.assign({}, mockWorkoutPlanWithExercises), { exercises: [mockWorkoutExercises[0]] }));
            expect(mockWorkoutExerciseRepo.delete).toHaveBeenCalledWith(2);
        });
        it('should throw not found error if exercise does not exist in workout plan', async () => {
            const emptyPlan = createMockWorkoutPlan({ exercises: [] });
            mockWorkoutPlanRepo.findById.mockResolvedValue(emptyPlan);
            await expect(service.removeExerciseFromWorkoutPlan(1, 1, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
        });
    });
    describe('reorderExercisesInWorkoutPlan', () => {
        const exerciseOrders = [
            { id: 1, order: 0 },
            { id: 2, order: 1 }
        ];
        it('should reorder exercises in workout plan', async () => {
            const mockWorkoutExercises = [
                Object.assign(Object.assign({}, mockWorkoutExercise), { id: 1, order: 0 }),
                Object.assign(Object.assign({}, mockWorkoutExercise), { id: 2, order: 1 })
            ];
            const mockWorkoutPlanWithExercises = Object.assign(Object.assign({}, mockWorkoutPlan), { exercises: mockWorkoutExercises });
            mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlanWithExercises);
            mockWorkoutExerciseRepo.update.mockResolvedValue(undefined);
            mockWorkoutPlanRepo.findOneOrFail.mockResolvedValue(mockWorkoutPlanWithExercises);
            const result = await service.reorderExercisesInWorkoutPlan(1, exerciseOrders, 'user1');
            expect(result).toEqual(mockWorkoutPlanWithExercises);
            expect(mockWorkoutExerciseRepo.update).toHaveBeenCalledTimes(2);
        });
        it('should throw not found error if exercise IDs are invalid', async () => {
            const singleExercisePlan = createMockWorkoutPlan({
                exercises: [mockWorkoutExercise]
            });
            mockWorkoutPlanRepo.findById.mockResolvedValue(singleExercisePlan);
            await expect(service.reorderExercisesInWorkoutPlan(1, exerciseOrders, 'user1'))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Invalid exercise IDs', 404));
        });
    });
});
//# sourceMappingURL=WorkoutPlanService.test.js.map