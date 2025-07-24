# Exercise Service Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationships](#entity-relationships)
3. [Development Phases](#development-phases)
4. [Implementation Checklist](#implementation-checklist)
5. [Service Methods](#service-methods)
6. [DTOs and Interfaces](#dtos-and-interfaces)
7. [Controller Implementation](#controller-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Documentation Standards](#documentation-standards)

## Overview

The Exercise Service is responsible for managing the exercise library in the OKGYM application. This includes:
- Creating, updating, retrieving, and deleting exercises
- Managing exercise categories and equipment associations
- Handling exercise media (images, videos, tutorials)
- Supporting exercise relationships (alternatives, progressions)
- Providing search and filtering capabilities

## Entity Relationships

The Exercise Service interacts with several entities:

```
Exercise
├── has many → ExerciseDetails (technique information)
├── belongs to many → ExerciseCategory (categorization)
├── belongs to many → Equipment (required equipment)
├── has many → Media (images, videos, tutorials)
├── has many → ExerciseRelation (source)
└── has many → ExerciseRelation (target)

ExerciseCategory
└── has many → Exercise

Equipment
└── used by many → Exercise

Media
└── belongs to many → Exercise (different contexts)

ExerciseRelation
├── belongs to → Exercise (source)
└── belongs to → Exercise (target)
```

## Development Phases

### Phase 1: Core Setup
- [ ] Review existing Exercise entity model
- [ ] Set up basic ExerciseService structure
- [ ] Implement repository dependencies
- [ ] Configure caching strategy
- [ ] Set up performance tracking

### Phase 2: CRUD Operations
- [ ] Implement createExercise
- [ ] Implement getExerciseById
- [ ] Implement updateExercise
- [ ] Implement deleteExercise
- [ ] Implement getAllExercises with filtering/pagination

### Phase 3: Category Management
- [ ] Implement getExerciseCategories
- [ ] Implement getCategoryById
- [ ] Implement createCategory
- [ ] Implement updateCategory
- [ ] Implement deleteCategory
- [ ] Implement findExercisesByCategory

### Phase 4: Equipment Integration
- [ ] Implement getEquipmentById
- [ ] Implement getAllEquipment
- [ ] Implement createEquipment
- [ ] Implement updateEquipment
- [ ] Implement deleteEquipment
- [ ] Implement findExercisesByEquipment

### Phase 5: Media Management
- [ ] Implement attachMediaToExercise
- [ ] Implement detachMediaFromExercise
- [ ] Implement getExerciseMedia
- [ ] Implement updateExerciseMediaOrder
- [ ] Implement setPrimaryExerciseMedia

### Phase 6: Exercise Relationships
- [ ] Implement createExerciseRelation
- [ ] Implement getRelatedExercises
- [ ] Implement removeExerciseRelation
- [ ] Implement getExerciseAlternatives
- [ ] Implement getExerciseProgressions

### Phase 7: Advanced Search
- [ ] Implement searchExercises
- [ ] Implement getExercisesByMuscleGroup
- [ ] Implement getExercisesByDifficulty
- [ ] Implement getExercisesByMovementPattern
- [ ] Implement getPopularExercises

### Phase 8: Controller Implementation
- [ ] Set up ExerciseController
- [ ] Implement CRUD endpoints
- [ ] Implement category endpoints
- [ ] Implement equipment endpoints
- [ ] Implement search endpoints
- [ ] Implement relation endpoints

### Phase 9: Testing
- [ ] Write unit tests for service methods
- [ ] Write integration tests for API endpoints
- [ ] Write performance tests for critical methods

## Implementation Checklist

### Core Setup Tasks
- [ ] Review the Exercise entity model at `backend/src/models/Exercise.ts`
- [ ] Review related entity models (ExerciseCategory, Equipment, etc.)
- [ ] Update the ExerciseService class at `backend/src/services/ExerciseService.ts`
- [ ] Set up repository dependencies
- [ ] Configure caching with appropriate TTL
- [ ] Add performance tracking with SimpleTrack decorator

### Service Class Structure
```typescript
// Basic structure for ExerciseService.ts
import { Repository } from 'typeorm';
import { SimpleTrack } from '../utils/performance';
import { AppError, ErrorType } from '../utils/errors';
import { cacheManager } from './CacheManager';

export class ExerciseService {
  private exerciseRepository: Repository<Exercise>;
  private categoryRepository: Repository<ExerciseCategory>;
  private equipmentRepository: Repository<Equipment>;
  private mediaRepository: Repository<Media>;
  private relationRepository: Repository<ExerciseRelation>;
  private cacheTTL: number;
  
  constructor() {
    this.exerciseRepository = AppDataSource.getRepository(Exercise);
    this.categoryRepository = AppDataSource.getRepository(ExerciseCategory);
    this.equipmentRepository = AppDataSource.getRepository(Equipment);
    this.mediaRepository = AppDataSource.getRepository(Media);
    this.relationRepository = AppDataSource.getRepository(ExerciseRelation);
    this.cacheTTL = config.cache?.ttl?.exercise || 3600; // 1 hour default
  }
  
  // Service methods will be implemented here
}
```

## Service Methods

### Exercise CRUD Operations

```typescript
/**
 * Create a new exercise
 * @param exerciseData Exercise data transfer object
 * @returns Newly created exercise
 * @throws {AppError} If validation fails or database error
 */
@SimpleTrack({ slowThreshold: 200 })
async createExercise(exerciseData: ExerciseDTO): Promise<Exercise> {
  // Implementation
}

/**
 * Get exercise by ID
 * @param id Exercise ID
 * @returns Exercise or null if not found
 * @throws {AppError} If database error
 */
@SimpleTrack({ slowThreshold: 100 })
async getExerciseById(id: string): Promise<Exercise | null> {
  // Implementation with caching
}

/**
 * Update an existing exercise
 * @param id Exercise ID
 * @param exerciseData Partial exercise data
 * @returns Updated exercise
 * @throws {AppError} If exercise not found, validation fails, or database error
 */
@SimpleTrack({ slowThreshold: 200 })
async updateExercise(id: string, exerciseData: Partial<ExerciseDTO>): Promise<Exercise> {
  // Implementation
}

/**
 * Delete an exercise
 * @param id Exercise ID
 * @throws {AppError} If exercise not found or database error
 */
@SimpleTrack({ slowThreshold: 200 })
async deleteExercise(id: string): Promise<void> {
  // Implementation
}

/**
 * Get all exercises with filtering, pagination, and sorting
 * @param filterOptions Filter options
 * @returns Array of exercises and total count
 * @throws {AppError} If database error
 */
@SimpleTrack({ slowThreshold: 300 })
async getAllExercises(filterOptions?: ExerciseFilterOptions): Promise<[Exercise[], number]> {
  // Implementation
}
```

### Category Management Operations
```typescript
// Define Category CRUD methods
```

### Equipment Operations
```typescript
// Define Equipment CRUD methods
```

### Media Management Operations
```typescript
// Define Media management methods
```

### Exercise Relationship Operations
```typescript
// Define Relationship management methods
```

### Search Operations
```typescript
// Define Search methods
```

## DTOs and Interfaces

Create these DTOs to support the Exercise Service:

```typescript
// Exercise DTO
export interface ExerciseDTO {
  name: string;
  description: string;
  type: ExerciseType;
  difficulty: Difficulty;
  muscleGroups: MuscleGroup[];
  movementPattern: MovementPattern;
  categoryIds?: string[];
  equipmentIds?: string[];
  instructions?: string;
  // Other properties
}

// Filter Options
export interface ExerciseFilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  categoryIds?: string[];
  equipmentIds?: string[];
  difficulty?: Difficulty;
  muscleGroups?: MuscleGroup[];
  type?: ExerciseType;
  search?: string;
}

// Category DTO
export interface CategoryDTO {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

// Equipment DTO
export interface EquipmentDTO {
  name: string;
  description?: string;
  imageUrl?: string;
}

// Relation DTO
export interface ExerciseRelationDTO {
  sourceExerciseId: string;
  targetExerciseId: string;
  relationType: RelationType;
  notes?: string;
}
```

## Controller Implementation

After the service is complete, implement the ExerciseController with these endpoints:

### Core Exercise Endpoints
- `POST /api/exercises` - Create exercise
- `GET /api/exercises` - List exercises (with filtering)
- `GET /api/exercises/:id` - Get single exercise
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### Category Endpoints
- `GET /api/exercise-categories` - List categories
- `POST /api/exercise-categories` - Create category
- `GET /api/exercise-categories/:id` - Get single category
- `PUT /api/exercise-categories/:id` - Update category
- `DELETE /api/exercise-categories/:id` - Delete category
- `GET /api/exercise-categories/:id/exercises` - Get exercises in category

### Equipment Endpoints
- Similar CRUD endpoints for equipment management

### Search and Filtering Endpoints
- `GET /api/exercises/search` - Search exercises by keyword
- `GET /api/exercises/by-muscle/:muscleGroup` - Filter by muscle group
- `GET /api/exercises/by-equipment/:equipmentId` - Filter by equipment
- `GET /api/exercises/popular` - Get popular exercises

### Relationship Endpoints
- `GET /api/exercises/:id/related` - Get related exercises
- `POST /api/exercises/:id/relations` - Create relationship
- `DELETE /api/exercises/relations/:relationId` - Remove relationship

## Testing Strategy

### Unit Tests
- Test each service method in isolation with mocked repositories
- Test valid inputs and edge cases
- Verify error handling for each method
- Validate caching behavior

### Integration Tests
- Test API endpoints with actual database connections
- Verify proper HTTP responses
- Test authorization and validation middleware
- Test relationship cascades

### Example Test Cases
```typescript
// Exercise creation test
it('should create a new exercise', async () => {
  // Setup
  const exerciseDTO = { /* test data */ };
  
  // Execute
  const result = await exerciseService.createExercise(exerciseDTO);
  
  // Verify
  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  expect(result.name).toEqual(exerciseDTO.name);
  // Additional assertions
});

// Error handling test
it('should throw AppError when creating exercise with invalid data', async () => {
  // Setup
  const invalidDTO = { /* invalid test data */ };
  
  // Execute & Verify
  await expect(exerciseService.createExercise(invalidDTO))
    .rejects
    .toThrow(AppError);
});
```

## Performance Considerations

### Caching Strategy
- Cache individual exercises by ID
- Cache lists with short TTL (5-10 minutes)
- Invalidate cache when exercises are updated/deleted
- Use namespaced cache keys: `exercise:${id}`, `exercises:list:${hash}`

### Query Optimization
- Use eager loading for related entities only when needed
- Implement pagination for all list operations
- Use optimized queries for search operations
- Consider adding database indexes for frequently filtered fields

## Documentation Standards

### JSDoc Comments
All service methods should include JSDoc comments with:
- Description of functionality
- Parameter descriptions
- Return value description
- Thrown exceptions

### Example Comment
```typescript
/**
 * Get exercises by muscle group with pagination and sorting
 * 
 * @param muscleGroup The target muscle group to filter by
 * @param options Filtering, pagination, and sorting options
 * @returns Tuple containing array of exercises and total count
 * @throws {AppError} If invalid muscle group or database error
 */
```

### Swagger/OpenAPI Documentation
After implementing the controller, add OpenAPI annotations for API documentation. 