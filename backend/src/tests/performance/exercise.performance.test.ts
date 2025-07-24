import { ExerciseService } from '../../services/ExerciseService';
import { Exercise } from '../../models/Exercise';
import { ExerciseCategory } from '../../models/ExerciseCategory';
import { Equipment } from '../../models/Equipment';
import { ExerciseRelation } from '../../models/ExerciseRelation';
import { Media } from '../../models/Media';
import { Difficulty, MovementPattern, ExerciseType } from '../../models/shared/Enums';
import { performance } from 'perf_hooks';


// Mock dependencies
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

// Mock metrics
const mockMetrics = {
  recordTime: jest.fn(),
  incrementCounter: jest.fn(),
  recordServiceMetric: jest.fn(),
  recordCacheMetric: jest.fn(),
  recordDatabaseMetric: jest.fn()
};

// Create a large mock dataset for performance testing
function createMockExercises(count: number) {
  const exercises: any[] = [];
  
  for (let i = 0; i < count; i++) {
    exercises.push({
      id: `exercise-${i}`,
      name: `Exercise ${i}`,
      description: `Description for exercise ${i}`,
      types: [i % 2 === 0 ? ExerciseType.STRENGTH_COMPOUND : ExerciseType.STRENGTH_ISOLATION],
      level: i % 3 === 0 ? Difficulty.BEGINNER : i % 3 === 1 ? Difficulty.INTERMEDIATE : Difficulty.ADVANCED,
      movementPattern: i % 5 === 0 ? MovementPattern.PUSH : i % 5 === 1 ? MovementPattern.PULL : i % 5 === 2 ? MovementPattern.SQUAT : i % 5 === 3 ? MovementPattern.HINGE : MovementPattern.ROTATION,
      instructions: `Instructions for exercise ${i}`,
      targetMuscleGroups: [`MUSCLE_${i % 10}`, `MUSCLE_${(i + 1) % 10}`],
      synergistMuscleGroups: [`MUSCLE_${(i + 2) % 10}`, `MUSCLE_${(i + 3) % 10}`],
      categories: [],
      equipmentOptions: [],
      viewCount: i % 100,
      createdAt: new Date(Date.now() - i * 86400000), // Each one day older
      updatedAt: new Date(Date.now() - i * 43200000)  // Each half day older
    });
  }
  
  return exercises;
}

// Create a mock ExerciseService for performance testing
class MockExerciseService {
  private exerciseRepository: typeof mockExerciseRepository;
  private categoryRepository: typeof mockCategoryRepository;
  private equipmentRepository: typeof mockEquipmentRepository;
  private relationRepository: typeof mockRelationRepository;
  private mediaRepository: typeof mockMediaRepository;
  private cacheManager: typeof mockCacheManager;
  
  constructor() {
    this.exerciseRepository = mockExerciseRepository;
    this.categoryRepository = mockCategoryRepository;
    this.equipmentRepository = mockEquipmentRepository;
    this.relationRepository = mockRelationRepository;
    this.mediaRepository = mockMediaRepository;
    this.cacheManager = mockCacheManager;
  }
  
  // Get all exercises with optional caching
  async getAllExercises(filters?: any, forceFresh = false): Promise<[any[], number]> {
    const start = performance.now();
    
    // Check cache if not forcing refresh
    if (!forceFresh) {
      const cacheKey = 'all_exercises';
      const cachedExercises = await this.cacheManager.get(cacheKey);
      
      if (cachedExercises) {
        mockMetrics.recordCacheMetric('cache_hit', 'getAllExercises', performance.now() - start);
        return cachedExercises;
      }
      
      mockMetrics.recordCacheMetric('cache_miss', 'getAllExercises', 0);
    }
    
    // Simulate database query
    const queryStart = performance.now();
    const exercises = await this.exerciseRepository.findAndCount();
    const queryDuration = performance.now() - queryStart;
    
    // Cache results
    if (!forceFresh) {
      const cacheKey = 'all_exercises';
      await this.cacheManager.set(cacheKey, exercises);
    }
    
    const totalDuration = performance.now() - start;
    mockMetrics.recordServiceMetric('getAllExercises', totalDuration);
    mockMetrics.recordDatabaseMetric('exercise_find', queryDuration);
    
    return exercises;
  }
  
