# Entity Relationship Diagram Details

## Core Entities

### users
- PK: id (UUID)
- Essential Fields:
  - email (varchar, unique, not null)
  - firstName (varchar, not null)
  - lastName (varchar, not null)
  - password (varchar, not null, hashed)
  - userRole (enum: USER, ADMIN, TRAINER, CONTENT_CREATOR)
  - isAdmin (boolean, default: false)
  - isPremium (boolean, default: false)
- Profile Fields:
  - gender (enum: Gender, nullable)
  - birthYear (integer, nullable)
  - height (float, nullable)
  - mainGoal (enum: FitnessGoal, nullable)
  - activityLevel (enum: ActivityLevel, nullable)
  - fitnessLevel (enum: Difficulty, default: BEGINNER)
- JSON Fields:
  - preferences (jsonb: UserPreferences)
  - stats (jsonb: UserStats)
- Timestamps:
  - createdAt (timestamp)
  - updatedAt (timestamp)
- Key Relationships:
  - → workout_sessions (1:N)
  - → achievements (1:N)
  - → fitness_goals (1:N)
  - → body_metrics (1:N)
  - → notifications (1:N)
  - → workout_plans (1:N, as creator)
  - ↔ workout_plans (M:N via user_favourite_workouts)
  - ↔ workout_plans (M:N via user_workout_history)
- Indexes:
  - idx_user_email_admin_premium (email, isAdmin, isPremium)
  - idx_user_fitness_goal_activity (fitnessLevel, mainGoal, activityLevel)
  - email (unique)

### exercises
- PK: id (uuid)
- Essential Fields:
  - name (varchar, not null)
  - description (text, not null)
  - measurementType (enum: MeasurementType, default: REPS)
  - types (ExerciseType[], not null)
  - level (enum: Difficulty, default: BEGINNER)
  - movementPattern (enum: MovementPattern, nullable)
  - trackingFeatures (TrackingFeature[], default: [])
  - targetMuscleGroups (MuscleGroup[], default: [])
  - synergistMuscleGroups (MuscleGroup[], default: [])
- JSON Fields:
  - form (jsonb: ExerciseForm, nullable)
  - aiConfig (jsonb: AIModelConfig, nullable)
  - stats (jsonb: ExerciseStats)
- Timestamps:
  - createdAt (timestamp)
  - updatedAt (timestamp)
- Key Relationships:
  - → workout_exercises (1:N)
  - → exercise_details (1:N)
  - → metric_tracking (1:N)
  - → feedback (1:N)
  - ↔ equipment (M:N via exercise_equipment)
  - ↔ media (M:N via exercise_media)
  - ↔ categories (M:N via exercise_category)
  - ↔ exercise_relations (M:N)
- Indexes:
  - idx_exercise_name_measurement (name, measurementType)
  - idx_exercise_name
  - idx_exercise_measurement
  - idx_exercise_level
  - idx_exercise_movement

### equipment
- PK: id (uuid)
- Essential Fields:
  - name (varchar, default: "Unnamed Equipment")
  - description (text)
  - category (enum: EquipmentCategory, default: ACCESSORIES)
  - difficulty (enum: Difficulty, default: BEGINNER)
  - costTier (enum: CostTier, default: MID_RANGE)
  - spaceRequired (enum: SpaceRequirement, default: SMALL)
  - purchaseUrl (varchar, nullable)
  - estimatedPrice (float, nullable)
  - manufacturer (varchar, nullable)
- Media Fields:
  - image_id (uuid, nullable)
  - video_id (uuid, nullable)
- JSON Fields:
  - specifications (jsonb, nullable)
  - alternatives (jsonb, nullable)
- Timestamps:
  - createdAt (timestamp)
  - updatedAt (timestamp)
- Key Relationships:
  - ↔ exercise_category (M:N via equipment_muscle_groups)
  - ↔ workout_tag (M:N via equipment_training_types)
  - ↔ exercise (M:N via exercise_equipment)
  - ↔ workout_plan (M:N via workout_equipment)
  - ↔ training_program (M:N)
  - → media (N:1 for image)
  - → media (N:1 for video)
