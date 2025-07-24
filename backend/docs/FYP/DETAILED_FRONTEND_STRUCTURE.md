# Detailed Frontend Structure

This document provides a comprehensive breakdown of the frontend file structure, detailing the files and their purposes within each directory.

## Frontend Root

```
frontend/
├── src/                # Main source code
├── public/             # Public assets
├── node_modules/       # Node.js dependencies
├── package.json        # Package configuration
├── package-lock.json   # Package dependency lock
├── tsconfig.json       # TypeScript configuration
└── various utility and configuration files
```

## Main Source Code (`src/`)

### Entry Point and Core Files
```
src/
├── index.tsx           # Application entry point
├── App.tsx             # Main application component
├── index.css           # Global styles
├── theme.ts            # UI theme configuration
├── config.ts           # Application configuration
├── reportWebVitals.ts  # Performance reporting
```

### Pages (`src/pages/`)
Pages represent full views or screens in the application.

```
src/pages/
├── Dashboard.tsx                # Main dashboard page
├── Profile.tsx                  # User profile page
├── Settings.tsx                 # User settings page
├── Progress.tsx                 # Progress tracking page
├── Achievements.tsx             # User achievements page
│
├── auth/                        # Authentication-related pages
│   ├── Login.tsx                # Login page
│   ├── Register.tsx             # Registration page
│   ├── ForgotPassword.tsx       # Password recovery page
│   └── ResetPassword.tsx        # Password reset page
│
├── exercises/                   # Exercise-related pages
│   ├── ExerciseList.tsx         # Exercise list/browse page
│   ├── ExerciseSearch.tsx       # Exercise search page
│   └── ExerciseFilters.tsx      # Exercise filtering page
│
├── exercise-detail/             # Exercise detail pages
│   ├── ExerciseDetail.tsx       # Exercise detail page
│   └── ExerciseTutorial.tsx     # Exercise tutorial page
│
├── workouts/                    # Workout-related pages
│   ├── WorkoutList.tsx          # Workout list page
│   ├── WorkoutDetail.tsx        # Workout detail page
│   ├── WorkoutCreator.tsx       # Workout creation page
│   └── WorkoutEditor.tsx        # Workout editing page
│
├── sessions/                    # Workout session pages
│   ├── ActiveSession.tsx        # Active workout session page
│   ├── SessionHistory.tsx       # Session history page
│   └── SessionDetail.tsx        # Session detail page
│
├── progress/                    # Progress tracking pages
│   ├── ProgressOverview.tsx     # Progress overview page
│   ├── BodyMetrics.tsx          # Body metrics tracking page
│   └── ProgressCharts.tsx       # Progress visualization page
│
├── equipment/                   # Equipment-related pages
│   ├── EquipmentList.tsx        # Equipment list page
│   └── UserEquipment.tsx        # User's equipment page
│
├── real-time-detection/         # AI form detection pages
│   ├── DetectionSetup.tsx       # Detection setup page
│   ├── LiveDetection.tsx        # Live form detection page
│   └── DetectionSettings.tsx    # Detection settings page
│
├── profile/                     # Extended profile pages
│   ├── ProfileEdit.tsx          # Profile editing page
│   ├── ActivityHistory.tsx      # Activity history page
│   └── UserPreferences.tsx      # User preferences page
│
└── ai-testing/                  # AI testing pages
    ├── TestAI.tsx               # AI testing page
    └── AISettings.tsx           # AI settings page
```

### Components (`src/components/`)
Reusable UI components grouped by functionality.

