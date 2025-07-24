/**
 * Shared enums for use across models to maintain consistency and reduce duplication
 * 
 * GUIDELINES FOR ENUM USAGE:
 * 
 * 1. All domain-specific enums should be defined here, not in individual model files
 * 
 * 2. Enum naming conventions:
 *    - Use PascalCase for enum names (e.g., `WorkoutCategory`)
 *    - Use UPPER_SNAKE_CASE for enum values (e.g., `UPPER_BODY`)
 *    - Group related enums together with comments
 * 
 * 3. When adding a new enum:
 *    - Add descriptive JSDoc comments explaining its purpose
 *    - Include comments on individual values if their meaning isn't obvious
 *    - Consider adding a "NONE" or "OTHER" option for flexibility
 *    - Update related validation classes if needed
 * 
 * 4. To add a new enum:
 *    ```typescript
 *    /**
 *     * Description of what this enum represents
 *     * /
 *    export enum NewEnumName {
 *      VALUE_ONE = "VALUE_ONE",  // Optional comment about this value
 *      VALUE_TWO = "VALUE_TWO"
 *    }
 *    ```
 * 
 * 5. When using enums in entities:
 *    ```typescript
 *    @Column({ 
 *      type: "enum",
 *      enum: EnumName,
 *      default: EnumName.DEFAULT_VALUE
 *    })
 *    property: EnumName;
 *    ```
 */

/**
 * Unified difficulty levels for workouts, exercises, and programs
 */
export enum Difficulty {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    ELITE = "ELITE"  // For the most challenging levels
}

/**
 * Unified fitness goals for workouts, programs, and user profiles
 */
export enum FitnessGoal {
    // Physical transformation goals
    STRENGTH_GAIN = "STRENGTH_GAIN",
    MUSCLE_BUILDING = "MUSCLE_BUILDING", 
    HYPERTROPHY = "HYPERTROPHY",     // Alias for MUSCLE_BUILDING
    FAT_LOSS = "FAT_LOSS",
    WEIGHT_LOSS = "WEIGHT_LOSS",     // Alias for FAT_LOSS
    
    // Performance goals
    ENDURANCE = "ENDURANCE",
    POWER_DEVELOPMENT = "POWER_DEVELOPMENT",
    ATHLETICISM = "ATHLETICISM",
    SPORT_SPECIFIC = "SPORT_SPECIFIC",
    SKILL_DEVELOPMENT = "SKILL_DEVELOPMENT",
    
    // General wellness goals
    GENERAL_FITNESS = "GENERAL_FITNESS",
    FLEXIBILITY = "FLEXIBILITY",
    MOBILITY = "MOBILITY",
    MAINTENANCE = "MAINTENANCE",
    ACTIVE_RECOVERY = "ACTIVE_RECOVERY",
    REHABILITATION = "REHABILITATION",
    
    // Special purpose
    CUSTOM = "CUSTOM"  // For user-defined goals
}

/**
 * Unified workout categories based on primary focus
 */
export enum WorkoutCategory {
    // Strength-focused
    STRENGTH = "STRENGTH",
    HYPERTROPHY = "HYPERTROPHY",
    POWER = "POWER",
    
    // Endurance-focused
    ENDURANCE = "ENDURANCE",
    CARDIO = "CARDIO",
    HIIT = "HIIT",
    
    // Specialized
    CIRCUIT = "CIRCUIT",
    FLEXIBILITY = "FLEXIBILITY",
    RECOVERY = "RECOVERY",
    SPORT_SPECIFIC = "SPORT_SPECIFIC",
    SKILL = "SKILL",
    
    // Body focus
    FULL_BODY = "FULL_BODY",
    UPPER_BODY = "UPPER_BODY",
    LOWER_BODY = "LOWER_BODY",
    CORE = "CORE",
    
    // Split types (adding these)
    PUSH = "PUSH",
    PULL = "PULL",
    LEGS = "LEGS"
}

/**
 * Unified workout split types for both programs and plans
 */
