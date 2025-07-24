# OKGYM Backend Testing Strategy

This document outlines our testing strategy for the OKGYM backend, with a focus on the Exercise service.

## Testing Layers

Our testing strategy consists of three main layers:

### 1. Unit Tests

Unit tests verify the functionality of individual service methods in isolation. These tests use mock repositories, cache managers, and other dependencies to test each method's business logic.

**Example: `backend/src/tests/services/ExerciseService.test.ts`**

This file tests the Exercise service with the following coverage:

- **CRUD Operations**
  - Create exercise (with validation, error handling)
  - Get exercise by ID (with caching)
  - Update exercise (with validation, error handling)
  - Delete exercise (with validation, cascade deletion)
  - Get all exercises (with filtering, pagination, sorting)

- **Category and Equipment Management**
  - Get all categories
  - Get category by ID
  - Create category
  - Find exercises by category
  - Get all equipment
  - Get equipment by ID
  - Create equipment
  - Find exercises by equipment

- **Media Management**
  - Get exercise media
  - Attach media to exercise
  - Detach media from exercise
  - Set primary exercise media

- **Exercise Relationships**
  - Create exercise relation
  - Get related exercises
  - Remove exercise relation

- **Search and Filtering**
  - Search exercises by keyword
  - Find exercises by category
  - Get exercises by difficulty
  - Get popular exercises
  - Get exercises by muscle group
  - Get exercises by movement pattern

- **Caching Behavior**
  - Cache hits and misses
  - Cache invalidation when updating or deleting
  - Forced cache refresh

- **Error Handling**
  - Not Found errors
  - Validation errors
  - Conflict errors
  - Database errors

### 2. Integration Tests

Integration tests verify the interactions between components, specifically the API endpoints and their handling of requests and responses.

**Example: `backend/src/tests/integration/exercise.integration.test.ts`**

These tests focus on:

- API endpoints
  - Request validation
  - Response format and status codes
  - Error handling
  - Data transformation

- Controller-Service interaction
  - Correct service methods are called with proper parameters
  - Controller correctly processes the service responses

### 3. Performance Tests

Performance tests measure the system's behavior under load, with a focus on response times, memory usage, and scalability.

**Example: `backend/src/tests/performance/exercise.performance.test.ts`**

These tests focus on:

- **Caching Performance**
  - Measuring the performance difference between cached and non-cached requests
  - Verifying that cache invalidation works correctly
  - Testing cache bypass behavior

- **Search Performance**
  - Measuring search operation performance with various query types
  - Testing performance with large result sets
  - Verifying efficient filtering and sorting

- **Memory Usage**
  - Monitoring memory consumption during operations on large datasets
  - Checking for memory leaks or excessive usage

- **Scalability**
  - Testing performance with increasing dataset sizes
  - Verifying that performance degradation is sublinear (ideally logarithmic)

- **Metrics Recording**
  - Ensuring performance metrics are properly recorded for monitoring

## Implementation Notes

### Mocking Dependencies

To isolate components for testing, we use Jest's mocking capabilities:

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  // other methods...
};

// Mock the dependencies
jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    // other methods...
  }
}));
```

### Performance Measurement

For measuring execution time differences:

```typescript
const start = performance.now();
await serviceMethod();
const duration = performance.now() - start;
```

### Memory Usage Tracking

For tracking memory usage:

```typescript
const memoryBefore = process.memoryUsage().heapUsed;
await operation();
const memoryAfter = process.memoryUsage().heapUsed;
const memoryIncreaseMB = (memoryAfter - memoryBefore) / 1024 / 1024;
```

### Test Data Generation

For performance tests with large datasets:

```typescript
function createMockExercises(count: number) {
  const exercises = [];
  for (let i = 0; i < count; i++) {
    exercises.push({
      id: `exercise-${i}`,
      // other properties with varied values...
    });
  }
  return exercises;
}
```

## Running Tests

To run the tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- -t "ExerciseService"

# Run with coverage
npm test -- --coverage
```

## Continuous Integration

Tests are run automatically on pull requests and before deployments to ensure code quality and prevent regressions.

## Test Data Management

Test data is primarily generated programmatically within the test files. This approach ensures:

1. Tests are self-contained
2. Data can be tailored to specific test cases
3. Tests can be run in any order without dependencies

## Future Improvements

- Add end-to-end tests for complete user flows
- Implement load testing for API endpoints
- Add property-based testing for more robust validation
- Implement contract testing for API format validation
- Align test mock objects with production types more closely

## Type Safety

We use TypeScript interfaces and type assertions to ensure type safety even in tests:

```typescript
// Casting to any where appropriate for testing purposes
const result = await exerciseService.createExercise(newExerciseData as any);

// Using proper interfaces
interface ExerciseDTO {
  name: string;
  description: string;
  // other properties...
}
``` 