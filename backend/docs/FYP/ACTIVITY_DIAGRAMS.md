# OKGYM Web Application - Activity Diagrams Documentation

This document outlines the activity diagrams that will be created to visualize the key processes in the OKGYM Web Application.

## Activity Diagrams Overview

We will create the following activity diagrams, broken down into smaller, focused components:

4.2.2.1 User Management
Account Registration: New user registration flow, Validation process, Error handling


Authentication: Login process, Logout process, Session management


Profile Management: Profile editing, Settings management, Dark mode toggle


4.2.2.2 Workout Management
Workout Browsing: List view, Filtering process, Pagination


Workout Details: Viewing workout information, Video preview, Exercise list


Favorite Management: Saving workouts, Managing favorites, Quick access


4.2.2.3 Workout Session
Session Start: Workout selection, Preparation, Initial setup


Exercise Performance: Recording sets/reps, Form tracking, Rest timer


Session Completion: Finalizing workout, Saving progress, Summary generation


4.2.2.4 Exercise Management
Exercise Browsing: Category navigation, Search functionality, Filtering options


Exercise Details: Viewing instructions, Video demonstrations, Form guidelines


Equipment Management: Equipment browsing, Equipment details, Related exercises


4.2.2.5 Real-time Detection
Detection Setup: Exercise selection, Method selection, Camera setup


Video Processing: Video upload flow, Format validation, Processing status


Live Detection: Camera feed, Real-time analysis, Form feedback


Metrics Display: Layout management, Real-time updates, Performance tracking


4.2.2.6 Progress Tracking
Dashboard View: Progress overview, Statistics display, Time filtering


Goal Management: Setting goals, Tracking progress, Achievement notifications


Weight Tracking: Weight entry, Trend analysis, Progress visualization


Report Generation: Report creation, Data compilation, Export options


4.2.2.7 Achievements
Achievement Viewing: List display, Details view, Progress tracking


Achievement Filtering: Tier filtering, Type filtering, Search functionality


Completion Tracking: Rate calculation, Progress display, Milestone tracking


4.2.2.8 Admin Functions
AI Testing: Test setup, Performance monitoring, Result analysis

## File Organization

Activity diagrams will be stored in the following structure:
```
backend/docs/FYP/PlantUML/
├── ActivityDiagrams/
│   ├── UserManagement/
│   │   ├── AccountRegistration.puml
│   │   ├── Authentication.puml
│   │   └── ProfileManagement.puml
│   ├── WorkoutManagement/
│   │   ├── WorkoutBrowsing.puml
│   │   ├── WorkoutDetails.puml
│   │   └── FavoriteManagement.puml
│   ├── WorkoutSession/
│   │   ├── SessionStart.puml
│   │   ├── ExercisePerformance.puml
│   │   └── SessionCompletion.puml
│   ├── ExerciseManagement/
│   │   ├── ExerciseBrowsing.puml
│   │   ├── ExerciseDetails.puml
│   │   └── EquipmentManagement.puml
│   ├── RealTimeDetection/
│   │   ├── DetectionSetup.puml
│   │   ├── VideoProcessing.puml
│   │   ├── LiveDetection.puml
│   │   └── MetricsDisplay.puml
│   ├── ProgressTracking/
│   │   ├── DashboardView.puml
│   │   ├── GoalManagement.puml
│   │   ├── WeightTracking.puml
│   │   └── ReportGeneration.puml
│   ├── Achievements/
│   │   ├── AchievementViewing.puml
│   │   ├── AchievementFiltering.puml
│   │   └── CompletionTracking.puml
│   └── AdminFunctions/
│       └── AITesting.puml
```

## Implementation Plan

1. Create User Management diagrams
2. Create Workout Management diagrams
3. Create Workout Session diagrams
4. Create Exercise Management diagrams
5. Create Real-time Detection diagrams
6. Create Progress Tracking diagrams
7. Create Achievements diagrams
8. Create Admin Functions diagrams

Each diagram will be created using PlantUML and will follow consistent styling and notation conventions.

## Styling Guidelines

- Use consistent colors for different types of activities
- Include clear swimlanes for different actors
- Use clear decision points with yes/no paths
- Include error handling paths
- Add notes for complex decision points
- Use consistent arrow styles
- Include clear start and end points

## Review Process

Each diagram will be reviewed for:
- Completeness of process coverage
- Correctness of flow logic
- Clarity of notation
- Consistency with use cases
- Proper error handling
- Appropriate level of detail 