export enum SplitType {
    FULL_BODY = "FULL_BODY",             // All major muscle groups
    UPPER_LOWER = "UPPER_LOWER",         // Upper/lower body split
    PUSH_PULL_LEGS = "PUSH_PULL_LEGS",   // Push/pull/legs split
    PUSH_PULL = "PUSH_PULL",             // Push/pull split
    BODY_PART = "BODY_PART",             // Individual body part focus
    ANTAGONIST_PAIRS = "ANTAGONIST_PAIRS", // Opposing muscle groups
    TOTAL_BODY = "TOTAL_BODY"            // Comprehensive full body
}

/**
 * Unified progression types for exercises, workouts, and programs
 */
export enum ProgressionType {
    LINEAR = "LINEAR",             // Steady progression
    UNDULATING = "UNDULATING",     // Variable progression
    DAILY_UNDULATING = "DAILY_UNDULATING", // Daily variable progression
    WEEKLY_UNDULATING = "WEEKLY_UNDULATING", // Weekly variable progression
    WAVE = "WAVE",                // Wave-loading progression
    BLOCK = "BLOCK",              // Block periodization
    CONJUGATE = "CONJUGATE",      // Conjugate method
    CONCURRENT = "CONCURRENT"     // Multiple goals simultaneously
}

/**
 * Measurement types for exercises
 */
export enum MeasurementType {
    REPS = "REPS",                // Repetition-based
    DURATION = "DURATION",        // Time-based
    DISTANCE = "DISTANCE",        // Distance-based
    WEIGHT = "WEIGHT",            // Weight/resistance-based
    COMBO = "COMBO"               // Combination of measurements
}

/**
 * Days of the week
 */
export enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}

/**
 * Exercise role within a workout
 */
export enum ExerciseRole {
    PRIMARY = "PRIMARY",       // Main compound exercise
    SECONDARY = "SECONDARY",   // Supporting compound exercise
    ACCESSORY = "ACCESSORY",   // Isolation exercise
    WARMUP = "WARMUP",         // Preparation exercise
    FINISHER = "FINISHER",     // End-of-workout high-intensity exercise
    SKILL = "SKILL",           // Technique-focused exercise
    MOBILITY = "MOBILITY"      // Flexibility/mobility exercise
}

/**
 * Exercise intensity levels for workout planning and progression
 */
export enum ExerciseIntensity {
    LIGHT = "LIGHT",           // Low intensity, suitable for beginners or recovery
    MODERATE = "MODERATE",     // Medium intensity, standard training
    HEAVY = "HEAVY"           // High intensity, advanced training
}

/**
 * Set organization patterns for exercise programming
 */
export enum SetType {
    STRAIGHT = "STRAIGHT",           // Same weight/reps across all sets
    PYRAMID = "PYRAMID",             // Increasing weight, decreasing reps
    REVERSE_PYRAMID = "REVERSE_PYRAMID", // Decreasing weight, increasing reps
    DROP = "DROP",                   // Drop sets with decreasing weight
    SUPER = "SUPER",                 // Supersets with minimal rest
    NORMAL = "NORMAL",               // Standard set structure
    TRISET = "TRISET",               // Three exercises in sequence
    GIANT_SET = "GIANT_SET",         // Four or more exercises in sequence
    CIRCUIT = "CIRCUIT"              // Circuit training format
}

/**
 * Special set structures
 */
export enum SetStructure {
    REGULAR = "REGULAR",
    DROP_SET = "DROP_SET",
    REST_PAUSE = "REST_PAUSE",
    AMRAP = "AMRAP",           // As Many Reps As Possible
    EMOM = "EMOM",             // Every Minute On the Minute
    TABATA = "TABATA",
    PYRAMID = "PYRAMID",
    REVERSE_PYRAMID = "REVERSE_PYRAMID"
}

/**
 * Space requirement options
 */
export enum SpaceRequirement {
    MINIMAL = "MINIMAL",      // < 2x2m space
    SMALL = "SMALL",          // 2x2m to 3x3m
    MEDIUM = "MEDIUM",        // 3x3m to 5x5m
    LARGE = "LARGE",          // > 5x5m
    DEDICATED = "DEDICATED"   // Dedicated room/area
}

/**
 * Noise level options
 */