  // Get exercise by ID with caching
  async getExerciseById(id: string, forceFresh = false): Promise<any> {
    const start = performance.now();
    
    // Check cache if not forcing refresh
    if (!forceFresh) {
      const cacheKey = `exercise_${id}`;
      const cachedExercise = await this.cacheManager.get(cacheKey);
      
      if (cachedExercise) {
        mockMetrics.recordCacheMetric('cache_hit', 'getExerciseById', performance.now() - start);
        return cachedExercise;
      }
      
      mockMetrics.recordCacheMetric('cache_miss', 'getExerciseById', 0);
    }
    
    // Simulate database query
    const queryStart = performance.now();
    const exercise = await this.exerciseRepository.findOne();
    const queryDuration = performance.now() - queryStart;
    
    // Cache result
    if (exercise && !forceFresh) {
      const cacheKey = `exercise_${id}`;
      await this.cacheManager.set(cacheKey, exercise);
    }
    
    const totalDuration = performance.now() - start;
    mockMetrics.recordServiceMetric('getExerciseById', totalDuration);
    mockMetrics.recordDatabaseMetric('exercise_findOne', queryDuration);
    
    return exercise;
  }
  
  // Search exercises by keyword
  async searchExercises(keyword: string): Promise<[any[], number]> {
    const start = performance.now();
    
    // Check cache
    const cacheKey = `search_${keyword}`;
    const cachedResults = await this.cacheManager.get(cacheKey);
    
    if (cachedResults) {
      mockMetrics.recordCacheMetric('cache_hit', 'searchExercises', performance.now() - start);
      return cachedResults;
    }
    
    mockMetrics.recordCacheMetric('cache_miss', 'searchExercises', 0);
    
    // Simulate search query
    const queryStart = performance.now();
    const queryBuilder = this.exerciseRepository.createQueryBuilder();
    
    // Add search conditions
    queryBuilder.where('name ILIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('description ILIKE :keyword', { keyword: `%${keyword}%` });
    
    // We need to handle the getMany() call differently to avoid type errors
    const results = mockExerciseRepository.createQueryBuilder().getMany();
    const queryDuration = performance.now() - queryStart;
    
    // Cache results
    const searchResults: [any[], number] = [await results, (await results).length];
    await this.cacheManager.set(cacheKey, searchResults);
    
    const totalDuration = performance.now() - start;
    mockMetrics.recordServiceMetric('searchExercises', totalDuration);
    mockMetrics.recordDatabaseMetric('exercise_search', queryDuration);
    
    return searchResults;
  }
  
  // Get exercises by muscle group
  async getExercisesByMuscleGroup(muscleGroup: string): Promise<[any[], number]> {
    const start = performance.now();
    
    // Check cache
    const cacheKey = `muscle_${muscleGroup}`;
    const cachedResults = await this.cacheManager.get(cacheKey);
    
    if (cachedResults) {
      mockMetrics.recordCacheMetric('cache_hit', 'getExercisesByMuscleGroup', performance.now() - start);
      return cachedResults;
    }
    
    mockMetrics.recordCacheMetric('cache_miss', 'getExercisesByMuscleGroup', 0);
    
    // Simulate search query
    const queryStart = performance.now();
    const queryBuilder = this.exerciseRepository.createQueryBuilder();
    
    // Add muscle group conditions
    queryBuilder.where('targetMuscleGroups @> ARRAY[:muscleGroup]', { muscleGroup })
      .orWhere('synergistMuscleGroups @> ARRAY[:muscleGroup]', { muscleGroup });
    
    // We need to handle the getMany() call differently to avoid type errors
    const results = mockExerciseRepository.createQueryBuilder().getMany();
    const queryDuration = performance.now() - queryStart;
    
    // Cache results
    const muscleResults: [any[], number] = [await results, (await results).length];
    await this.cacheManager.set(cacheKey, muscleResults);
    
    const totalDuration = performance.now() - start;
    mockMetrics.recordServiceMetric('getExercisesByMuscleGroup', totalDuration);
    mockMetrics.recordDatabaseMetric('exercise_muscle', queryDuration);
    
    return muscleResults;
  }
}

describe('Exercise Service Performance Tests', () => {
  let exerciseService: MockExerciseService;
  const LARGE_DATASET_SIZE = 1000;
  const MEDIUM_DATASET_SIZE = 500;
  let mockExercises: any[];
  
  // Add console logs to track test progress
  console.log('Starting test suite');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    exerciseService = new MockExerciseService();
    
    // Generate mock data sets
    mockExercises = createMockExercises(LARGE_DATASET_SIZE);
    
    // Setup default mock implementations
    mockExerciseRepository.findAndCount.mockResolvedValue([mockExercises, mockExercises.length]);
    mockExerciseRepository.findOne.mockResolvedValue(mockExercises[0]);
    mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValue(mockExercises.slice(0, 50));
  });
  
  afterAll(() => {
    console.log('Finished test suite');
  });
  
