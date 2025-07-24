"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExerciseRelation_1 = require("../../models/ExerciseRelation");
const Enums_1 = require("../../models/shared/Enums");
const logger_1 = __importDefault(require("../../utils/logger"));
const ExerciseService_1 = require("../../services/ExerciseService");
const errors_1 = require("../../utils/errors");
const ExerciseCategory_1 = require("../../models/ExerciseCategory");
const Enums_2 = require("../../models/shared/Enums");
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
    SimpleTrack: (options) => (target, propertyKey, descriptor) => descriptor,
    SimplePerformanceMetrics: {
        recordSuccess: jest.fn(),
        recordFailure: jest.fn(),
        recordTime: jest.fn(),
        getReport: jest.fn().mockReturnValue({ metrics: {} }),
        resetMetrics: jest.fn(),
    }
}));
jest.mock('../../utils/transaction-helper', () => ({
    executeTransaction: jest.fn((callback) => callback()),
    executeTransactionBatch: jest.fn(),
    isInTransaction: jest.fn()
}));
describe('ExerciseService', () => {
    let exerciseService;
    let mockExerciseRepository;
    let mockCategoryRepository;
    let mockEquipmentRepository;
    let mockMediaRepository;
    let mockRelationRepository;
    let cacheManager;
    let repositories;
    const mockExerciseId = 'exercise-1';
    const mockCategoryId = 'category-1';
    const mockEquipmentId = 'equipment-1';
    const mockRelatedExerciseId = 'exercise-2';
    const mockCategory = {
        id: mockCategoryId,
        name: 'Strength',
        description: 'Strength exercises',
        type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockEquipment = {
        id: mockEquipmentId,
        name: 'Barbell',
        description: 'Standard barbell',
        category: 'WEIGHTS',
        createdAt: new Date(),
        updatedAt: new Date()
    };
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
        types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
        level: Enums_1.Difficulty.INTERMEDIATE,
        movementPattern: Enums_1.MovementPattern.HINGE,
        equipmentOptions: [mockEquipment],
        categories: [mockCategory],
        media: [mockMedia],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const exerciseWithoutWorkouts = Object.assign(Object.assign({}, mockExercise), { workoutExercises: [] });
    const mockRelatedExercise = Object.assign(Object.assign({}, mockExercise), { id: mockRelatedExerciseId, name: 'Dumbbell Squat', description: 'A variant of the squat', movementPattern: Enums_1.MovementPattern.SQUAT, level: Enums_1.Difficulty.BEGINNER });
    beforeEach(() => {
        jest.clearAllMocks();
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
        };
        mockCategoryRepository = {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockCategory),
            findByIds: jest.fn(),
            create: jest.fn().mockReturnValue(mockCategory),
            save: jest.fn().mockResolvedValue(mockCategory),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
        };
        mockEquipmentRepository = {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockEquipment),
            findByIds: jest.fn(),
            create: jest.fn().mockReturnValue(mockEquipment),
            save: jest.fn().mockResolvedValue(mockEquipment),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
        };
        mockMediaRepository = {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockMedia),
            findByIds: jest.fn(),
            create: jest.fn().mockReturnValue(mockMedia),
            save: jest.fn().mockResolvedValue(mockMedia),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
        };
        mockRelationRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            findByIds: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
        };
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
        };
        exerciseService = new ExerciseService_1.ExerciseService(mockExerciseRepository, mockCategoryRepository, mockEquipmentRepository, mockMediaRepository, mockRelationRepository, cacheManager);
    });
    describe('createExercise', () => {
        const newExerciseData = {
            name: 'New Exercise',
            description: 'A new exercise',
            type: Enums_1.ExerciseType.STRENGTH_COMPOUND,
            difficulty: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.SQUAT,
            categoryIds: [mockCategoryId],
            equipmentIds: [mockEquipmentId],
            mediaIds: ['media-1'],
            muscleGroups: {
                primary: ['QUADRICEPS'],
                secondary: ['GLUTES']
            }
        };
        it('should create a new exercise with valid data', async () => {
            mockCategoryRepository.findByIds = jest.fn().mockResolvedValue([mockCategory]);
            mockEquipmentRepository.findByIds = jest.fn().mockResolvedValue([mockEquipment]);
            mockMediaRepository.findByIds = jest.fn().mockResolvedValue([mockMedia]);
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
            };
            mockExerciseRepository.create = jest.fn().mockReturnValue(createdExercise);
            mockExerciseRepository.save = jest.fn().mockResolvedValue(createdExercise);
            const result = await exerciseService.createExercise(newExerciseData);
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
            const invalidData = Object.assign(Object.assign({}, newExerciseData), { name: '' });
            mockExerciseRepository.create = jest.fn().mockImplementation(() => {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Name is required', 400);
            });
            await expect(exerciseService.createExercise(invalidData))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create exercise', 500, expect.any(Error)));
            expect(mockExerciseRepository.save).not.toHaveBeenCalled();
        });
        it('should handle database errors', async () => {
            mockCategoryRepository.findByIds = jest.fn().mockResolvedValue([mockCategory]);
            mockEquipmentRepository.findByIds = jest.fn().mockResolvedValue([mockEquipment]);
            mockMediaRepository.findByIds = jest.fn().mockResolvedValue([mockMedia]);
            const error = new Error('Database error');
            mockExerciseRepository.create = jest.fn().mockReturnValue(newExerciseData);
            mockExerciseRepository.save = jest.fn().mockRejectedValue(error);
            await expect(exerciseService.createExercise(newExerciseData))
                .rejects
                .toThrow('Failed to create exercise');
        });
    });
    describe('getExerciseById', () => {
        it('should return an exercise when found', async () => {
            cacheManager.get.mockResolvedValue(null);
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
            const result = await exerciseService.getExerciseById(mockExerciseId);
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
            const cachedExercise = exerciseService.mapToResponseDTO(mockExercise);
            cacheManager.get.mockResolvedValue(cachedExercise);
            const result = await exerciseService.getExerciseById(mockExerciseId);
            expect(cacheManager.get).toHaveBeenCalledWith(`exercise:${mockExerciseId}`);
            expect(mockExerciseRepository.findOne).not.toHaveBeenCalled();
            expect(cacheManager.set).not.toHaveBeenCalled();
            expect(result).toEqual(cachedExercise);
        });
        it('should throw not found error when exercise does not exist', async () => {
            cacheManager.get.mockResolvedValue(null);
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
            await expect(exerciseService.getExerciseById(mockExerciseId))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            expect(cacheManager.get).toHaveBeenCalledWith(`exercise:${mockExerciseId}`);
            expect(cacheManager.set).not.toHaveBeenCalled();
        });
    });
    describe('updateExercise', () => {
        const updateData = {
            name: 'Updated Squat',
            description: 'Updated description',
            difficulty: Enums_1.Difficulty.ADVANCED
        };
        it('should update an exercise successfully', async () => {
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
            const updatedExercise = Object.assign(Object.assign({}, mockExercise), { name: updateData.name, description: updateData.description, level: updateData.difficulty, updatedAt: new Date() });
            mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
            const result = await exerciseService.updateExercise(mockExerciseId, updateData);
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
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
            await expect(exerciseService.updateExercise(mockExerciseId, updateData))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            expect(mockExerciseRepository.save).not.toHaveBeenCalled();
            expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
        });
        it('should handle unique constraint errors', async () => {
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
            const uniqueConstraintError = new Error('unique constraint violation');
            uniqueConstraintError.code = '23505';
            mockExerciseRepository.save = jest.fn().mockRejectedValue(uniqueConstraintError);
            await expect(exerciseService.updateExercise(mockExerciseId, updateData))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update exercise', 500));
            expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
        });
        it('should handle general errors and log them', async () => {
            mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
            const error = new Error('Database error');
            mockExerciseRepository.save = jest.fn().mockRejectedValue(error);
            await expect(exerciseService.updateExercise(mockExerciseId, updateData))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update exercise', 500));
        });
    });
    describe('deleteExercise', () => {
        const mockExerciseId = 'exercise-1';
        const exerciseWithoutWorkouts = {
            id: mockExerciseId,
            name: 'Test Exercise',
            description: 'Test Description',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.PUSH,
            equipmentOptions: [],
            categories: [],
            media: [],
            metrics: [],
            feedback: [],
            details: [],
            workoutExercises: [],
            relationsFrom: [],
            relationsTo: [],
            trackingFeatures: [Enums_2.TrackingFeature.FORM],
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
        };
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should delete an exercise successfully when not used in workouts', async () => {
            mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithoutWorkouts);
            mockExerciseRepository.remove.mockResolvedValueOnce(exerciseWithoutWorkouts);
            await exerciseService.deleteExercise(mockExerciseId);
            expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockExerciseId },
                relations: ['workoutExercises']
            });
            expect(mockExerciseRepository.remove).toHaveBeenCalledWith(exerciseWithoutWorkouts);
            expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercise:*');
            expect(cacheManager.deleteByPattern).toHaveBeenCalledWith('exercises:*');
        });
        it('should throw not found error when exercise does not exist', async () => {
            mockExerciseRepository.findOne.mockResolvedValueOnce(null);
            await expect(exerciseService.deleteExercise(mockExerciseId))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
        });
        it('should throw error when exercise is used in workouts', async () => {
            const exerciseWithWorkouts = Object.assign(Object.assign({}, exerciseWithoutWorkouts), { workoutExercises: [{ id: 'workout-1' }] });
            mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithWorkouts);
            await expect(exerciseService.deleteExercise(mockExerciseId))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Cannot delete exercise that is used in workouts', 400));
            expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
        });
        it('should handle database errors gracefully', async () => {
            mockExerciseRepository.findOne.mockResolvedValueOnce(exerciseWithoutWorkouts);
            mockExerciseRepository.remove.mockRejectedValueOnce(new Error('Database error'));
            await expect(exerciseService.deleteExercise(mockExerciseId))
                .rejects
                .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to delete exercise', 500));
            expect(cacheManager.deleteByPattern).not.toHaveBeenCalled();
        });
    });
    describe('getAllExercises', () => {
        const mockExercises = [mockExercise, Object.assign(Object.assign({}, mockExercise), { id: 'exercise-2', name: 'Deadlift' })];
        const mockTotalCount = 2;
        const mockFilterOptions = {
            page: 1,
            limit: 10,
            sortBy: 'name',
            sortOrder: 'ASC',
            difficulty: Enums_1.Difficulty.INTERMEDIATE
        };
        it('should return exercises with filtering and pagination', async () => {
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
            mockExerciseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await exerciseService.getAllExercises(filterOptions);
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
            mockExerciseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
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
            type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
            description: 'Flexibility exercises'
        };
        describe('getExerciseCategories', () => {
            it('should return all categories', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockCategoryRepository.createQueryBuilder = jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnThis(),
                    addOrderBy: jest.fn().mockReturnThis(),
                    getManyAndCount: jest.fn().mockResolvedValue([mockCategories, mockCategories.length])
                });
                const result = await exerciseService.getExerciseCategories();
                expect(cacheManager.get).toHaveBeenCalledWith('exercise:categories:all');
                expect(mockCategoryRepository.createQueryBuilder).toHaveBeenCalledWith('category');
                expect(cacheManager.set).toHaveBeenCalledWith('exercise:categories:all', [expect.any(Array), expect.any(Number)], expect.any(Number));
                expect(result).toEqual([expect.any(Array), expect.any(Number)]);
            });
            it('should return categories from cache when available', async () => {
                const cachedResult = [mockCategories, mockCategories.length];
                cacheManager.get.mockResolvedValue(cachedResult);
                const result = await exerciseService.getExerciseCategories();
                expect(cacheManager.get).toHaveBeenCalledWith('exercise:categories:all');
                expect(mockCategoryRepository.createQueryBuilder).not.toHaveBeenCalled();
                expect(result).toEqual(cachedResult);
            });
            it('should handle database errors', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockCategoryRepository.createQueryBuilder = jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnThis(),
                    addOrderBy: jest.fn().mockReturnThis(),
                    getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error'))
                });
                await expect(exerciseService.getExerciseCategories())
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise categories', 500));
            });
        });
        describe('getCategoryById', () => {
            it('should return a category by ID', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
                const result = await exerciseService.getCategoryById(mockCategoryId);
                expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
                expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockCategoryId }
                });
                expect(cacheManager.set).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`, expect.any(Object), expect.any(Number));
                expect(result).toBeDefined();
                if (result) {
                    expect(result.id).toBe(mockCategory.id.toString());
                    expect(result.name).toBe(mockCategory.name);
                    expect(result.description).toBe(mockCategory.description);
                    expect(result.type).toBe(mockCategory.type);
                }
            });
            it('should return null if category does not exist', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);
                const result = await exerciseService.getCategoryById(mockCategoryId);
                expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
                expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockCategoryId }
                });
                expect(cacheManager.set).not.toHaveBeenCalled();
                expect(result).toBeNull();
            });
            it('should return category from cache when available', async () => {
                const cachedCategory = {
                    id: mockCategory.id.toString(),
                    name: mockCategory.name,
                    description: mockCategory.description,
                    type: mockCategory.type
                };
                cacheManager.get.mockResolvedValue(cachedCategory);
                const result = await exerciseService.getCategoryById(mockCategoryId);
                expect(cacheManager.get).toHaveBeenCalledWith(`exercise:category:${mockCategoryId}`);
                expect(mockCategoryRepository.findOne).not.toHaveBeenCalled();
                expect(cacheManager.set).not.toHaveBeenCalled();
                expect(result).toEqual(cachedCategory);
            });
            it('should handle errors gracefully', async () => {
                cacheManager.get.mockResolvedValue(null);
                const error = new Error('Database error');
                mockCategoryRepository.findOne = jest.fn().mockRejectedValue(error);
                await expect(exerciseService.getCategoryById(mockCategoryId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get category', 500));
            });
        });
        describe('createCategory', () => {
            it('should create a new category', async () => {
                const categoryData = {
                    name: 'Flexibility',
                    type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                    description: 'Flexibility exercises'
                };
                const createdCategory = Object.assign(Object.assign({}, categoryData), { id: 'new-category-id', createdAt: new Date(), updatedAt: new Date() });
                mockCategoryRepository.create = jest.fn().mockReturnValue(createdCategory);
                mockCategoryRepository.save = jest.fn().mockResolvedValue(createdCategory);
                const result = await exerciseService.createCategory(categoryData);
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
                    type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                    description: 'Flexibility exercises'
                };
                const error = new Error('Database error');
                mockCategoryRepository.create = jest.fn().mockReturnValue(categoryData);
                mockCategoryRepository.save = jest.fn().mockRejectedValue(error);
                await expect(exerciseService.createCategory(categoryData))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create category', 500));
            });
        });
        describe('findExercisesByCategory', () => {
            it('should find exercises by category ID', async () => {
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const result = await exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 });
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
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const filters = {
                    page: 1,
                    limit: 10,
                    type: Enums_1.ExerciseType.STRENGTH_COMPOUND,
                    difficulty: Enums_1.Difficulty.INTERMEDIATE,
                    equipment: 'Barbell',
                    muscleGroup: 'Back',
                    search: 'deadlift'
                };
                const result = await exerciseService.findExercisesByCategory(mockCategoryId, filters);
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
                expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${filters.search}%` });
                expect(queryBuilder.skip).toHaveBeenCalledWith(0);
                expect(queryBuilder.take).toHaveBeenCalledWith(10);
                expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
                expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
                expect(result).toEqual([expect.any(Array), expect.any(Number)]);
            });
            it('should throw not found error if category does not exist', async () => {
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 }))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Category not found', 404));
            });
            it('should handle database errors', async () => {
                mockCategoryRepository.findOne = jest.fn().mockResolvedValue(mockCategory);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                await expect(exerciseService.findExercisesByCategory(mockCategoryId, { page: 1, limit: 10 }))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to find exercises by category', 500));
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
                cacheManager.get.mockResolvedValue(null);
                const queryBuilder = {
                    orderBy: jest.fn().mockReturnThis(),
                    getManyAndCount: jest.fn().mockResolvedValue([mockEquipments, mockEquipments.length])
                };
                mockEquipmentRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const result = await exerciseService.getAllEquipment();
                expect(cacheManager.get).toHaveBeenCalledWith('exercise:equipment:all');
                expect(mockEquipmentRepository.createQueryBuilder).toHaveBeenCalledWith('equipment');
                expect(queryBuilder.orderBy).toHaveBeenCalledWith('equipment.name', 'ASC');
                expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
                expect(cacheManager.set).toHaveBeenCalledWith('exercise:equipment:all', [expect.any(Array), expect.any(Number)], expect.any(Number));
                expect(result).toEqual([expect.any(Array), expect.any(Number)]);
            });
            it('should return equipment from cache when available', async () => {
                const cachedResult = [mockEquipments, mockEquipments.length];
                cacheManager.get.mockResolvedValue(cachedResult);
                const result = await exerciseService.getAllEquipment();
                expect(cacheManager.get).toHaveBeenCalledWith('exercise:equipment:all');
                expect(mockEquipmentRepository.createQueryBuilder).not.toHaveBeenCalled();
                expect(result).toEqual(cachedResult);
            });
        });
        describe('getEquipmentById', () => {
            it('should return equipment by ID', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
                const result = await exerciseService.getEquipmentById(mockEquipmentId);
                expect(mockEquipmentRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockEquipmentId }
                });
                expect(result).toBeDefined();
                expect(result === null || result === void 0 ? void 0 : result.id).toBeDefined();
                expect(result === null || result === void 0 ? void 0 : result.name).toBe(mockEquipment.name);
            });
            it('should throw not found error if equipment does not exist', async () => {
                cacheManager.get.mockResolvedValue(null);
                mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(null);
                const result = await exerciseService.getEquipmentById(mockEquipmentId);
                expect(result).toBeNull();
            });
        });
        describe('createEquipment', () => {
            it('should create new equipment', async () => {
                const createdEquipment = {
                    id: 'new-equipment-id',
                    name: newEquipmentData.name,
                    description: newEquipmentData.description,
                    category: undefined
                };
                mockEquipmentRepository.create = jest.fn().mockReturnValue(newEquipmentData);
                mockEquipmentRepository.save = jest.fn().mockResolvedValue(createdEquipment);
                const result = await exerciseService.createEquipment(newEquipmentData);
                expect(mockEquipmentRepository.create).toHaveBeenCalled();
                expect(mockEquipmentRepository.save).toHaveBeenCalled();
                expect(cacheManager.del).toHaveBeenCalledWith('exercise:equipment:*');
                expect(result).toEqual(createdEquipment);
            });
            it('should handle database errors', async () => {
                const error = new Error('Database error');
                mockEquipmentRepository.create = jest.fn().mockReturnValue(newEquipmentData);
                mockEquipmentRepository.save = jest.fn().mockRejectedValue(error);
                await expect(exerciseService.createEquipment(newEquipmentData))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create equipment', 500));
            });
        });
        describe('findExercisesByEquipment', () => {
            it('should find exercises by equipment ID', async () => {
                mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const result = await exerciseService.findExercisesByEquipment(mockEquipmentId, { page: 1, limit: 10 });
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
                mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(mockEquipment);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const filters = {
                    page: 1,
                    limit: 10,
                    type: Enums_1.ExerciseType.STRENGTH_COMPOUND,
                    difficulty: Enums_1.Difficulty.INTERMEDIATE,
                    muscleGroup: 'Back',
                    search: 'deadlift'
                };
                const result = await exerciseService.findExercisesByEquipment(mockEquipmentId, filters);
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
                expect(queryBuilder.andWhere).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${filters.search}%` });
                expect(queryBuilder.skip).toHaveBeenCalledWith(0);
                expect(queryBuilder.take).toHaveBeenCalledWith(10);
                expect(queryBuilder.orderBy).toHaveBeenCalledWith('exercise.name', 'ASC');
                expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
                expect(result).toEqual([expect.any(Array), expect.any(Number)]);
            });
            it('should throw not found error if equipment does not exist', async () => {
                mockEquipmentRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.findExercisesByEquipment(mockEquipmentId, { page: 1, limit: 10 }))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Equipment not found', 404));
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
                cacheManager.get.mockResolvedValue(null);
                const exerciseWithMedia = Object.assign(Object.assign({}, mockExercise), { media: mockMediaList });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
                const result = await exerciseService.getExerciseMedia(mockExerciseId);
                expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockExerciseId },
                    relations: ['media']
                });
                expect(result.length).toEqual(mockMediaList.length);
            });
            it('should throw not found error if exercise does not exist', async () => {
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.getExerciseMedia(mockExerciseId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            });
        });
        describe('attachMediaToExercise', () => {
            const attachData = {
                mediaId: mockMediaId,
                order: 1,
                isPrimary: true
            };
            it('should attach media to an exercise', async () => {
                const exerciseWithoutMedia = Object.assign(Object.assign({}, mockExercise), { media: [] });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithoutMedia);
                mockMediaRepository.findOne = jest.fn().mockResolvedValue(mockMedia);
                const updatedExercise = Object.assign(Object.assign({}, exerciseWithoutMedia), { media: [Object.assign(Object.assign({}, mockMedia), { order: 1, isPrimary: true })] });
                mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
                const result = await exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId);
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
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            });
            it('should throw not found error if media does not exist', async () => {
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(mockExercise);
                mockMediaRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.attachMediaToExercise(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Media not found', 404));
            });
        });
        describe('detachMediaFromExercise', () => {
            it('should detach media from an exercise', async () => {
                const exerciseWithMedia = Object.assign(Object.assign({}, mockExercise), { media: [Object.assign(Object.assign({}, mockMedia), { order: 1, isPrimary: true })] });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
                const updatedExercise = Object.assign(Object.assign({}, exerciseWithMedia), { media: [] });
                mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
                await exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId);
                expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockExerciseId },
                    relations: ['media']
                });
                expect(mockExerciseRepository.save).toHaveBeenCalled();
                expect(cacheManager.deleteByPattern).toHaveBeenCalled();
            });
            it('should throw not found error if exercise does not exist', async () => {
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            });
            it('should throw business rule error if media is not attached to exercise', async () => {
                const exerciseWithOtherMedia = Object.assign(Object.assign({}, mockExercise), { media: [{ id: 'different-media-id', isPrimary: true, order: 1 }] });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithOtherMedia);
                await expect(exerciseService.detachMediaFromExercise(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Media is not attached to this exercise', 400));
            });
        });
        describe('setPrimaryExerciseMedia', () => {
            it('should set primary media for an exercise', async () => {
                const exerciseWithMedia = Object.assign(Object.assign({}, mockExercise), { media: [
                        { id: 'media-1', isPrimary: false, order: 1 },
                        { id: 'media-2', isPrimary: true, order: 2 }
                    ] });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithMedia);
                const updatedExercise = Object.assign(Object.assign({}, exerciseWithMedia), { media: [
                        { id: 'media-1', isPrimary: true, order: 1 },
                        { id: 'media-2', isPrimary: false, order: 2 }
                    ] });
                mockExerciseRepository.save = jest.fn().mockResolvedValue(updatedExercise);
                const result = await exerciseService.setPrimaryExerciseMedia(mockExerciseId, 'media-1');
                expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
                    where: { id: mockExerciseId },
                    relations: ['media']
                });
                expect(mockExerciseRepository.save).toHaveBeenCalled();
                expect(cacheManager.deleteByPattern).toHaveBeenCalled();
                expect(result).toBeDefined();
            });
            it('should throw not found error if exercise does not exist', async () => {
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(null);
                await expect(exerciseService.setPrimaryExerciseMedia(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404));
            });
            it('should throw business rule error if media is not attached to exercise', async () => {
                const exerciseWithOtherMedia = Object.assign(Object.assign({}, mockExercise), { media: [{ id: 'different-media-id', isPrimary: true, order: 1 }] });
                mockExerciseRepository.findOne = jest.fn().mockResolvedValue(exerciseWithOtherMedia);
                await expect(exerciseService.setPrimaryExerciseMedia(mockExerciseId, mockMediaId))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Media is not attached to this exercise', 400));
            });
        });
    });
    describe('Exercise Relationship Management', () => {
        const progressionData = {
            sourceExerciseId: mockExerciseId,
            targetExerciseId: mockRelatedExerciseId,
            type: ExerciseRelation_1.RelationType.PROGRESSION
        };
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
        };
        describe('createExerciseRelation', () => {
            it('should create a relation between exercises', async () => {
                mockExerciseRepository.findOne = jest.fn().mockImplementation((params) => {
                    if (params.where.id === mockExerciseId) {
                        return Promise.resolve(mockExercise);
                    }
                    else if (params.where.id === mockRelatedExerciseId) {
                        return Promise.resolve(mockRelatedExercise);
                    }
                    return Promise.resolve(null);
                });
                mockRelationRepository.create = jest.fn().mockReturnValue(mockExerciseRelation);
                mockRelationRepository.save = jest.fn().mockResolvedValue(mockExerciseRelation);
                const result = await exerciseService.createExerciseRelation(progressionData);
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
                mockExerciseRepository.findOne = jest.fn().mockImplementation((params) => {
                    if (params.where.id === mockExerciseId) {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve(mockRelatedExercise);
                });
                await expect(exerciseService.createExerciseRelation(progressionData))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'One or both exercises not found', 404));
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const result = await exerciseService.searchExercises(searchQuery);
                expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
                expect(queryBuilder.where).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${searchQuery}%` });
                expect(queryBuilder.take).toHaveBeenCalledWith(20);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                const result = await exerciseService.searchExercises(searchQuery);
                expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalledWith('exercise');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.categories', 'categories');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.equipmentOptions', 'equipment');
                expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('exercise.media', 'media');
                expect(queryBuilder.where).toHaveBeenCalledWith('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${searchQuery}%` });
                expect(queryBuilder.take).toHaveBeenCalledWith(20);
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
                logger_1.default.error.mockImplementation(() => { });
                await expect(exerciseService.searchExercises(searchQuery))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to search exercises', 500));
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
                mockExerciseRepository.createQueryBuilder = jest.fn().mockImplementation(() => {
                    throw new Error(`'${invalidDifficulty}' is not a valid Difficulty`);
                });
                await expect(exerciseService.getExercisesByDifficulty(invalidDifficulty))
                    .rejects
                    .toThrow(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercises by difficulty', 500));
            });
        });
    });
});
//# sourceMappingURL=ExerciseService.test.js.map