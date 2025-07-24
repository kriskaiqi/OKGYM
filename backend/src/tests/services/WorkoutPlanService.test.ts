import { WorkoutPlanRepository } from '../../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../../repositories/ExerciseRepository';
import { WorkoutPlan } from '../../models/WorkoutPlan';
import { WorkoutExercise } from '../../models/WorkoutExercise';
import { Exercise } from '../../models/Exercise';
import { AppError, ErrorType } from '../../utils/errors';
import { Difficulty, WorkoutCategory, ExerciseIntensity, SetType } from '../../models/shared/Enums';
import { cacheManager } from '../../services/CacheManager';
import { ExerciseCategory } from '../../models/ExerciseCategory';
import { User } from '../../models/User';
import { setupTransactionMocking } from '../utils/test-helpers';

// Setup mocking for transaction helpers, database, and cache
setupTransactionMocking();

// Mock the repositories
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

// Mock cache manager
jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn().mockImplementation(async () => null),
    set: jest.fn().mockImplementation(async () => {}),
    delete: jest.fn().mockImplementation(async () => {}),
    deleteByPattern: jest.fn().mockImplementation(async () => {}),
    clear: jest.fn().mockImplementation(async () => {}),
    keys: jest.fn().mockImplementation(async () => []),
    getStats: jest.fn().mockReturnValue({}),
    resetStats: jest.fn(),
    setEnabled: jest.fn()
  }
}));

// Define interfaces for our mocks to ensure type safety
interface MockWorkoutExercise {
  id: number;
  exercise_id: number;
  sets: number;
  repetitions?: number;
  duration?: number;
  restTime?: number;
  order: number;
  workoutPlan?: { id: number };
  [key: string]: any;
}

interface MockWorkoutPlan {
  id: number;
  name: string;
  description: string;
  difficulty: Difficulty;
  workoutCategory: WorkoutCategory;
  isCustom: boolean;
  creator_id: string;
  exercises: MockWorkoutExercise[];
  canBeModifiedBy: (userId: string) => boolean;
  [key: string]: any;
}

// Define the variables to hold mock repositories
let mockWorkoutPlanRepo: any;
let mockWorkoutExerciseRepo: any;
let mockExerciseRepo: any;
let service: any;

// Immediately after the mock declarations, set up the mock repository variables
mockWorkoutPlanRepo = new (require('../../repositories/WorkoutPlanRepository').WorkoutPlanRepository)();
mockWorkoutExerciseRepo = new (require('../../repositories/WorkoutExerciseRepository').WorkoutExerciseRepository)();
mockExerciseRepo = new (require('../../repositories/ExerciseRepository').ExerciseRepository)();

// Create the service with the mock repositories
const { WorkoutPlanService } = require('../../services/WorkoutPlanService');
service = new WorkoutPlanService(mockWorkoutPlanRepo, mockWorkoutExerciseRepo, mockExerciseRepo);