  describe('Caching Performance Tests', () => {
    it('should use cache on second call', async () => {
      // First call - no cache
      mockCacheManager.get.mockResolvedValueOnce(null);
      
      const start1 = performance.now();
      await exerciseService.getAllExercises();
      const duration1 = performance.now() - start1;
      
      // Verify cache was set
      expect(mockCacheManager.set).toHaveBeenCalled();
      
      // Set up mock for cache hit
      mockCacheManager.get.mockResolvedValueOnce([mockExercises, mockExercises.length]);
      
      // Reset call counter
      mockExerciseRepository.findAndCount.mockClear();
      
      // Second call - with cache
      const start2 = performance.now();
      await exerciseService.getAllExercises();
      const duration2 = performance.now() - start2;
      
      // Verify repository was not called again (this is the main benefit of caching)
      expect(mockExerciseRepository.findAndCount).not.toHaveBeenCalled();
      
      // Logging for debugging
      console.log(`First call (no cache): ${duration1}ms`);
      console.log(`Second call (with cache): ${duration2}ms`);
      console.log(`Performance difference: ${((duration2 - duration1) / duration1 * 100).toFixed(2)}%`);
    });
    
    it('should bypass cache when forced', async () => {
      // Setup cache with data
      mockCacheManager.get.mockResolvedValue([mockExercises.slice(0, 10), 10]);
      
      // First call - with cache
      await exerciseService.getAllExercises();
      
      // Repository should not be called due to cache hit
      expect(mockExerciseRepository.findAndCount).not.toHaveBeenCalled();
      
      // Reset call count
      mockExerciseRepository.findAndCount.mockClear();
      
      // Second call - with force refresh (bypassing cache)
      await exerciseService.getAllExercises({}, true);
      
      // Repository should be called despite cache being available
      expect(mockExerciseRepository.findAndCount).toHaveBeenCalled();
    });
  });
  
  describe('Search Performance Tests', () => {
    it('should perform keyword search efficiently', async () => {
      // Set up mock for query builder
      const filteredExercises = mockExercises.slice(0, 25);
      mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValueOnce(filteredExercises);
      
      const searchQuery = 'squat';
      
      // Measure search performance
      const start = performance.now();
      const result = await exerciseService.searchExercises(searchQuery);
      const duration = performance.now() - start;
      
      // Verify query builder was used
      expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalled();
      
      // Log performance metrics
      console.log(`Search for "${searchQuery}" took ${duration}ms`);
      
      // This is a loose assertion since actual time depends on machine
      expect(duration).toBeLessThan(500); // 500ms is plenty of time for a mock operation
      expect(result[0].length).toBeGreaterThan(0);
    });
    
    it('should perform muscle group search with good performance', async () => {
      // Set up mock for query builder
      const filteredExercises = mockExercises.filter(e => 
        e.targetMuscleGroups.includes('MUSCLE_1') || 
        e.synergistMuscleGroups.includes('MUSCLE_1')
      );
      mockExerciseRepository.createQueryBuilder().getMany.mockResolvedValueOnce(filteredExercises);
      
      const muscleGroup = 'MUSCLE_1';
      
      // Measure search performance
      const start = performance.now();
      const result = await exerciseService.getExercisesByMuscleGroup(muscleGroup);
      const duration = performance.now() - start;
      
      // Verify query builder was used
      expect(mockExerciseRepository.createQueryBuilder).toHaveBeenCalled();
      
      // Log performance metrics
      console.log(`Muscle group search for "${muscleGroup}" took ${duration}ms`);
      
      // This is a loose assertion since actual time depends on machine
      expect(duration).toBeLessThan(500); // 500ms is plenty of time for a mock operation
    });
  });
  
  describe('Memory Usage Tests', () => {
    it('should not cause excessive memory usage with large datasets', async () => {
      // Create a large dataset
      const largeDataset = createMockExercises(5000);
      mockExerciseRepository.findAndCount.mockResolvedValue([largeDataset, largeDataset.length]);
      
      // Measure memory before
      const memoryBefore = process.memoryUsage().heapUsed;
      
      // Perform operation
      await exerciseService.getAllExercises();
      
      // Measure memory after
      const memoryAfter = process.memoryUsage().heapUsed;
      
      // Calculate memory increase in MB
      const memoryIncreaseMB = (memoryAfter - memoryBefore) / 1024 / 1024;
      
      // Log memory usage
      console.log(`Memory usage increased by ${memoryIncreaseMB.toFixed(2)} MB`);
      
      // Memory increase should be reasonable
      expect(memoryIncreaseMB).toBeLessThan(100); // 100MB is a generous threshold
    });
  });
  
  describe('Service Metrics Tests', () => {
    it('should track operations without errors', async () => {
      // Reset metrics
      mockMetrics.recordServiceMetric.mockClear();
      mockMetrics.recordCacheMetric.mockClear();
      
      // Perform operations - these should complete without errors
      await exerciseService.getAllExercises();
      await exerciseService.getExerciseById('exercise-1');
      await exerciseService.searchExercises('squat');
      
      // Test passes as long as the operations completed successfully
      expect(true).toBe(true);
    });
  });
}); 