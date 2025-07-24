# Exercise Service Implementation Patterns

This document contains common implementation patterns to follow when developing the Exercise Service. These patterns ensure consistency with the rest of the OKGYM codebase.

## Table of Contents
1. [Error Handling](#error-handling)
2. [Caching Pattern](#caching-pattern)
3. [Performance Tracking](#performance-tracking)
4. [Repository Access](#repository-access)
5. [Validation](#validation)
6. [Transaction Management](#transaction-management)
7. [Query Building](#query-building)
8. [Controller Patterns](#controller-patterns)

## Error Handling

Use the AppError class for all errors, with appropriate error types:

```typescript
import { AppError, ErrorType } from '../utils/errors';

// Example: Entity not found
if (!exercise) {
  throw new AppError(
    ErrorType.NOT_FOUND_ERROR,
    `Exercise with ID ${id} not found`
  );
}

// Example: Validation error
if (!isValid(exerciseData)) {
  throw new AppError(
    ErrorType.VALIDATION_ERROR,
    'Invalid exercise data provided'
  );
}

// Example: Authorization error
if (!canUserEditExercise(userId, exerciseId)) {
  throw new AppError(
    ErrorType.AUTHORIZATION_ERROR,
    'User not authorized to edit this exercise'
  );
}

// Example: Database error with logging
try {
  return await this.exerciseRepository.save(exercise);
} catch (error) {
  logger.error('Database error while saving exercise:', error);
  throw new AppError(
    ErrorType.DATABASE_ERROR, 
    'Failed to save exercise'
  );
}
```

## Caching Pattern

Use the CacheManager for all caching operations:

```typescript
import { cacheManager } from '../services/CacheManager';

// Get from cache first
async getExerciseById(id: string): Promise<Exercise | null> {
  const cacheKey = `exercise:${id}`;
  
  // Try to get from cache first
  const cachedExercise = await cacheManager.get<Exercise>(cacheKey);
  if (cachedExercise) {
    return cachedExercise;
  }
  
  // If not in cache, get from database
  const exercise = await this.exerciseRepository.findOne({
    where: { id },
    relations: ['categories', 'equipment']
  });
  
  // Cache the result if found
  if (exercise) {
    await cacheManager.set(
      cacheKey, 
      exercise, 
      { ttl: this.cacheTTL, namespace: 'exercises' }
    );
  }
  
  return exercise;
}

// Invalidate cache on updates
async updateExercise(id: string, data: Partial<ExerciseDTO>): Promise<Exercise> {
  // Update logic here...
  
  // Invalidate related caches
  await cacheManager.delete(`exercise:${id}`);
  await cacheManager.deleteByPattern('exercises:list:*');
  
  return updatedExercise;
}
```

## Performance Tracking

Use the SimpleTrack decorator for performance monitoring:

```typescript
import { SimpleTrack } from '../utils/performance';

@SimpleTrack({ slowThreshold: 200 })
async getExerciseById(id: string): Promise<Exercise | null> {
  // Method implementation...
}

@SimpleTrack({ 
  slowThreshold: 500,
  domain: 'exercises',
  operation: 'search' 
})
async searchExercises(query: string): Promise<Exercise[]> {
  // Search implementation...
}
```

## Repository Access

Access repositories following this pattern:

```typescript
import { Repository } from 'typeorm';
import { Exercise } from '../models/Exercise';
import { AppDataSource } from '../data-source';

export class ExerciseService {
  private exerciseRepository: Repository<Exercise>;
  
  constructor() {
    this.exerciseRepository = AppDataSource.getRepository(Exercise);
  }
  
  // Use the repository for queries
  async findByName(name: string): Promise<Exercise | null> {
    return this.exerciseRepository.findOne({
      where: { name }
    });
  }
}
```

## Validation

Apply validation using class-validator in DTOs and before persistence:

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

async createExercise(exerciseData: ExerciseDTO): Promise<Exercise> {
  // Transform plain object to class instance for validation
  const exerciseDto = plainToClass(ExerciseDTO, exerciseData);
  
  // Validate
  const errors = await validate(exerciseDto);
  if (errors.length > 0) {
    throw new AppError(
      ErrorType.VALIDATION_ERROR,
      `Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`
    );
  }
  
  // Create entity and save
  const exercise = new Exercise();
  Object.assign(exercise, exerciseDto);
  
  return this.exerciseRepository.save(exercise);
}
```

## Transaction Management

Use transactions for operations that modify multiple entities:

```typescript
import { executeTransaction } from '../utils/transaction-helper';

async createExerciseWithCategories(
  exerciseData: ExerciseDTO, 
  categoryIds: string[]
): Promise<Exercise> {
  return await executeTransaction(async transactionManager => {
    // Create exercise
    const exercise = new Exercise();
    Object.assign(exercise, exerciseData);
    
    const savedExercise = await transactionManager.save(exercise);
    
    // Load and associate categories
    if (categoryIds?.length) {
      const categories = await transactionManager.findByIds(
        ExerciseCategory, 
        categoryIds
      );
      
      savedExercise.categories = categories;
      await transactionManager.save(savedExercise);
    }
    
    return savedExercise;
  });
}
```

## Query Building

Build complex queries using QueryBuilder:

```typescript
async getExercisesByFilters(filterOptions: ExerciseFilterOptions): Promise<[Exercise[], number]> {
  const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
    .leftJoinAndSelect('exercise.categories', 'category')
    .leftJoinAndSelect('exercise.equipment', 'equipment');
  
  // Apply filters
  if (filterOptions.difficulty) {
    queryBuilder.andWhere('exercise.difficulty = :difficulty', { 
      difficulty: filterOptions.difficulty 
    });
  }
  
  if (filterOptions.categoryIds?.length) {
    queryBuilder.andWhere('category.id IN (:...categoryIds)', { 
      categoryIds: filterOptions.categoryIds 
    });
  }
  
  if (filterOptions.search) {
    queryBuilder.andWhere(
      '(exercise.name ILIKE :search OR exercise.description ILIKE :search)', 
      { search: `%${filterOptions.search}%` }
    );
  }
  
  // Apply pagination
  if (filterOptions.page && filterOptions.limit) {
    const skip = (filterOptions.page - 1) * filterOptions.limit;
    queryBuilder.skip(skip).take(filterOptions.limit);
  }
  
  // Apply sorting
  if (filterOptions.sortBy) {
    const order = filterOptions.sortOrder === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`exercise.${filterOptions.sortBy}`, order);
  } else {
    queryBuilder.orderBy('exercise.name', 'ASC');
  }
  
  // Get results
  return await queryBuilder.getManyAndCount();
}
```

## Controller Patterns

Structure controllers following this pattern:

```typescript
import { Request, Response } from 'express';
import { ExerciseService } from '../services/ExerciseService';
import { AppError, ErrorType } from '../utils/errors';

export class ExerciseController {
  private exerciseService: ExerciseService;
  
  constructor() {
    this.exerciseService = new ExerciseService();
  }
  
  async createExercise(req: Request, res: Response) {
    try {
      const exerciseData = req.body;
      const result = await this.exerciseService.createExercise(exerciseData);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        switch (error.type) {
          case ErrorType.VALIDATION_ERROR:
            return res.status(400).json({ message: error.message });
          case ErrorType.AUTHORIZATION_ERROR:
            return res.status(403).json({ message: error.message });
          default:
            return res.status(500).json({ message: error.message });
        }
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async getExercises(req: Request, res: Response) {
    try {
      // Parse query parameters for filtering
      const filterOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        difficulty: req.query.difficulty as string,
        categoryIds: req.query.categoryIds 
          ? (req.query.categoryIds as string).split(',') 
          : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
        search: req.query.search as string
      };
      
      const [exercises, total] = await this.exerciseService.getAllExercises(filterOptions);
      
      return res.status(200).json({
        data: exercises,
        meta: {
          total,
          page: filterOptions.page,
          limit: filterOptions.limit,
          totalPages: Math.ceil(total / filterOptions.limit)
        }
      });
    } catch (error) {
      // Error handling...
    }
  }
  
  // Other controller methods...
}
```

Following these patterns will ensure that the Exercise Service implementation remains consistent with the existing codebase and follows the established best practices. 