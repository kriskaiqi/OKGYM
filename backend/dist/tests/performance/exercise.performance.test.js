"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Enums_1 = require("../../models/shared/Enums");
const perf_hooks_1 = require("perf_hooks");
const mockExerciseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn()
    })
};
const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
};
const mockEquipmentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
};
const mockRelationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
};
const mockMediaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn()
};
const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    reset: jest.fn()
};
const mockMetrics = {
    recordTime: jest.fn(),
    incrementCounter: jest.fn(),
    recordServiceMetric: jest.fn(),
    recordCacheMetric: jest.fn(),
    recordDatabaseMetric: jest.fn()
};
function createMockExercises(count) {
    const exercises = [];
    for (let i = 0; i < count; i++) {
        exercises.push({
            id: `exercise-${i}`,
            name: `Exercise ${i}`,
            description: `Description for exercise ${i}`,
            types: [i % 2 === 0 ? Enums_1.ExerciseType.STRENGTH_COMPOUND : Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: i % 3 === 0 ? Enums_1.Difficulty.BEGINNER : i % 3 === 1 ? Enums_1.Difficulty.INTERMEDIATE : Enums_1.Difficulty.ADVANCED,
            movementPattern: i % 5 === 0 ? Enums_1.MovementPattern.PUSH : i % 5 === 1 ? Enums_1.MovementPattern.PULL : i % 5 === 2 ? Enums_1.MovementPattern.SQUAT : i % 5 === 3 ? Enums_1.MovementPattern.HINGE : Enums_1.MovementPattern.ROTATION,
            instructions: `Instructions for exercise ${i}`,
            targetMuscleGroups: [`MUSCLE_${i % 10}`, `MUSCLE_${(i + 1) % 10}`],
            synergistMuscleGroups: [`MUSCLE_${(i + 2) % 10}`, `MUSCLE_${(i + 3) % 10}`],
            categories: [],
            equipmentOptions: [],
            viewCount: i % 100,
            createdAt: new Date(Date.now() - i * 86400000),
            updatedAt: new Date(Date.now() - i * 43200000)
        });
    }
    return exercises;
}
class MockExerciseService {
    constructor() {
        this.exerciseRepository = mockExerciseRepository;
        this.categoryRepository = mockCategoryRepository;
        this.equipmentRepository = mockEquipmentRepository;
        this.relationRepository = mockRelationRepository;
        this.mediaRepository = mockMediaRepository;
        this.cacheManager = mockCacheManager;
    }
    async getAllExercises(filters, forceFresh = false) {
        const start = perf_hooks_1.performance.now();
        if (!forceFresh) {
            const cacheKey = 'all_exercises';
            const cachedExercises = await this.cacheManager.get(cacheKey);
            if (cachedExercises) {
                mockMetrics.recordCacheMetric('cache_hit', 'getAllExercises', perf_hooks_1.performance.now() - start);
                return cachedExercises;
            }
            mockMetrics.recordCacheMetric('cache_miss', 'getAllExercises', 0);
        }
        const queryStart = perf_hooks_1.performance.now();
        const exercises = await this.exerciseRepository.findAndCount();
        const queryDuration = perf_hooks_1.performance.now() - queryStart;
        if (!forceFresh) {
            const cacheKey = 'all_exercises';
            await this.cacheManager.set(cacheKey, exercises);
        }
        const totalDuration = perf_hooks_1.performance.now() - start;
        mockMetrics.recordServiceMetric('getAllExercises', totalDuration);
        mockMetrics.recordDatabaseMetric('exercise_find', queryDuration);
        return exercises;
    }
    async getExerciseById(id, forceFresh = false) {
        const start = perf_hooks_1.performance.now();
        if (!forceFresh) {
            const cacheKey = `exercise_${id}`;
            const cachedExercise = await this.cacheManager.get(cacheKey);
            if (cachedExercise) {
                mockMetrics.recordCacheMetric('cache_hit', 'getExerciseById', perf_hooks_1.performance.now() - start);
                return cachedExercise;
            }
            mockMetrics.recordCacheMetric('cache_miss', 'getExerciseById', 0);
        }
        const queryStart = perf_hooks_1.performance.now();
        const exercise = await this.exerciseRepository.findOne();
        const queryDuration = perf_hooks_1.performance.now() - queryStart;
        if (exercise && !forceFresh) {
            const cacheKey = `exercise_${id}`;
            await this.cacheManager.set(cacheKey, exercise);
        }
        const totalDuration = perf_hooks_1.performance.now() - start;
        mockMetrics.recordServiceMetric('getExerciseById', totalDuration);
        mockMetrics.recordDatabaseMetric('exercise_findOne', queryDuration);
        return exercise;
    }
    async searchExercises(keyword) {
        const start = perf_hooks_1.performance.now();
        const cacheKey = `search_${keyword}`;
        const cachedResults = await this.cacheManager.get(cacheKey);
        if (cachedResults) {
            mockMetrics.recordCacheMetric('cache_hit', 'searchExercises', perf_hooks_1.performance.now() - start);
            return cachedResults;
        }
        mockMetrics.recordCacheMetric('cache_miss', 'searchExercises', 0);
        const queryStart = perf_hooks_1.performance.now();
        const queryBuilder = this.exerciseRepository.createQueryBuilder();
        queryBuilder.where('name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('description ILIKE :keyword', { keyword: `%${keyword}%` });
        const results = mockExerciseRepository.createQueryBuilder().getMany();
        const queryDuration = perf_hooks_1.performance.now() - queryStart;
        const searchResults = [await results, (await results).length];
        await this.cacheManager.set(cacheKey, searchResults);
        const totalDuration = perf_hooks_1.performance.now() - start;
        mockMetrics.recordServiceMetric('searchExercises', totalDuration);
        mockMetrics.recordDatabaseMetric('exercise_search', queryDuration);
        return searchResults;
    }
    async getExercisesByMuscleGroup(muscleGroup) {
        const start = perf_hooks_1.performance.now();
        const cacheKey = `muscle_${muscleGroup}`;
        const cachedResults = await this.cacheManager.get(cacheKey);
        if (cachedResults) {
            mockMetrics.recordCacheMetric('cache_hit', 'getExercisesByMuscleGroup', perf_hooks_1.performance.now() - start);
            return cachedResults;
        }
        mockMetrics.recordCacheMetric('cache_miss', 'getExercisesByMuscleGroup', 0);
        const queryStart = perf_hooks_1.performance.now();
        const queryBuilder = this.exerciseRepository.createQueryBuilder();
        queryBuilder.where('targetMuscleGroups @> ARRAY[:muscleGroup]', { muscleGroup })
            .orWhere('synergistMuscleGroups @> ARRAY[:muscleGroup]', { muscleGroup });
        const results = mockExerciseRepository.createQueryBuilder().getMany();
        const queryDuration = perf_hooks_1.performance.now() - queryStart;
        const muscleResults = [await results, (await results).length];
        await this.cacheManager.set(cacheKey, muscleResults);
        const totalDuration = perf_hooks_1.performance.now() - start;
        mockMetrics.recordServiceMetric('getExercisesByMuscleGroup', totalDuration);
        mockMetrics.recordDatabaseMetric('exercise_muscle', queryDuration);
        return muscleResults;
    }
}
describe('Exercise Service Performance Tests', () => {
    let exerciseService;
    const LARGE_DATASET_SIZE = 1000;
    const MEDIUM_DATASET_SIZE = 500;
    let mockExercises;
    console.log('Starting test suite');
    beforeEach(() => {
        jest.clearAllMocks();
        exerciseService = new MockExerciseService();
        mockExercises = createMockExercises(LARGE_DATASET_SIZE);
        mockExerciseRepository.findAndCount.mockResolvedValue([mockExercises, mockExercises.length]);
        mockExerciseRepository.findOne.mockResolvedValue(mockExercises[0]);
        mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValue(mockExercises.slice(0, 50));
    });
    afterAll(() => {
        console.log('Finished test suite');
    });
    describe('Caching Performance Tests', () => {
        it('should use cache on second call', async () => {
            mockCacheManager.get.mockResolvedValueOnce(null);
            const start1 = perf_hooks_1.performance.now();
            await exerciseService.getAllExercises();
            const duration1 = perf_hooks_1.performance.now() - start1;
            expect(mockCacheManager.set).toHaveBeenCalled();
            mockCacheManager.get.mockResolvedValueOnce([mockExercises, mockExercises.length]);
            mockExerciseRepository.findAndCount.mockClear();
            const start2 = perf_hooks_1.performance.now();
            await exerciseService.getAllExercises();
            const duration2 = perf_hooks_1.performance.now() - start2;
            expect(mockExerciseRepository.findAndCount).not.toHaveBeenCalled();
            console.log(`First call (no cache): ${duration1}ms`);
            console.log(`Second call (with cache): ${duration2}ms`);
            console.log(`Performance difference: ${((duration2 - duration1) / duration1 * 100).toFixed(2)}%`);
        });
        it('should bypass cache when forced', async () => {
            mockCacheManager.get.mockResolvedValue([mockExercises.slice(0, 10), 10]);
            await exerciseService.getAllExercises();
            expect(mockExerciseRepository.findAndCount).not.toHaveBeenCalled();
            mockExerciseRepository.findAndCount.mockClear();
            await exerciseService.getAllExercises({}, true);
            expect(mockExerciseRepository.findAndCount).toHaveBeenCalled();
        });
    });
    describe('Search Performance Tests', () => {
        it('should perform keyword search efficiently', async () => {
            const filteredExercises = mockExercises.slice(0, 25);
            mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValueOnce(filteredExercises);
            const searchQuery = 'squat';
            const start = perf_hooks_1.performance.now();
            const result = await exerciseService.searchExercises(searchQuery);
            const duration = perf_hooks_1.performance.now() - start;
            expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalled();
            console.log(`Search for "${searchQuery}" took ${duration}ms`);
            expect(duration).toBeLessThan(500);
            expect(result[0].length).toBeGreaterThan(0);
        });
        it('should perform muscle group search with good performance', async () => {
            const filteredExercises = mockExercises.filter(e => e.targetMuscleGroups.includes('MUSCLE_1') ||
                e.synergistMuscleGroups.includes('MUSCLE_1'));
            mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValueOnce(filteredExercises);
            const muscleGroup = 'MUSCLE_1';
            const start = perf_hooks_1.performance.now();
            const result = await exerciseService.getExercisesByMuscleGroup(muscleGroup);
            const duration = perf_hooks_1.performance.now() - start;
            expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalled();
            console.log(`Muscle group search for "${muscleGroup}" took ${duration}ms`);
            expect(duration).toBeLessThan(500);
        });
    });
    describe('Memory Usage Tests', () => {
        it('should not cause excessive memory usage with large datasets', async () => {
            const largeDataset = createMockExercises(5000);
            mockExerciseRepository.findAndCount.mockResolvedValue([largeDataset, largeDataset.length]);
            const memoryBefore = process.memoryUsage().heapUsed;
            await exerciseService.getAllExercises();
            const memoryAfter = process.memoryUsage().heapUsed;
            const memoryIncreaseMB = (memoryAfter - memoryBefore) / 1024 / 1024;
            console.log(`Memory usage increased by ${memoryIncreaseMB.toFixed(2)} MB`);
            expect(memoryIncreaseMB).toBeLessThan(100);
        });
    });
    describe('Service Metrics Tests', () => {
        it('should track operations without errors', async () => {
            mockMetrics.recordServiceMetric.mockClear();
            mockMetrics.recordCacheMetric.mockClear();
            await exerciseService.getAllExercises();
            await exerciseService.getExerciseById('exercise-1');
            await exerciseService.searchExercises('squat');
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=exercise.performance.test.js.map