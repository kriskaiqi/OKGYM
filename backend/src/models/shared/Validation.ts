import { IsNumber, IsOptional, Min, Max, IsString, IsEnum, IsArray, IsBoolean, IsDate, ValidateNested, ArrayMinSize, IsUUID, IsNotEmpty } from "class-validator";
import { Type } from 'class-transformer';
import { NoiseLevel, SpaceRequirement, MobilityLevel, FitnessGoal, TrackingFeature, ProgressionType } from './Enums';

/**
 * Base class for numerical range validation
 * Provides min/max constraints with optional values
 */
export class NumericalRange {
    @IsNumber()
    @Min(0)
    min: number;

    @IsNumber()
    @Min(0)
    max: number;
}

/**
 * Base class for all metrics that use a 0-1 scale
 */
export class NormalizedScore {
    @IsNumber()
    @Min(0)
    @Max(1)
    score: number;

    @IsDate()
    @IsOptional()
    lastUpdated?: Date;
}

/**
 * Base class for all metrics that use a 1-10 scale
 */
export class ScaleOfTen {
    @IsNumber()
    @Min(1)
    @Max(10)
    rating: number;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * Base class for tracking exercise intensity
 */
export class ExerciseIntensity {
    @IsNumber()
    @Min(0)
    @IsOptional()
    weight?: number;

    @IsString()
    @IsOptional()
    level?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    resistance?: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    percentOfOneRepMax?: number;

    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    rateOfPerceivedExertion?: number;
}

/**
 * Base class for tracking exercise tempo
 */
export class ExerciseTempo {
    @IsNumber()
    @Min(0)
    @IsOptional()
    eccentric?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    pause?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    concentric?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    pauseAtTop?: number;
}

/**
 * Base class for range of motion configuration
 */
export class RangeOfMotion {
    @IsBoolean()
    @IsOptional()
    partial?: boolean;

    @IsString()
    @IsOptional()
    partialType?: string;

    @IsString()
    @IsOptional()
    rangeRestriction?: string;
}

/**
 * Base class for progression strategy configuration
 */
export class ProgressionStrategy {
    @IsString()
    @IsOptional()
    targetProgressionType?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    progressionRate?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    deloadFrequency?: number;

    @IsBoolean()
    @IsOptional()
    autoRegulate?: boolean;
}

/**
 * Base class for workout environment metadata
 */
export class WorkoutMetadata {
    @IsEnum(SpaceRequirement)
    @IsOptional()
    spaceRequired?: SpaceRequirement;

    @IsEnum(NoiseLevel)
    @IsOptional()
    noise?: NoiseLevel;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    targetAudience?: string[];

    @IsEnum(MobilityLevel)
    @IsOptional()
    mobility?: MobilityLevel;

    @IsBoolean()
    @IsOptional()
    warmupIncluded?: boolean;

    @IsBoolean()
    @IsOptional()
    cooldownIncluded?: boolean;

    @IsArray()
    @IsEnum(FitnessGoal, { each: true })
    @IsOptional()
    fitnessGoals?: FitnessGoal[];
}

/**
 * Base class for muscle group targeting
 */
export class MuscleGroup {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    primary: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    secondary?: string[];
}

/**
 * Base class for time-based metrics with caching
 */
export class CachedMetrics {
    @IsDate()
    lastCalculated: Date;

    @IsNumber()
    @IsOptional()
    @Min(0)
    cacheTimeoutMinutes?: number;

    /**
     * Check if the cache is still valid
     * @param maxAgeMinutes Optional override for cache timeout
     * @returns boolean indicating if cache is still valid
     */
    isCacheValid(maxAgeMinutes?: number): boolean {
        const timeout = maxAgeMinutes || this.cacheTimeoutMinutes || 60; // Default 1 hour
        const ageInMinutes = (Date.now() - this.lastCalculated.getTime()) / (60 * 1000);
        return ageInMinutes < timeout;
    }
}

/**
 * Base class for all workout/exercise metrics
 */
export class WorkoutMetrics extends CachedMetrics {
    @IsNumber()
    @Min(0)
    volumeLoad: number;

    @IsNumber()
    @Min(0)
    density: number;

    @IsNumber()
    @Min(0)
    @Max(1)
    intensity: number;

    @IsNumber()
    @Min(0)
    totalTime: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalRestTime?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    averageHeartRate?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedCalories?: number;
}

/**
 * Base class for substitution options
 */
export class SubstitutionOptions {
    @IsBoolean()
    @IsOptional()
    allowRegressions?: boolean;

    @IsBoolean()
    @IsOptional()
    allowProgressions?: boolean;

    @IsBoolean()
    @IsOptional()
    allowEquipmentVariations?: boolean;

    @IsString({ each: true })
    @IsOptional()
    preferredSubstitutes?: string[];
}

/**
 * Base class for weekly progression tracking
 */
export class WeeklyProgression {
    @IsNumber()
    @Min(0)
    @Max(2)
    intensityMultiplier: number;

    @IsNumber()
    @Min(0)
    @Max(2)
    volumeMultiplier: number;
}

/**
 * Coordinates for location data
 */
export class Coordinates {
    @IsNumber()
    latitude: number;
    
    @IsNumber()
    longitude: number;
}

/**
 * Location data for workouts and sessions
 */
export class LocationData {
    @IsString()
    type: string; // "HOME", "GYM", "OUTDOORS", etc.
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Coordinates)
    coordinates?: Coordinates;
    
    @IsString()
    @IsOptional()
    address?: string;
}

/**
 * Standard metric statistics used across models for measurement tracking
 */