export enum NoiseLevel {
    SILENT = "SILENT",        // No noise
    LOW = "LOW",              // Minimal noise
    MODERATE = "MODERATE",    // Some noise
    HIGH = "HIGH"             // Significant noise
}

/**
 * Mobility/flexibility level
 */
export enum MobilityLevel {
    BASIC = "BASIC",              // Basic mobility
    INTERMEDIATE = "INTERMEDIATE", // Average mobility
    ADVANCED = "ADVANCED"         // High mobility
}

/**
 * Session status tracking
 */
export enum SessionStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

/**
 * Exercise attempt status
 */
export enum ExerciseStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    SKIPPED = "SKIPPED",
    FAILED = "FAILED"
}

/**
 * Movement patterns for exercise biomechanics
 */
export enum MovementPattern {
    PUSH = "PUSH",
    PULL = "PULL",
    SQUAT = "SQUAT",
    HINGE = "HINGE",
    LUNGE = "LUNGE",
    ROTATION = "ROTATION",
    CARRY = "CARRY",
    CORE = "CORE",
    LOCOMOTION = "LOCOMOTION"
}

/**
 * Gender options for user profiles
 */
export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

/**
 * Activity level classifications for users
 */
export enum ActivityLevel {
    SEDENTARY = "SEDENTARY",           // Little to no exercise
    LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE", // Light exercise 1-3 days/week
    MODERATELY_ACTIVE = "MODERATELY_ACTIVE", // Moderate exercise 3-5 days/week
    VERY_ACTIVE = "VERY_ACTIVE",       // Hard exercise 6-7 days/week
    EXTREMELY_ACTIVE = "EXTREMELY_ACTIVE" // Very hard exercise & physical job
}

/**
 * Workout locations for user preferences
 */
export enum WorkoutLocation {
    HOME = "HOME",
    GYM = "GYM",
    OUTDOORS = "OUTDOORS",
    ANYWHERE = "ANYWHERE"
}

/**
 * Exercise preferences for user profiles
 */
export enum ExercisePreference {
    NO_EQUIPMENT = "NO_EQUIPMENT",
    NO_JUMPING = "NO_JUMPING",
    LOW_IMPACT = "LOW_IMPACT",
    QUIET = "QUIET",
    STRENGTH_FOCUSED = "STRENGTH_FOCUSED",
    CARDIO_FOCUSED = "CARDIO_FOCUSED"
}

/**
 * Measurement units for user preferences and measurements
 */
export enum MeasurementUnit {
    // System preferences
    METRIC = "METRIC",
    IMPERIAL = "IMPERIAL",
    
    // Weight units
    KILOGRAM = "KILOGRAM",
    KILOGRAMS = "KILOGRAMS",
    GRAM = "GRAM",
    POUND = "POUND",
    POUNDS = "POUNDS",
    
    // Distance units
    METER = "METER",
    KILOMETER = "KILOMETER",
    KILOMETERS = "KILOMETERS",
    CENTIMETER = "CENTIMETER",
    FOOT = "FOOT",
    INCH = "INCH",
    MILE = "MILE",
    MILES = "MILES",
    STEPS = "STEPS",
    
    // Volume units
    LITER = "LITER",
    MILLILITER = "MILLILITER",
    FLUID_OUNCE = "FLUID_OUNCE",
    
    // Time units
    SECOND = "SECOND",
    MINUTE = "MINUTE",
    MINUTES = "MINUTES",
    HOUR = "HOUR",
    HOURS = "HOURS",
    DAYS = "DAYS",
    
    // Frequency units
    TIMES_PER_WEEK = "TIMES_PER_WEEK",
    
    // Count units
    REPETITIONS = "REPETITIONS",
    REP = "REP",
    
    // Other units
    PERCENT = "PERCENT",
    BEATS_PER_MINUTE = "BEATS_PER_MINUTE",
    SCORE = "SCORE",
    CUSTOM = "CUSTOM"
}

/**
 * App theme options
 */
export enum AppTheme {
    LIGHT = "LIGHT",
    DARK = "DARK",
    SYSTEM = "SYSTEM"
}

/**
 * Body areas that can be targeted in workouts
 */
