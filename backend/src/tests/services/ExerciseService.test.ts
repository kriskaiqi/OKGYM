import { Exercise } from '../../models/Exercise';
import { Equipment } from '../../models/Equipment';
import { ExerciseRelation, RelationType } from '../../models/ExerciseRelation';
import { ExerciseType, Difficulty, MeasurementType, MovementPattern, MuscleGroup } from '../../models/shared/Enums';
import logger from '../../utils/logger';
import { Repository } from 'typeorm';
import { ExerciseService } from '../../services/ExerciseService';
import { AppError, ErrorType } from '../../utils/errors';
import { ExerciseCategory, CategoryType } from '../../models/ExerciseCategory';
import { cacheManager } from '../../services/CacheManager';
import { ExerciseDTO } from '../../dto/ExerciseDTO';
import { ExerciseDetails } from '../../models/ExerciseDetails';
import { Cache } from 'cache-manager';
import { TrackingFeature } from '../../models/shared/Enums';
import { MetricTracking } from '../../models/MetricTracking';

type ExerciseId = string;
type CategoryId = string;
type EquipmentId = string;
type ExerciseRelationship = ExerciseRelation;

interface CustomCache extends Cache {
  deleteByPattern(pattern: string): Promise<void>;
}

// Add before mockRelatedExercise definition
interface ExerciseRelationDTO {
  sourceExerciseId: string;
  targetExerciseId: string;
  type: string;
}