```
src/components/
├── common/                      # Common shared components
│   ├── Loader.tsx               # Loading indicator
│   ├── ErrorBoundary.tsx        # Error handling component
│   ├── Pagination.tsx           # Pagination component
│   ├── SearchBar.tsx            # Search bar component
│   ├── Filters.tsx              # Filter components
│   └── NotFound.tsx             # Not found component
│
├── layout/                      # Layout components
│   ├── Header.tsx               # Header component
│   ├── Sidebar.tsx              # Sidebar navigation
│   ├── Footer.tsx               # Footer component
│   ├── PageContainer.tsx        # Page container
│   └── AppLayout.tsx            # Main application layout
│
├── ui/                          # UI elements and controls
│   ├── Button.tsx               # Button component
│   ├── Card.tsx                 # Card component
│   ├── Modal.tsx                # Modal component
│   ├── Dropdown.tsx             # Dropdown component
│   ├── Tabs.tsx                 # Tabs component
│   ├── Alert.tsx                # Alert/notification component
│   └── Form elements (inputs, selects, etc.)
│
├── auth/                        # Authentication components
│   ├── LoginForm.tsx            # Login form
│   ├── RegisterForm.tsx         # Registration form
│   ├── PasswordReset.tsx        # Password reset form
│   └── AuthGuard.tsx            # Authentication guard
│
├── exercise/                    # Exercise components
│   ├── ExerciseCard.tsx         # Exercise card
│   ├── ExerciseList.tsx         # Exercise list component
│   ├── ExerciseForm.tsx         # Exercise form
│   ├── ExerciseFilters.tsx      # Exercise filters
│   └── ExerciseInstructions.tsx # Exercise instructions
│
├── workout/                     # Workout components
│   ├── WorkoutCard.tsx          # Workout card
│   ├── WorkoutList.tsx          # Workout list component
│   ├── WorkoutForm.tsx          # Workout form
│   ├── WorkoutExerciseItem.tsx  # Workout exercise item
│   └── WorkoutTimer.tsx         # Workout timer
│
├── progress/                    # Progress tracking components
│   ├── ProgressChart.tsx        # Progress chart
│   ├── MetricsForm.tsx          # Metrics input form
│   ├── ProgressSummary.tsx      # Progress summary
│   └── GoalTracker.tsx          # Goal tracking component
│
├── video/                       # Video-related components
│   ├── VideoPlayer.tsx          # Video player
│   ├── CameraSetup.tsx          # Camera setup component
│   └── VideoRecorder.tsx        # Video recording component
│
├── ai/                          # AI-related components
│   ├── layout/                  # AI layout components
│   │   └── ExerciseAnalysisLayout.tsx  # Layout for exercise analysis
│   │
│   ├── camera/                  # Camera processing components
│   │   ├── Camera.tsx           # Camera component for video capture
│   │   └── types.ts             # Type definitions for camera components
│   │
│   ├── common/                  # Common AI components
│   │   └── TabPanel.tsx         # Tab panel for AI interface
│   │
│   ├── analysis/                # Analysis display components
│   │   ├── AnalysisError.tsx    # Error display for analysis
│   │   └── AnalysisResult.tsx   # Display for analysis results
│   │
│   ├── exercises/               # Exercise-specific AI components
│   │   ├── BaseExerciseAnalyzer.tsx    # Base class for all exercise analyzers
│   │   │
│   │   ├── squat/               # Squat analysis components
│   │   │   ├── SquatAnalyzer.tsx        # Squat form analyzer
│   │   │   └── SquatMetricsDisplay.tsx  # Squat metrics visualization
│   │   │
│   │   ├── bench_press/         # Bench press analysis components
│   │   │   ├── BenchPressAnalyzer.tsx
│   │   │   └── BenchPressMetricsDisplay.tsx
│   │   │
│   │   ├── bicep/               # Bicep curl analysis components
│   │   │   ├── BicepAnalyzer.tsx
│   │   │   └── BicepMetricsDisplay.tsx
│   │   │
│   │   ├── lateral-raise/       # Lateral raise analysis components
│   │   │   ├── LateralRaiseAnalyzer.tsx
│   │   │   └── LateralRaiseMetricsDisplay.tsx
│   │   │
│   │   ├── lunge/               # Lunge analysis components
│   │   │   ├── LungeAnalyzer.tsx
│   │   │   └── LungeMetricsDisplay.tsx
│   │   │
│   │   ├── plank/               # Plank analysis components
│   │   │   ├── PlankAnalyzer.tsx
│   │   │   └── PlankMetricsDisplay.tsx
│   │   │
│   │   ├── pushup/              # Push-up analysis components
│   │   │   ├── PushupAnalyzer.tsx
│   │   │   └── PushupMetricsDisplay.tsx
│   │   │
│   │   ├── shoulder_press/      # Shoulder press analysis components
│   │   │   ├── ShoulderPressAnalyzer.tsx
│   │   │   └── ShoulderPressMetricsDisplay.tsx
│   │   │
│   │   └── situp/               # Sit-up analysis components
│   │       ├── SitupAnalyzer.tsx
│   │       └── SitupMetricsDisplay.tsx
│
├── equipment/                   # Equipment components
│   ├── EquipmentSelector.tsx    # Equipment selection component
│   ├── EquipmentList.tsx        # Equipment list component
│   └── UserEquipmentForm.tsx    # User equipment form
│
└── achievements/                # Achievement components
    ├── AchievementCard.tsx      # Achievement card
    ├── AchievementList.tsx      # Achievement list
    └── AchievementProgress.tsx  # Achievement progress tracker
```

