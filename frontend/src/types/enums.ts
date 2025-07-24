/**
 * Shared enums for use across components to maintain consistency with backend
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
    
    // Split types
    PUSH = "PUSH",
    PULL = "PULL",
    LEGS = "LEGS"
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
 * Movement patterns for exercise classification
 */
export enum MovementPattern {
    PUSH = "PUSH",               // Pushing movements
    PULL = "PULL",               // Pulling movements
    SQUAT = "SQUAT",             // Squat pattern movements
    HINGE = "HINGE",             // Hip hinge movements
    LUNGE = "LUNGE",             // Lunge pattern movements
    ROTATION = "ROTATION",       // Rotational movements
    CARRY = "CARRY",             // Carrying movements
    CORE = "CORE",               // Core stabilization
    ISOMETRIC = "ISOMETRIC",     // Static holds
    LOCOMOTION = "LOCOMOTION",   // Moving through space
    PLYOMETRIC = "PLYOMETRIC",   // Explosive movements
    ISOLATED = "ISOLATED"        // Single-joint isolation
}

/**
 * Primary muscle groups for exercise targeting
 */
export enum MuscleGroup {
    CHEST = "CHEST",
    BACK = "BACK",
    SHOULDERS = "SHOULDERS",
    BICEPS = "BICEPS",
    TRICEPS = "TRICEPS",
    FOREARMS = "FOREARMS",
    QUADRICEPS = "QUADRICEPS",
    HAMSTRINGS = "HAMSTRINGS",
    GLUTES = "GLUTES",
    CALVES = "CALVES",
    ABS = "ABS",
    OBLIQUES = "OBLIQUES",
    LOWER_BACK = "LOWER_BACK",
    NECK = "NECK",
    TRAPS = "TRAPS",
    FULL_BODY = "FULL_BODY",
    UPPER_BODY = "UPPER_BODY",
    LOWER_BODY = "LOWER_BODY",
    CORE = "CORE"
}

/**
 * Media type classification
 */
export enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    GIF = "GIF",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT"
}

/**
 * Category types for exercise classification
 */
export enum CategoryType {
    MUSCLE_GROUP = "MUSCLE_GROUP",         // Primary muscles worked
    MOVEMENT_PATTERN = "MOVEMENT_PATTERN", // Type of movement (push, pull, etc.)
    EQUIPMENT = "EQUIPMENT",               // Required equipment
    EXPERIENCE_LEVEL = "EXPERIENCE_LEVEL", // Beginner, intermediate, advanced
    GOAL = "GOAL",                         // Strength, hypertrophy, endurance
    BODY_PART = "BODY_PART",               // Body part targeted
    SPECIAL = "SPECIAL"                    // Other special categories
}

/**
 * Exercise intensity levels for workout planning and progression
 */
export enum ExerciseIntensity {
    LIGHT = "LIGHT",           // Low intensity, suitable for beginners or recovery
    MODERATE = "MODERATE",     // Medium intensity, standard training
    HEAVY = "HEAVY"            // High intensity, advanced training
}

/**
 * Tracking features supported by exercises
 */
export enum TrackingFeature {
    REP_COUNTING = "REP_COUNTING",                 // Count repetitions
    FORM_ANALYSIS = "FORM_ANALYSIS",               // Analyze movement form
    RANGE_OF_MOTION = "RANGE_OF_MOTION",           // Measure range of motion
    POWER_OUTPUT = "POWER_OUTPUT",                 // Measure power generation
    VELOCITY = "VELOCITY",                         // Track movement speed
    TIME_UNDER_TENSION = "TIME_UNDER_TENSION",     // Measure muscle tension time
    REST_TIMING = "REST_TIMING",                   // Track rest periods
    HEART_RATE = "HEART_RATE",                     // Monitor heart rate
    CALORIE_BURN = "CALORIE_BURN",                 // Estimate calorie expenditure
    ONE_REP_MAX = "ONE_REP_MAX",                   // Calculate 1RM
    SYMMETRY = "SYMMETRY",                         // Analyze left/right balance
    FATIGUE = "FATIGUE",                           // Measure fatigue levels
    EFFORT = "EFFORT",                             // Gauge perceived effort
    PROGRESSION = "PROGRESSION"                    // Track progression over time
} 