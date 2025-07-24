# OKGYM Project Folder Structure

## Project Overview

OKGYM is a fitness application that helps users track workouts, manage exercise routines, and monitor progress. The project is divided into three main components:

1. Backend: API server built with Node.js and TypeScript
2. Frontend: React-based user interface
3. Core: Shared code between frontend and backend

## Root Directory Structure

```
OKGYM/
├── backend/          # Backend server code
├── frontend/         # Frontend application code
├── core/             # Shared code between frontend and backend
├── scripts/          # Utility scripts for the project
├── public/           # Public assets
├── src/              # Source code (project root level)
├── node_modules/     # Node.js dependencies
└── various config files and documentation
```

## Backend Structure

```
backend/
├── src/                         # Main source code
│   ├── app.ts                   # Express application setup
│   ├── index.ts                 # Entry point
│   ├── data-source.ts           # Database connection configuration
│   ├── config.ts                # Application configuration
│   ├── controllers/             # API request handlers
│   ├── services/                # Business logic layer
│   ├── models/                  # Database entities/models
│   ├── repositories/            # Data access layer
│   ├── routes/                  # API route definitions
│   ├── middleware/              # Express middleware
│   ├── decorators/              # TypeScript decorators
│   ├── guards/                  # Authentication guards
│   ├── types/                   # TypeScript type definitions
│   ├── dto/                     # Data transfer objects
│   ├── utils/                   # Utility functions
│   ├── config/                  # Configuration files
│   ├── migrations/              # Database migrations
│   ├── seed/                    # Database seed scripts
│   └── scripts/                 # Utility scripts
├── public/                      # Public assets
├── tests/                       # Test files
├── models/                      # Alternative model location
├── dist/                        # Compiled JavaScript output
├── docs/                        # Documentation files
└── configuration files (package.json, tsconfig.json, etc.)
```

## Frontend Structure

```
frontend/
├── src/                         # Main source code
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Entry point
│   ├── index.css                # Global styles
│   ├── theme.ts                 # UI theme configuration
│   ├── config.ts                # Application configuration
│   ├── pages/                   # Page components
│   ├── components/              # Reusable UI components
│   ├── layouts/                 # Layout components
│   ├── contexts/                # React context providers
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service functions
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript type definitions
│   ├── config/                  # Configuration files
│   ├── constants/               # Constant values
│   ├── styles/                  # Style-related files
│   └── router/                  # Routing configuration
├── public/                      # Public assets
└── configuration files (package.json, tsconfig.json, etc.)
```

## Key Data Models

The application is built around the following key data models:

### User-related
- User
- UserActivity
- UserEquipment
- UserProgress
- UserSchedule

### Workout-related
- Exercise
- ExerciseCategory
- ExerciseDetails
- ExerciseFormAnalysis
- ExerciseRelation
- ExerciseSpecificAnalysis
- WorkoutExercise
- WorkoutPlan
- WorkoutRating
- WorkoutSession
- WorkoutTag
- TrainingProgram
- ProgramEnrollment
- ProgramWorkout

### Equipment & Resources
- Equipment
- AudioCue
- Media
- VideoTutorial

### Tracking & Progress
- Achievement
- BodyMetric
- Feedback
- FitnessGoal
- MetricTracking
- Notification
- AIModelConfiguration

## Further Documentation

For more detailed information on specific parts of the system, please refer to the other documentation files in the `backend/docs/` directory. 