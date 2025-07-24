# OKGYM Backend

This is the backend service for the OKGYM application, providing APIs for user management, workout plans, exercise tracking, and more.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit `.env` file with your configuration.

3. Initialize database:
   ```bash
   npm run db:seed-users
   ```

## Updating Exercise Stats

To update exercise statistics with realistic data:

1. Run the following command:
   ```bash
   npm run update:exercise-stats
   ```

2. This will:
   - Go through all exercises in the database
   - Generate realistic stats for each exercise
   - Update the exercises with the new stats

3. The stats include:
   - Rating (count, value, distribution)
   - Calories (avg, min, max)
   - Duration (avg, min, max)
   - Completion (rate, total, successful)
   - Popularity (score, trend, lastUpdated)

This is useful for initializing your database with realistic-looking usage data instead of default/empty values.

## Testing

### User API Testing

The `testUserApi.ts` script tests the HTTP API endpoints for user filtering.

1. Run the server:
   ```bash
   npm run start
   ```

2. In a separate terminal, run the API tests:
   ```bash
   npm run test:user-api
   ```

This will test:
- Basic filters (role, status, search term)
- Pagination and sorting 
- Demographic filters (gender, activity level, fitness level)
- Preference filters (location, exercise preferences, body areas)
- Combined filters

### Repository Testing

The `testUserFilters.ts` script tests the repository layer directly.

Run the repository filter tests with:
```bash
npm run test:user-filters
```

This validates that our database queries handle all filter criteria correctly.

### Dry Run Testing 

For quick testing without a database connection, use:
```bash
npm run test:dry-run
```

### Caching Testing

Test the caching functionality in the UserRepository with:
```bash
npm run test:caching
```

This verifies:
- Cache hit/miss behavior
- Cache invalidation patterns
- Filter-based caching

If you encounter any caching issues, you can run:
```bash
npm run fix:caching
```

This will analyze and fix common caching issues in the UserRepository.

More details on caching best practices can be found in the [caching documentation](src/repositories/README_CACHING_FIX.md).

## Available Filter Options

Users can be filtered by:

- `role`: USER, ADMIN, TRAINER, CONTENT_CREATOR
- `status`: ACTIVE, INACTIVE, PENDING, SUSPENDED, DELETED
- `searchTerm`: Searches in first name, last name, and email
- `gender`: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- `activityLevel`: SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTREMELY_ACTIVE
- `fitnessLevel`: BEGINNER, INTERMEDIATE, ADVANCED, ELITE
- `mainGoal`: STRENGTH_GAIN, MUSCLE_BUILDING, FAT_LOSS, ENDURANCE, etc.
- `preferredLocation`: HOME, GYM, OUTDOORS, ANYWHERE
- `exercisePreferences`: STRENGTH_FOCUSED, CARDIO_FOCUSED, LOW_IMPACT, NO_EQUIPMENT, etc.
- `targetBodyAreas`: ARMS, LEGS, CORE, CHEST, BACK, FULL_BODY, etc.

## Performance Optimization

Database indexes have been added to optimize user filtering queries. The indexes are defined in the migration file:
```
src/migrations/1710800000000-AddUserFilteringIndexes.ts
```

## Troubleshooting

- If you encounter errors with the database connection, verify your database settings in the `.env` file.
- Make sure the database migrations have been run.
- For testing issues, try the dry run test first to validate filter logic.
- If you experience caching-related issues, refer to the caching documentation and run the caching test.

## API Documentation

### Exercise Service API

The Exercise service provides comprehensive functionality for managing exercises, categories, equipment, and related operations.

#### Main Endpoints

- **Exercises**
  - `GET /api/exercises` - List all exercises with filtering and pagination
  - `GET /api/exercises/:id` - Get exercise by ID
  - `POST /api/exercises` - Create new exercise
  - `PUT /api/exercises/:id` - Update existing exercise
  - `DELETE /api/exercises/:id` - Delete exercise

- **Categories**
  - `GET /api/exercise-categories` - List all categories
  - `GET /api/exercise-categories/:id` - Get category by ID
  - `POST /api/exercise-categories` - Create new category
  - `PUT /api/exercise-categories/:id` - Update category
  - `DELETE /api/exercise-categories/:id` - Delete category

- **Equipment**
  - `GET /api/equipment` - List all equipment
  - `GET /api/equipment/:id` - Get equipment by ID
  - `POST /api/equipment` - Create new equipment
  - `PUT /api/equipment/:id` - Update equipment
  - `DELETE /api/equipment/:id` - Delete equipment

- **Search and Filtering**
  - `GET /api/exercises/search?q=query` - Search exercises by keyword
  - `GET /api/exercises/by-muscle/:muscleGroup` - Get exercises by muscle group
  - `GET /api/exercises/popular` - Get popular exercises

- **Exercise Relationships**
  - `GET /api/exercises/:id/related` - Get related exercises
  - `GET /api/exercises/:id/alternatives` - Get alternative exercises
  - `GET /api/exercises/:id/progressions` - Get exercise progressions
  - `POST /api/exercises/:id/relations` - Create exercise relation
  - `DELETE /api/exercises/relations/:relationId` - Remove exercise relation

For full API documentation, please refer to the Swagger documentation at `/api-docs` when running the server. 