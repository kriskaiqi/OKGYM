# OKGYM Unit Testing Documentation

This directory contains comprehensive unit testing documentation for the OKGYM web application. The testing is organized into 7 main components:

1. **User Management**
   - Account Registration 1
   - Authentication 2
   - Profile Management 3
   - Dark Mode Toggle 4

2. **Workout Management**
   - Workout Browsing 5
   - Workout Details 6
   - Favorite Workouts 7
   - Workout Filtering 8

3. **Workout Sessions**
   - Session Start 9
   - Exercise Performance 10
   - Session Completion 11
   - Workout History 12
   - Workout Summary 13
   - Workout Feedback 14

4. **Exercise and Equipment Management**
   - Exercise Browsing 15
   - Exercise Details 16
   - Exercise Filtering 17
   - Equipment Browsing 18
   - Equipment Details 19
   - Equipment Filtering 20

5. **Real-time Detection**
   - Exercise Detection 21
   - Exercise Selection 22
   - Form Monitoring 23
   - Detection Methods 24
   - Video Upload 25
   - Live Camera 26
   - Metrics Layout 27

6. **Progress Tracking**
   - Progress Dashboard 28
   - Fitness Goals 29
   - Weight Tracking 30
   - Progress Reports 31
   - Time Filtering 32

7. **Achievements**
   - Achievement Viewing 33
   - Achievement Filtering 34
   - Completion Tracking 35

## Directory Structure
```
Unit_Testing/
├── UserManagement/
│   ├── AccountRegistration.md
│   ├── Authentication.md
│   ├── ProfileManagement.md
│   └── DarkMode.md
├── WorkoutManagement/
│   ├── WorkoutBrowsing.md
│   ├── WorkoutDetails.md
│   ├── FavoriteWorkouts.md
│   └── WorkoutFiltering.md
├── WorkoutSessions/
│   ├── SessionStart.md
│   ├── ExercisePerformance.md
│   ├── SessionCompletion.md
│   ├── WorkoutHistory.md
│   ├── WorkoutSummary.md
│   └── WorkoutFeedback.md
├── ExerciseEquipment/
│   ├── ExerciseBrowsing.md
│   ├── ExerciseDetails.md
│   ├── ExerciseFiltering.md
│   ├── EquipmentBrowsing.md
│   ├── EquipmentDetails.md
│   └── EquipmentFiltering.md
├── RealTimeDetection/
│   ├── ExerciseDetection.md
│   ├── ExerciseSelection.md
│   ├── FormMonitoring.md
│   ├── DetectionMethods.md
│   ├── VideoUpload.md
│   ├── LiveCamera.md
│   └── MetricsLayout.md
├── ProgressTracking/
│   ├── ProgressDashboard.md
│   ├── FitnessGoals.md
│   ├── WeightTracking.md
│   ├── ProgressReports.md
│   └── TimeFiltering.md
└── Achievements/
    ├── AchievementViewing.md
    ├── AchievementFiltering.md
    └── CompletionTracking.md
```

## Testing Guidelines
1. Each component's test documentation follows the template provided in `UNIT_TESTING_TEMPLATE.md`
2. Tests should cover:
   - Basic functionality
   - Edge cases
   - Error handling
   - Performance metrics
   - Integration points
3. All test cases should be reproducible
4. Test data should be clearly documented
5. Results should be verifiable

## Test Environment Requirements
- Node.js v14 or higher
- Jest testing framework
- Supertest for API testing
- Mock service worker for API mocking
- Chrome/Chromium for browser testing
- Jest Puppeteer for E2E testing

## Running Tests
Instructions for running tests will be provided in each component's documentation. 