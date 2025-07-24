import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    Index,
    JoinColumn
} from "typeorm";
import { IsEnum, IsNotEmpty, ValidateNested, ArrayMinSize, IsArray, IsString, IsNumber, IsOptional, IsUUID, Min, Max } from "class-validator";
import { Type } from 'class-transformer';
import { ExerciseDetails } from "./ExerciseDetails";
import { WorkoutExercise } from "./WorkoutExercise";
import { Equipment } from "./Equipment";
import { Media } from "./Media";
import { MetricTracking } from "./MetricTracking";
import { Feedback } from "./Feedback";
import { ExerciseCategory } from "./ExerciseCategory";
import { ExerciseRelation, RelationType } from "./ExerciseRelation";
import { 
    Difficulty, 
    MeasurementType,
    MovementPattern,
    TrackingFeature,
    ExerciseType
} from './shared/Enums';
import { 
    MuscleGroup,
    MetricStats,
    CompletionStats,
    RatingStats,
    JointRange,
    JointInfo,
    ExecutionSteps,
    SafetyInfo,
    ExerciseForm,
    AIModelConfig,
    AIModel,
    AITracking,
    PopularityStats,
    ExerciseStats
} from './shared/Validation';
import * as ModelUtils from './shared/Utils';
import { ExerciseData } from './shared/Interfaces';

/**
 * Exercise represents a single physical activity that can be part of workouts.
 * 
 * Relationships:
 * - OneToMany with WorkoutExercise (each exercise can be used in multiple workout plans)
 * - OneToMany with ExerciseDetails (each exercise can have multiple detail variations)
 * - OneToMany with MetricTracking (each exercise can have multiple tracked metrics)
 * - OneToMany with Feedback (each exercise can receive multiple feedback entries)
 * - ManyToMany with Equipment (each exercise can use multiple equipment options)
 * - ManyToMany with Media (each exercise can have multiple media assets)
 * - ManyToMany with ExerciseCategory (each exercise can belong to multiple categories)
 * - OneToMany with ExerciseRelation (each exercise can have relationships with others)
 */
@Entity("exercises")
@Index("idx_exercise_name_measurement", ["name", "measurementType"])
export class Exercise {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index("idx_exercise_name")
    @IsNotEmpty()
    name: string;

    @Column("text")
    description: string;

    @Column({
        type: "enum",
        enum: MeasurementType,
        default: MeasurementType.REPS
    })
    @IsEnum(MeasurementType)
    @Index("idx_exercise_measurement")
    measurementType: MeasurementType;

    @Column("simple-array")
    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(ExerciseType, { each: true })
    types: ExerciseType[];

    @Column({
        type: "enum",
        enum: Difficulty,
        default: Difficulty.BEGINNER
    })
    @IsEnum(Difficulty)
    @Index("idx_exercise_level")
    level: Difficulty;

    @Column({
        type: "enum",
        enum: MovementPattern,
        nullable: true
    })
    @IsEnum(MovementPattern)
    @Index("idx_exercise_movement")
    movementPattern: MovementPattern;

    /**
     * Equipment that can be used with this exercise
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    equipmentOptions: Equipment[];

    /**
     * Media resources for this exercise
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    media: Media[];

    /**
     * Categories this exercise belongs to (muscle groups, movement patterns, etc.)
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    categories: ExerciseCategory[];

    /**
     * Metrics tracked for this exercise across users
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    metrics: MetricTracking[];

    /**
     * User feedback on this exercise
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    feedback: Feedback[];

    /**
     * Instances of this exercise in workout plans
     * We want to prevent deletion if the exercise is used in any workout
     */
    @OneToMany(() => WorkoutExercise, workoutExercise => workoutExercise.exercise, {
        onDelete: "RESTRICT"
    })
    workoutExercises: WorkoutExercise[];

    /**
     * Detailed variations of this exercise
     * When an exercise is deleted, its details will be deleted
     */
    @OneToMany(() => ExerciseDetails, details => details.exercise, { 
        cascade: true,
        onDelete: "CASCADE"
    })
    details: ExerciseDetails[];

    /**
     * Relationships where this exercise is the base
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    relationsFrom: ExerciseRelation[];

    /**
     * Relationships where this exercise is related to another
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    relationsTo: ExerciseRelation[];

    @Column("simple-array", { default: [] })
    @IsArray()
    @IsEnum(TrackingFeature, { each: true })
    trackingFeatures: TrackingFeature[];

    @Column("simple-array", { default: [] })
    @IsArray()
    @IsEnum(MuscleGroup, { each: true })
    targetMuscleGroups: MuscleGroup[] = [];

    @Column("simple-array", { default: [] })
    @IsArray()
    @IsEnum(MuscleGroup, { each: true })
    synergistMuscleGroups: MuscleGroup[] = [];

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ExerciseForm)
    form: ExerciseForm;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => AIModelConfig)
    aiConfig: AIModelConfig;

    /**
     * Other exercises that are variations of this one
     * Computed through the ExerciseRelation table with RelationType.VARIATION
     */
    variations: Exercise[];

    /**
     * Other exercises that are alternatives to this one
     * Computed through the ExerciseRelation table with RelationType.ALTERNATIVE
     */
    alternatives: Exercise[];

    /**
     * Other exercises that are progressions from this one
     * Computed through the ExerciseRelation table with RelationType.PROGRESSION
     */
    progressions: Exercise[];

    /**
     * Other exercises that are regressions from this one
     * Computed through the ExerciseRelation table with RelationType.REGRESSION
     */
    regressions: Exercise[];

    @Column("jsonb", { 
        default: () => "'{ \"duration\": {\"avg\": 0, \"min\": 0, \"max\": 0}, \"calories\": {\"avg\": 0, \"min\": 0, \"max\": 0}, \"completion\": {\"rate\": 0, \"total\": 0, \"successful\": 0}, \"rating\": {\"value\": 0, \"count\": 0, \"distribution\": {}}, \"popularity\": {\"score\": 0, \"trend\": \"stable\", \"lastUpdated\": \"1970-01-01T00:00:00.000Z\"} }'::jsonb"
    })
    @ValidateNested()
    @Type(() => ExerciseStats)
    stats: ExerciseStats;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    /**
     * Calculate the complexity score of the exercise based on various factors
     * @returns number between 0 and 1, where 1 is most complex
     */
    calculateComplexity(): number {
        return ModelUtils.calculateExerciseComplexity(
            this.level,
            this.types,
            this.equipmentOptions?.length || 0,
            this.movementPattern,
            this.form
        );
    }

    // Helper methods to work with relations
    getRelatedExercises(type: RelationType): Promise<Exercise[]> {
        // This will be implemented in the service layer
        return Promise.resolve([]);
    }
} 