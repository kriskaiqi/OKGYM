# WorkoutPlanService Testing Guide

## Problem Overview

The WorkoutPlanService has been challenging to test using Jest due to:

1. Dependencies with side effects (logger, performance tracking, caching)
2. Complex database interactions requiring careful mocking
3. Open handles from interval timers preventing test completion

## Solution Approach

### Direct Simplified Testing

The most effective approach for testing the `WorkoutPlanService` is using a simplified script as shown in `debug-wo.js`. This approach:

1. Uses simple mock objects directly passed to the service
2. Overrides key utility functions that cause side effects
3. Avoids the complexity of Jest's mocking system for quick debugging

### Key Steps for Testing

1. **Create mock repositories** with simplified async methods that return expected data
2. **Override logger methods** to prevent errors with the logging system
3. **Override the transaction helper** to simulate database transactions
4. **Override cache manager** to prevent errors with cache operations
5. **Create the service** with mocked repositories
6. **Test each method** in isolation, catching errors for better diagnostics

### Benefits of This Approach

- Quick iteration and debugging
- No need for complex mocking setups
- Clear visibility into service behavior
- Avoids test runner issues with open handles

## Using Jest for Production Tests

Once the direct testing approach validates core functionality, you can create proper Jest tests by:

1. Moving mocking logic to Jest's mocking system
2. Setting up proper beforeEach/afterEach hooks
3. Using the patterns established in the debug script

## Example Test Implementation

```typescript
// Import for direct setup
import { WorkoutPlanService } from '../../services/WorkoutPlanService';
import { mockWorkoutPlanRepository } from '../mocks/repositories';

// Or using Jest mocking
jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('WorkoutPlanService', () => {
  let service;
  let mockRepos;
  
  beforeEach(() => {
    // Setup mocks and service
    mockRepos = {
      workoutPlanRepo: { /* mock methods */ },
      workoutExerciseRepo: { /* mock methods */ },
      exerciseRepo: { /* mock methods */ }
    };
    
    service = new WorkoutPlanService(
      mockRepos.workoutPlanRepo,
      mockRepos.workoutExerciseRepo,
      mockRepos.exerciseRepo
    );
    
    // Override error handling for tests
    service.handleError = jest.fn().mockImplementation((error, message) => {
      console.error(`Error handled: ${message}`, error);
      return null;
    });
  });
  
  test('getWorkoutPlanById returns workout plan', async () => {
    const result = await service.getWorkoutPlanById(1, 'user1');
    expect(mockRepos.workoutPlanRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toBeTruthy();
  });
  
  // Additional tests...
});
```

## Core Service Methods to Test

1. **getWorkoutPlanById** - Retrieves workout plan by ID
2. **createWorkoutPlan** - Creates a new workout plan with exercises
3. **updateWorkoutPlan** - Updates an existing workout plan
4. **deleteWorkoutPlan** - Deletes a workout plan
5. **addExerciseToWorkoutPlan** - Adds exercise to a workout plan
6. **removeExerciseFromWorkoutPlan** - Removes exercise from a workout plan
7. **updateExerciseInWorkoutPlan** - Updates exercise details in a workout plan

## Conclusion

The `WorkoutPlanService` is central to the application's workout functionality, handling the creation, retrieval, updating, and deletion of workout plans and their exercises. Proper testing is essential to ensure this core service operates correctly.

Using the simplified direct testing approach, we've validated the core functionality works as expected. This pattern can be replicated for other services with similar dependencies. 