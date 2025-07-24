# Service Layer Implementation Tasks

This document outlines the remaining service layer implementation tasks needed to complete the OKGYM MVP. The tasks are organized by service and prioritized based on the roadmap.

## Overview of Completed Components

The following components have already been implemented:

- **Base Repository Infrastructure**:
  - `BaseRepository.ts`: Interface defining standard repository operations
  - `GenericRepository.ts`: Base implementation for all entity repositories
  - Repository templates with caching and advanced querying

- **Entity Repositories**:
  - `WorkoutPlanRepository.ts`: Repository for workout plans with filtering
  - `WorkoutExerciseRepository.ts`: Repository for workout exercises
  - `WorkoutSessionRepository.ts`: Repository for workout sessions
  - `AchievementRepository.ts`: Repository for achievements
  - `WorkoutTagRepository.ts`: Repository for workout tags
  - `WorkoutRatingRepository.ts`: Repository for workout ratings

- **Utility Functions**:
  - `typeorm-helpers.ts`: Utilities for TypeORM query building
  - `error-handler.ts`: Error handling middleware
  - `errors.ts`: Custom error classes
  - `logger.ts`: Logging utility
  - `performance.ts`: Performance tracking utilities
  - `response-formatter.ts`: API response formatting
  - `service-metrics.ts`: Service performance metrics
  - `cache-metrics.ts`: Cache performance metrics
  - `transaction-helper.ts`: Transaction management utilities

## Service Implementation Tasks

### 1. WorkoutPlanService Implementation

**Estimated Time**: 1 day

**Files to Create**:
- `backend/src/services/WorkoutPlanService.ts`
- `backend/src/controllers/WorkoutPlanController.ts`
- `backend/src/dtos/WorkoutPlanDTO.ts`

**Core Methods**:

```typescript
// WorkoutPlanService.ts
export class WorkoutPlanService {
  private workoutPlanRepository: WorkoutPlanRepository;
  private workoutExerciseRepository: WorkoutExerciseRepository;
  
  constructor() {
    this.workoutPlanRepository = new WorkoutPlanRepository();
    this.workoutExerciseRepository = new WorkoutExerciseRepository();
  }
  
  /**
   * Create a new workout plan with exercises
   */
  async createWorkoutPlan(data: CreateWorkoutPlanDTO, userId: string): Promise<WorkoutPlan> {
    // Use transaction helper for atomic operations
    return await transactionHelper.runInTransaction(async (manager) => {
      // Create workout plan
      // Add exercises to workout plan
      // Return complete workout plan with exercises
    });
  }
  
  /**
   * Get workout plan by ID with all related entities
   */
  async getWorkoutPlanById(id: number, userId: string): Promise<WorkoutPlan | null> {
    // Use performance tracking
    return await performanceTracker.trackMethodPerformance(
      'WorkoutPlanService.getWorkoutPlanById',
      async () => {
        // Get workout plan with full details
        // Check user permissions
        // Return workout plan
      }
    );
  }
  
  /**
   * Update workout plan with partial data
   */
  async updateWorkoutPlan(id: number, data: UpdateWorkoutPlanDTO, userId: string): Promise<WorkoutPlan | null> {
    // Validate that user can update this plan
    // Update plan properties
    // Update exercises if needed
    // Return updated plan
  }
  
  /**
   * Get workout plans with filtering
   */
  async getWorkoutPlans(filters: WorkoutPlanFilters, userId: string): Promise<PaginatedResponse<WorkoutPlan>> {
    // Apply filters
    // Add user-specific filters
    // Return paginated response
  }
  
  // Additional methods for exercise management within plans
  async addExerciseToWorkoutPlan(workoutPlanId: number, data: AddExerciseDTO, userId: string): Promise<WorkoutPlan> {
    // Implementation
  }
  
  async updateExerciseInWorkoutPlan(workoutPlanId: number, exerciseId: number, data: UpdateExerciseDTO, userId: string): Promise<WorkoutPlan> {
    // Implementation
  }
  
  async removeExerciseFromWorkoutPlan(workoutPlanId: number, exerciseId: number, userId: string): Promise<WorkoutPlan> {
    // Implementation
  }
}
```

