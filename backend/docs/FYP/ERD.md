# Entity Relationship Diagram Documentation

## Core Models

### Users
- Primary model for user management
- Stores user authentication and profile information

### Exercises
- Core model for exercise information
- Contains exercise details and configurations

### Equipment
- Stores exercise equipment information
- Used for both workouts and exercises

### Workouts
- Represents workout sessions and plans
- Links exercises, equipment, and user progress

## Exercise-Related Models

### Exercise Equipment
- Junction table linking exercises with required equipment
- Maps exercise_uuid to equipment_uuid

### Exercise Media
- Stores media files associated with exercises
- Contains video tutorials, images, etc.

### Equipment Muscle Groups
- Maps equipment to targeted muscle groups
- Used for exercise and workout planning

### Equipment Categories
- Detailed categorization of exercise equipment
- Contains category descriptions and hierarchies

### Body Metrics
- Tracks user physical measurements
- Used for progress monitoring

## Workout-Related Models

### Workout Plans
- Structured workout programs
- Contains workout sequences and schedules

### Workout Sessions
- Records of completed workout sessions
- Tracks user performance and progress

### Workout Exercises
- Maps exercises to specific workouts
- Contains exercise order and configurations

### Workout Equipment
- Links equipment needed for workouts
- Maps workout_uuid to equipment_uuid

### Workout Muscle Groups
- Tracks muscle groups targeted in workouts
- Used for workout categorization

### Workout Tags
- Categorization system for workouts
- Used for filtering and organization

### Workout Tag Map
- Junction table for workout-tag relationships
- Maps workout_uuid to tag_uuid

## User Progress Models

### User Favorite Workouts
- Stores user workout preferences
- Maps user_uuid to workout_uuid

### Fitness Goals
- User-defined fitness objectives
- Tracks goal progress and achievements

## Media Models

### Media
- Central storage for all media files
- Used across exercises and workouts

### Audio Cues
- Voice prompts and audio instructions
- Used during workout sessions

## Please confirm if these models align with your database structure. Let me know:
1. Which models should be removed
2. Which additional models need to be added
3. If you need detailed field information for any specific model
4. Any relationships that need to be clarified

I'll update the documentation based on your feedback. 