export enum BodyArea {
    FULL_BODY = "FULL_BODY",
    UPPER_BODY = "UPPER_BODY",
    LOWER_BODY = "LOWER_BODY",
    CORE = "CORE",
    ARMS = "ARMS",
    BACK = "BACK",
    CHEST = "CHEST",
    SHOULDERS = "SHOULDERS",
    LEGS = "LEGS",
    GLUTES = "GLUTES"
}

/**
 * Categories of metrics that can be tracked
 */
export enum MetricCategory {
    BODY_COMPOSITION = "BODY_COMPOSITION",   // Weight, body fat, measurements
    PERFORMANCE = "PERFORMANCE",             // Strength, endurance, speed
    FORM = "FORM",                          // Exercise form quality
    VITALS = "VITALS",                      // Heart rate, blood pressure
    NUTRITION = "NUTRITION",                 // Calories, macros
    WELLNESS = "WELLNESS",                   // Sleep, stress, mood
    WORKOUT = "WORKOUT",                     // Workout-specific metrics
    CUSTOM = "CUSTOM"                        // User-defined metrics
}

/**
 * Types of metric values
 */
export enum MetricValueType {
    NUMERIC = "NUMERIC",           // Simple number
    PERCENTAGE = "PERCENTAGE",     // Percentage value
    DURATION = "DURATION",         // Time duration
    DISTANCE = "DISTANCE",         // Distance measurement
    WEIGHT = "WEIGHT",            // Weight measurement
    RATIO = "RATIO",              // Ratio between two values
    SCORE = "SCORE",              // Calculated score
    ENUM = "ENUM",                // Enumerated value
    COMPOUND = "COMPOUND"         // Multiple related values
}

/**
 * Trend direction for metric changes
 */
export enum TrendDirection {
    INCREASING = "INCREASING",
    DECREASING = "DECREASING",
    STABLE = "STABLE",
    FLUCTUATING = "FLUCTUATING"
}

/**
 * Type of body measurement
 */
export enum MetricType {
    WEIGHT = "WEIGHT",
    BODY_FAT = "BODY_FAT",
    MUSCLE_MASS = "MUSCLE_MASS",
    BMI = "BMI",
    WAIST = "WAIST",
    CHEST = "CHEST",
    HIPS = "HIPS",
    THIGHS = "THIGHS",
    ARMS = "ARMS",
    SHOULDERS = "SHOULDERS",
    CALVES = "CALVES",
    NECK = "NECK",
    BLOOD_PRESSURE = "BLOOD_PRESSURE",
    RESTING_HEART_RATE = "RESTING_HEART_RATE",
    CUSTOM = "CUSTOM"
}

/**
 * Types of motion tracking capabilities
 */
export enum TrackingFeature {
    FORM = "FORM",           // Track exercise form/posture
    RANGE = "RANGE",         // Track range of motion
    SPEED = "SPEED",         // Track movement speed
    COUNT = "COUNT",         // Count reps
    TEMPO = "TEMPO",         // Track tempo/cadence
    BALANCE = "BALANCE",     // Track stability/balance
    POWER = "POWER",         // Track power output
    PATH = "PATH"            // Track movement path
}

/**
 * Cost tiers for equipment
 */
export enum CostTier {
    BUDGET = "BUDGET",            // Low-cost options
    MID_RANGE = "MID_RANGE",      // Mid-price options
    PREMIUM = "PREMIUM",          // High-quality options
    PROFESSIONAL = "PROFESSIONAL" // Commercial-grade options
}

/**
 * Types of audio cues for workouts
 */
export enum AudioCueType {
    START = "START",               // Start of exercise/workout
    FINISH = "FINISH",             // End of exercise/workout
    COUNTDOWN = "COUNTDOWN",       // Countdown timer
    TRANSITION = "TRANSITION",     // Moving to next exercise
    REST = "REST",                 // Rest period
    FORM_REMINDER = "FORM_REMINDER", // Reminder about form
    MOTIVATION = "MOTIVATION",     // Motivational message
    INSTRUCTION = "INSTRUCTION",   // Specific exercise instruction
    MILESTONE = "MILESTONE",       // Achievement of milestone
    WARNING = "WARNING",           // Warning about form/safety
    PACE = "PACE",                 // Guidance on pace/speed
    BREATHING = "BREATHING",       // Breathing cue
    CUSTOM = "CUSTOM"              // User-defined cue
}