**Controller Implementation**:
```typescript
// WorkoutPlanController.ts
export class WorkoutPlanController {
  private workoutPlanService: WorkoutPlanService;
  
  constructor() {
    this.workoutPlanService = new WorkoutPlanService();
  }
  
  async createWorkoutPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const workoutPlan = await this.workoutPlanService.createWorkoutPlan(req.body, userId);
      formatResponse(res, { data: workoutPlan, message: 'Workout plan created successfully' });
    } catch (error) {
      handleControllerError(error, res);
    }
  }
  
  // Implement other controller methods for CRUD operations
}
```

### 2. WorkoutSessionService Implementation

**Estimated Time**: 1 day

**Files to Create**:
- `backend/src/services/WorkoutSessionService.ts`
- `backend/src/controllers/WorkoutSessionController.ts`
- `backend/src/dtos/WorkoutSessionDTO.ts`

**Core Methods**:

```typescript
// WorkoutSessionService.ts
export class WorkoutSessionService {
  private workoutSessionRepository: WorkoutSessionRepository;
  private workoutPlanRepository: WorkoutPlanRepository;
  
  constructor() {
    this.workoutSessionRepository = new WorkoutSessionRepository();
    this.workoutPlanRepository = new WorkoutPlanRepository();
  }
  
  /**
   * Start a new workout session
   */
  async startWorkoutSession(data: StartSessionDTO, userId: string): Promise<WorkoutSession> {
    // Validate workout plan exists
    // Create new session with initial state
    // Return session with first exercise
  }
  
  /**
   * Record exercise completion during a session
   */
  async recordExerciseCompletion(sessionId: number, data: ExerciseCompletionDTO, userId: string): Promise<WorkoutSession> {
    // Validate session belongs to user
    // Record exercise completion with performance metrics
    // Update session progress
    // Return updated session
  }
  
  /**
   * Pause a workout session
   */
  async pauseSession(sessionId: number, userId: string): Promise<WorkoutSession> {
    // Implementation
  }
  
  /**
   * Resume a paused workout session
   */
  async resumeSession(sessionId: number, userId: string): Promise<WorkoutSession> {
    // Implementation
  }
  
  /**
   * Complete a workout session
   */
  async completeSession(sessionId: number, userId: string): Promise<WorkoutSession> {
    // Mark session as complete
    // Calculate session statistics
    // Process achievements if implemented
    // Return completed session with stats
  }
  
  /**
   * Get user's workout session history
   */
  async getUserSessions(userId: string, filters: SessionFilters): Promise<PaginatedResponse<WorkoutSession>> {
    // Implementation
  }
}
```

### 3. MetricTrackingService Implementation

**Estimated Time**: 1 day

**Files to Create**:
- `backend/src/services/MetricTrackingService.ts`
- `backend/src/controllers/MetricController.ts`
- `backend/src/dtos/MetricDTO.ts`

**Core Methods**:

```typescript
// MetricTrackingService.ts
export class MetricTrackingService {
  private bodyMetricRepository: BodyMetricRepository;
  private performanceMetricRepository: PerformanceMetricRepository;
  
  constructor() {
    this.bodyMetricRepository = new BodyMetricRepository();
    this.performanceMetricRepository = new PerformanceMetricRepository();
  }
  
  /**
   * Record user body metrics
   */
  async recordBodyMetric(data: BodyMetricDTO, userId: string): Promise<BodyMetric> {
    // Validate metric data
    // Store metric with timestamp
    // Return created metric
  }
  
  /**
   * Record exercise performance metrics
   */
  async recordPerformanceMetric(data: PerformanceMetricDTO, userId: string): Promise<PerformanceMetric> {
    // Validate metric data
    // Store with exercise relationship
    // Return created metric
  }
  
  /**
   * Get user's latest body metrics
   */
  async getLatestBodyMetrics(userId: string, type?: MeasurementType): Promise<BodyMetric[]> {
    // Implementation
  }
  
  /**
   * Get historical metrics with date range
   */
  async getHistoricalMetrics(userId: string, options: MetricHistoryOptions): Promise<PaginatedResponse<BodyMetric>> {
    // Implementation
  }
  
  /**
   * Get performance trends for specific exercises
   */
  async getExercisePerformanceTrends(userId: string, exerciseId: number, periodInDays: number = 30): Promise<PerformanceTrend[]> {
    // Implementation
  }
}
```

