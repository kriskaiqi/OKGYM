import { 
    Difficulty, 
    MeasurementType,
    MovementPattern,
    TrackingFeature,
    ExerciseType,
    WorkoutCategory,
    FitnessGoal,
    ProgressionType
} from './Enums';

import {
    ExerciseForm,
    AITracking,
    ExerciseStats,
    WorkoutMetadata,
    WorkoutStructure,
    ProgressionModel
} from './Validation';

/**
 * Interface for creating new exercises
 */
export interface ExerciseData {
    name: string;
    description: string;
    measurementType: MeasurementType;
    types: ExerciseType[];
    level?: Difficulty;
    movementPattern?: MovementPattern;
    categoryIds?: number[];
    equipmentIds?: string[];
    mediaIds?: string[];
    trackingFeatures?: TrackingFeature[];
    form: ExerciseForm;
    aiTracking?: AITracking;
    stats?: Partial<ExerciseStats>;
}

/**
 * Interface for creating new workout plans
 */
export interface WorkoutPlanData {
    name: string;
    description: string;
    difficulty: Difficulty;
    workoutCategory: WorkoutCategory;
    estimatedDuration: number;
    categoryIds?: number[];
    equipmentIds?: string[];
    tagIds?: number[];
    videoId?: string;
    thumbnailId?: string;
    metadata?: WorkoutMetadata;
    workoutStructure?: WorkoutStructure;
    progressionModel?: ProgressionModel;
    fitnessGoals?: FitnessGoal[];
    exercises: {
        exerciseId: string;
        order: number;
        sets: number;
        repetitions?: number;
        duration?: number;
        distance?: number;
        intensity?: {
            weight?: number;
            level?: string;
            resistance?: number;
            percentOfOneRepMax?: number;
            rateOfPerceivedExertion?: number;
        };
        restTime?: number;
        notes?: string;
    }[];
}

/**
 * Interface for fitness goal filters
 */
export interface GoalFilters {
    userId?: string;
    status?: string;
    type?: string;
    startDateMin?: Date;
    startDateMax?: Date;
    targetDateMin?: Date;
    targetDateMax?: Date;
    isActive?: boolean;
    searchTerm?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Interface for workout plan filters
 */
export interface WorkoutPlanFilters {
    difficulty?: Difficulty;
    workoutCategory?: WorkoutCategory;
    categoryIds?: number[];
    equipmentIds?: string[];
    tagIds?: number[];
    minDuration?: number;
    maxDuration?: number;
    searchTerm?: string;
    isCustom?: boolean;
    creatorId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Interface for training program filters
 */
export interface TrainingProgramFilters {
    difficulty?: Difficulty;
    category?: string;
    programStructure?: string;
    minDurationWeeks?: number;
    maxDurationWeeks?: number;
    minWorkoutsPerWeek?: number;
    maxWorkoutsPerWeek?: number;
    categoryIds?: number[];
    equipmentIds?: number[];
    tagIds?: number[];
    searchTerm?: string;
    isPublished?: boolean;
    creatorId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
} 