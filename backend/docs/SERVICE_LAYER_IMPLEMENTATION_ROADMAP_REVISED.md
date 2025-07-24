# OKGYM Service Layer Implementation Roadmap - Revised

This implementation roadmap provides a comprehensive plan for building the service layer of OKGYM, specifically aligned with the existing entity models. This document prioritizes a strategic implementation sequence to ensure that core functionality is developed first, followed by more advanced features.

## Entity Model Analysis

The existing entity models demonstrate a sophisticated and well-designed data structure with:

1. **Rich Entity Relationships**: Complex many-to-many relationships with proper join tables
2. **Comprehensive Metadata**: Extensive use of JSON columns for flexible metadata storage
3. **Advanced Categorization**: Hierarchical classification systems for exercises and workouts
4. **High-Performance Design**: Proper indexing and query optimization considerations
5. **Domain-Specific Validation**: Thorough validation rules tailored to fitness domain

## Implementation Strategy

Based on the analyzed entity models, this roadmap adopts the following implementation strategy:

1. **Repository-First Development**: Create type-safe repositories that leverage the sophisticated entity relationships
2. **Service Boundary Definition**: Clearly defined service boundaries that respect domain contexts
3. **Layered Architecture**: Maintain clear separation between repositories, services, and controllers
4. **Strategic Caching**: Implement caching for frequently accessed data with proper invalidation
5. **Performance Monitoring**: Add telemetry to track service performance from the beginning

## Core Services Implementation Timeline (MVP)

### Week 1: Foundation and Exercise Service (Days 1-7)

#### Days 1-2: Core Service Infrastructure
- [x] Set up service base classes with dependency injection support
- [x] Configure TypeORM custom repositories with proper typing
- [x] Implement QueryBuilder utilities for advanced filtering
- [x] Create common service interfaces and response formats
- [x] Implement error handling with AppError class hierarchy

#### Days 3-7: Exercise Service & Controller (Completed)
- [x] Implement ExerciseService with full CRUD operations
- [x] Create category management functions leveraging ExerciseCategory model
- [x] Implement exercise relationship management (variations, alternatives, progressions)
- [x] Add equipment association functionality
- [x] Build search functionality using the sophisticated model relationships
- [x] Create controller endpoints with proper validation and error handling
- [x] Implement integration tests for the API surface
- [x] Add comprehensive documentation for all service methods

### Week 2: Workout Plan & Session Services (Days 8-14)

#### Days 8-10: Workout Plan Service
- [ ] Create WorkoutPlanService with repository dependencies
- [ ] Implement CRUD operations leveraging the WorkoutPlan entity model
- [ ] Add exercise management functionality using WorkoutExercise join entity:
  - [ ] Add exercises to plans with comprehensive configuration
  - [ ] Update exercise sequencing and ordering
  - [ ] Manage rest periods and set configurations
  - [ ] Handle equipment alternatives and substitutions
- [ ] Implement search and filtering leveraging existing indexes
- [ ] Create controller with proper request validation
- [ ] Write comprehensive tests for core functionality

#### Days 11-14: Workout Session Service
- [ ] Create WorkoutSessionService with proper dependencies on WorkoutPlan
- [ ] Implement session lifecycle management using the SessionStatus enum:
  - [ ] Start sessions based on workout plans
  - [ ] Properly track paused/resumed sessions
  - [ ] Record comprehensive completion metrics
- [ ] Add exercise progress tracking leveraging:
  - [ ] ExerciseCompletion entity for tracking sets/reps
  - [ ] ActualExercise vs PlannedExercise comparisons
  - [ ] Form scoring and performance metrics
- [ ] Create session analytics functionality:
  - [ ] Generate WorkoutSummary objects with proper metrics
  - [ ] Calculate exercise-specific statistics
  - [ ] Track progress against previous sessions
- [ ] Implement controller endpoints with proper validation
- [ ] Add integration tests for the complete API surface

### Week 3: Metrics & AI Services (Days 15-21)

#### Days 15-17: Metric Tracking Service
- [ ] Create MetricTrackingService integrating with:
  - [ ] BodyMetric entity for physical measurements
  - [ ] Performance tracking for exercise metrics
  - [ ] Goal progress calculation
- [ ] Implement measurement recording functionality:
  - [ ] Support for all BodyArea enum values
  - [ ] Handling of different MeasurementUnit types
  - [ ] Proper metadata storage and retrieval
