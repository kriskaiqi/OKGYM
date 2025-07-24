/**
 * Shared models and utilities
 * This module provides common components for use across all models
 * 
 * USAGE GUIDELINES:
 * 
 * 1. Imports - Always use barrel imports for shared components:
 *    ```typescript
 *    import { 
 *      // Group imports by type with comments
 *      // Enums
 *      Difficulty,
 *      WorkoutCategory,
 *      
 *      // Validation classes
 *      WorkoutMetrics,
 *      ExerciseForm
 *    } from './shared';
 *    ```
 * 
 * 2. Enums - Use shared enums instead of creating local ones:
 *    ```typescript
 *    // INCORRECT - Local enum definition
 *    export enum MyLocalEnum { ... }
 *    
 *    // CORRECT - Use shared enum
 *    import { SharedEnum } from './shared';
 *    ```
 * 
 * 3. Validation - Use shared validation classes with class-validator decorators:
 *    ```typescript
 *    @ValidateNested()
 *    @Type(() => WorkoutMetrics)
 *    metrics: WorkoutMetrics;
 *    ```
 * 
 * 4. Constants - Use centralized constants for consistent values:
 *    ```typescript
 *    // Instead of hardcoded values
 *    timeout: TIME_CONSTANTS.DEFAULT_CACHE_TIMEOUT_MINUTES
 *    ```
 * 
 * 5. Utility functions - Prefer shared utilities for common operations:
 *    ```typescript
 *    // Instead of local implementation
 *    isValid = ModelUtils.isCacheValid(timestamp);
 *    ```
 */

// Export all enums
export {
    Difficulty,
    FitnessGoal,
    Gender,
    ActivityLevel,
    WorkoutLocation,
    ExercisePreference,
    BodyArea,
    MeasurementUnit,
    AppTheme,
    MeasurementType,
    ExerciseType,
    EquipmentCategory,
    WorkoutCategory,
    TagCategory,
    TagScope,
    DifficultyRating,
    EnjoymentRating,
    TutorialDifficulty,
    VideoQuality,
    TutorialType,
    SplitType,
    ProgressionType,
    RecurrencePattern,
    ScheduleItemType,
    ScheduleItemStatus,
    EnrollmentStatus
} from './Enums';

// Export all validation classes
export * from './Validation';

// Export all utility functions
export * from './Utils';

// Export all constants
export * from './Constants';

// Version of the shared module - update when making breaking changes
export const SHARED_MODULE_VERSION = '1.0.0'; 