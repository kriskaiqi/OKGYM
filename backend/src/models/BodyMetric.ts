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
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { 
    BodyArea, 
    MetricValueType, 
    MeasurementUnit,
    TrendDirection
} from "./shared/Enums";
import * as ModelUtils from "./shared/Utils";

/**
 * Metadata for body metrics with additional context
 */
export class BodyMetricMetadata {
    @IsNumber()
    @IsOptional()
    previousValue?: number;
    
    @IsDate()
    @IsOptional()
    previousDate?: Date;
    
    @IsNumber()
    @IsOptional()
    changeAmount?: number;
    
    @IsNumber()
    @IsOptional()
    changePercent?: number;
    
    @IsString()
    @IsOptional()
    device?: string;
    
    @IsString()
    @IsOptional()
    method?: string;
    
    @IsString()
    @IsOptional()
    notes?: string;
    
    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    confidence?: number;
}

/**
 * Entity for tracking user body measurements
 */
@Entity("body_metrics")
@Check(`"value" >= 0`)
export class BodyMetric {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    /**
     * User this measurement belongs to
     */
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index()
    user: User;

    /**
     * Body area being measured
     */
    @Column({
        type: "enum",
        enum: BodyArea
    })
    @IsEnum(BodyArea)
    @Index()
    bodyArea: BodyArea;

    /**
     * Type of value being stored
     */
    @Column({
        type: "enum",
        enum: MetricValueType,
        default: MetricValueType.NUMERIC
    })
    @IsEnum(MetricValueType)
    valueType: MetricValueType;

    /**
     * Measurement value
     */
    @Column("float")
    @IsNumber()
    @Min(0)
    value: number;

    /**
     * Unit of measurement (e.g., kg, cm, %)
     */
    @Column({
        type: "enum",
        enum: MeasurementUnit,
        default: MeasurementUnit.KILOGRAM
    })
    @IsEnum(MeasurementUnit)
    unit: MeasurementUnit;

    /**
     * When this measurement was taken
     */
    @Column({ type: "timestamp with time zone" })
    @IsDate()
    measurementDate: Date;

    /**
     * Target value for this metric (for goal tracking)
     */
    @Column("float", { nullable: true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    targetValue: number;

    /**
     * Desired trend direction
     */
    @Column({
        type: "enum",
        enum: TrendDirection,
        nullable: true
    })
    @IsEnum(TrendDirection)
    @IsOptional()
    desiredTrend: TrendDirection;

    /**
     * Additional metadata and context
     */
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => BodyMetricMetadata)
    @IsOptional()
    metadata: BodyMetricMetadata;

    /**
     * Source of the measurement (e.g., "manual", "smart_scale", "imported")
     */
    @Column({ length: 50, nullable: true })
    @IsString()
    @IsOptional()
    source: string;

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
        if (!this.targetValue) return false;
        
        // For metrics where lower is better (like weight loss)
        if (this.desiredTrend === TrendDirection.DECREASING) {
            return this.value <= this.targetValue;
        }
        
        // For metrics where higher is better (like muscle gains)
        return this.value >= this.targetValue;
    }
    
    /**
     * Calculate progress percentage toward target
     * @param startValue Optional starting value (uses previousValue from metadata if not provided)
     * @returns Progress percentage (0-100)
     */
    calculateProgress(startValue?: number): number {
        if (!this.targetValue) return 0;
        
        const start = startValue || this.metadata?.previousValue || 0;
        const current = this.value;
        
        // For metrics where lower is better
        if (this.desiredTrend === TrendDirection.DECREASING) {
            if (start <= this.targetValue) return 100; // Already at or past target
            const range = start - this.targetValue;
            const progress = start - current;
            return ModelUtils.normalize(
                (progress / range) * 100,
                0, 100
            );
        }
        
        // For metrics where higher is better
        if (this.targetValue <= start) return 100; // Already at or past target
        const range = this.targetValue - start;
        const progress = current - start;
        return ModelUtils.normalize(
            (progress / range) * 100,
            0, 100
        );
    }
}

/**
 * Interface for creating new body metrics
 */
export interface BodyMetricData {
    userId: string;
    bodyArea: BodyArea;
    valueType?: MetricValueType;
    value: number;
    unit: MeasurementUnit;
    measurementDate: Date;
    targetValue?: number;
    desiredTrend?: TrendDirection;
    metadata?: BodyMetricMetadata;
    source?: string;
} 