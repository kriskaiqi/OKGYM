import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    Check
} from "typeorm";
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max, IsBoolean, IsDate, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { WorkoutSession } from "./WorkoutSession";
import { 
    MetricCategory,
    MetricValueType,
    TrendDirection
} from "./shared/Enums";
import * as ModelUtils from './shared/Utils';

/**
 * Related metric correlation data
 */
export class MetricCorrelation {
    @IsString()
    @IsNotEmpty()
    metricId: string;
    
    @IsNumber()
    @Min(-1)
    @Max(1)
    correlation: number;
}

/**
 * Validation rules for metric values
 */
export class ValidationRules {
    @IsNumber()
    @IsOptional()
    min?: number;
    
    @IsNumber()
    @IsOptional()
    max?: number;
    
    @IsNumber()
    @IsOptional()
    step?: number;
    
    @IsArray()
    @IsOptional()
    allowedValues?: any[];
}

/**
 * Metric metadata for additional context
 */
export class MetricMetadata {
    @IsNumber()
    @IsOptional()
    previousValue?: number;
    
    @IsDate()
    @IsOptional()
    previousDate?: Date;
    
    @IsNumber()
    @IsOptional()
    changePercent?: number;
    
    @IsNumber()
    @IsOptional()
    movingAverage?: number;
    
    @IsNumber()
    @IsOptional()
    standardDeviation?: number;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MetricCorrelation)
    @IsOptional()
    relatedMetrics?: MetricCorrelation[];
    
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
    
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    conditions?: string[];
    
    @IsString()
    @IsOptional()
    device?: string;
    
    @IsString()
    @IsOptional()
    method?: string;
    
    @ValidateNested()
    @Type(() => ValidationRules)
    @IsOptional()
    validationRules?: ValidationRules;
}

/**
 * Entity for unified metric tracking across the application
 */
@Entity("metric_tracking")
@Index(["user", "category", "name"])
@Index(["exercise", "category"])
@Index(["workoutSession", "category"])
@Check(`"value" >= 0`)
export class MetricTracking {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    /**
     * User this metric belongs to
     */
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index()
    user: User;

    /**
     * Category of the metric
     */
    @Column({
        type: "enum",
        enum: MetricCategory
    })
    @IsEnum(MetricCategory)
    @Index()
    category: MetricCategory;

    /**
     * Name of the metric
     */
    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    name: string;

    /**
     * Type of value being tracked
     */
    @Column({
        type: "enum",
        enum: MetricValueType,
        default: MetricValueType.NUMERIC
    })
    @IsEnum(MetricValueType)
    valueType: MetricValueType;

    /**
     * Current value of the metric
     */
    @Column("float")
    @IsNumber()
    @Min(0)
    value: number;

    /**
     * Additional values for compound metrics
     */
    @Column("jsonb", { nullable: true })
    @IsOptional()
    compoundValues: {
        [key: string]: number;
    };

    /**
     * Unit of measurement (e.g., kg, cm, bpm)
     */
    @Column({ length: 20, nullable: true })
    @IsString()
    @IsOptional()
    unit: string;

    /**
     * Related exercise if this is an exercise-specific metric
     */
    @ManyToOne(() => Exercise, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "exercise_id" })
    @Index()
    @IsOptional()
    exercise: Exercise;

    /**
     * Related workout session if this is a session-specific metric
     */
    @ManyToOne(() => WorkoutSession, workoutSession => workoutSession.metrics)
    @JoinColumn({ name: "workout_session_id", referencedColumnName: "id" })
    workoutSession: WorkoutSession;

    @Column({ name: "workout_session_id" })
    @IsUUID()
    workoutSessionId: string = '';

    /**
     * When this metric was recorded
     */
    @Column({ type: "timestamp with time zone" })
    @IsDate()
    recordedAt: Date;

    /**
     * Source of the data (e.g., "manual_entry", "smartwatch", "scale")
     */
    @Column({ length: 50, nullable: true })
    @IsString()
    @IsOptional()
    source: string;

    /**
     * Notes about this specific measurement
     */
    @Column({ type: "text", nullable: true })
    @IsString()
    @IsOptional()
    notes: string;

    /**
     * Target value for this metric (for goal tracking)
     */
    @Column("float", { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    target: number;

    /**
     * Current trend of this metric
     */
    @Column({
        type: "enum",
        enum: TrendDirection,
        nullable: true
    })
    @IsEnum(TrendDirection)
    @IsOptional()
    trend: TrendDirection;

    /**
     * Whether this is a baseline measurement
     * Used for initial assessments or for tracking changes over time
     */
    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isBaseline: boolean;

    /**
     * Confidence score for the measurement (0-1)
     * For AI-predicted or estimated metrics
     */
    @Column("float", { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    confidence: number;

    /**
     * Additional metadata and context for the measurement
     */
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => MetricMetadata)
    @IsOptional()
    metadata: MetricMetadata;

    /**
     * Flag for metrics migrated from legacy systems
     */
    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isMigrated: boolean;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    legacyId: string;

    @Column({ type: "jsonb", nullable: true })
    @IsOptional()
    legacyData: any;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
    
    /**
     * Calculate the change percentage from a previous value
     * @param previousValue The value to compare against
     * @returns Percentage change
     */
    calculateChangePercentage(previousValue?: number): number {
        const prevValue = previousValue || this.metadata?.previousValue;
        if (!prevValue) return 0;
        
        return ModelUtils.normalize(
            ((this.value - prevValue) / prevValue) * 100,
            -100, 100
        );
    }
    
    /**
     * Determine if the current value meets the target
     * @returns Boolean indicating if target is met
     */
    isTargetMet(): boolean {
        if (!this.target) return false;
        
        // For metrics where lower is better (like weight loss)
        if (this.trend === TrendDirection.DECREASING) {
            return this.value <= this.target;
        }
        
        // For metrics where higher is better (like strength gains)
        return this.value >= this.target;
    }
    
    /**
     * Calculate progress percentage toward target
     * @param startValue Optional starting value (uses previousValue from metadata if not provided)
     * @returns Progress percentage (0-100)
     */
    calculateProgress(startValue?: number): number {
        if (!this.target) return 0;
        
        const start = startValue || this.metadata?.previousValue || 0;
        const current = this.value;
        
        // For metrics where lower is better
        if (this.trend === TrendDirection.DECREASING) {
            if (start <= this.target) return 100; // Already at or past target
            const range = start - this.target;
            const progress = start - current;
            return ModelUtils.normalize(
                (progress / range) * 100,
                0, 100
            );
        }
        
        // For metrics where higher is better
        if (this.target <= start) return 100; // Already at or past target
        const range = this.target - start;
        const progress = current - start;
        return ModelUtils.normalize(
            (progress / range) * 100,
            0, 100
        );
    }
}

/**
 * Interface for creating new metric tracking entries
 */
export interface MetricTrackingData {
    userId: string;
    category: MetricCategory;
    name: string;
    valueType?: MetricValueType;
    value: number;
    compoundValues?: {
        [key: string]: number;
    };
    unit?: string;
    exerciseId?: string;
    workoutSessionId?: string;
    recordedAt: Date;
    source?: string;
    notes?: string;
    target?: number;
    isBaseline?: boolean;
    confidence?: number;
    metadata?: MetricMetadata;
}