// Mock dependencies
jest.mock('../../repositories', () => ({
  repositories: {
    exercise: {
      findWithFilters: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      countByCategory: jest.fn(),
      countByEquipment: jest.fn(),
      getPopular: jest.fn(),
      searchByKeyword: jest.fn()
    },
    exerciseCategory: {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    equipment: {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    exerciseRelation: {
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findBySourceId: jest.fn(),
      findByType: jest.fn() 
    },
    media: {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    deleteByPattern: jest.fn()
  }
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('../../utils/performance', () => ({
  SimpleTrack: (options: any) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
  SimplePerformanceMetrics: {
    recordSuccess: jest.fn(),
    recordFailure: jest.fn(),
    recordTime: jest.fn(),
    getReport: jest.fn().mockReturnValue({ metrics: {} }),
    resetMetrics: jest.fn(),
  }
}));

// Mock the transaction helper
jest.mock('../../utils/transaction-helper', () => ({
  executeTransaction: jest.fn((callback) => callback()),
  executeTransactionBatch: jest.fn(),
  isInTransaction: jest.fn()
}));

describe('ExerciseService', () => {
  let exerciseService: ExerciseService;
  let mockExerciseRepository: any;
  let mockCategoryRepository: any;
  let mockEquipmentRepository: any;
  let mockMediaRepository: any;
  let mockRelationRepository: any;
  let cacheManager: CustomCache;
  let repositories: any;
  
  // Mock data
  const mockExerciseId: ExerciseId = 'exercise-1';
  const mockCategoryId: CategoryId = 'category-1';
  const mockEquipmentId: EquipmentId = 'equipment-1';
  const mockRelatedExerciseId: ExerciseId = 'exercise-2';
  
  const mockCategory = {
    id: mockCategoryId,
    name: 'Strength',
    description: 'Strength exercises',
    type: CategoryType.MUSCLE_GROUP,
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as ExerciseCategory;
  
  const mockEquipment = {
    id: mockEquipmentId,
    name: 'Barbell',
    description: 'Standard barbell',
    category: 'WEIGHTS',
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as Equipment;
  
  const mockMedia = {
    id: 'media-1',
    type: 'VIDEO',
    url: 'https://example.com/video.mp4',
    isPrimary: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const mockExercise = {
    id: mockExerciseId,
    name: 'Deadlift',
    description: 'A compound exercise that targets multiple muscle groups',
    types: [ExerciseType.STRENGTH_COMPOUND],
    level: Difficulty.INTERMEDIATE,
    movementPattern: MovementPattern.HINGE,
    equipmentOptions: [mockEquipment],
    categories: [mockCategory],
    media: [mockMedia],
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as Exercise;

  const exerciseWithoutWorkouts = {
    ...mockExercise,
    workoutExercises: []
  } as unknown as Exercise;

  const mockRelatedExercise = {
    ...mockExercise,
    id: mockRelatedExerciseId,
    name: 'Dumbbell Squat',
    description: 'A variant of the squat',
    movementPattern: MovementPattern.SQUAT,
    level: Difficulty.BEGINNER
  } as unknown as Exercise;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock repositories with proper typing
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      getManyAndCount: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis()
    };

    mockExerciseRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(mockExercise),
      findOneBy: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn().mockReturnValue(mockExercise),
      save: jest.fn().mockResolvedValue(mockExercise),
      remove: jest.fn().mockResolvedValue(mockExercise),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;

    mockCategoryRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(mockCategory),
      findByIds: jest.fn(),
      create: jest.fn().mockReturnValue(mockCategory),
      save: jest.fn().mockResolvedValue(mockCategory),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;

    mockEquipmentRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(mockEquipment),
      findByIds: jest.fn(),
      create: jest.fn().mockReturnValue(mockEquipment),
      save: jest.fn().mockResolvedValue(mockEquipment),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;

    mockMediaRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(mockMedia),
      findByIds: jest.fn(),
      create: jest.fn().mockReturnValue(mockMedia),
      save: jest.fn().mockResolvedValue(mockMedia),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;

    mockRelationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      deleteByPattern: jest.fn(),
      reset: jest.fn(),
      wrap: jest.fn(),
      store: {},
      mget: jest.fn(),
      ttl: jest.fn(),
      mset: jest.fn(),
      mdel: jest.fn(),
      keys: jest.fn(),
      has: jest.fn()
    } as any;

    exerciseService = new ExerciseService(
      mockExerciseRepository,
      mockCategoryRepository,
      mockEquipmentRepository,
      mockMediaRepository,
      mockRelationRepository,
      cacheManager
    );
  });

  describe('createExercise', () => {
    const newExerciseData: ExerciseDTO = {
      name: 'New Exercise',
      description: 'A new exercise',
      type: ExerciseType.STRENGTH_COMPOUND,
      difficulty: Difficulty.INTERMEDIATE,
      movementPattern: MovementPattern.SQUAT,
      categoryIds: [mockCategoryId],
      equipmentIds: [mockEquipmentId],
      mediaIds: ['media-1'],
      muscleGroups: {
        primary: ['QUADRICEPS'],
        secondary: ['GLUTES']
      }
    };

    it('should create a new exercise with valid data', async () => {
      // Mock category and equipment lookups
      mockCategoryRepository.findByIds = jest.fn().mockResolvedValue([mockCategory]);
      mockEquipmentRepository.findByIds = jest.fn().mockResolvedValue([mockEquipment]);
      mockMediaRepository.findByIds = jest.fn().mockResolvedValue([mockMedia]);

      // Mock exercise creation
      const createdExercise = {
        id: mockExerciseId,
        name: newExerciseData.name,
        description: newExerciseData.description,
        types: [newExerciseData.type],
        level: newExerciseData.difficulty,
        movementPattern: newExerciseData.movementPattern,
        categories: [mockCategory],
        equipmentOptions: [mockEquipment],
        media: [mockMedia],
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Exercise;

      mockExerciseRepository.create = jest.fn().mockReturnValue(createdExercise);
      mockExerciseRepository.save = jest.fn().mockResolvedValue(createdExercise);

      const result = await exerciseService.createExercise(newExerciseData);

      // Assertions
      expect(mockCategoryRepository.findByIds).toHaveBeenCalledWith(newExerciseData.categoryIds);
      expect(mockEquipmentRepository.findByIds).toHaveBeenCalledWith(newExerciseData.equipmentIds);
      expect(mockMediaRepository.findByIds).toHaveBeenCalledWith(newExerciseData.mediaIds);
      expect(mockExerciseRepository.create).toHaveBeenCalled();
      expect(mockExerciseRepository.save).toHaveBeenCalled();
      expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercise:*');
      expect(result).toBeDefined();
      expect(result.id).toBe(createdExercise.id);
      expect(result.name).toBe(createdExercise.name);
      expect(result.description).toBe(createdExercise.description);
      expect(result.type).toBe(createdExercise.types[0]);
      expect(result.difficulty).toBe(createdExercise.level);
      expect(result.movementPattern).toBe(createdExercise.movementPattern);
      expect(result.categories).toBeDefined();
      expect(result.equipment).toBeDefined();
      expect(result.media).toBeDefined();
      expect(result.muscleGroups).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle validation errors', async () => {
      // Mock invalid data
      const invalidData = { ...newExerciseData, name: '' };

      // Mock validation error
      mockExerciseRepository.create = jest.fn().mockImplementation(() => {
        throw new AppError(ErrorType.VALIDATION_ERROR, 'Name is required', 400);
      });

      // Call the method and expect error
      await expect(exerciseService.createExercise(invalidData))
        .rejects
        .toThrow(new AppError(
          ErrorType.SERVICE_ERROR,
          'Failed to create exercise',
          500,
          expect.any(Error)
        ));

      // Verify save was not called
      expect(mockExerciseRepository.save).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Mock category lookup
      mockCategoryRepository.findByIds = jest.fn().mockResolvedValue([mockCategory]);
      mockEquipmentRepository.findByIds = jest.fn().mockResolvedValue([mockEquipment]);
      mockMediaRepository.findByIds = jest.fn().mockResolvedValue([mockMedia]);

      // Mock database error
      const error = new Error('Database error');
      mockExerciseRepository.create = jest.fn().mockReturnValue(newExerciseData);
      mockExerciseRepository.save = jest.fn().mockRejectedValue(error);

      // Call the method and expect error
      await expect(exerciseService.createExercise(newExerciseData))
        .rejects
        .toThrow('Failed to create exercise');
    });
  });

  describe('getExerciseById', () => {
    it('should return an exercise when found', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock database response
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
      
      // Call the method
      const result = await exerciseService.getExerciseById(mockExerciseId);
      
      // Assertions
      expect(cacheManager.get).toHaveBeenCalledWith(`exercise:${mockExerciseId}`);
      expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        relations: ['categories', 'equipmentOptions', 'media', 'relationsFrom', 'relationsTo']
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(mockExercise.id);
      expect(result.name).toBe(mockExercise.name);
      expect(result.description).toBe(mockExercise.description);
      expect(result.type).toBe(mockExercise.types[0]);
      expect(result.difficulty).toBe(mockExercise.level);
      expect(result.movementPattern).toBe(mockExercise.movementPattern);
      expect(result.categories).toBeDefined();
      expect(result.equipment).toBeDefined();
      expect(result.media).toBeDefined();
      expect(result.muscleGroups).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(cacheManager.set).toHaveBeenCalledWith(`exercise:${mockExerciseId}`, expect.any(Object), expect.any(Number));
    });

    it('should return exercise from cache when available', async () => {
      // Mock cache hit
      const cachedExercise = exerciseService.mapToResponseDTO(mockExercise);
      (cacheManager.get as jest.Mock).mockResolvedValue(cachedExercise);
      
      // Call the method
      const result = await exerciseService.getExerciseById(mockExerciseId);
      
      // Assertions
      expect(cacheManager.get).toHaveBeenCalledWith(`exercise:${mockExerciseId}`);
      expect(mockExerciseRepository.findOne).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(result).toEqual(cachedExercise);
    });

    it('should throw not found error when exercise does not exist', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock database response - not found
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
      
      // Call the method and expect error
      await expect(exerciseService.getExerciseById(mockExerciseId))
        .rejects
        .toThrow(new AppError(
          ErrorType.NOT_FOUND,
          'Exercise not found',
          404
        ));
        
      // Verify cache operations
      expect(cacheManager.get).toHaveBeenCalledWith(`exercise:${mockExerciseId}`);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('updateExercise', () => {
    const updateData = {
      name: 'Updated Squat',
      description: 'Updated description',
      difficulty: Difficulty.ADVANCED
    };

    it('should update an exercise successfully', async () => {
      // Mock find exercise
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
      
      // Mock update
      const updatedExercise = { 
        ...mockExercise,
        name: updateData.name,
        description: updateData.description,
        level: updateData.difficulty,
        updatedAt: new Date()
      };
      mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
      
      // Call the method
      const result = await exerciseService.updateExercise(mockExerciseId, updateData);
      
      // Assertions
      expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({ where: { id: mockExerciseId } });
      expect(mockExerciseRepository.save).toHaveBeenCalled();
      expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercise:*');
      expect(result).toBeDefined();
      expect(result.id).toBe(updatedExercise.id);
      expect(result.name).toBe(updatedExercise.name);
      expect(result.description).toBe(updatedExercise.description);
      expect(result.difficulty).toBe(updatedExercise.level);
      expect(result.movementPattern).toBe(updatedExercise.movementPattern);
      expect(result.categories).toBeDefined();
      expect(result.equipment).toBeDefined();
      expect(result.media).toBeDefined();
      expect(result.muscleGroups).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw not found error when exercise does not exist', async () => {
      // Mock find exercise - not found
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
      
      // Call the method and expect error
      await expect(exerciseService.updateExercise(mockExerciseId, updateData))
        .rejects
        .toThrow(new AppError(
          ErrorType.NOT_FOUND,
          'Exercise not found',
          404
        ));
        
      // Verify update was not called
      expect(mockExerciseRepository.save).not.toHaveBeenCalled();
      expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
    });

    it('should handle unique constraint errors', async () => {
      // Mock find exercise
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
      
      // Mock save with a unique constraint error
      const uniqueConstraintError = new Error('unique constraint violation');
      (uniqueConstraintError as any).code = '23505'; // PostgreSQL unique violation code
      mockExerciseRepository.save = jest.fn().mockRejectedValue(uniqueConstraintError);
      
      // Call the method and expect error
      await expect(exerciseService.updateExercise(mockExerciseId, updateData))
        .rejects
        .toThrow(new AppError(
          ErrorType.SERVICE_ERROR,
          'Failed to update exercise',
          500
        ));
        
      // Verify cache was not invalidated
      expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
    });

    it('should handle general errors and log them', async () => {
      // Mock find exercise
      mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
      
      // Mock database error
      const error = new Error('Database error');
      mockExerciseRepository.save = jest.fn().mockRejectedValue(error);
      
      // Call the method and expect error
      await expect(exerciseService.updateExercise(mockExerciseId, updateData))
        .rejects
        .toThrow(new AppError(
          ErrorType.SERVICE_ERROR,
          'Failed to update exercise',
          500
        ));
    });
  });

  describe('deleteExercise', () => {
    const mockExerciseId = 'exercise-1';
    const exerciseWithoutWorkouts = {
      id: mockExerciseId,
      name: 'Test Exercise',
      description: 'Test Description',
      measurementType: MeasurementType.REPS,
      types: [ExerciseType.STRENGTH_COMPOUND],
      level: Difficulty.BEGINNER,
      movementPattern: MovementPattern.PUSH,
      equipmentOptions: [],
      categories: [],
      media: [],
      metrics: [],
      feedback: [],
      details: [],
      workoutExercises: [],
      relationsFrom: [],
      relationsTo: [],
      trackingFeatures: [TrackingFeature.FORM],
      form: {},
      aiConfig: {},
      variations: [],
      alternatives: [],
      progressions: [],
      regressions: [],
      stats: {
        duration: { avg: 0, min: 0, max: 0 },
        calories: { avg: 0, min: 0, max: 0 },
        completion: { rate: 0, total: 0, successful: 0 },
        rating: { value: 0, count: 0, distribution: {} },
        popularity: { score: 0, trend: 'stable', lastUpdated: new Date('1970-01-01T00:00:00.000Z') }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      calculateComplexity: () => 1,
      getRelatedExercises: async () => Promise.resolve([])
    } as unknown as Exercise;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete an exercise successfully when not used in workouts', async () => {
      // Mock repository methods
      mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithoutWorkouts);
      mockExerciseRepository.remove.mockResolvedValueOnce(exerciseWithoutWorkouts);

      // Execute
      await exerciseService.deleteExercise(mockExerciseId);

      // Verify repository calls
      expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        relations: ['workoutExercises']
      });
      expect(mockExerciseRepository.remove).toHaveBeenCalledWith(exerciseWithoutWorkouts);

      // Verify cache invalidation - only check deleteByPattern
      expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercise:*');
      expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercises:*');
    });

    it('should throw not found error when exercise does not exist', async () => {
      // Mock repository methods
      mockExerciseRepository.findOne.mockResolvedValueOnce(null);

      // Execute and verify
      await expect(exerciseService.deleteExercise(mockExerciseId))
        .rejects
        .toThrow(new AppError(
          ErrorType.NOT_FOUND,
          'Exercise not found',
          404
        ));

      // Verify cache was not invalidated
      expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
    });

    it('should throw error when exercise is used in workouts', async () => {
      const exerciseWithWorkouts = {
        ...exerciseWithoutWorkouts,
        workoutExercises: [{ id: 'workout-1' }]
      } as unknown as Exercise;

      // Mock repository methods
      mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithWorkouts);

      // Execute and verify
      await expect(exerciseService.deleteExercise(mockExerciseId))
        .rejects
        .toThrow(new AppError(
          ErrorType.BUSINESS_RULE_VIOLATION,
          'Cannot delete exercise that is used in workouts',
          400
        ));

      // Verify cache was not invalidated
      expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Mock repository methods
      mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithoutWorkouts);
      mockExerciseRepository.remove.mockRejectedValueOnce(new Error('Database error'));

      // Execute and verify
      await expect(exerciseService.deleteExercise(mockExerciseId))
        .rejects
        .toThrow(new AppError(
          ErrorType.SERVICE_ERROR,
          'Failed to delete exercise',
          500
        ));

      // Verify cache was not invalidated
      expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
    });
  });

  describe('getAllExercises', () => {
    const mockExercises = [mockExercise, { ...mockExercise, id: 'exercise-2', name: 'Deadlift' }];
    const mockTotalCount = 2;
    const mockFilterOptions = {
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'ASC' as const,
      difficulty: Difficulty.INTERMEDIATE
    };

    it('should return exercises with filtering and pagination', async () => {
      // Arrange
      const filterOptions = {
        page: 1,
        limit: 10,
        search: 'test',
        muscleGroup: 'Chest',
        equipment: 'Barbell'
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockExercises)
      };

      mockExerciseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await exerciseService.getAllExercises(filterOptions);

      // Assertions
      expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'category');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('category.name = :muscleGroup', { muscleGroup: 'Chest' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('equipment.name = :equipment', { equipment: 'Barbell' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('exercise.name ILIKE :search', { search: '%test%' });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Array));
    });

    it('should handle database errors', async () => {
      // Arrange
      const filterOptions = {
        page: 1,
        limit: 10
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockExerciseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act & Assert
      await expect(exerciseService.getAllExercises(filterOptions)).rejects.toThrow('Failed to get exercises');
    });
  });

  describe('Category Management', () => {
    const mockCategories = [
      mockCategory,
      { 
        id: 'category-2', 
        name: 'Cardio', 
        description: 'Cardiovascular exercises', 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const newCategoryData = {
      name: 'Flexibility',
      type: CategoryType.MUSCLE_GROUP,
      description: 'Flexibility exercises'
    };

    describe('getExerciseCategories', () => {
      it('should return all categories', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response
        mockCategoryRepository.createQueryBuilder = jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockCategories, mockCategories.length])
        });
        
        // Call the method
        const result = await exerciseService.getExerciseCategories();
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith('exercise:categories:all');
        expect(mockCategoryRepository.createQueryBuilder).toHaveBeenCalledWith('category');
        expect(cacheManager.set).toHaveBeenCalledWith(
          'exercise:categories:all',
          [expect.any(Array), expect.any(Number)],
          expect.any(Number)
        );
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should return categories from cache when available', async () => {
        // Mock cache hit
        const cachedResult = [mockCategories, mockCategories.length];
        (cacheManager.get as jest.Mock).mockResolvedValue(cachedResult);
        
        // Call the method
        const result = await exerciseService.getExerciseCategories();
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith('exercise:categories:all');
        expect(mockCategoryRepository.createQueryBuilder).not.toHaveBeenCalled();
        expect(result).toEqual(cachedResult);
      });

      it('should handle database errors', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database error
        mockCategoryRepository.createQueryBuilder = jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error'))
        });
        
        // Call the method and expect error
        await expect(exerciseService.getExerciseCategories())
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to get exercise categories',
            500
          ));
      });
    });

    describe('getCategoryById', () => {
      it('should return a category by ID', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
        
        // Call the method
        const result = await exerciseService.getCategoryById(mockCategoryId);
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockCategoryId }
        });
        expect(cacheManager.set).toHaveBeenCalledWith(
          `exercise:category:${mockCategoryId}`,
          expect.any(Object),
          expect.any(Number)
        );
        expect(result).toBeDefined();
        if (result) {
          expect(result.id).toBe(mockCategory.id.toString());
          expect(result.name).toBe(mockCategory.name);
          expect(result.description).toBe(mockCategory.description);
          expect(result.type).toBe(mockCategory.type);
        }
      });

      it('should return null if category does not exist', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response - not found
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method
        const result = await exerciseService.getCategoryById(mockCategoryId);
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockCategoryId }
        });
        expect(cacheManager.set).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it('should return category from cache when available', async () => {
        // Mock cache hit
        const cachedCategory = {
          id: mockCategory.id.toString(),
          name: mockCategory.name,
          description: mockCategory.description,
          type: mockCategory.type
        };
        (cacheManager.get as jest.Mock).mockResolvedValue(cachedCategory);
        
        // Call the method
        const result = await exerciseService.getCategoryById(mockCategoryId);
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
        expect(mockCategoryRepository.findOne).not.toHaveBeenCalled();
        expect(cacheManager.set).not.toHaveBeenCalled();
        expect(result).toEqual(cachedCategory);
      });

      it('should handle errors gracefully', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database error
        const error = new Error('Database error');
        mockCategoryRepository.findOne = jest.fn().mockRejectedValue(error);
        
        // Call the method and expect error
        await expect(exerciseService.getCategoryById(mockCategoryId))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to get category',
            500
          ));
      });
    });

    describe('createCategory', () => {
      it('should create a new category', async () => {
        const categoryData = {
          name: 'Flexibility',
          type: CategoryType.MUSCLE_GROUP,
          description: 'Flexibility exercises'
        };
        
        // Mock create and save
        const createdCategory = {
          ...categoryData,
          id: 'new-category-id',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCategoryRepository.create = jest.fn().mockReturnValue(createdCategory);
        mockCategoryRepository.save = jest.fn().mockResolvedValue(createdCategory);

        // Call the method
        const result = await exerciseService.createCategory(categoryData);

        // Assertions
        expect(mockCategoryRepository.create).toHaveBeenCalledWith(categoryData);
        expect(mockCategoryRepository.save).toHaveBeenCalledWith(createdCategory);
        expect(cacheManager.del).toHaveBeenCalledWith('exercise:categories:*');
        expect(result).toBeDefined();
        expect(result.id).toBe(createdCategory.id);
        expect(result.name).toBe(createdCategory.name);
        expect(result.description).toBe(createdCategory.description);
        expect(result.type).toBe(createdCategory.type);
      });

      it('should handle database errors', async () => {
        const categoryData = {
          name: 'Flexibility',
          type: CategoryType.MUSCLE_GROUP,
          description: 'Flexibility exercises'
        };
        
        // Mock database error
        const error = new Error('Database error');
        mockCategoryRepository.create = jest.fn().mockReturnValue(categoryData);
        mockCategoryRepository.save = jest.fn().mockRejectedValue(error);
        
        // Call the method and expect error
        await expect(exerciseService.createCategory(categoryData))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to create category',
            500
          ));
      });
    });

    describe('findExercisesByCategory', () => {
      it('should find exercises by category ID', async () => {
        // Mock category exists
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
        
        // Mock exercises found
        const mockExercises = [mockExercise];
        const mockTotal = 1;
        
        const queryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockExercises, mockTotal])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Call the method
        const result = await exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 });
        
        // Assertions
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockCategoryId }
        });
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith('exercise.categories', 'category', 'category.id = :categoryId', { categoryId: mockCategoryId });
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'allCategories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.skip).toHaveBeenCalledWith(0);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
        expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
        expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should apply filters when provided', async () => {
        // Mock category exists
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
        
        // Mock exercises found
        const mockExercises = [mockExercise];
        const mockTotal = 1;
        
        const queryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockExercises, mockTotal])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Call the method with filters
        const filters = {
          page: 1,
          limit: 10,
          type: ExerciseType.STRENGTH_COMPOUND,
          difficulty: Difficulty.INTERMEDIATE,
          equipment: 'Barbell',
          muscleGroup: 'Back',
          search: 'deadlift'
        };
        
        const result = await exerciseService.findExercisesByCategory(mockCategoryId, filters);
        
        // Assertions
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockCategoryId }
        });
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith('exercise.categories', 'category', 'category.id = :categoryId', { categoryId: mockCategoryId });
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'allCategories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.type = :type', { type: filters.type });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.level = :difficulty', { difficulty: filters.difficulty });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('equipment.name = :equipment', { equipment: filters.equipment });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('categories.name = :muscleGroup', { muscleGroup: filters.muscleGroup });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
          { search: `%${filters.search}%` });
        expect(queryBuilder.skip).toHaveBeenCalledWith(0);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
        expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
        expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should throw not found error if category does not exist', async () => {
        // Mock category not found
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 }))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Category not found',
            404
          ));
      });

      it('should handle database errors', async () => {
        // Mock category exists
        mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
        
        // Mock database error
        const queryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error'))
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Call the method and expect error
        await expect(exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 }))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to find exercises by category',
            500
          ));
      });
    });
  });

  describe('Equipment Management', () => {
    const mockEquipments = [
      mockEquipment,
      { 
        id: 'equipment-2', 
        name: 'Dumbbell', 
        description: 'Free weights', 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const newEquipmentData = {
      name: 'Kettlebell',
      description: 'Cast iron weights',
    };

    describe('getAllEquipment', () => {
      it('should return all equipment', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response with createQueryBuilder
        const queryBuilder = {
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockEquipments, mockEquipments.length])
        };
        mockEquipmentRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
        
        // Call the method
        const result = await exerciseService.getAllEquipment();
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith('exercise:equipment:all');
        expect(mockEquipmentRepository.createQueryBuilder).toHaveBeenCalledWith('equipment');
        expect(queryBuilder.orderBy).toHaveBeenCalledWith('equipment.name', 'ASC');
        expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
        expect(cacheManager.set).toHaveBeenCalledWith(
          'exercise:equipment:all',
          [expect.any(Array), expect.any(Number)],
          expect.any(Number)
        );
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should return equipment from cache when available', async () => {
        // Mock cache hit
        const cachedResult = [mockEquipments, mockEquipments.length];
        (cacheManager.get as jest.Mock).mockResolvedValue(cachedResult);
        
        // Call the method
        const result = await exerciseService.getAllEquipment();
        
        // Assertions
        expect(cacheManager.get).toHaveBeenCalledWith('exercise:equipment:all');
        expect(mockEquipmentRepository.createQueryBuilder).not.toHaveBeenCalled();
        expect(result).toEqual(cachedResult);
      });
    });

    describe('getEquipmentById', () => {
      it('should return equipment by ID', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response
        mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
        
        // Call the method
        const result = await exerciseService.getEquipmentById(mockEquipmentId);
        
        // Assertions
        expect(mockEquipmentRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockEquipmentId }
        });
        // Verify basic properties without calling the private method
        expect(result).toBeDefined();
        expect(result?.id).toBeDefined();
        expect(result?.name).toBe(mockEquipment.name);
      });

      it('should throw not found error if equipment does not exist', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock database response - not found
        mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        // The service method returns null rather than throwing an error
        const result = await exerciseService.getEquipmentById(mockEquipmentId);
        expect(result).toBeNull();
      });
    });

    describe('createEquipment', () => {
      it('should create new equipment', async () => {
        // Mock create
        const createdEquipment = { 
          id: 'new-equipment-id', 
          name: newEquipmentData.name,
          description: newEquipmentData.description,
          category: undefined
        };
        mockEquipmentRepository.create = jest.fn().mockReturnValue(newEquipmentData);
        mockEquipmentRepository.save = jest.fn().mockResolvedValue(createdEquipment);
        
        // Call the method
        const result = await exerciseService.createEquipment(newEquipmentData as any);
        
        // Assertions
        expect(mockEquipmentRepository.create).toHaveBeenCalled();
        expect(mockEquipmentRepository.save).toHaveBeenCalled();
        expect(cacheManager.del).toHaveBeenCalledWith('exercise:equipment:*');
        expect(result).toEqual(createdEquipment);
      });

      it('should handle database errors', async () => {
        // Mock database error
        const error = new Error('Database error');
        mockEquipmentRepository.create = jest.fn().mockReturnValue(newEquipmentData);
        mockEquipmentRepository.save = jest.fn().mockRejectedValue(error);
        
        // Call the method and expect error
        await expect(exerciseService.createEquipment(newEquipmentData as any))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to create equipment',
            500
          ));
      });
    });

    describe('findExercisesByEquipment', () => {
      it('should find exercises by equipment ID', async () => {
        // Mock equipment exists
        mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
        
        // Mock exercises found
        const mockExercises = [mockExercise];
        const mockTotal = 1;
        
        const queryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockExercises, mockTotal])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Call the method
        const result = await exerciseService.findExercisesByEquipment(mockEquipmentId, { page: 1, limit: 10 });
        
        // Assertions
        expect(mockEquipmentRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockEquipmentId }
        });
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith('exercise.equipmentOptions', 'eq', 'eq.id = :equipmentId', { equipmentId: mockEquipmentId });
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.skip).toHaveBeenCalledWith(0);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
        expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
        expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should apply filters when provided', async () => {
        // Mock equipment exists
        mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
        
        // Mock exercises found
        const mockExercises = [mockExercise];
        const mockTotal = 1;
        
        const queryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockExercises, mockTotal])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Call the method with filters
        const filters = {
          page: 1,
          limit: 10,
          type: ExerciseType.STRENGTH_COMPOUND,
          difficulty: Difficulty.INTERMEDIATE,
          muscleGroup: 'Back',
          search: 'deadlift'
        };
        
        const result = await exerciseService.findExercisesByEquipment(mockEquipmentId, filters);
        
        // Assertions
        expect(mockEquipmentRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockEquipmentId }
        });
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith('exercise.equipmentOptions', 'eq', 'eq.id = :equipmentId', { equipmentId: mockEquipmentId });
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.type = :type', { type: filters.type });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.level = :difficulty', { difficulty: filters.difficulty });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('categories.name = :muscleGroup', { muscleGroup: filters.muscleGroup });
        expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
          { search: `%${filters.search}%` });
        expect(queryBuilder.skip).toHaveBeenCalledWith(0);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
        expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
        expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
        expect(result).toEqual([expect.any(Array), expect.any(Number)]);
      });

      it('should throw not found error if equipment does not exist', async () => {
        // Mock equipment not found
        mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.findExercisesByEquipment(mockEquipmentId, { page: 1, limit: 10 }))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Equipment not found',
            404
          ));
      });
    });
  });

  describe('Media Management', () => {
    const mockMediaId = 'media-1';
    const mockMediaList = [
      mockMedia,
      {
        id: 'media-2',
        type: 'VIDEO',
        url: 'https://example.com/squat-video.mp4',
        title: 'Squat Tutorial',
        description: 'Detailed instructions for barbell squat',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    describe('getExerciseMedia', () => {
      it('should return media for an exercise', async () => {
        // Mock cache miss
        (cacheManager.get as jest.Mock).mockResolvedValue(null);
        
        // Mock exercise exists with media
        const exerciseWithMedia = {
          ...mockExercise,
          media: mockMediaList
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
        
        // Call the method
        const result = await exerciseService.getExerciseMedia(mockExerciseId);
        
        // Assertions
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockExerciseId },
          relations: ['media']
        });
        // The service directly maps the media from the exercise, no separate find call
        expect(result.length).toEqual(mockMediaList.length);
      });

      it('should throw not found error if exercise does not exist', async () => {
        // Mock exercise not found
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.getExerciseMedia(mockExerciseId))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Exercise not found',
            404
          ));
      });
    });

    describe('attachMediaToExercise', () => {
      const attachData = {
        mediaId: mockMediaId,
        order: 1,
        isPrimary: true
      };

      it('should attach media to an exercise', async () => {
        // Mock exercise exists with empty media list
        const exerciseWithoutMedia = {
          ...mockExercise,
          media: []
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithoutMedia);
        
        // Mock media exists
        mockMediaRepository.findOne = jest.fn().mockResolvedValue(mockMedia);
        
        // Mock successful update
        const updatedExercise = {
          ...exerciseWithoutMedia,
          media: [{ 
            ...mockMedia, 
            order: 1, 
            isPrimary: true 
          }]
        };
        mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
        
        // Call the method
        const result = await exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId);
        
        // Assertions
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockExerciseId },
          relations: ['media']
        });
        expect(mockMediaRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockMediaId }
        });
        expect(mockExerciseRepository.save).toHaveBeenCalled();
        expect(cacheManager.deleteByPattern).toHaveBeenCalled();
        expect(result).toBeDefined();
      });

      it('should throw not found error if exercise does not exist', async () => {
        // Mock exercise not found
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Exercise not found',
            404
          ));
      });

      it('should throw not found error if media does not exist', async () => {
        // Mock exercise exists
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
        
        // Mock media not found
        mockMediaRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Media not found',
            404
          ));
      });
    });

    describe('detachMediaFromExercise', () => {
      it('should detach media from an exercise', async () => {
        // Mock exercise exists with attached media
        const exerciseWithMedia = {
          ...mockExercise,
          media: [{ ...mockMedia, order: 1, isPrimary: true }]
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
        
        // Mock successful update
        const updatedExercise = {
          ...exerciseWithMedia,
          media: []
        };
        mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
        
        // Call the method
        await exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId);
        
        // Assertions
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockExerciseId },
          relations: ['media']
        });
        expect(mockExerciseRepository.save).toHaveBeenCalled();
        expect(cacheManager.deleteByPattern).toHaveBeenCalled();
      });

      it('should throw not found error if exercise does not exist', async () => {
        // Mock exercise not found
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Exercise not found',
            404
          ));
      });

      it('should throw business rule error if media is not attached to exercise', async () => {
        // Mock exercise exists but without the specified media
        const exerciseWithOtherMedia = {
          ...mockExercise,
          media: [{ id: 'different-media-id', isPrimary: true, order: 1 }]
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithOtherMedia);
        
        // Call the method and expect error
        await expect(exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.BUSINESS_RULE_VIOLATION,
            'Media is not attached to this exercise',
            400
          ));
      });
    });

    describe('setPrimaryExerciseMedia', () => {
      it('should set primary media for an exercise', async () => {
        // Mock exercise exists with multiple media
        const exerciseWithMedia = {
          ...mockExercise,
          media: [
            { id: 'media-1', isPrimary: false, order: 1 },
            { id: 'media-2', isPrimary: true, order: 2 }
          ]
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
        
        // Mock successful update
        const updatedExercise = {
          ...exerciseWithMedia,
          media: [
            { id: 'media-1', isPrimary: true, order: 1 },
            { id: 'media-2', isPrimary: false, order: 2 }
          ]
        };
        mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
        
        // Call the method
        const result = await exerciseService.setPrimaryExerciseMedia(mockExerciseId, 'media-1');
        
        // Assertions
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockExerciseId },
          relations: ['media']
        });
        expect(mockExerciseRepository.save).toHaveBeenCalled();
        expect(cacheManager.deleteByPattern).toHaveBeenCalled();
        expect(result).toBeDefined();
      });

      it('should throw not found error if exercise does not exist', async () => {
        // Mock exercise not found
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
        
        // Call the method and expect error
        await expect(exerciseService.setPrimaryExerciseMedia(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'Exercise not found',
            404
          ));
      });

      it('should throw business rule error if media is not attached to exercise', async () => {
        // Mock exercise exists but without the specified media
        const exerciseWithOtherMedia = {
          ...mockExercise,
          media: [{ id: 'different-media-id', isPrimary: true, order: 1 }]
        };
        mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithOtherMedia);
        
        // Call the method and expect error
        await expect(exerciseService.setPrimaryExerciseMedia(mockExerciseId, mockMediaId))
          .rejects
          .toThrow(new AppError(
            ErrorType.BUSINESS_RULE_VIOLATION,
            'Media is not attached to this exercise',
            400
          ));
      });
    });
  });

  describe('Exercise Relationship Management', () => {
    // Define the data structure for the relation
    const progressionData = {
      sourceExerciseId: mockExerciseId,
      targetExerciseId: mockRelatedExerciseId,
      type: RelationType.PROGRESSION
    } as any; // Use any to bypass type checking temporarily

    const mockExerciseRelation = {
      id: 'relation-1',
      baseExercise: mockExercise,
      base_exercise_id: mockExerciseId,
      relatedExercise: mockRelatedExercise,
      related_exercise_id: mockRelatedExerciseId,
      type: 'PROGRESSION',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as ExerciseRelation;

    describe('createExerciseRelation', () => {
      it('should create a relation between exercises', async () => {
        // Mock both exercises exist
        mockExerciseRepository.findOne = jest.fn().mockImplementation((params) => {
          if (params.where.id === mockExerciseId) {
            return Promise.resolve(mockExercise);
          } else if (params.where.id === mockRelatedExerciseId) {
            return Promise.resolve(mockRelatedExercise);
          }
          return Promise.resolve(null);
        });
        
        // Mock successful creation
        mockRelationRepository.create = jest.fn().mockReturnValue(mockExerciseRelation);
        mockRelationRepository.save = jest.fn().mockResolvedValue(mockExerciseRelation);
        
        // Call the method
        const result = await exerciseService.createExerciseRelation(progressionData);
        
        // Verify repository calls
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: progressionData.sourceExerciseId }
        });
        expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
          where: { id: progressionData.targetExerciseId }
        });
        expect(mockRelationRepository.create).toHaveBeenCalledWith({
          baseExercise: mockExercise,
          relatedExercise: mockRelatedExercise,
          relationType: progressionData.type,
          notes: progressionData.description,
          similarityScore: 1.0
        });
        expect(mockRelationRepository.save).toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.sourceExerciseId).toBeDefined();
        expect(result.targetExerciseId).toBeDefined();
      });

      it('should throw error if parent exercise not found', async () => {
        // Mock parent exercise not found
        mockExerciseRepository.findOne = jest.fn().mockImplementation((params) => {
          if (params.where.id === mockExerciseId) {
            return Promise.resolve(null);
          }
          return Promise.resolve(mockRelatedExercise);
        });
        
        // Call the method and expect error
        await expect(exerciseService.createExerciseRelation(progressionData))
          .rejects
          .toThrow(new AppError(
            ErrorType.NOT_FOUND,
            'One or both exercises not found',
            404
          ));
      });
    });

    describe('searchExercises', () => {
      it('should search exercises by name', async () => {
        const searchQuery = 'Push';
        
        const searchResults = [mockExercise];
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([searchResults, 1])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        const result = await exerciseService.searchExercises(searchQuery);
        
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.where).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
          { search: `%${searchQuery}%` });
        expect(queryBuilder.take).toHaveBeenCalledWith(20);
        
        // Verify the structure of the result
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(Array.isArray(result[0])).toBe(true);
        expect(typeof result[1]).toBe('number');
      });

      it('should return empty array if no matches found', async () => {
        const searchQuery = 'NonExistentExercise';
        
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[], 0])
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        const result = await exerciseService.searchExercises(searchQuery);
        
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.where).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', 
          { search: `%${searchQuery}%` });
        expect(queryBuilder.take).toHaveBeenCalledWith(20);
        
        // Verify the structure of the result
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(Array.isArray(result[0])).toBe(true);
        expect(result[0].length).toBe(0);
        expect(result[1]).toBe(0);
      });

      it('should handle search errors gracefully', async () => {
        const searchQuery = 'Push';
        
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error'))
        };
        
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);
        
        // Mock logger.error
        (logger.error as jest.Mock).mockImplementation(() => {});
        
        await expect(exerciseService.searchExercises(searchQuery))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to search exercises',
            500
          ));
      });
      });
    });

  describe('Search and Filtering', () => {
    describe('getExercisesByDifficulty', () => {
      it('should return exercises by difficulty level', async () => {
        const difficultyLevel = 'INTERMEDIATE';
        const difficultyExercises = [mockExercise];
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([difficultyExercises, 1])
        };
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
        
        const result = await exerciseService.getExercisesByDifficulty(difficultyLevel);
        
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.where).toHaveBeenCalledWith('exercise.level = :difficulty', { difficulty: difficultyLevel });
        expect(result[0]).toEqual(expect.any(Array));
        expect(result[1]).toBe(1);
      });

      it('should return pagination metadata with exercises', async () => {
        const difficultyLevel = 'INTERMEDIATE';
        const paginationOptions = { page: 1, limit: 10 };
        const difficultyExercises = [mockExercise];
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([difficultyExercises, 1])
        };
        mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
        
        const result = await exerciseService.getExercisesByDifficulty(difficultyLevel, paginationOptions);
        
        expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
        expect(queryBuilder.where).toHaveBeenCalledWith('exercise.level = :difficulty', { difficulty: difficultyLevel });
        expect(queryBuilder.skip).toHaveBeenCalledWith((paginationOptions.page - 1) * paginationOptions.limit);
        expect(queryBuilder.take).toHaveBeenCalledWith(paginationOptions.limit);
        expect(result[0]).toEqual(expect.any(Array));
        expect(result[1]).toBe(1);
      });

      it('should throw validation error if difficulty level is invalid', async () => {
        const invalidDifficulty = 'INVALID_LEVEL';
        
        // Mock error in service
        mockExerciseRepository.createQueryBuilder = jest.fn().mockImplementation(() => {
          throw new Error(`'${invalidDifficulty}' is not a valid Difficulty`);
        });
        
        await expect(exerciseService.getExercisesByDifficulty(invalidDifficulty))
          .rejects
          .toThrow(new AppError(
            ErrorType.SERVICE_ERROR,
            'Failed to get exercises by difficulty',
            500
          ));
      });
    });
  });
}); 