/**
 * Trigger conditions for audio cues
 */
export enum AudioCueTrigger {
    TIME_BASED = "TIME_BASED",         // Triggered at specific time
    REPETITION_BASED = "REPETITION_BASED", // Triggered at specific rep
    EVENT_BASED = "EVENT_BASED",       // Triggered by an event
    FORM_BASED = "FORM_BASED",         // Triggered by form detection
    MANUAL = "MANUAL",                 // Manually triggered
    AUTOMATIC = "AUTOMATIC"            // System determined
}

/**
 * Exercise classification types grouped by primary purpose
 */
export enum ExerciseType {
    // Strength-focused types
    STRENGTH_COMPOUND = "STRENGTH_COMPOUND",     // Multi-joint strength movements
    STRENGTH_ISOLATION = "STRENGTH_ISOLATION",   // Single-joint strength movements
    POWER = "POWER",                            // Explosive strength movements
    PLYOMETRIC = "PLYOMETRIC",                  // Jump training
    
    // Endurance-focused types
    CARDIO = "CARDIO",                          // Cardiovascular conditioning
    HIIT = "HIIT",                              // High-intensity interval training
    CIRCUIT = "CIRCUIT",                        // Circuit-style training
    
    // Specialized types
    FLEXIBILITY = "FLEXIBILITY",                // Stretching and mobility
    BALANCE = "BALANCE",                        // Stability and balance
    CORE = "CORE",                              // Core-specific exercises
    REHABILITATION = "REHABILITATION",          // Injury recovery
    WARMUP = "WARMUP",                          // Preparatory movements
    COOLDOWN = "COOLDOWN",                      // Post-workout recovery
    SKILL_TECHNIQUE = "SKILL_TECHNIQUE",        // Sport-specific skills
    SKILL_POWER = "SKILL_POWER"                // Power development
}

/**
 * Equipment categories
 */
export enum EquipmentCategory {
    BARBELLS = "BARBELLS",
    DUMBBELLS = "DUMBBELLS",
    KETTLEBELLS = "KETTLEBELLS",
    MACHINES = "MACHINES",
    CABLES = "CABLES",
    BODYWEIGHT = "BODYWEIGHT",
    ACCESSORIES = "ACCESSORIES",
    CARDIO = "CARDIO",
    RACKS = "RACKS",
    BENCHES = "BENCHES",
    RESISTANCE_BANDS = "RESISTANCE_BANDS",
    SPECIALTY = "SPECIALTY"
}

/**
 * Tag categories for organization
 */
export enum TagCategory {
    GOAL = "GOAL",               // Weight loss, muscle gain, etc.
    DIFFICULTY = "DIFFICULTY",   // Easy, medium, hard
    DURATION = "DURATION",       // Quick, medium, long
    EQUIPMENT = "EQUIPMENT",     // Equipment required/not required
    BODY_PART = "BODY_PART",     // Body parts targeted
    WORKOUT_TYPE = "WORKOUT_TYPE", // HIIT, strength, cardio, etc.
    SPECIAL = "SPECIAL",         // Special categories
    USER_DEFINED = "USER_DEFINED" // Custom user tags
}

/**
 * Tag usage level (system vs. user)
 */
export enum TagScope {
    SYSTEM = "SYSTEM",       // Created/managed by system
    ADMIN = "ADMIN",         // Created/managed by admins
    USER = "USER",           // Created by users
    AUTOMATIC = "AUTOMATIC"  // Automatically generated
}

/**
 * Rating difficulty levels for workouts and exercises
 */
export enum DifficultyRating {
    TOO_EASY = "TOO_EASY",
    EASY = "EASY",
    JUST_RIGHT = "JUST_RIGHT",
    CHALLENGING = "CHALLENGING",
    TOO_HARD = "TOO_HARD"
}

/**
 * Rating enjoyment levels for user feedback
 */
export enum EnjoymentRating {
    DISLIKED = "DISLIKED",
    NEUTRAL = "NEUTRAL",
    ENJOYED = "ENJOYED",
    LOVED = "LOVED"
}