- [ ] Add historical data and trend analysis:
  - [ ] Time-series data retrieval with aggregation
  - [ ] Progress tracking against goals
  - [ ] Percentage change calculations
- [ ] Build controller with proper validation
- [ ] Write unit and integration tests

#### Days 18-21: AI Exercise Analysis Service
- [ ] Create AIExerciseService leveraging the exercise.aiConfig property
- [ ] Implement rep counting functionality:
  - [ ] Integration with pose detection library
  - [ ] Exercise-specific motion tracking using form.keyPoints
  - [ ] Confidence scoring for detection accuracy
- [ ] Add form analysis features:
  - [ ] Leverage the JointRange data for proper form validation
  - [ ] Calculate deviation from ideal form paths
  - [ ] Generate corrective feedback based on deviations
- [ ] Implement integration with WorkoutSessionService:
  - [ ] Automatic updating of ExerciseCompletion records
  - [ ] Real-time feedback during workout execution
- [ ] Create controller endpoints for AI functionality
- [ ] Add comprehensive testing for critical paths

## Detailed Service Implementations

### ExerciseService (Completed)

The ExerciseService implementation should fully leverage the sophisticated Exercise model:

```typescript
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(ExerciseCategory) private categoryRepo: Repository<ExerciseCategory>,
    @InjectRepository(ExerciseRelation) private relationRepo: Repository<ExerciseRelation>,
    @InjectRepository(Equipment) private equipmentRepo: Repository<Equipment>,
    private cacheManager: CacheManager,
    private metrics: MetricsService
  ) {}
  
  // Core CRUD operations
  async findAll(filters: ExerciseFilters): Promise<Exercise[]> {...}
  async findById(id: string): Promise<Exercise> {...}
  async create(data: CreateExerciseDto): Promise<Exercise> {...}
  async update(id: string, data: UpdateExerciseDto): Promise<Exercise> {...}
  async delete(id: string): Promise<boolean> {...}
  
  // Category management
  async addCategory(exerciseId: string, categoryId: number): Promise<Exercise> {...}
  async removeCategory(exerciseId: string, categoryId: number): Promise<Exercise> {...}
  async findByCategory(categoryId: number, filters?: ExerciseFilters): Promise<Exercise[]> {...}
  
  // Equipment management
  async addEquipment(exerciseId: string, equipmentId: string): Promise<Exercise> {...}
  async removeEquipment(exerciseId: string, equipmentId: string): Promise<Exercise> {...}
  async findByEquipment(equipmentId: string, filters?: ExerciseFilters): Promise<Exercise[]> {...}
  
  // Exercise relationships
  async createRelation(baseId: string, relatedId: string, type: RelationType): Promise<ExerciseRelation> {...}
  async removeRelation(relationId: string): Promise<boolean> {...}
  async getRelatedExercises(exerciseId: string, type?: RelationType): Promise<Exercise[]> {...}
  async getAlternatives(exerciseId: string): Promise<Exercise[]> {...}
  async getProgressions(exerciseId: string): Promise<Exercise[]> {...}
  
  // Search capabilities
  async search(query: string, filters?: ExerciseFilters): Promise<Exercise[]> {...}
  async findByMuscleGroup(muscleGroup: MuscleGroup, filters?: ExerciseFilters): Promise<Exercise[]> {...}
}
```

### WorkoutPlanService

The WorkoutPlanService should take full advantage of the WorkoutPlan and WorkoutExercise models:

```typescript
export class WorkoutPlanService {
  constructor(
    @InjectRepository(WorkoutPlan) private workoutPlanRepo: Repository<WorkoutPlan>,
    @InjectRepository(WorkoutExercise) private workoutExerciseRepo: Repository<WorkoutExercise>, 
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(ExerciseCategory) private categoryRepo: Repository<ExerciseCategory>,
    private cacheManager: CacheManager,
    private metrics: MetricsService
  ) {}

  // Core CRUD operations
  async findAll(filters: WorkoutPlanFilters): Promise<WorkoutPlan[]> {...}
  async findById(id: number): Promise<WorkoutPlan> {...}
  async create(data: CreateWorkoutPlanDto): Promise<WorkoutPlan> {...}
  async update(id: number, data: UpdateWorkoutPlanDto): Promise<WorkoutPlan> {...}
  async delete(id: number): Promise<boolean> {...}
  
  // Exercise management
  async addExercise(
    workoutId: number, 
    exerciseId: string, 
    config: ExerciseConfig
  ): Promise<WorkoutExercise> {...}
  
  async updateExercise(
    workoutId: number,
    exerciseId: string,
    config: Partial<ExerciseConfig>
  ): Promise<WorkoutExercise> {...}
  
  async removeExercise(workoutId: number, exerciseId: string): Promise<boolean> {...}
  async reorderExercises(workoutId: number, exerciseOrder: ExerciseOrderDto[]): Promise<WorkoutPlan> {...}
  
  // Advanced functionality
  async findSimilar(workoutId: number): Promise<WorkoutPlan[]> {...}
  async getByDifficulty(difficulty: Difficulty): Promise<WorkoutPlan[]> {...}
  async getByCategory(category: WorkoutCategory): Promise<WorkoutPlan[]> {...}
  async getByMuscleGroup(categoryId: number): Promise<WorkoutPlan[]> {...}
}
```

