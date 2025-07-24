# Database Schema Documentation

## Core Tables

### users
- Primary key: id (int, auto-increment)
- Fields:
  - email (varchar, unique)
  - password (varchar)
  - firstName (varchar)
  - lastName (varchar)
  - role (enum: 'user', 'admin')
  - fitnessProfile (jsonb, nullable)
  - createdAt (timestamp)
  - updatedAt (timestamp)

### exercises
- Primary key: id (uuid)
- Fields:
  - name (varchar)
  - type (varchar)
  - defaultDuration (integer)
  - description (text)
  - difficulty (varchar)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

### equipment
- Need schema details
- Used for both workouts and exercises

### workout_plans
- Primary key: id (uuid)
- Fields:
  - name (varchar)
  - description (text)
  - difficulty (varchar)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

## Junction Tables

### exercise_category
- Maps exercises to categories
- Primary key: id (uuid)
- Fields:
  - exercise_id (uuid, FK to exercises)
  - category_id (uuid, FK to exercise_categories)
  - created_at (timestamp)

### exercise_equipment
- Maps exercises to equipment
- Need schema details

### workout_exercises
- Primary key: id (uuid)
- Fields:
  - workout_plan_id (uuid, FK to workout_plans)
  - exercise_id (uuid, FK to exercises)
  - set_index (integer)
  - duration (integer)
  - order (integer)
  - settings (jsonb, nullable)
  - created_at (timestamp)

### workout_equipment
- Maps workouts to equipment
- Need schema details

### workout_muscle_group
- Maps workouts to muscle groups
- Need schema details

### workout_tag_map
- Maps workouts to tags
- Need schema details

## Media Tables

### media
- Central media storage
- Need schema details

### exercise_media
- Exercise-specific media
- Need schema details

### audio_cues
- Audio instructions
- Need schema details

## Additional Tables

### body_metrics
- Physical measurements
- Need schema details

### equipment_muscle_groups
- Equipment-muscle mappings
- Need schema details

### equipment_categories
- Equipment categorization
- Need schema details

### fitness_goals
- User goals
- Need schema details

### user_favourite_workouts
- User preferences
- Need schema details

### workout_sessions
- Workout records
- Need schema details

### workout_tags
- Workout categorization
- Need schema details

## Relationships
1. exercises -> exercise_category -> exercise_categories
2. exercises -> exercise_equipment -> equipment
3. workout_plans -> workout_exercises -> exercises
4. workout_plans -> workout_equipment -> equipment
5. workout_plans -> workout_muscle_group
6. workout_plans -> workout_tag_map -> workout_tags
7. users -> user_favourite_workouts -> workout_plans

## Notes
1. Need to confirm schema details for tables marked with "Need schema details"
2. Some tables might have additional fields not shown in the initial migrations
3. Need to verify if any tables have been modified in subsequent migrations

Would you like me to:
1. Search for schema details of specific tables?
2. Document additional relationships?
3. Add field descriptions for existing tables?
4. Look for any missing tables in the migrations? 