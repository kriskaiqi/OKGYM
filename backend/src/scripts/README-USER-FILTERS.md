# User Filtering Testing Guide

This guide explains how to test the enhanced user filtering functionality implemented in the OKGYM application.

## Overview

The user filtering system allows for searching and filtering users based on various criteria:

1. **Basic Filters**: role, status, search term
2. **Demographic Filters**: gender, activity level, fitness level
3. **Preference Filters**: workout location, exercise preferences, target body areas
4. **Pagination and Sorting**: limit, offset, sortBy, sortDirection

## Test Scripts

Two test scripts have been created to verify the filtering functionality:

### 1. Direct Repository Testing (`testUserFilters.ts`)

This script tests the filters directly against the repository layer:

- Creates test users with various attributes
- Tests filtering through the repository methods
- Validates filter results
- Tests combinations of filters

### 2. API Endpoint Testing (`testUserApi.ts`)

This script tests the filters through the API endpoints:

- Authenticates as an admin user
- Makes API requests with different filter combinations
- Validates responses
- Tests the HTTP layer and controller implementation

## Running the Tests

### Prerequisites

1. Make sure your database is set up and running
2. Ensure that the application is built and ready to run
3. Install all dependencies with `npm install`

### Test the Repository Layer

```bash
npm run test:user-filters
```

This will:
- Create test users if needed
- Run filter tests directly against the repository layer
- Log the results to the console

### Test the API Endpoints

1. Start the application:
```bash
npm run dev
```

2. In another terminal, run the API tests:
```bash
npm run test:user-api
```

This will:
- Authenticate as an admin
- Test the API endpoints with various filter combinations
- Log the results to the console

## Available Filters

### Basic Filters
- `role`: Filter by user role (ADMIN, USER, TRAINER, CONTENT_CREATOR)
- `status`: Filter by user status (ACTIVE, INACTIVE, PENDING, SUSPENDED)
- `searchTerm`: Search in user's name, email, etc.

### Demographic Filters
- `gender`: Filter by gender
- `activityLevel`: Filter by activity level
- `minimumFitnessLevel`: Filter by minimum fitness level

### Preference Filters
- `preferredLocation`: Filter by preferred workout location
- `exercisePreferences`: Filter by exercise preferences
- `targetBodyAreas`: Filter by target body areas

### Additional Filters
- `emailVerified`: Filter verified/unverified email accounts
- `hasProfilePicture`: Filter users with/without profile pictures
- `lastActiveAfter`: Filter by last activity date
- `hasCompletedProfile`: Filter by profile completion status

### Pagination
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip

### Sorting
- `sortBy`: Field to sort by (e.g., firstName, lastName, createdAt)
- `sortDirection`: Sort direction (ASC or DESC)

### Relations
- `includePreferences`: Include user preferences in results
- `includeFitnessGoals`: Include fitness goals in results
- `includeFavoriteWorkouts`: Include favorite workouts in results
- `includeWorkoutHistory`: Include workout history in results

## Examples

### Example 1: Find active female users
```
GET /api/users?role=USER&status=ACTIVE&gender=FEMALE
```

### Example 2: Find beginners who prefer home workouts
```
GET /api/users?minimumFitnessLevel=BEGINNER&preferredLocation=HOME&includePreferences=true
```

### Example 3: Pagination and sorting
```
GET /api/users?limit=10&offset=0&sortBy=firstName&sortDirection=ASC
```

## Troubleshooting

If the tests fail, check the following:

1. Ensure your database connection is working
2. Verify that the application is running (for API tests)
3. Check that you have the necessary permissions (admin role)
4. Look at the error logs for specific issues
5. Verify that the test users were created successfully 