- Indexes:
  - idx_equipment_search (name, category)
  - idx_equipment_name
  - idx_equipment_category
  - idx_equipment_difficulty
  - idx_equipment_cost_tier
  - idx_equipment_space_required
  - idx_equipment_price
  - idx_equipment_manufacturer
  - idx_equipment_image_id
  - idx_equipment_video_id
  - idx_fk_equipment_image
  - idx_fk_equipment_video

### workout_plans
- PK: id (int, auto-increment)
- Essential Fields:
  - name (varchar(100), not null)
  - description (text, not null)
  - difficulty (enum: Difficulty, default: BEGINNER)
  - workoutCategory (enum: WorkoutCategory, default: FULL_BODY)
  - isCustom (boolean, default: false)
  - estimatedDuration (int, min: 5, max: 180)
  - estimatedCaloriesBurn (int, default: 0)
  - rating (float, default: 0, max: 5)
  - ratingCount (int, default: 0)
  - popularity (int, default: 0)
- Media Fields:
  - video_media_id (uuid, nullable)
  - thumbnail_media_id (uuid, nullable)
- JSON Fields:
  - metadata (jsonb: WorkoutMetadata, nullable)
  - workoutStructure (jsonb: WorkoutStructure, nullable)
  - progressionModel (jsonb: ProgressionModel, nullable)
  - metrics (jsonb: WorkoutMetrics)
- Timestamps:
  - createdAt (timestamp)
  - updatedAt (timestamp)
- Key Relationships:
  - → workout_exercises (1:N)
  - ↔ exercise_category (M:N via workout_muscle_group)
  - ↔ equipment (M:N via workout_equipment)
  - ↔ workout_tag (M:N via workout_tag_map)
  - ← user (N:1 as creator)
  - → workout_session (1:N)
  - ↔ user (M:N via user_favourite_workouts)
  - ↔ workout_plans (M:N via workout_plan_combinations)
  - ↔ training_program (M:N via program_workouts)
- Indexes:
  - idx_workout_search (name, workoutCategory, difficulty)
  - idx_workout_rating (rating, ratingCount)
  - idx_workout_popularity (popularity, workoutCategory)
  - idx_workout_newest (createdAt, workoutCategory)
  - idx_workout_filter (difficulty, workoutCategory, estimatedDuration)
  - IDX_workout_difficulty_category (difficulty, workoutCategory)
  - IDX_workout_creator_custom (creator_id, isCustom)
  - idx_workout_name
  - idx_workout_description
  - idx_workout_difficulty
  - idx_workout_category
  - idx_workout_isCustom
  - idx_workout_estimatedDuration
  - idx_workout_estimatedCaloriesBurn
  - idx_workout_creator
  - idx_workout_creator_id
  - idx_workout_video_media_id
  - idx_workout_thumbnail_media_id
  - idx_workout_createdAt
  - idx_workout_updatedAt

### achievement
- PK: id (uuid)
- Essential Fields:
  - name (varchar, not null)
  - description (text, not null)
  - category (enum: achievement_category_enum)
  - tier (enum: achievement_tier_enum)
  - points (integer)
  - icon (varchar)
  - criteriaType (enum: achievement_criteriatype_enum)
  - criteriaDescription (text)
- JSON Fields:
  - progress (jsonb)
- FK Fields:
  - workout_session_id (uuid → workout_sessions.id)
- Timestamps:
  - expiresAt (timestamp with time zone)
  - created_at (timestamp without time zone)
  - updated_at (timestamp without time zone)
- Key Relationships:
  - ← workout_session (N:1)
- Indexes:
  - idx_achievement_category
  - idx_achievement_tier
  - idx_achievement_workout_session
  - idx_achievement_expires

## Junction Tables

### exercise_category
- PK: id (uuid)
- FKs:
  - exercise_id (uuid → exercises.id, not null)
  - category_id (uuid → exercise_categories.id, not null)
- Fields:
  - created_at (timestamp, default: now())
- Indexes:
  - exercise_id
  - category_id
- Type: Many-to-Many mapping

### exercise_equipment
- PK: id (uuid)
- FKs:
  - exercise_id (uuid → exercises.id, not null)
  - equipment_id (uuid → equipment.id, not null)