### Services (`src/services/`)
API communication and business logic.

```
src/services/
├── api.ts                      # Base API configuration
├── index.ts                    # Service exports
├── authService.ts              # Authentication service
├── userService.ts              # User management service
├── exerciseService.ts          # Exercise service
├── workoutService.ts           # Workout service
├── sessionService.ts           # Workout session service
├── progressService.ts          # Progress tracking service
├── achievementService.ts       # Achievement service
├── equipmentService.ts         # Equipment service
└── dashboardService.ts         # Dashboard data service
```

### Contexts (`src/contexts/`)
React Context providers for state management.

```
src/contexts/
├── AuthContext.tsx              # Authentication context
├── UserContext.tsx              # User data context
├── WorkoutContext.tsx           # Workout data context
├── ExerciseContext.tsx          # Exercise data context
├── ThemeContext.tsx             # Theme/styling context
└── NotificationContext.tsx      # Notification context
```

### Hooks (`src/hooks/`)
Custom React hooks.

```
src/hooks/
├── useAuth.ts                   # Authentication hook
├── useUser.ts                   # User data hook
├── useWorkout.ts                # Workout data hook
├── useExercise.ts               # Exercise data hook
├── useForm.ts                   # Form handling hook
├── useLocalStorage.ts           # Local storage hook
├── useProgress.ts               # Progress tracking hook
├── useSession.ts                # Session management hook
└── useApi.ts                    # API communication hook
```

### Types (`src/types/`)
TypeScript type definitions.

```
src/types/
├── auth.types.ts                # Authentication types
├── user.types.ts                # User-related types
├── exercise.types.ts            # Exercise-related types
├── workout.types.ts             # Workout-related types
├── session.types.ts             # Session-related types
├── progress.types.ts            # Progress tracking types
├── equipment.types.ts           # Equipment-related types
├── api.types.ts                 # API-related types
└── common.types.ts              # Common shared types
```

### Additional Directories
```
src/
├── utils/                       # Utility functions
│   ├── formatters.ts            # Data formatting utilities
│   ├── validators.ts            # Validation utilities
│   ├── storage.ts               # Storage utilities
│   └── helpers.ts               # General helper functions
│
├── constants/                   # Constants and enums
│   ├── routes.ts                # Route constants
│   ├── api.ts                   # API endpoints
│   ├── messages.ts              # Message constants
│   └── enums.ts                 # Enumeration types
│
├── styles/                      # Style-related files
│   ├── global.css               # Global styles
│   ├── variables.css            # CSS variables
│   ├── mixins.scss              # SCSS mixins
│   └── themes.ts                # Theme definitions
│
├── config/                      # Configuration files
│   ├── api.config.ts            # API configuration
│   └── app.config.ts            # Application configuration
│
├── router/                      # Routing configuration
│   ├── routes.tsx               # Route definitions
│   ├── PrivateRoute.tsx         # Private route component
│   └── AppRouter.tsx            # Main router component
│
└── layouts/                     # Layout components
    ├── MainLayout.tsx           # Main application layout
    ├── AuthLayout.tsx           # Authentication page layout
    └── DashboardLayout.tsx      # Dashboard layout
```

## AI Component Architecture

The AI components in the frontend follow a hierarchical structure designed for computer vision exercise analysis:

1. **Analysis Layout**: The `ExerciseAnalysisLayout.tsx` provides a consistent layout for all exercise form analysis interfaces.

2. **Camera Management**: The `Camera.tsx` component handles video capture, frame processing, and communication with the backend.

3. **Exercise-Specific Analyzers**: Each exercise type (e.g., squat, bench press) has its own analyzer that:
   - Inherits from `BaseExerciseAnalyzer.tsx`
   - Uses the camera component to capture video
   - Sends frames to the backend for processing
   - Receives analysis results
   - Visualizes feedback to the user

4. **Analysis Visualization**: Exercise-specific metric displays (e.g., `SquatMetricsDisplay.tsx`) show the analysis results in a user-friendly format.

The data flow is:
1. User starts an exercise with camera enabled
2. Camera component captures frames
3. Exercise analyzer processes frames locally and/or sends to backend
4. Analysis results are displayed in real-time
5. Feedback is provided to the user about form corrections

This architecture allows for easy addition of new exercises by creating new analyzer components that follow the established pattern. 