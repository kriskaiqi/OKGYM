# OKGYM Database Schema

This document outlines the database schema for the OKGYM application, describing the main entities and their relationships.

## Entity Relationship Diagram (ERD)

```
┌───────────┐       ┌─────────────────┐        ┌───────────────┐
│           │       │                 │        │               │
│  User     │───────┤ WorkoutSession  ├────────┤ WorkoutPlan   │
│           │       │                 │        │               │
└─────┬─────┘       └────────┬────────┘        └───────┬───────┘
      │                      │                         │
      │                      │                         │
┌─────▼─────┐       ┌────────▼────────┐        ┌───────▼───────┐
│           │       │                 │        │               │
│UserEquip  │       │WorkoutExercise  │◄───────┤ Exercise      │
│-ment      │       │                 │        │               │
└─────┬─────┘       └────────┬────────┘        └───────┬───────┘
      │                      │                         │
      │                      │                         │
      │              ┌───────▼───────┐         ┌───────▼───────┐
      │              │               │         │               │
      └──────────────► Equipment     ├─────────┤ExerciseCategory
                     │               │         │               │
                     └───────────────┘         └───────────────┘
```

## Main Entities

### User-related Entities

#### User

The central entity representing application users.

**Key Fields:**
- `id`: Primary key
- `email`: User email (unique)
- `passwordHash`: Hashed password
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: User role (ADMIN, USER, TRAINER)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Relationships:**
- One-to-many with `WorkoutSession`
- One-to-many with `UserEquipment`
- One-to-many with `UserProgress`
- One-to-many with `UserActivity`
- Many-to-many with `Achievement`

#### UserEquipment

Records equipment available to a user.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `equipmentId`: Foreign key to Equipment
- `purchaseDate`: Date when equipment was acquired
- `notes`: Additional notes about the equipment

**Relationships:**
- Many-to-one with `User`
- Many-to-one with `Equipment`

#### UserProgress

Tracks user progress over time.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `date`: Date of progress record
- `weight`: User's weight
- `bodyFat`: Body fat percentage
- `notes`: Additional notes

**Relationships:**
- Many-to-one with `User`

#### UserActivity

Records user activities in the system.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `activityType`: Type of activity (LOGIN, WORKOUT, etc.)
- `timestamp`: When the activity occurred
- `details`: Additional activity details

**Relationships:**
- Many-to-one with `User`

### Workout-related Entities

#### WorkoutPlan

Defines a workout plan template.

**Key Fields:**
- `id`: Primary key
- `name`: Plan name
- `description`: Plan description
- `difficulty`: Difficulty level
- `createdById`: User who created the plan
- `isPublic`: Whether the plan is publicly available
- `estimatedDuration`: Estimated workout duration
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships:**
- Many-to-one with `User` (creator)
- One-to-many with `WorkoutExercise`
- Many-to-many with `WorkoutTag`

#### WorkoutSession

Records an instance of a user performing a workout.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `workoutPlanId`: Foreign key to WorkoutPlan
- `startTime`: When the session started
- `endTime`: When the session ended
- `status`: Session status (IN_PROGRESS, COMPLETED, etc.)
- `notes`: Session notes
- `rating`: User rating for the session

**Relationships:**
- Many-to-one with `User`
- Many-to-one with `WorkoutPlan`
- One-to-many with `ExerciseFormAnalysis`

#### WorkoutExercise

Links exercises to workout plans with specific parameters.

**Key Fields:**
- `id`: Primary key
- `workoutPlanId`: Foreign key to WorkoutPlan
- `exerciseId`: Foreign key to Exercise
- `order`: Order in the workout
- `sets`: Number of sets
- `reps`: Number of repetitions
- `duration`: Exercise duration
- `rest`: Rest period
- `notes`: Exercise-specific notes

**Relationships:**
- Many-to-one with `WorkoutPlan`
- Many-to-one with `Exercise`

#### WorkoutTag

Tags for categorizing workouts.

**Key Fields:**
- `id`: Primary key
- `name`: Tag name
- `description`: Tag description

**Relationships:**
- Many-to-many with `WorkoutPlan`

### Exercise-related Entities

#### Exercise

Base entity for exercises.

**Key Fields:**
- `id`: Primary key
- `name`: Exercise name
- `description`: Exercise description
- `difficulty`: Difficulty level
- `instructions`: Detailed instructions
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships:**
- Many-to-many with `ExerciseCategory`
- Many-to-many with `Equipment`
- One-to-many with `WorkoutExercise`
- One-to-many with `ExerciseDetails`