export class MetricStats {
    @IsNumber()
    @Min(0)
    avg: number;

    @IsNumber()
    @Min(0)
    min: number;

    @IsNumber()
    @Min(0)
    max: number;
    
    @IsDate()
    @IsOptional()
    lastCalculated?: Date;
}

/**
 * Standardized validation for ratings with distribution tracking
 */
export class RatingStats {
    @IsNumber()
    @Min(0)
    @Max(5)
    value: number;

    @IsNumber()
    @Min(0)
    count: number;
    
    @IsOptional()
    distribution?: Record<number, number>;
}

/**
 * Standardized validation for tracking completion rates
 */
export class CompletionStats {
    @IsNumber()
    @Min(0)
    @Max(1)
    rate: number;

    @IsNumber()
    @Min(0)
    total: number;

    @IsNumber()
    @Min(0)
    successful: number;
    
    @IsDate()
    @IsOptional()
    lastUpdated?: Date;
}

/**
 * Joint range of motion validation
 */
export class JointRange {
    @IsNumber()
    min: number;

    @IsNumber()
    max: number;
}

/**
 * Joint information validation with primary joints and range of motion
 */
export class JointInfo {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    primary: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => JointRange)
    rangeOfMotion?: { [joint: string]: JointRange };
}

/**
 * Exercise execution steps validation
 */
export class ExecutionSteps {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    setup: string[];

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    steps: string[];

    @IsOptional()
    @IsString()
    tempo?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keyPoints?: string[];
}

/**
 * Exercise safety information validation
 */
export class SafetyInfo {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    prerequisites?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    cautions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tips?: string[];
}

/**
 * Complete exercise form validation
 */
export class ExerciseForm {
    @ValidateNested()
    @Type(() => MuscleGroup)
    muscles: MuscleGroup;

    @ValidateNested()
    @Type(() => JointInfo)
    joints: JointInfo;

    @ValidateNested()
    @Type(() => ExecutionSteps)
    execution: ExecutionSteps;

    @ValidateNested()
    @Type(() => SafetyInfo)
    safety: SafetyInfo;
}

/**
 * AI model configuration parameters
 */
export class AIModelConfig {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    threshold?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    minConfidence?: number;

    @IsOptional()
    parameters?: Record<string, number | string | boolean>;
}

/**
 * AI model definition for exercise tracking
 */
export class AIModel {
    @IsUUID()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    version: string;

    @IsArray()
    @IsEnum(TrackingFeature, { each: true })
    features: TrackingFeature[];

    @IsOptional()
    @ValidateNested()
    @Type(() => AIModelConfig)
    config?: AIModelConfig;
}

/**
 * Collection of AI models for tracking
 */
export class AITracking {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AIModel)
    models?: AIModel[];
}

/**
 * Popularity tracking with trend analysis
 */
export class PopularityStats {
    @IsNumber()
    @Min(0)
    score: number;

    @IsEnum(['up', 'down', 'stable'])
    trend: 'up' | 'down' | 'stable';

    @IsDate()
    lastUpdated: Date;
}

/**
 * Standardized exercise statistics validation class
 */
export class ExerciseStats {
    @ValidateNested()
    @Type(() => MetricStats)
    duration: MetricStats;

    @ValidateNested()
    @Type(() => MetricStats)
    calories: MetricStats;

    @ValidateNested()
    @Type(() => CompletionStats)
    completion: CompletionStats;

    @ValidateNested()
    @Type(() => RatingStats)
    rating: RatingStats;

    @ValidateNested()
    @Type(() => PopularityStats)
    popularity: PopularityStats;
}

/**
 * Standard structure for workout organization and progression
 */
export class WorkoutStructure {
    @IsNumber()
    @IsOptional()
    @Min(1)
    sets?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(1)
    circuits?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(10)
    rounds?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(5)
    @Max(300)
    restBetweenExercises?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(30)
    @Max(600)
    restBetweenSets?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(30)
    @Max(600)
    restBetweenCircuits?: number;
    
    @IsOptional()
    @IsEnum(ProgressionType)
    progressionType?: ProgressionType;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    workToRestRatio?: number;
    
    @IsOptional()
    @IsBoolean()
    autoAdjustRest?: boolean;
    
    @IsNumber()
    @IsOptional()
    @Min(0)
    totalSets?: number;
    
    @IsNumber()
    @IsOptional()
    @Min(0)
    totalReps?: number;
}

/**
 * Standard model for exercise progression strategy
 */
export class ProgressionModel {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    intensityIncreaseRate?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    volumeIncreaseRate?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    deloadFrequency?: number;
    
    @IsOptional()
    @IsBoolean()
    autoRegulate?: boolean;
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    rpeTarget?: number;
    
    @IsOptional()
    @IsEnum(ProgressionType)
    progressionType?: ProgressionType;
    
    @IsOptional()
    weeklyProgression?: { [week: number]: any };
}

/**
 * Standard exercise configuration for workouts
 */
export class ExerciseConfig {
    @IsString()
    @IsNotEmpty()
    exerciseId: string;

    @IsNumber()
    @Min(1)
    order: number;

    @IsNumber()
    @Min(1)
    sets: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    repetitions?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    duration?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    distance?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    restTime?: number;

    @IsString()
    @IsOptional()
    notes?: string;
    
    @IsOptional()
    intensity?: {
        weight?: number;  // in kg or lbs
        level?: string;   // e.g., "light", "moderate", "heavy"
        resistance?: number; // For resistance bands or machines
        percentOfOneRepMax?: number; // % of 1RM (e.g., 75%)
        rateOfPerceivedExertion?: number; // RPE (1-10 scale)
    };
} 