- Indexes:
  - exercise_id
  - equipment_id
- Type: Many-to-Many mapping

### workout_exercises
- PK: id (uuid)
- Essential Fields:
  - exercise_id (uuid → exercises.id, not null)
  - workout_plan_id (uuid → workout_plans.id, not null)
  - order (int, default: 0)
  - repetitions (int, default: 0)
  - duration (int, default: 0)
  - restTime (int, default: 30)
  - sets (int, default: 1)
  - notes (text, nullable)
  - setType (enum: SetType, default: NORMAL)
  - setStructure (enum: SetStructure, default: REGULAR)
  - exerciseRole (enum: ExerciseRole, default: PRIMARY)
  - superset_with_exercise_id (uuid, nullable)
- JSON Fields:
  - intensity (jsonb: ExerciseIntensity, nullable)
  - tempo (jsonb: ExerciseTempo, nullable)
  - rangeOfMotion (jsonb: RangeOfMotion, nullable)
  - progressionStrategy (jsonb: ProgressionStrategy, nullable)
  - substitutionOptions (jsonb: SubstitutionOptions, nullable)
- Timestamps:
  - created_at (timestamp)
  - updated_at (timestamp)
- Key Relationships:
  - ← exercise (N:1)
  - ← workout_plan (N:1)
  - ← workout_exercise (N:1, for supersets)
- Indexes:
  - idx_workout_exercise_order (workoutPlan, order)
  - idx_fk_workout_exercise_exercise
  - idx_fk_workout_exercise_plan
  - idx_fk_workout_exercise_superset

### workout_equipment
- PK: id (uuid)
- FKs:
  - workout_id (uuid → workout_plans.id, not null)
  - equipment_id (uuid → equipment.id, not null)
- Fields:
  - quantity (integer, default: 1)
  - required (boolean, default: true)
  - alternative_equipment_ids (uuid[], nullable)
  - notes (text, nullable)
  - metadata (jsonb, nullable)
- Timestamps:
  - created_at (timestamp)
- Indexes:
  - workout_id
  - equipment_id
  - required
- Type: Many-to-Many mapping between workouts and equipment

### workout_muscle_group
- PK: id (uuid)
- FKs:
  - workout_id (uuid → workout_plans.id, not null)
  - category_id (uuid → exercise_categories.id, not null)
- Fields:
  - intensity_level (varchar, not null)
  - focus_type (enum: ['PRIMARY', 'SECONDARY', 'AUXILIARY'])
  - estimated_activation (float, nullable)
  - metadata (jsonb, nullable)
- Timestamps:
  - created_at (timestamp)
- Indexes:
  - workout_id
  - category_id
  - intensity_level
  - focus_type
- Type: Many-to-Many mapping between workouts and muscle groups

### workout_tag_map
- PK: id (uuid)
- FKs:
  - workout_id (uuid → workout_plans.id, not null)
  - tag_id (uuid → workout_tags.id, not null)
- Timestamps:
  - created_at (timestamp)
- Type: Many-to-Many mapping between workouts and tags

## Media Related Tables

### media
- PK: id (uuid)
- Essential Fields:
  - type (enum: MediaType [IMAGE, VIDEO, AUDIO])
  - context (enum: MediaContext)
  - url (varchar, not null)
  - entityType (varchar(50), not null)
  - entityId (uuid, nullable)
- Timestamps:
  - created_at (timestamp)
  - updated_at (timestamp)
- Key Relationships:
  - → exercise_media (1:N)
  - → equipment (1:N)
  - → workout_plans (1:N)
- Indexes:
  - idx_media_type_context
  - idx_media_entity

### exercise_media
- PK: id (uuid)
- FKs:
  - media_id (uuid → media.id, not null)
  - exercise_id (uuid → exercises.id, not null)
- Timestamps:
  - created_at (timestamp)
- Indexes:
  - media_id
  - exercise_id

### audio_cues
- PK: id (uuid)
- FKs:
  - exercise_id (uuid → exercises.id, nullable)
  - created_by (uuid → users.id, nullable)