#### ExerciseCategory

Categories for organizing exercises.

**Key Fields:**
- `id`: Primary key
- `name`: Category name
- `description`: Category description
- `parentId`: Parent category (for hierarchical categories)

**Relationships:**
- Many-to-many with `Exercise`
- Self-referencing for hierarchical categories

#### ExerciseDetails

Additional details about exercises.

**Key Fields:**
- `id`: Primary key
- `exerciseId`: Foreign key to Exercise
- `muscleGroups`: Primary muscles worked
- `secondaryMuscleGroups`: Secondary muscles worked
- `benefits`: Exercise benefits
- `variations`: Possible variations

**Relationships:**
- Many-to-one with `Exercise`

#### ExerciseFormAnalysis

Records and analyzes exercise form during a workout session.

**Key Fields:**
- `id`: Primary key
- `sessionId`: Foreign key to WorkoutSession
- `exerciseId`: Foreign key to Exercise
- `timestamp`: Analysis timestamp
- `formScore`: Overall form score
- `feedback`: Feedback on form
- `rawData`: Raw analysis data

**Relationships:**
- Many-to-one with `WorkoutSession`
- Many-to-one with `Exercise`

### Equipment & Resources

#### Equipment

Exercise equipment.

**Key Fields:**
- `id`: Primary key
- `name`: Equipment name
- `description`: Equipment description
- `category`: Equipment category
- `imageUrl`: Equipment image URL

**Relationships:**
- Many-to-many with `Exercise`
- One-to-many with `UserEquipment`

#### Media

Media resources like images and videos.

**Key Fields:**
- `id`: Primary key
- `type`: Media type (IMAGE, VIDEO)
- `url`: Media URL
- `title`: Media title
- `description`: Media description
- `uploadedById`: User who uploaded the media
- `uploadedAt`: Upload timestamp

**Relationships:**
- Many-to-one with `User` (uploader)
- Many-to-many with `Exercise`

#### VideoTutorial

Video tutorials for exercises.

**Key Fields:**
- `id`: Primary key
- `exerciseId`: Foreign key to Exercise
- `url`: Video URL
- `title`: Tutorial title
- `description`: Tutorial description
- `durationSeconds`: Video duration

**Relationships:**
- Many-to-one with `Exercise`

### Tracking & Progress

#### Achievement

User achievements.

**Key Fields:**
- `id`: Primary key
- `name`: Achievement name
- `description`: Achievement description
- `criteria`: Achievement criteria
- `points`: Points awarded

**Relationships:**
- Many-to-many with `User`

#### BodyMetric

Body measurements tracked over time.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `metricType`: Type of metric (WEIGHT, BODY_FAT, etc.)
- `value`: Metric value
- `date`: Measurement date
- `notes`: Additional notes

**Relationships:**
- Many-to-one with `User`

#### FitnessGoal

User fitness goals.

**Key Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `title`: Goal title
- `description`: Goal description
- `targetDate`: Target achievement date
- `status`: Goal status (IN_PROGRESS, COMPLETED, etc.)
- `createdAt`: Creation timestamp
- `completedAt`: Completion timestamp

**Relationships:**
- Many-to-one with `User`

## Database Relationships

### One-to-Many Relationships

- User → WorkoutSession: A user can have many workout sessions
- User → UserEquipment: A user can have many equipment items
- User → UserProgress: A user can have many progress records
- User → UserActivity: A user can have many activity records
- WorkoutPlan → WorkoutExercise: A workout plan can have many exercises
- Exercise → ExerciseDetails: An exercise can have many detail records

### Many-to-Many Relationships

- Exercise ↔ ExerciseCategory: Exercises can belong to multiple categories
- Exercise ↔ Equipment: Exercises can use multiple equipment items
- WorkoutPlan ↔ WorkoutTag: Workout plans can have multiple tags
- User ↔ Achievement: Users can earn multiple achievements

## Indexing Strategy

The database uses the following indexing strategy to optimize query performance:

1. Primary key indices on all tables
2. Foreign key indices for all relationships
3. Composite indices for frequently queried combinations
4. Full-text search indices for text search functionality

## Data Integrity

Data integrity is maintained through:

1. Foreign key constraints
2. NOT NULL constraints on required fields
3. Unique constraints on fields requiring uniqueness
4. Check constraints for value validation
5. Default values for common fields 