### 4. UserService and Authentication Implementation

**Estimated Time**: 1 day

**Files to Create**:
- `backend/src/services/UserService.ts`
- `backend/src/services/AuthService.ts`
- `backend/src/controllers/AuthController.ts`
- `backend/src/controllers/UserController.ts`
- `backend/src/dtos/UserDTO.ts`
- `backend/src/middleware/auth.middleware.ts`

**Core Methods**:

```typescript
// AuthService.ts
export class AuthService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  /**
   * Register a new user
   */
  async register(data: RegisterUserDTO): Promise<{ user: User; token: string }> {
    // Validate user doesn't exist
    // Hash password
    // Create user
    // Generate JWT token
    // Return user and token
  }
  
  /**
   * Authenticate user and generate JWT token
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    // Verify password
    // Generate JWT token
    // Return user and token
  }
  
  /**
   * Generate JWT token for user
   */
  private generateToken(user: User): string {
    // Implementation
  }
}

// UserService.ts
export class UserService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  /**
   * Get user profile with related entities
   */
  async getUserProfile(userId: string): Promise<User> {
    // Implementation
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileDTO): Promise<User> {
    // Implementation
  }
  
  /**
   * Update user fitness preferences
   */
  async updateFitnessPreferences(userId: string, data: FitnessPreferencesDTO): Promise<User> {
    // Implementation
  }
}
```

## Implementation Priority and Dependencies

1. **UserService and Authentication**: This should be implemented first as other services depend on user authentication.
2. **WorkoutPlanService**: Core service for creating and managing workout plans.
3. **WorkoutSessionService**: Depends on WorkoutPlanService for starting sessions.
4. **MetricTrackingService**: Can be implemented in parallel with WorkoutSessionService.

## Testing Strategy

Each service should have corresponding test files:

- `backend/src/tests/services/WorkoutPlanService.test.ts`
- `backend/src/tests/services/WorkoutSessionService.test.ts`
- `backend/src/tests/services/MetricTrackingService.test.ts`
- `backend/src/tests/services/UserService.test.ts`
- `backend/src/tests/services/AuthService.test.ts`

Tests should cover:
- Core CRUD operations
- Business logic validation
- Error handling
- Integration with repositories
- Edge cases and boundary conditions

## API Endpoints

The services above will expose the following RESTful endpoints:

```
// Workout Plans
POST /api/v1/workout-plans               - Create workout plan
GET /api/v1/workout-plans                - List workout plans with filters
GET /api/v1/workout-plans/:id            - Get workout plan details
PUT /api/v1/workout-plans/:id            - Update workout plan
DELETE /api/v1/workout-plans/:id         - Delete workout plan
POST /api/v1/workout-plans/:id/exercises - Add exercise to workout plan
PUT /api/v1/workout-plans/:id/exercises/:exerciseId - Update exercise in workout plan
DELETE /api/v1/workout-plans/:id/exercises/:exerciseId - Remove exercise from workout plan

// Workout Sessions
POST /api/v1/sessions                    - Start workout session
GET /api/v1/sessions                     - List user's workout sessions
GET /api/v1/sessions/:id                 - Get session details
POST /api/v1/sessions/:id/exercises      - Record exercise completion
PUT /api/v1/sessions/:id/pause           - Pause session
PUT /api/v1/sessions/:id/resume          - Resume session
PUT /api/v1/sessions/:id/complete        - Complete session

// Metrics
POST /api/v1/metrics/body                - Record body metrics
POST /api/v1/metrics/performance         - Record performance metrics
GET /api/v1/metrics/body                 - Get body metrics
GET /api/v1/metrics/body/history         - Get historical body metrics
GET /api/v1/metrics/performance/:exerciseId - Get exercise performance trends

// Authentication
POST /api/v1/auth/register               - Register new user
POST /api/v1/auth/login                  - Login user

// User
GET /api/v1/users/profile                - Get user profile
PUT /api/v1/users/profile                - Update user profile
PUT /api/v1/users/preferences            - Update fitness preferences
```

## Next Steps

1. Implement services in the priority order listed above
2. Create corresponding controllers for each service
3. Implement route configurations in `backend/src/routes/`
4. Write essential tests for each service
5. Integrate with frontend components 