- Essential Fields:
  - name (varchar(100), not null)
  - type (enum: AudioCueType)
  - trigger (enum: AudioCueTrigger)
  - audioUrl (varchar(255), not null)
- Timestamps:
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - idx_audiocue_exercise_id
  - idx_audiocue_created_by

## Progress Tracking Tables

### body_metrics
- PK: id (uuid)
- FK: user_id (uuid → users.id, not null)
- Fields:
  - type (enum: MetricType)
  - value (float, not null)
  - unit (enum: MeasurementUnit)
  - date (timestamp, not null)
  - notes (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - user_id
  - type
  - date

### equipment_muscle_groups
- PK: id (uuid)
- FKs:
  - equipment_id (uuid → equipment.id, not null)
  - category_id (uuid → exercise_categories.id, not null)
- Timestamps:
  - created_at (timestamp)
- Indexes:
  - idx_equipment_muscle_groups_equipment_id
  - idx_equipment_muscle_groups_category_id
- Type: Many-to-Many mapping between equipment and exercise categories

### equipment_categories
- PK: id (uuid)
- FK: equipment_id → equipment.id
- Type: One-to-Many with equipment

### fitness_goals
- PK: id (uuid)
- FK: user_id (uuid → users.id, not null)
- Fields:
  - type (enum: GoalType)
  - target (float, not null)
  - unit (enum: MeasurementUnit)
  - startDate (timestamp, not null)
  - endDate (timestamp, not null)
  - status (enum: GoalStatus, default: 'IN_PROGRESS')
  - progress (float, default: 0)
  - notes (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - user_id
  - type
  - status
  - endDate

### user_favourite_workouts
- PK: id (uuid)
- FKs:
  - user_id → users.id
  - workout_id → workout_plans.id
- Type: Many-to-Many mapping

### workout_sessions
- PK: id (uuid)
- Essential Fields:
  - user_id (uuid → users.id, not null)
  - workout_plan_id (uuid → workout_plans.id, not null)
  - status (enum: SessionStatus, default: ACTIVE)
  - totalDuration (int, default: 0)
  - caloriesBurned (float, default: 0)
  - difficultyRating (int, default: 1, min: 1, max: 10)
  - userFeedback (text, nullable)
  - startTime (timestamp, nullable)
  - endTime (timestamp, nullable)
- JSON Fields:
  - exerciseSequence (jsonb, nullable) {
    - originalPlan: PlannedExercise[]
    - actualSequence: ActualExercise[]
  }
  - exerciseResults (jsonb, default: {}) { [exerciseId: string]: ExerciseResult }
  - summary (jsonb) {
    - totalExercises: number
    - uniqueExercises: number
    - totalDuration: number
    - caloriesBurned: number
    - averageHeartRate?: number
    - peakHeartRate?: number
    - difficultyRating?: number
    - focusAreas: string[]
    - muscleGroups: string[]
    - totalSets: number
    - totalReps: number
    - formScore: number
    - exerciseSummaries: ExerciseSummary[]
  }
  - locationData (jsonb, nullable) {
    - type: WorkoutLocation
    - coordinates?: { latitude: number, longitude: number }
    - address?: string
  }
  - environmentData (jsonb, nullable) {
    - temperature?: number
    - humidity?: number
    - weather?: string
    - altitude?: number
  }
  - healthData (jsonb, nullable) {
    - avgHeartRate?: number
    - peakHeartRate?: number
    - caloriesBurned?: number
    - stepsCount?: number
    - weightBefore?: number
    - weightAfter?: number
    - stressLevel?: number
    - hydrationLevel?: number
  }
- Timestamps:
  - createdAt (timestamp)
  - updatedAt (timestamp)
- Key Relationships:
  - ← user (N:1)
  - ← workout_plan (N:1)
  - → metric_tracking (1:N)
  - → feedback (1:N)
  - → workout_rating (1:N)
  - → exercise_form_analysis (1:N)
  - → achievement (1:N)
- Indexes:
  - status

### workout_tags
- PK: id (uuid)
- Fields:
  - name (varchar, not null)
  - description (text, nullable)
  - category (varchar, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - name
  - category

### equipment_training_types
- PK: id (uuid)
- FKs:
  - equipment_id (uuid → equipment.id, not null)
  - tag_id (uuid → workout_tags.id, not null)
- Timestamps:
  - created_at (timestamp)
- Type: Many-to-Many mapping between equipment and workout tags

## Key Relationships Summary

1. User Management:
   - users → fitness_goals (1:N)
   - users → body_metrics (1:N)
   - users → workout_sessions (1:N)
   - users ↔ workout_plans (M:N via user_favourite_workouts)

2. Exercise Organization:
   - exercises ↔ equipment (M:N via exercise_equipment)
   - exercises ↔ categories (M:N via equipment_category)
   - exercises → exercise_media (1:N)
   - exercises → audio_cues (1:N)

3. Workout Structure:
   - workout_plans ↔ exercises (M:N via workout_exercises)
   - workout_plans ↔ equipment (M:N via workout_equipment)
   - workout_plans ↔ tags (M:N via workout_tag_map)
   - workout_plans → workout_sessions (1:N)

4. Equipment Classification:
   - equipment → equipment_categories (1:N)
   - equipment ↔ muscle_groups (M:N via equipment_muscle_group)

## ERD Considerations
1. All tables should use UUID as primary key except users (int)
2. Timestamps (created_at, updated_at) should be included in most tables
3. Soft delete might be needed for critical tables
4. Indexes should be created for frequently queried fields
5. Foreign key constraints should enforce referential integrity

## Enums

1. UserRole
   - user
   - admin

2. Difficulty
   - beginner
   - intermediate
   - advanced
   - expert

3. ExerciseType
   - strength
   - cardio
   - flexibility
   - balance

4. EquipmentCategory
   - weights
   - machines
   - cardio
   - accessories
   - bodyweight

5. AudioCueType
   - START: Start of exercise/workout
   - FINISH: End of exercise/workout
   - COUNTDOWN: Countdown timer
   - TRANSITION: Moving to next exercise
   - REST: Rest period
   - FORM_REMINDER: Reminder about form
   - MOTIVATION: Motivational message
   - INSTRUCTION: Specific exercise instruction
   - MILESTONE: Achievement of milestone
   - WARNING: Warning about form/safety
   - PACE: Guidance on pace/speed
   - BREATHING: Breathing cue
   - CUSTOM: User-defined cue

6. AudioCueTrigger
   - TIME_BASED: Triggered at specific time
   - REPETITION_BASED: Triggered at specific rep
   - EVENT_BASED: Triggered by an event
   - FORM_BASED: Triggered by form detection
   - MANUAL: Manually triggered
   - AUTOMATIC: System determined

7. MetricType
   - WEIGHT: Body weight
   - BODY_FAT: Body fat percentage
   - MUSCLE_MASS: Muscle mass measurement
   - BMI: Body Mass Index
   - WAIST: Waist measurement
   - CHEST: Chest measurement
   - HIPS: Hip measurement
   - THIGHS: Thigh measurement
   - ARMS: Arm measurement
   - SHOULDERS: Shoulder measurement
   - CALVES: Calf measurement
   - NECK: Neck measurement
   - BLOOD_PRESSURE: Blood pressure reading
   - RESTING_HEART_RATE: Resting heart rate
   - CUSTOM: Custom metric type

8. GoalStatus
   - IN_PROGRESS: Currently working on
   - COMPLETED: Successfully achieved
   - FAILED: Not achieved
   - ABANDONED: Given up
   - PENDING: Not yet started

## Common Fields

Most tables include:
1. Primary Key (uuid or int)
2. Timestamps (created_at, updated_at)
3. Soft Delete (is_active boolean, optional)
4. Metadata (jsonb, optional)

## Index Patterns

1. Foreign Key Indexes
   - All FK columns should be indexed
   - Composite indexes for frequently joined columns

2. Search Indexes
   - Name columns
   - Category/Type columns
   - Status/State columns

3. Sort Indexes
   - Order/Sequence columns
   - Date columns
   - Priority columns

4. Unique Constraints
   - Email addresses
   - External IDs
   - Natural keys

## Data Integrity Rules

1. Cascade Deletes
   - Junction tables should cascade on parent deletion
   - Media references should set null on deletion

2. Not Null Constraints
   - Primary keys
   - Foreign keys
   - Essential business data
   - Status/State fields

3. Default Values
   - Timestamps (now())
   - Status fields
   - Counters/Indexes
   - Standard settings

## Missing Relationships in Current ERD

1. Achievement Tracking:
   - users ↔ achievements (1:N)
   - workout_sessions ↔ achievements (1:N)

2. Equipment Relationships:
   - equipment ↔ equipment_categories (1:N)
   - equipment ↔ equipment_muscle_group (1:N)
   - equipment ↔ workout_equipment (1:N)

3. Exercise Categorization:
   - exercises ↔ equipment_category (M:N)
   - exercises ↔ exercise_media (1:N)
   - exercises ↔ audio_cues (1:N)

4. Workout Organization:
   - workout_plans ↔ workout_tag_map (1:N)
   - workout_tag_map ↔ workout_tags (N:1)
   - workout_plans ↔ user_favourite_workouts (1:N)
   - workout_plans ↔ workout_muscle_group (1:N)

5. Progress Tracking ERD:
   - Add achievement tracking
   - Include session metrics
   - Show complete body metrics

6. Real-time Detection ERD:
   - Add form analysis
   - Include audio cue triggers
   - Show equipment setup

## Required Updates for ERD Diagrams

1. Overview ERD:
   - Add all junction tables
   - Show complete relationship cardinality
   - Include all 21 core tables

2. User Management ERD:
   - Add user_favourite_workouts
   - Include achievement tracking
   - Show fitness goal relationships

3. Exercise Management ERD:
   - Add equipment_category
   - Include audio_cues
   - Show complete media relationships

4. Workout Management ERD:
   - Add workout_tag_map
   - Include equipment relationships
   - Show muscle group mappings

5. Progress Tracking ERD:
   - Add achievement tracking
   - Include session metrics
   - Show complete body metrics

6. Real-time Detection ERD:
   - Add form analysis
   - Include audio cue triggers
   - Show equipment setup

## Required Table Attributes

Each table should include:
1. Primary Key (UUID/int)
2. Foreign Keys (with proper references)
3. Essential Fields (as documented)
4. Timestamps (created_at, updated_at)
5. Metadata (where applicable)
6. Proper Indexes

## Required Relationship Types

1. One-to-Many (1:N):
   - User → WorkoutSessions
   - Exercise → AudioCues
   - WorkoutPlan → WorkoutExercises

2. Many-to-Many (M:N):
   - Exercise ↔ Equipment (via exercise_equipment)
   - WorkoutPlan ↔ Tags (via workout_tag_map)
   - Equipment ↔ MuscleGroups (via equipment_muscle_group)

3. Self-Referential:
   - equipment_categories (parent-child)

Would you like me to:
1. Add more detailed field information for specific tables?
2. Document additional relationships or constraints?
3. Elaborate on any specific index patterns?
4. Add more technical implementation details? 

### Missing Tables with Complete Fields

#### audio_cues (renamed from audio_cus)
- PK: id (uuid)
- FKs:
  - exercise_id (uuid → exercises.id, nullable)
  - created_by (uuid → users.id, nullable)
- Fields:
  - name (varchar(100), not null)
  - type (enum: AudioCueType)
  - trigger (enum: AudioCueTrigger)
  - script (text, not null)
  - audioUrl (varchar(255), not null)
  - isEnabled (boolean, default: true)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - idx_audiocue_exercise_id
  - idx_audiocue_created_by
  - type

#### equipment_muscle_group
- PK: id (uuid)
- FKs:
  - equipment_id (uuid → equipment.id, not null)
  - muscle_group_id (uuid → muscle_groups.id, not null)
- Fields:
  - primary_focus (boolean, default: false)
  - intensity_level (varchar, nullable)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
- Indexes:
  - equipment_id
  - muscle_group_id
  - idx_equipment_muscle_primary

#### equipment_categories
- PK: id (uuid)
- Fields:
  - name (varchar, not null)
  - description (text, nullable)
  - parent_id (uuid, self-reference, nullable)
  - level (integer, default: 0)
  - path (varchar, not null)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
- Indexes:
  - name
  - parent_id
  - path
  - level

#### user_favourite_workouts
- PK: id (uuid)
- FKs:
  - user_id (uuid → users.id, not null)
  - workout_id (uuid → workout_plans.id, not null)
- Fields:
  - added_at (timestamp, default: now())
  - notes (text, nullable)
  - order_index (integer, default: 0)
  - metadata (jsonb, nullable)
- Indexes:
  - user_id
  - workout_id
  - added_at
  - order_index

#### workout_equipment
- PK: id (uuid)
- FKs:
  - workout_id (uuid → workout_plans.id, not null)
  - equipment_id (uuid → equipment.id, not null)
- Fields:
  - quantity (integer, default: 1)
  - required (boolean, default: true)
  - alternative_equipment_ids (uuid[], nullable)
  - notes (text, nullable)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
- Indexes:
  - workout_id
  - equipment_id
  - required

#### workout_muscle_group
- PK: id (uuid)
- FKs:
  - workout_id (uuid → workout_plans.id, not null)
  - muscle_group_id (uuid → muscle_groups.id, not null)
- Fields:
  - intensity_level (varchar, not null)
  - focus_type (enum: ['PRIMARY', 'SECONDARY', 'AUXILIARY'])
  - estimated_activation (float, nullable)
  - metadata (jsonb, nullable)
  - created_at (timestamp)
- Indexes:
  - workout_id
  - muscle_group_id
  - intensity_level
  - focus_type

### Additional Relationships to Add
1. Users <-> Favorite Workouts (M:N through user_favourite_workouts)
2. Equipment <-> Muscle Groups (M:N through equipment_muscle_group)
3. Workouts <-> Equipment (M:N through workout_equipment)
4. Workouts <-> Muscle Groups (M:N through workout_muscle_group)
5. Equipment <-> Categories (M:N through equipment_category)
6. Exercises <-> Audio (1:N with audio_cus)

### exercise_details
- PK: id (uuid)
- Essential Fields:
  - exercise_id (uuid → exercises.id, not null)
  - confidenceScore (float, nullable)
  - analyzedAt (timestamp, nullable)
- JSON Fields:
  - formAnalysis (jsonb, nullable) {
    - overallScore: number
    - keyPointScores?: {[keyPoint: string]: number}
    - angleScores?: {[joint: string]: number}
    - feedback?: string[]
    - detectedIssues?: string[]
  }
  - repData (jsonb, nullable) {
    - count: number
    - timestamps: number[]
    - qualityScores: number[]
    - invalidReps?: {timestamp: number, reason: string}[]
  }
  - rawData (jsonb, nullable) {
    - keypoints?: any[]
    - angles?: any[]
    - trajectories?: any[]
    - timestamps: number[]
  }
- Timestamps:
  - created_at (timestamp)
  - updated_at (timestamp)
- Key Relationships:
  - ← exercise (N:1)
- Indexes:
  - idx_fk_exercisedetails_exercise
  - idx_exercisedetails_exercise_id

### exercise_categories
- PK: id (int, auto-increment)
- Essential Fields:
  - name (varchar, not null)
  - description (text, nullable)
  - type (enum: CategoryType, default: MUSCLE_GROUP)
  - parentId (int, nullable)
  - icon (varchar, nullable)
  - color (varchar, nullable)
  - displayOrder (int, default: 0)
  - isActive (boolean, default: true)
- JSON Fields:
  - metadata (jsonb, nullable) {
    - aliases?: string[]
    - anatomicalInfo?: string
    - benefits?: string[]
    - recommendedFrequency?: string
    - relatedCategories?: number[]
    - imageUrl?: string
  }
- Timestamps:
  - created_at (timestamp)
  - updated_at (timestamp)
- Key Relationships:
  - ↔ exercises (M:N)
  - ↔ workout_plans (M:N)
  - ↔ equipment (M:N)
  - ↔ training_programs (M:N)
- Indexes:
  - idx_category_search (name, type, isActive)
  - idx_category_name
  - idx_category_type
  - idx_category_active 