# Detailed Backend Structure

This document provides a comprehensive breakdown of the backend file structure, detailing the files and their purposes within each directory.

## Backend Root

```
backend/
├── src/                # Main source code
├── public/             # Public assets
├── tests/              # Test files
├── models/             # Alternative model location
├── dist/               # Compiled JavaScript output
├── docs/               # Documentation files
│   └── FYP/            # Final Year Project documentation
├── node_modules/       # Node.js dependencies
├── package.json        # Package configuration
├── package-lock.json   # Package dependency lock
├── tsconfig.json       # TypeScript configuration
└── various utility and configuration files
```

## Main Source Code (`src/`)

### Entry Point and Core Configuration
```
src/
├── app.ts              # Express application setup
├── index.ts            # Application entry point
├── data-source.ts      # Database connection configuration
├── config.ts           # Application configuration
```

### Controllers (`src/controllers/`)
Controllers handle HTTP requests and route them to appropriate services.

```
src/controllers/
├── AuthController.ts                   # Authentication and authorization
├── UserController.ts                   # User management
├── ExerciseController.ts               # Exercise management
├── WorkoutSessionController.ts         # Workout session management
├── WorkoutPlanController.ts            # Workout plan management
├── MediaController.ts                  # Media file management
├── MetricTrackingController.ts         # Metrics tracking
├── dashboardController.ts              # Dashboard data
├── SystemController.ts                 # System operations
├── AIController.ts                     # AI-related operations
├── achievementController.ts            # User achievements
│
│ # Exercise Analysis Controllers (form analysis for specific exercises)
├── SquatAnalysisController.ts
├── BenchPressAnalysisController.ts
├── BicepAnalysisController.ts
├── LateralRaiseAnalysisController.ts
├── LungeAnalysisController.ts
├── PlankAnalysisController.ts
├── PushupAnalysisController.ts
├── ShoulderPressAnalysisController.ts
├── SitupAnalysisController.ts
│
└── templates/                          # Controller templates
```

### Services (`src/services/`)
Services contain the business logic of the application.

```
src/services/
├── authService.ts                    # Authentication service
├── UserService.ts                    # User management service
├── ExerciseService.ts                # Exercise management service
├── WorkoutSessionService.ts          # Workout session service
├── WorkoutPlanService.ts             # Workout plan service
├── AchievementService.ts             # Achievement service
├── MetricTrackingService.ts          # Metrics tracking service
├── AIService.ts                      # AI integration service
├── MetricsService.ts                 # Performance metrics service
├── CacheManager.ts                   # Cache management
├── DatabaseSeeder.ts                 # Database seeding logic
├── PythonService.ts                  # Python integration service
│
│ # Exercise Analysis Services
├── BaseExerciseAnalyzer.ts           # Base class for exercise analyzers
├── ExerciseAnalyzerFactory.ts        # Factory pattern for analyzer creation
├── SquatAnalyzerService.ts           # Squat form analysis
├── BenchPressAnalyzerService.ts      # Bench press form analysis
├── BicepAnalyzerService.ts           # Bicep curl form analysis
├── LateralRaiseAnalyzerService.ts    # Lateral raise form analysis
├── LungeAnalyzerService.ts           # Lunge form analysis
├── PlankAnalyzerService.ts           # Plank form analysis
├── PushupAnalyzerService.ts          # Push-up form analysis
├── ShoulderPressAnalyzerService.ts   # Shoulder press form analysis
├── SitupAnalyzerService.ts           # Sit-up form analysis
│
│ # Python Service Integration (`src/services/python/`)
├── python/                           # Python service integration
│   ├── __pycache__/                  # Python bytecode cache
│   ├── model/                        # Trained ML models folder
│   │   ├── MODELS_GO_HERE.txt        # Placeholder for models
│   │   ├── LR_model.pkl              # Linear regression model
│   │   ├── RF_model.pkl              # Random forest model
│   │   ├── KNN_model.pkl             # KNN model
│   │   ├── input_scaler.pkl          # Input data scaler
│   │   ├── plank_input_scaler.pkl    # Plank-specific input scaler
│   │   ├── bicep_curl_model.pkl      # Bicep curl model
│   │   ├── bicep_dp.pkl              # Bicep data preprocessor
│   │   ├── all_sklearn.pkl           # All exercises sklearn model
│   │   └── all_dp.pkl                # All exercises data preprocessor
│   ├── models/                       # Another models directory
│   │   └── LR_model.pkl              # Linear regression model
│   ├── venv/                         # Python virtual environment
│   ├── requirements.txt              # Python dependencies
│   ├── exercise_analyzer_server.py   # Main server for exercise analysis
│   ├── squat_analyzer.py             # Squat-specific analyzer
│   ├── bench_press_analyzer.py       # Bench press analyzer
│   ├── bicep_analyzer.py             # Bicep curl analyzer
│   ├── lateral_raise_analyzer.py     # Lateral raise analyzer
│   ├── lunge_analyzer.py             # Lunge analyzer
│   ├── plank_analyzer.py             # Plank analyzer
│   ├── pushup_analyzer.py            # Push-up analyzer
│   ├── shoulder_press_analyzer.py    # Shoulder press analyzer
│   ├── situp_analyzer.py             # Sit-up analyzer
│   └── check_sklearn.py              # Utility to check sklearn models
│
├── interfaces/                       # Service interfaces
├── templates/                        # Service templates
└── SERVICE_STANDARDS.md              # Documentation on service standards
```