### WorkoutSessionService

The WorkoutSessionService should fully utilize the WorkoutSession model structure:

```typescript
export class WorkoutSessionService {
  constructor(
    @InjectRepository(WorkoutSession) private sessionRepo: Repository<WorkoutSession>,
    @InjectRepository(WorkoutPlan) private workoutPlanRepo: Repository<WorkoutPlan>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    private cacheManager: CacheManager,
    private metrics: MetricsService
  ) {}

  // Session lifecycle
  async startSession(userId: string, planId: number): Promise<WorkoutSession> {...}
  async pauseSession(sessionId: string): Promise<WorkoutSession> {...}
  async resumeSession(sessionId: string): Promise<WorkoutSession> {...}
  async completeSession(sessionId: string): Promise<WorkoutSession> {...}
  
  // Session retrieval
  async getSessionById(id: string): Promise<WorkoutSession> {...}
  async getUserSessions(userId: string, filters?: SessionFilters): Promise<WorkoutSession[]> {...}
  
  // Exercise tracking
  async recordExerciseCompletion(
    sessionId: string,
    exerciseId: string,
    result: ExerciseResult
  ): Promise<ExerciseCompletion> {...}
  
  async updateExerciseCompletion(
    sessionId: string,
    exerciseId: string,
    updates: Partial<ExerciseResult>
  ): Promise<ExerciseCompletion> {...}
  
  async skipExercise(sessionId: string, exerciseId: string, reason?: string): Promise<boolean> {...}
  
  // Analytics
  async calculateSessionStats(sessionId: string): Promise<WorkoutSummary> {...}
  async compareToTargets(sessionId: string): Promise<ComparisonResult> {...}
  async getSessionSummary(sessionId: string): Promise<WorkoutSummary> {...}
}
```

### MetricTrackingService

The MetricTrackingService should leverage the BodyMetric model's capabilities:

```typescript
export class MetricTrackingService {
  constructor(
    @InjectRepository(BodyMetric) private bodyMetricRepo: Repository<BodyMetric>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private cacheManager: CacheManager,
    private metrics: MetricsService
  ) {}

  // Recording metrics
  async recordBodyMetric(data: BodyMetricData): Promise<BodyMetric> {...}
  async recordPerformanceMetric(
    userId: string,
    exerciseId: string,
    metricData: PerformanceMetricData
  ): Promise<PerformanceMetric> {...}
  
  async bulkRecordMetrics(metrics: BodyMetricData[]): Promise<BodyMetric[]> {...}
  async updateMetric(id: string, data: Partial<BodyMetricData>): Promise<BodyMetric> {...}
  
  // Retrieving metrics
  async getLatestBodyMetrics(
    userId: string, 
    bodyArea?: BodyArea
  ): Promise<Map<BodyArea, BodyMetric>> {...}
  
  async getHistoricalMetrics(
    userId: string,
    bodyArea: BodyArea,
    timeRange: DateRange
  ): Promise<BodyMetric[]> {...}
  
  async getPerformanceMetricsByExercise(
    userId: string,
    exerciseId: string,
    timeRange?: DateRange
  ): Promise<PerformanceMetric[]> {...}
  
  // Goal tracking
  async setMetricGoal(
    userId: string,
    bodyArea: BodyArea,
    targetValue: number,
    targetDate: Date
  ): Promise<MetricGoal> {...}
  
  async getUserGoals(userId: string, status?: GoalStatus): Promise<MetricGoal[]> {...}
  
  async calculateProgress(
    userId: string,
    goalId: string
  ): Promise<ProgressResult> {...}
  
  async compareToGoals(userId: string): Promise<GoalComparisonResult> {...}
}
```

