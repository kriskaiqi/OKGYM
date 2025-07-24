import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max, IsBoolean, IsDate, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { WorkoutPlan } from "./WorkoutPlan";
import { User } from "./User";
import { MetricTracking } from "./MetricTracking";
import { Feedback } from "./Feedback";
import { WorkoutRating } from "./WorkoutRating";
import { ExerciseFormAnalysis } from "./ExerciseFormAnalysis";
import { Achievement } from "./Achievement";
import { 
    SessionStatus,
    ExerciseStatus,
    MeasurementUnit,
    WorkoutLocation,
    WorkoutCategory,
    Difficulty,
    BodyArea,
    MuscleGroup
} from "./shared/Enums";
import * as ModelUtils from './shared/Utils';

/**
 * Class representing the best result of a workout session
 */
export class BestResult {
    @IsNumber()
    @Min(0)
    @IsOptional()
    weight?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    reps?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration?: number;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    formScore: number = 0;
    
    @IsNumber()
    @Min(0)
    @Max(5)
    @IsOptional()
    difficultyScore?: number;
    
    @IsString()
    @IsOptional()
    notes?: string;
}

/**
 * Information about a single attempt at an exercise
 */
export class ExerciseAttempt {
    @IsDate()
    timestamp: Date = new Date();
    
    @IsNumber()
    @Min(0)
    repetitions: number = 0;
    
    @IsNumber()
    @Min(0)
    duration: number = 0;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    formScore: number = 0;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    weight?: number = 0;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    resistance?: number = 0;
    
    @IsString()
    @IsOptional()
    notes?: string = '';
}

/**
 * Combined results for all attempts at an exercise
 */
export class ExerciseResult {
    @IsEnum(ExerciseStatus)
    status: ExerciseStatus = ExerciseStatus.PENDING;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExerciseAttempt)
    attempts: ExerciseAttempt[] = [];
    
    @ValidateNested()
    @Type(() => BestResult)
    bestResult: BestResult = new BestResult();
    
    @IsString()
    @IsOptional()
    feedback?: string = '';
    
    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    difficultyRating?: number = 5; // 1-10 scale

    @IsString()
    @IsOptional()
    skipReason?: string;
}

/**
 * Planned exercise configuration
 */
export class PlannedExercise {
    @IsString()
    @IsNotEmpty()
    exerciseId: string = '';
    
    @IsNumber()
    @Min(1)
    order: number = 1;
    
    @IsNumber()
    @Min(0)
    targetRepetitions: number = 0;
    
    @IsNumber()
    @Min(0)
    targetDuration: number = 0;
    
    @IsNumber()
    @Min(1)
    targetSets: number = 1;
    
    @IsNumber()
    @Min(0)
    restTime: number = 0;
    
    @IsString()
    @IsOptional()
    notes?: string = '';
}

/**
 * Actual exercise execution
 */
export class ActualExercise {
    @IsString()
    @IsNotEmpty()
    exerciseId: string = '';
    
    @IsNumber()
    @Min(1)
    order: number = 1;
    
    @IsDate()
    startTime: Date = new Date();
    
    @IsDate()
    @IsOptional()
    endTime?: Date;
    
    @IsEnum(ExerciseStatus)
    status: ExerciseStatus = ExerciseStatus.PENDING;
    
    @IsNumber()
    @Min(0)
    completedSets: number = 0;
    
    @IsString()
    @IsOptional()
    notes?: string = '';
}

/**
 * Planned vs. actual exercise sequence
 */
export class ExerciseSequence {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlannedExercise)
    originalPlan: PlannedExercise[] = [];
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActualExercise)
    actualSequence: ActualExercise[] = [];
}

/**
 * Exercise summary in workout results
 */
export class ExerciseSummary {
    @IsString()
    @IsNotEmpty()
    exerciseId: string = '';
    
    @IsString()
    @IsNotEmpty()
    name: string = '';
    
    @IsNumber()
    @Min(0)
    totalAttempts: number = 0;
    
    @ValidateNested()
    @Type(() => BestResult)
    bestResult: BestResult = new BestResult();
}

/**
 * Summary of workout session results
 */
export class WorkoutSummary {
    @IsNumber()
    @Min(0)
    totalExercises: number = 0;
    
    @IsNumber()
    @Min(0)
    uniqueExercises: number = 0;
    
    @IsNumber()
    @Min(0)
    totalDuration: number = 0;
    
    @IsNumber()
    @Min(0)
    caloriesBurned: number = 0;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    averageHeartRate?: number = 0;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    peakHeartRate?: number = 0;
    
    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    difficultyRating?: number = 5;
    
    @IsArray()
    @IsString({ each: true })
    focusAreas: string[] = [];
    
    @IsArray()
    @IsString({ each: true })
    muscleGroups: string[] = [];
    
    @IsNumber()
    @Min(0)
    totalSets: number = 0;
    
    @IsNumber()
    @Min(0)
    totalReps: number = 0;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    formScore: number = 0;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExerciseSummary)
    exerciseSummaries: ExerciseSummary[] = [];
}

/**
 * Coordinates for location data
 */
export class Coordinates {
    @IsNumber()
    latitude: number = 0;
    
    @IsNumber()
    longitude: number = 0;
}

/**
 * Location data for workout
 */
export class LocationData {
    @IsEnum(WorkoutLocation)
    type: WorkoutLocation = WorkoutLocation.HOME;
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Coordinates)
    coordinates?: Coordinates;
    
    @IsString()
    @IsOptional()
    address?: string = '';
}