### Routes (`src/routes/`)
Routes define the API endpoints and their controllers.

```
src/routes/
├── index.ts                          # Routes aggregation
├── authRoutes.ts                     # Authentication routes
├── userRoutes.ts                     # User management routes
├── exerciseRoutes.ts                 # Exercise management routes
├── workoutSessionRoutes.ts           # Workout session routes
├── workoutRoutes.ts                  # Workout routes
├── mediaRoutes.ts                    # Media file routes
├── metricRoutes.ts                   # Metrics routes
├── dashboardRoutes.ts                # Dashboard routes
├── aiRoutes.ts                       # AI-related routes
├── achievementRoutes.ts              # Achievement routes
│
│ # Exercise Analysis Routes
├── squatAnalysisRoutes.ts            # Squat analysis routes
├── benchPressAnalysisRoutes.ts       # Bench press analysis routes
├── bicepAnalysisRoutes.ts            # Bicep curl analysis routes
├── lateralRaiseAnalysisRoutes.ts     # Lateral raise analysis routes
├── lungeAnalysisRoutes.ts            # Lunge analysis routes
├── plankAnalysisRoutes.ts            # Plank analysis routes
├── pushupAnalysisRoutes.ts           # Push-up analysis routes
├── shoulderPressAnalysisRoutes.ts    # Shoulder press analysis routes
├── situpAnalysisRoutes.ts            # Sit-up analysis routes
│
└── testRoutes.ts                     # Testing routes
```

### Data Transfer Objects (`src/dto/`)
DTOs define the structure of data exchanged between the client and server.

```
src/dto/
├── ExerciseDTO.ts                    # Exercise-related DTOs
├── UserDto.ts                        # User-related DTOs
├── workoutSession.dto.ts             # Workout session DTOs
├── dashboard.dto.ts                  # Dashboard data DTOs
├── auth.dto.ts                       # Authentication DTOs
├── templates/                        # DTO templates
└── README.md                         # Documentation for DTOs
```

### Middleware (`src/middleware/`)
Middleware functions for request processing.

```
src/middleware/
├── auth.ts                           # Authentication middleware
├── authMiddleware.ts                 # Alternative auth middleware
├── isAdmin.ts                        # Admin permission check
├── httpCache.ts                      # HTTP caching middleware
├── validateRequest.ts                # Request validation
└── validation.ts                     # Input validation
```

### Repositories (`src/repositories/`)
Repositories handle data access and persistence.

```
src/repositories/
├── BaseRepository.ts                    # Base repository class
├── GenericRepository.ts                 # Generic repository implementation
│
│ # User-related Repositories
├── UserRepository.ts                    # User data access
├── UserActivityRepository.ts            # User activity tracking
├── UserEquipmentRepository.ts           # User equipment
├── UserProgressRepository.ts            # User progress tracking
├── UserScheduleRepository.ts            # User scheduling
│
│ # Workout-related Repositories
├── WorkoutSessionRepository.ts          # Workout session data
├── WorkoutPlanRepository.ts             # Workout plan data
├── WorkoutExerciseRepository.ts         # Workout exercise join data
├── WorkoutRatingRepository.ts           # Workout ratings
├── WorkoutTagRepository.ts              # Workout tags
│
│ # Exercise-related Repositories
├── ExerciseRepository.ts                # Exercise data
├── ExerciseDetailsRepository.ts         # Exercise details
├── ExerciseFormAnalysisRepository.ts    # Exercise form analysis
├── ExerciseRelationRepository.ts        # Exercise relationships
├── ExerciseSpecificAnalysisRepository.ts # Exercise-specific analysis
├── ExerciseCategoryRepository.ts        # Exercise categories
│
│ # Training Program Repositories
├── TrainingProgramRepository.ts         # Training program data
├── ProgramEnrollmentRepository.ts       # Program enrollment
├── ProgramWorkoutRepository.ts          # Program workouts
│
│ # Equipment & Resources Repositories
├── EquipmentRepository.ts               # Equipment data
├── AudioCueRepository.ts                # Audio cues
├── MediaRepository.ts                   # Media files
├── VideoTutorialRepository.ts           # Video tutorials
│
│ # Tracking & Progress Repositories
├── AchievementRepository.ts             # User achievements
├── BodyMetricRepository.ts              # Body metrics
├── FeedbackRepository.ts                # User feedback
├── FitnessGoalRepository.ts             # Fitness goals
├── MetricTrackingRepository.ts          # Metric tracking
├── NotificationRepository.ts            # Notifications
├── AIModelConfigurationRepository.ts    # AI model configuration
│
├── index.ts                             # Repository exports
├── interfaces/                          # Repository interfaces
├── templates/                           # Repository templates
└── REPOSITORY_STANDARDS.md              # Documentation on repository standards
```

