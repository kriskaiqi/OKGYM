# OKGYM Web Application - Sequence Diagrams Documentation

This document outlines the sequence diagrams that will be created to visualize the interactions between different components in the OKGYM Web Application.

## Sequence Diagrams Overview

We will create the following sequence diagrams, corresponding to our activity diagrams:

4.2.3.1 User Management
Account Registration: User registration flow, Validation process, Error handling


Authentication: Login process, Session management, Logout process


Profile Management: Profile updates, Settings management, Theme preferences


4.2.3.2 Workout Management
Workout Browsing: List retrieval, Filtering process, Pagination


Workout Details: Information retrieval, Video loading, Exercise list display


Favorite Management: Saving workouts, Managing favorites, Quick access


4.2.3.3 Workout Session
Session Start: Workout selection, Initial setup, Preparation


Exercise Performance: Set/rep recording, Form tracking, Rest timer


Session Completion: Progress saving, Summary generation, Achievement updates


4.2.3.4 Exercise Management
Exercise Browsing: Category navigation, Search functionality, Filtering


Exercise Details: Information display, Video loading, Form guidelines


Equipment Management: Equipment browsing, Details display, Related exercises


4.2.3.5 Real-time Detection
Detection Setup: Exercise selection, Method configuration, Camera setup


Video Processing: Video upload, Format validation, Processing


Live Detection: Camera feed, Real-time analysis, Form feedback


Metrics Display: Layout management, Real-time updates, Performance tracking


4.2.3.6 Progress Tracking
Dashboard View: Progress overview, Statistics display, Time filtering


Goal Management: Goal setting, Progress tracking, Achievement updates


Weight Tracking: Weight entry, Trend analysis, Progress visualization


Report Generation: Report creation, Data compilation, Export options


4.2.3.7 Achievements
Achievement Viewing: List display, Details view, Progress tracking


Achievement Filtering: Filter application, Results display, Category management


Completion Tracking: Progress monitoring, Achievement updates, Statistics calculation


4.2.3.8 Admin Functions
AI Testing: Test setup, Performance monitoring, Debug information

## File Organization

Sequence diagrams will be stored in the following structure:
```
backend/docs/FYP/PlantUML/
├── SequenceDiagrams/
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

1. Create User Management sequence diagrams
2. Create Workout Management sequence diagrams
3. Create Workout Session sequence diagrams
4. Create Exercise Management sequence diagrams
5. Create Real-time Detection sequence diagrams
6. Create Progress Tracking sequence diagrams
7. Create Achievements sequence diagrams
8. Create Admin Functions sequence diagrams

Each sequence diagram will be created using PlantUML and will follow consistent styling and notation conventions.

## Styling Guidelines

- Use consistent colors for different types of participants
- Include clear lifelines for each component
- Use clear message arrows with proper labels
- Include return messages where appropriate
- Add notes for complex interactions
- Use consistent arrow styles
- Include clear start and end points

## Review Process

Each diagram will be reviewed for:
- Completeness of interaction coverage
- Correctness of message flow
- Clarity of notation
- Consistency with activity diagrams
- Proper error handling
- Appropriate level of detail 