/**
 * Environment data during workout
 */
export class EnvironmentData {
    @IsNumber()
    @IsOptional()
    temperature?: number;
    
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    humidity?: number;
    
    @IsString()
    @IsOptional()
    weather?: string;
    
    @IsNumber()
    @IsOptional()
    altitude?: number;
}

/**
 * Health data during workout
 */
export class HealthData {
    @IsNumber()
    @Min(0)
    @IsOptional()
    avgHeartRate?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    peakHeartRate?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    caloriesBurned?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    stepsCount?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    weightBefore?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    weightAfter?: number;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    @IsOptional()
    stressLevel?: number;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    @IsOptional()
    hydrationLevel?: number;
}

/**
 * WorkoutSession entity tracks a single instance of a user performing a workout
 */
@Entity("workout_sessions")
@Index(["user", "status"])
@Index(["workoutPlan", "status"])
@Index(["startTime", "endTime"])
export class WorkoutSession {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    @Column({ name: "user_id" })
    @IsUUID()
    userId: string = '';

    @Column({ name: "workout_plan_id" })
    @IsUUID()
    workoutPlanId: string = '';

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @ManyToOne(() => WorkoutPlan)
    @JoinColumn({ name: "workout_plan_id", referencedColumnName: "id" })
    workoutPlan: WorkoutPlan;

    @OneToMany(() => MetricTracking, metric => metric.workoutSession)
    metrics: MetricTracking[];

    @OneToMany(() => Feedback, feedback => feedback.workoutSession)
    feedback: Feedback[];

    @OneToMany(() => WorkoutRating, rating => rating.workoutSession)
    ratings: WorkoutRating[];

    @OneToMany(() => ExerciseFormAnalysis, analysis => analysis.workoutSession)
    formAnalysis: ExerciseFormAnalysis[];

    @OneToMany(() => Achievement, achievement => achievement.workoutSession)
    achievements: Achievement[];

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE
    })
    @IsEnum(SessionStatus)
    @Index()
    status: SessionStatus = SessionStatus.ACTIVE;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ExerciseSequence)
    exerciseSequence: ExerciseSequence = new ExerciseSequence();

    @Column("jsonb", { default: {} })
    exerciseResults: { [exerciseId: string]: ExerciseResult } = {};

    @Column("jsonb", {
        default: {
            totalDuration: 0,
            caloriesBurned: 0,
            totalExercises: 0,
            uniqueExercises: 0,
            totalSets: 0,
            totalReps: 0,
            formScore: 0,
            focusAreas: [],
            muscleGroups: [],
            exerciseSummaries: []
        }
    })
    @ValidateNested()
    @Type(() => WorkoutSummary)
    summary: WorkoutSummary = new WorkoutSummary();

    @Column({ type: "timestamp", nullable: true })
    @IsDate()
    @IsOptional()
    startTime?: Date;

    @Column({ type: "timestamp", nullable: true })
    @IsDate()
    @IsOptional()
    endTime?: Date;

    @Column({ type: "int", default: 0 })
    @IsNumber()
    @Min(0)
    totalDuration: number = 0;

    @Column({ type: "float", default: 0 })
    @IsNumber()
    @Min(0)
    caloriesBurned: number = 0;

    @Column({ type: "int", default: 1 })
    @IsNumber()
    @Min(1)
    @Max(10)
    difficultyRating: number = 1;

    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    userFeedback?: string = '';

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => LocationData)
    @IsOptional()
    locationData?: LocationData;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => EnvironmentData)
    @IsOptional()
    environmentData?: EnvironmentData;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => HealthData)
    @IsOptional()
    healthData?: HealthData;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @UpdateDateColumn()
    updatedAt: Date = new Date();
    
    /**
     * Calculate total duration of the workout
     * @returns Duration in minutes
     */
    calculateDuration(): number {
        if (this.startTime && this.endTime) {
            return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (60 * 1000));
        } else if (this.summary.totalDuration > 0) {
            return this.summary.totalDuration;
        }
        return 0;
    }
    
    /**
     * Check if the workout is complete
     * @returns Boolean indicating if all exercises are completed
     */
    isComplete(): boolean {
        if (!this.exerciseSequence?.actualSequence) return false;
        
        return this.exerciseSequence.actualSequence.every(
            exercise => exercise.status === ExerciseStatus.COMPLETED ||
                      exercise.status === ExerciseStatus.SKIPPED
        );
    }
    
    /**
     * Calculate total volume load from the exercise results
     * @returns Total volume (weight × reps × sets)
     */
    calculateVolumeLoad(): number {
        let totalVolume = 0;
        
        if (!this.exerciseResults) return 0;
        
        Object.values(this.exerciseResults).forEach(result => {
            result.attempts.forEach(attempt => {
                const weight = attempt.weight || 0;
                totalVolume += weight * attempt.repetitions;
            });
        });
        
        return totalVolume;
    }
    
    /**
     * Calculate average form score across all completed exercises
     * @returns Average form score (0-10)
     */
    calculateAverageFormScore(): number {
        if (!this.exerciseResults) return 0;
        
        const scores: number[] = [];
        
        Object.values(this.exerciseResults).forEach(result => {
            result.attempts.forEach(attempt => {
                scores.push(attempt.formScore);
            });
        });
        
        if (scores.length === 0) return 0;
        
        return ModelUtils.normalize(
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
            0, 10
        );
    }
}