### AIExerciseService

The AIExerciseService should utilize the AI configuration in the Exercise model:

```typescript
export class AIExerciseService {
  constructor(
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(WorkoutSession) private sessionRepo: Repository<WorkoutSession>,
    private workoutSessionService: WorkoutSessionService,
    private poseDetectionService: PoseDetectionService
  ) {}

  // Core AI functionality
  async analyzeForm(
    exerciseId: string,
    videoFrame: Buffer
  ): Promise<FormAnalysisResult> {...}
  
  async countReps(
    exerciseId: string,
    videoStream: Observable<Buffer>
  ): Promise<RepCountingResult> {...}
  
  async processWorkoutFrame(
    sessionId: string,
    exerciseId: string,
    videoFrame: Buffer
  ): Promise<ExerciseAnalysisResult> {...}
  
  // Integration with session
  async startExerciseTracking(
    sessionId: string,
    exerciseId: string
  ): Promise<TrackingSession> {...}
  
  async recordRepCompletion(
    trackingSessionId: string,
    repData: RepData
  ): Promise<void> {...}
  
  // Guidance
  async getFormGuidance(
    exerciseId: string
  ): Promise<FormGuidanceInfo> {...}
  
  async generateExerciseFeedback(
    exerciseId: string,
    formData: FormData
  ): Promise<ExerciseFeedback> {...}
}
```

## Service Integration and Controller Implementation

Each service should be complemented by a well-designed controller that follows these principles:

1. **Consistent Response Format**:
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: {
       message: string;
       code?: string;
       details?: any;
     };
     meta?: {
       count?: number;
       page?: number;
       totalPages?: number;
       // Additional metadata as needed
     }
   }
   ```

2. **Comprehensive Request Validation**:
   - Use class-validator decorators on DTOs
   - Implement custom validators for domain-specific rules
   - Sanitize inputs to prevent injection attacks

3. **Proper Error Handling**:
   - Use AppError hierarchy for typed errors
   - Map errors to appropriate HTTP status codes
   - Include useful error details without exposing sensitive information

4. **Authentication & Authorization**:
   - Secure endpoints with JWT validation
   - Implement role-based access control
   - Add data-level permissions where needed

## Testing Strategy

Implement a comprehensive testing strategy for each service:

1. **Unit Tests**:
   - Test business logic in isolation
   - Mock dependencies using Jest mocks
   - Cover edge cases and error scenarios

2. **Integration Tests**:
   - Test service interactions with repositories
   - Validate database operations using test database
   - Ensure proper transaction handling

3. **API Tests**:
   - Test controller endpoints end-to-end
   - Validate request/response formats
   - Ensure proper error responses

## Performance Considerations

1. **Caching Strategy**:
   - Cache frequently accessed exercise and workout data
   - Implement cache invalidation on updates
   - Use Redis for distributed cache if needed

2. **Query Optimization**:
   - Leverage existing indexes in entity models
   - Use QueryBuilder for complex queries
   - Implement pagination for large result sets

3. **Transaction Management**:
   - Use transactions for operations affecting multiple entities
   - Ensure proper error handling within transactions
   - Consider using query runners for complex operations

## Deployment & Monitoring

1. **Metrics Collection**:
   - Track performance of key service methods
   - Monitor database query execution times
   - Collect error rates and types

2. **Logging**:
   - Implement structured logging
   - Include correlation IDs for request tracing
   - Log appropriate detail level based on environment

3. **Health Checks**:
   - Add service health check endpoints
   - Monitor dependencies (database, cache, etc.)
   - Implement circuit breakers for external dependencies

## Implementation Guidelines

1. **Follow Repository Pattern**:
   - Create custom repositories for complex queries
   - Keep business logic in services, not repositories
   - Use proper typing for all repository methods

2. **Implement Service Layer Abstraction**:
   - Define clear interfaces for all services
   - Use dependency injection for better testability
   - Follow single responsibility principle

3. **Optimize for Performance**:
   - Use eager loading judiciously
   - Implement pagination for list operations
   - Add caching for frequently accessed data

4. **Ensure Data Integrity**:
   - Validate input data thoroughly
   - Use transactions for multi-operation changes
   - Implement proper error handling and rollback 