describe('WorkoutPlanService', () => {
  let baseWorkoutPlan: MockWorkoutPlan;

  const createMockWorkoutPlan = (overrides: Partial<WorkoutPlan> = {}): WorkoutPlan => {
    const plan = new WorkoutPlan();
    Object.assign(plan, {
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
      creator: null,
      workoutHistoryOf: [],
      updateMetricsCache: jest.fn(),
      calculateIntensity: jest.fn(),
      calculateEstimatedTime: jest.fn(),
      getPrimaryMuscleGroups: jest.fn(),
      getSecondaryMuscleGroups: jest.fn(),
      getEquipment: jest.fn(),
      getDifficulty: jest.fn(),
      getCategory: jest.fn(),
      isCustomPlan: jest.fn(),
      canBeModifiedBy: jest.fn((userId) => userId === 'user1'),
      toJSON: jest.fn(),
      ...overrides
    });
    return plan;
  };

  const createMockWorkoutExercise = (overrides: Partial<WorkoutExercise> = {}): WorkoutExercise => {
    const exercise = new WorkoutExercise();
    Object.assign(exercise, {
      id: 1,
      workoutPlan: null,
      exercise: null,
      exercise_id: 1,
      order: 1,
      sets: 3,
      repetitions: 12,
      duration: 0,
      restTime: 60,
      intensity: ExerciseIntensity.MODERATE,
      notes: '',
      setType: SetType.STRAIGHT,
      workout_plan_id: 1,
      calculateVolume: jest.fn(),
      calculateTotalTime: jest.fn(),
      getRelativeIntensity: jest.fn(),
      generateSessionPlanItem: jest.fn(),
      toJSON: jest.fn(),
      ...overrides
    });
    return exercise;
  };

  const mockExerciseCategory = new ExerciseCategory();
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

  const mockUser = new User();
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

  const mockExercise = new Exercise();
  Object.assign(mockExercise, {
    id: 1,
    name: 'Test Exercise',
    description: 'Test Exercise Description',
    muscleGroups: ['chest', 'triceps'],
    equipment: [{ id: 1, name: 'Barbell' }],
    difficulty: Difficulty.BEGINNER,
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
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup common mock behavior
    mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
    mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
    mockWorkoutExerciseRepo.findOne.mockResolvedValue(mockWorkoutExercise);
    
    // Make sure caching is mocked consistently
    (cacheManager.get as jest.Mock).mockImplementation(async () => {
      return null; // Default to cache miss, override in specific tests
    });

    baseWorkoutPlan = {
      id: 1,
      name: 'Test Workout',
      description: 'Test Description',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      isCustom: true,
      creator_id: 'user1',
      exercises: [],
      canBeModifiedBy: (userId: string) => userId === 'user1'
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
      expect(mockWorkoutPlanRepo.create).toHaveBeenCalledWith({
        ...createData,
        creator_id: 'user1',
        isCustom: true,
        difficulty: Difficulty.BEGINNER,
        workoutCategory: WorkoutCategory.FULL_BODY,
        estimatedDuration: 30
      });
    });

    it('should throw validation error if required fields are missing', async () => {
      await expect(service.createWorkoutPlan({}, 'user1'))
        .rejects
        .toThrow(new AppError(ErrorType.VALIDATION_ERROR, 'Name and description are required', 400));
    });
  });

  describe('getWorkoutPlanById', () => {
    it('should return cached workout plan if available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockWorkoutPlan);

      const result = await service.getWorkoutPlanById(1);

      expect(result).toEqual(mockWorkoutPlan);
      expect(mockWorkoutPlanRepo.findById).not.toHaveBeenCalled();
    });

    it('should fetch and cache workout plan if not in cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);

      const result = await service.getWorkoutPlanById(1);

      expect(result).toEqual(mockWorkoutPlan);
      expect(mockWorkoutPlanRepo.findById).toHaveBeenCalledWith(1);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw not found error if workout plan does not exist', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      mockWorkoutPlanRepo.findById.mockResolvedValue(null);

      await expect(service.getWorkoutPlanById(1))
        .rejects
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
    });

    it('should throw authorization error for custom plans', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);

      await expect(service.getWorkoutPlanById(1, 'user2'))
        .rejects
        .toThrow(new AppError(ErrorType.AUTHORIZATION_ERROR, 'Access denied', 403));
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
      const updatedPlan = {
        ...mockWorkoutPlan,
        ...updateData
      };

      mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlan);
      mockWorkoutPlanRepo.update.mockResolvedValue({ affected: 1 });
      mockWorkoutPlanRepo.findOne.mockResolvedValueOnce({
        ...mockWorkoutPlan,
        ...updateData
      });

      const result = await service.updateWorkoutPlan(1, updateData, 'user1');

      expect(result).toEqual({
        ...mockWorkoutPlan,
        ...updateData
      });
      expect(mockWorkoutPlanRepo.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw not found error if workout plan does not exist', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(null);

      await expect(service.updateWorkoutPlan(1, updateData, 'user1'))
        .rejects
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
    });

    it('should throw authorization error for custom plans', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);

      await expect(service.updateWorkoutPlan(1, updateData, 'user2'))
        .rejects
        .toThrow(new AppError(ErrorType.AUTHORIZATION_ERROR, 'Update denied', 403));
    });
  });

  describe('deleteWorkoutPlan', () => {
    it('should delete workout plan and invalidate cache', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
      mockWorkoutPlanRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteWorkoutPlan(1, 'user1');

      expect(result).toBe(true);
      expect(mockWorkoutPlanRepo.delete).toHaveBeenCalledWith(1);
      expect(cacheManager.delete).toHaveBeenCalled();
    });

    it('should throw not found error if workout plan does not exist', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(null);

      await expect(service.deleteWorkoutPlan(1, 'user1'))
        .rejects
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Workout plan with ID 1 not found', 404));
    });

    it('should throw authorization error for custom plans', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);

      await expect(service.deleteWorkoutPlan(1, 'user2'))
        .rejects
        .toThrow(new AppError(ErrorType.AUTHORIZATION_ERROR, 'Delete denied', 403));
    });
  });

  describe('getWorkoutPlans', () => {
    const filters = {
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY
    };

    it('should return cached workout plans if available', async () => {
      const cachedResult = {
        workoutPlans: [mockWorkoutPlan],
        total: 1
      };
      (cacheManager.get as jest.Mock).mockResolvedValue(cachedResult);

      const result = await service.getWorkoutPlans(filters);

      expect(result).toEqual(cachedResult);
      expect(mockWorkoutPlanRepo.findWithFilters).not.toHaveBeenCalled();
    });

    it('should fetch and cache workout plans if not in cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      mockWorkoutPlanRepo.findWithFilters.mockResolvedValue([[mockWorkoutPlan], 1]);

      const result = await service.getWorkoutPlans(filters);

      expect(result).toEqual({
        workoutPlans: [mockWorkoutPlan],
        total: 1
      });
      expect(mockWorkoutPlanRepo.findWithFilters).toHaveBeenCalledWith(filters);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should filter by user if userPlansOnly is true', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
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
      const newWorkoutExercise = {
        ...mockWorkoutExercise,
        ...exerciseData
      };

      const updatedPlan = {
        ...mockWorkoutPlan,
        exercises: [...mockWorkoutPlan.exercises, newWorkoutExercise]
      };

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
        .toThrow(new AppError(ErrorType.VALIDATION_ERROR, 'Exercise ID required', 400));
    });

    it('should throw not found error if exercise does not exist', async () => {
      mockWorkoutPlanRepo.findById.mockResolvedValue(mockWorkoutPlan);
      mockExerciseRepo.findById.mockResolvedValue(null);

      await expect(service.addExerciseToWorkoutPlan(1, exerciseData, 'user1'))
        .rejects
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
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
      const updatedWorkoutExercise = {
        ...mockWorkoutExercise,
        ...exerciseData
      };

      const updatedPlan = {
        ...mockWorkoutPlan,
        exercises: [updatedWorkoutExercise]
      };

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
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
    });
  });

  describe('removeExerciseFromWorkoutPlan', () => {
    it('should remove exercise and reorder remaining exercises', async () => {
      const mockWorkoutExercises = [
        { ...mockWorkoutExercise, id: 1, order: 0 },
        { ...mockWorkoutExercise, id: 2, order: 1 }
      ];

      const mockWorkoutPlanWithExercises = {
        ...mockWorkoutPlan,
        exercises: mockWorkoutExercises
      };

      mockWorkoutPlanRepo.findOne.mockResolvedValue(mockWorkoutPlanWithExercises);
      mockWorkoutExerciseRepo.delete.mockResolvedValue(undefined);
      mockWorkoutExerciseRepo.find.mockResolvedValue([mockWorkoutExercises[0]]);
      mockWorkoutPlanRepo.findOneOrFail.mockResolvedValue({
        ...mockWorkoutPlanWithExercises,
        exercises: [mockWorkoutExercises[0]]
      });

      const result = await service.removeExerciseFromWorkoutPlan(1, 2, 'user1');

      expect(result).toEqual({
        ...mockWorkoutPlanWithExercises,
        exercises: [mockWorkoutExercises[0]]
      });
      expect(mockWorkoutExerciseRepo.delete).toHaveBeenCalledWith(2);
    });

    it('should throw not found error if exercise does not exist in workout plan', async () => {
      const emptyPlan = createMockWorkoutPlan({ exercises: [] });
      mockWorkoutPlanRepo.findById.mockResolvedValue(emptyPlan);

      await expect(service.removeExerciseFromWorkoutPlan(1, 1, 'user1'))
        .rejects
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Exercise with ID 1 not found', 404));
    });
  });

  describe('reorderExercisesInWorkoutPlan', () => {
    const exerciseOrders = [
      { id: 1, order: 0 },
      { id: 2, order: 1 }
    ];

    it('should reorder exercises in workout plan', async () => {
      const mockWorkoutExercises = [
        { ...mockWorkoutExercise, id: 1, order: 0 },
        { ...mockWorkoutExercise, id: 2, order: 1 }
      ];

      const mockWorkoutPlanWithExercises = {
        ...mockWorkoutPlan,
        exercises: mockWorkoutExercises
      };

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
        .toThrow(new AppError(ErrorType.NOT_FOUND, 'Invalid exercise IDs', 404));
    });
  });
}); 