/**
 * Difficulty levels for video tutorials
 */
export enum TutorialDifficulty {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
    EXPERT = "EXPERT"
}

/**
 * Video quality options
 */
export enum VideoQuality {
    SD = "SD",           // Standard Definition
    HD = "HD",           // High Definition (720p)
    FULL_HD = "FULL_HD", // Full HD (1080p)
    ULTRA_HD = "ULTRA_HD" // 4K
}

/**
 * Types of video tutorials
 */
export enum TutorialType {
    DEMONSTRATION = "DEMONSTRATION",   // Basic demonstration of exercise
    INSTRUCTIONAL = "INSTRUCTIONAL",   // Detailed instruction
    FORM_GUIDE = "FORM_GUIDE",         // Focusing on proper form
    COMMON_MISTAKES = "COMMON_MISTAKES", // Highlighting errors to avoid
    VARIATIONS = "VARIATIONS",         // Different variations of an exercise
    PROGRESSION = "PROGRESSION",       // How to progress in difficulty
    MODIFICATION = "MODIFICATION",     // Modified versions for accessibility
    EXPERT_TIPS = "EXPERT_TIPS"        // Advanced tips from experts
}

/**
 * Recurrence patterns for scheduled items
 */
export enum RecurrencePattern {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY",
    CUSTOM = "CUSTOM"
}

/**
 * Schedule item types
 */
export enum ScheduleItemType {
    WORKOUT = "WORKOUT",
    REST = "REST",
    RECOVERY = "RECOVERY",
    ASSESSMENT = "ASSESSMENT",
    GOAL_CHECK = "GOAL_CHECK",
    REMINDER = "REMINDER",
    CUSTOM = "CUSTOM"
}

/**
 * Completion status for scheduled items
 */
export enum ScheduleItemStatus {
    UPCOMING = "UPCOMING",
    COMPLETED = "COMPLETED",
    MISSED = "MISSED",
    RESCHEDULED = "RESCHEDULED",
    CANCELLED = "CANCELLED",
    IN_PROGRESS = "IN_PROGRESS"
}

/**
 * Status of a user's enrollment in a training program
 */
export enum EnrollmentStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    ABANDONED = "ABANDONED"
}

/**
 * User roles for access control
 */
export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    TRAINER = "TRAINER"
}

/**
 * Muscle groups for exercise targeting
 */
export enum MuscleGroup {
    BACK = "BACK",
    CHEST = "CHEST",
    SHOULDERS = "SHOULDERS",
    BICEPS = "BICEPS",
    TRICEPS = "TRICEPS",
    FOREARMS = "FOREARMS",
    QUADRICEPS = "QUADRICEPS",
    HAMSTRINGS = "HAMSTRINGS",
    CALVES = "CALVES",
    GLUTES = "GLUTES",
    CORE = "CORE",
    LATS = "LATS",
    TRAPS = "TRAPS",
    DELTOIDS = "DELTOIDS",
    ABS = "ABS",
    OBLIQUES = "OBLIQUES",
    HIP_FLEXORS = "HIP_FLEXORS",
    ADDUCTORS = "ADDUCTORS",
    ABDUCTORS = "ABDUCTORS",
    LOWER_BACK = "LOWER_BACK",
    UPPER_BACK = "UPPER_BACK",
    FULL_BODY = "FULL_BODY"
}

/**
 * Types of feedback
 */
export enum FeedbackType {
    WORKOUT_RATING = "WORKOUT_RATING",
    EXERCISE_FORM = "EXERCISE_FORM",
    PROGRAM_REVIEW = "PROGRAM_REVIEW",
    EQUIPMENT_REVIEW = "EQUIPMENT_REVIEW",
    TUTORIAL_FEEDBACK = "TUTORIAL_FEEDBACK",
    ACHIEVEMENT_FEEDBACK = "ACHIEVEMENT_FEEDBACK",
    USER_SUGGESTION = "USER_SUGGESTION",
    BUG_REPORT = "BUG_REPORT",
    FEATURE_REQUEST = "FEATURE_REQUEST"
} 