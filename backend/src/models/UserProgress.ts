import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    OneToOne
} from 'typeorm';
import { User } from './User';
import { MetricTracking } from './MetricTracking';

/**
 * @deprecated Use MetricTracking with appropriate category instead
 * Progress tracking types
 */
export enum ProgressType {
    STRENGTH = "STRENGTH",
    ENDURANCE = "ENDURANCE",
    FLEXIBILITY = "FLEXIBILITY",
    BODY_COMPOSITION = "BODY_COMPOSITION",
    WEIGHT = "WEIGHT",
    SKILL = "SKILL",
    WORKOUT_VOLUME = "WORKOUT_VOLUME",
    CONSISTENCY = "CONSISTENCY",
    NUTRITION = "NUTRITION",
    SLEEP = "SLEEP",
    CUSTOM = "CUSTOM"
}

/**
 * @deprecated Use MetricTracking's trend direction instead
 * Progress trend states
 */
export enum ProgressTrend {
    IMPROVING = "IMPROVING",
    MAINTAINING = "MAINTAINING",
    DECLINING = "DECLINING",
    PLATEAU = "PLATEAU",
    INCONSISTENT = "INCONSISTENT"
}

/**
 * @deprecated Use MetricTracking instead
 * UserProgress entity represents tracked progress metrics for a user
 * Designed for time-series tracking of various fitness metrics
 * 
 * Relationships:
 * - ManyToOne with User (the user whose progress is being tracked)
 * - OneToOne with MetricTracking (modern replacement for this entity)
 */
@Entity("user_progress")
@Index("idx_userprogress_metric_date", ["metricName", "date"])
@Index("idx_userprogress_type_user", ["type", "user_id"])
export class UserProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * User whose progress is being tracked
     * When the user is deleted, their progress records will be deleted
     */
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_userprogress_user")
    user: User;

    @Column("uuid")
    @Index("idx_userprogress_user_id") 
    user_id: string;

    /**
     * Link to the new metric tracking system
     * When this progress is deleted, the linked metric tracking should be deleted
     */
    @OneToOne(() => MetricTracking, { 
        nullable: true,
        onDelete: "CASCADE",
        cascade: true 
    })
    @JoinColumn({ name: "metric_tracking_id" })
    @Index("idx_fk_userprogress_metric")
    metricTracking: MetricTracking;

    @Column("uuid", { nullable: true })
    @Index("idx_userprogress_metric_id")
    metric_tracking_id: string;

    @Column({
        type: "enum",
        enum: ProgressType,
        default: ProgressType.CUSTOM
    })
    @Index("idx_userprogress_type")
    type: ProgressType;

    @Column("varchar")
    @Index("idx_userprogress_metric_name")
    metricName: string; // e.g., "Bench Press 1RM", "5K Run Time", "Daily Steps"

    @Column("date")
    @Index("idx_userprogress_date") 
    date: Date;

    @Column("float")
    value: number;

    @Column({ nullable: true })
    unit: string; // e.g., "kg", "minutes", "cm", "steps"

    @Column({ nullable: true })
    @Index("idx_userprogress_exercise")
    exerciseId: string; // Reference to specific exercise if applicable

    @Column("float", { nullable: true })
    baseline: number; // Initial value when tracking began

    @Column("float", { nullable: true })
    target: number; // Target value if applicable

    @Column("float", { default: 0 })
    percentChange: number; // Percent change from previous recording

    @Column({
        type: "enum",
        enum: ProgressTrend,
        nullable: true
    })
    trend: ProgressTrend; // Calculated trend based on history

    @Column({ nullable: true })
    previousDate: Date; // Date of previous recording for this metric

    @Column("float", { nullable: true })
    previousValue: number; // Previous recorded value for this metric

    @Column("jsonb", { nullable: true })
    relatedMetrics: {
        influencingMetrics?: Array<{
            metricId: string;
            correlation: number; // -1.0 to 1.0
        }>;
        dependentMetrics?: string[]; // Metrics affected by this one
    };

    @Column("jsonb", { nullable: true })
    context: {
        workoutSessionId?: string;
        workoutPlanId?: number;
        notes?: string;
        factors?: Array<{
            name: string; // e.g., "Sleep Quality", "Nutrition", "Stress"
            value: number; // Rating or value
            impact: number; // -5 to 5 impact rating
        }>;
        tags?: string[];
    };

    @Column("jsonb", { nullable: true })
    analysis: {
        shortTermTrend?: number; // 7-day rate of change
        longTermTrend?: number; // 30-day rate of change
        volatility?: number; // Measure of consistency
        seasonality?: boolean; // Whether metric shows regular patterns
        plateauDuration?: number; // Days since significant change
        correlationToGoals?: number; // How this relates to user goals
        insights?: string[]; // Auto-generated insights
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * Data structure for recording new progress
 */
export interface UserProgressData {
    userId: string;
    type: ProgressType;
    metricName: string;
    date: Date;
    value: number;
    unit?: string;
    exerciseId?: string;
    baseline?: number;
    target?: number;
    context?: {
        workoutSessionId?: string;
        workoutPlanId?: number;
        notes?: string;
        factors?: Array<{
            name: string;
            value: number;
            impact: number;
        }>;
        tags?: string[];
    };
} 