### Models (`src/models/`)
Models define the database entities and their relationships.

```
src/models/
├── User.ts                           # User entity
├── WorkoutSession.ts                 # Workout session entity
├── WorkoutPlan.ts                    # Workout plan entity
├── WorkoutExercise.ts                # Workout exercise join entity
├── WorkoutRating.ts                  # Workout rating entity
├── WorkoutTag.ts                     # Workout tag entity
├── Exercise.ts                       # Exercise entity
├── ExerciseCategory.ts               # Exercise category entity
├── ExerciseDetails.ts                # Exercise details entity
├── ExerciseFormAnalysis.ts           # Exercise form analysis entity
├── ExerciseRelation.ts               # Exercise relationship entity
├── ExerciseSpecificAnalysis.ts       # Exercise-specific analysis entity
├── Equipment.ts                      # Equipment entity
├── AudioCue.ts                       # Audio cue entity
├── Media.ts                          # Media entity
├── VideoTutorial.ts                  # Video tutorial entity
├── Achievement.ts                    # Achievement entity
├── BodyMetric.ts                     # Body metric entity
├── Feedback.ts                       # Feedback entity
├── FitnessGoal.ts                    # Fitness goal entity
├── MetricTracking.ts                 # Metric tracking entity
├── Notification.ts                   # Notification entity
├── AIModelConfiguration.ts           # AI model configuration entity
├── TrainingProgram.ts                # Training program entity
├── ProgramEnrollment.ts              # Program enrollment entity
├── ProgramWorkout.ts                 # Program workout entity
├── UserActivity.ts                   # User activity entity
├── UserEquipment.ts                  # User equipment entity
├── UserProgress.ts                   # User progress entity
├── UserSchedule.ts                   # User schedule entity
├── index.ts                          # Model exports
└── shared/                           # Shared model components
```

### Utilities (`src/utils/`)
Utility functions and helpers.

```
src/utils/
├── AppError.ts                       # Custom error class
├── logger.ts                         # Logging utility
├── mediaUtils.ts                     # Media file utilities
├── RelationshipLoader.ts             # Entity relationship loader
├── EntityRelationships.ts            # Entity relationship definitions
├── initRelationships.ts              # Relationship initialization
├── RelationshipGenerator.ts          # Relationship generator
├── RelationshipDecorators.ts         # Relationship decorators
├── idConverter.ts                    # ID conversion utilities
├── typeorm-id-helpers.ts             # TypeORM ID helpers
├── idCompatibility.ts                # ID compatibility utilities
├── QueryBuilderExtensions.ts         # Query builder extensions
├── transaction-helper.ts             # Transaction helpers
├── response-formatter.ts             # Response formatting
├── error-handler.ts                  # Error handling utilities
├── performance.ts                    # Performance measurement
├── service-metrics.ts                # Service metrics
├── cache-metrics.ts                  # Cache metrics
├── errors.ts                         # Error definitions
└── typeorm-helpers.ts                # TypeORM helpers
```

### Additional Directories
```
src/
├── config/                           # Configuration files
├── migrations/                       # Database migrations
├── seed/                             # Database seed scripts
├── types/                            # TypeScript type definitions
├── guards/                           # Authentication guards
└── decorators/                       # TypeScript decorators
```

## Testing Files (`tests/`)
Contains test files for the application.

## Documentation (`docs/`)
Contains project documentation files, including:
- Implementation guides
- Service development guides
- Integration plans
- Best practices
- Roadmaps
- Implementation tasks

## Python Integration Architecture

The Python integration in the backend follows this architecture:

1. **TypeScript Interface**: The `PythonService.ts` acts as the main interface between the Node.js backend and Python analysis services.

2. **Exercise-Specific Analyzers**: Each exercise has a dedicated analyzer service (e.g., `SquatAnalyzerService.ts`) that uses the Python service.

3. **Python Analysis Server**: The `exercise_analyzer_server.py` runs as a separate process and receives analysis requests via HTTP.

4. **Exercise-Specific Python Analyzers**: Individual Python files for each exercise type (e.g., `squat_analyzer.py`) contain the machine learning logic.

5. **ML Models**: Pre-trained machine learning models (`*.pkl` files) stored in the `model/` directory are used for form analysis.

The data flow is:
1. Frontend sends video frames to backend exercise controller
2. Controller calls corresponding analyzer service
3. Service uses PythonService to communicate with Python server
4. Python server uses exercise-specific analyzer with ML models
5. Results are returned through the same path back to frontend 