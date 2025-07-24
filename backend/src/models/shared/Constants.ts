/**
 * Constants shared across the application
 */

/**
 * Time-related constants
 */
export const TIME_CONSTANTS = {
    // Cache timeouts
    DEFAULT_CACHE_TIMEOUT_MINUTES: 60,
    
    // Workout duration defaults
    STANDARD_WARMUP_MINUTES: 10,
    STANDARD_COOLDOWN_MINUTES: 5,
    
    // Exercise timing defaults
    DEFAULT_REST_TIME_SECONDS: 30,
    DEFAULT_EXERCISE_DURATION_SECONDS: 30,
    DEFAULT_SECONDS_PER_REP: 3,
    
    // Duration thresholds
    MINIMUM_REST_TIME_SECONDS: 15
};

/**
 * Progression-related constants
 */
export const PROGRESSION_CONSTANTS = {
    // Default progression increments
    DEFAULT_WEIGHT_INCREMENT: 2.5,
    DEFAULT_REPS_PERCENTAGE: 0.1,
    DEFAULT_DURATION_PERCENTAGE: 0.15,
    DEFAULT_REST_REDUCTION_SECONDS: 10,
    
    // Rep range intensity mappings
    LOW_REPS_INTENSITY: 0.9,  // <= 5 reps
    MEDIUM_REPS_INTENSITY: 0.7, // 6-12 reps
    HIGH_REPS_INTENSITY: 0.5  // > 12 reps
};

/**
 * Calculation-related constants
 */
export const CALCULATION_CONSTANTS = {
    // Equipment complexity factor
    EQUIPMENT_COMPLEXITY_FACTOR: 0.05,
    MAX_EQUIPMENT_COMPLEXITY_COUNT: 3,
    
    // Form complexity factors
    SECONDARY_MUSCLES_COMPLEXITY_FACTOR: 0.05,
    KEY_POINTS_COMPLEXITY_FACTOR: 0.02,
    CAUTIONS_COMPLEXITY_FACTOR: 0.03,
    
    // Workout intensity factors
    WORK_TO_REST_INTENSITY_FACTOR: 0.1,
    VOLUME_INTENSITY_DIVISOR: 1000,
    MAX_VOLUME_INTENSITY_CONTRIBUTION: 0.3
}; 