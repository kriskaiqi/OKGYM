import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToOne
} from "typeorm";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { WorkoutSession } from "./WorkoutSession";
import { MetricTracking } from "./MetricTracking";
import { Media } from "./Media";
import { IsUUID } from "class-validator";

/**
 * Enum for feedback severity levels
 */
export enum FeedbackSeverity {
    INFO = "INFO",           // Just informational
    SUGGESTION = "SUGGESTION", // Suggested improvement
    WARNING = "WARNING",     // Potential for minor issues
    CRITICAL = "CRITICAL"    // High risk of injury
}

/**
 * Enum for body position states during exercise
 */
export enum BodyPositionState {
    CORRECT = "CORRECT",
    NEEDS_ADJUSTMENT = "NEEDS_ADJUSTMENT",
    INCORRECT = "INCORRECT"
}

/**
 * Entity for form corrections or insights for a specific body part
 * 
 * Relationships:
 * - ManyToOne with ExerciseFormAnalysis (the parent analysis)
 * - ManyToOne with Media (image representation of the correction)
 */
@Entity("form_correction_points")
export class FormCorrectionPoint {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * The form analysis this correction belongs to
     * When the parent analysis is deleted, all its correction points will be deleted
     */
    @ManyToOne("ExerciseFormAnalysis", {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "analysis_id" })
    @Index("idx_fk_formcorrection_analysis")
    analysis: any; // Temporarily use any to avoid circular references

    @Column("uuid")
    @Index("idx_formcorrection_analysis_id")
    analysis_id: string;

    /**
     * Timestamp within the exercise when this was detected
     */
    @Column({ type: "float" })
    timeOffset: number;

    /**
     * Body part or joint this correction applies to
     */
    @Column({ length: 50 })
    @Index("idx_formcorrection_bodypart")
    bodyPart: string;

    /**
     * Current position state
     */
    @Column({
        type: "enum",
        enum: BodyPositionState,
        default: BodyPositionState.NEEDS_ADJUSTMENT
    })
    @Index("idx_formcorrection_state")
    state: BodyPositionState;
    
    /**
     * Detected angle value (if applicable)
     */
    @Column({ type: "float", nullable: true })
    detectedAngle: number;
    
    /**
     * Target/ideal angle value (if applicable)
     */
    @Column({ type: "float", nullable: true })
    targetAngle: number;
    
    /**
     * Severity of the issue
     */
    @Column({
        type: "enum",
        enum: FeedbackSeverity,
        default: FeedbackSeverity.SUGGESTION
    })
    @Index("idx_formcorrection_severity")
    severity: FeedbackSeverity;

    /**
     * Feedback message for the user
     */
    @Column({ type: "text" })
    message: string;

    /**
     * Suggested action to correct the form
     */
    @Column({ type: "text" })
    correctionInstruction: string;
    
    /**
     * Image showing the correction
     * When the media is deleted, this reference will be set to null
     */
    @ManyToOne(() => Media, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "image_media_id" })
    @Index("idx_fk_formcorrection_image")
    image: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_formcorrection_image_id")
    image_media_id: string;

    @Column({ type: "jsonb", nullable: true })
    metadata: {
        confidence?: number;
        jointCoordinates?: Record<string, number[]>;
        referenceImageUrl?: string;
        relatedBodyParts?: string[];
        aiConfidence?: number;
        additionalVisualizationData?: any;
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}

/**
 * Main entity for exercise form analysis
 * 
 * Relationships:
 * - ManyToOne with User (user performing the exercise)
 * - ManyToOne with Exercise (exercise being analyzed)
 * - ManyToOne with WorkoutSession (session this analysis belongs to)
 * - ManyToOne with Media (video recording of the exercise)
 * - OneToMany with FormCorrectionPoint (individual form correction points)
 * - OneToOne with MetricTracking (metrics tracking for this analysis)
 */
@Entity("exercise_form_analysis")
@Index("idx_analysis_user_exercise", ["user_id", "exercise_id"])
@Index("idx_analysis_performance", ["performedAt", "overallScore"])
export class ExerciseFormAnalysis {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    /**
     * User performing the exercise
     * When the user is deleted, their form analyses will be deleted
     */
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_formanalysis_user")
    user: User;

    @Column("uuid")
    @Index("idx_formanalysis_user_id")
    user_id: string;

    /**
     * Exercise being performed
     * When the exercise is deleted, all its form analyses will be deleted
     */
    @ManyToOne(() => Exercise, { 
        nullable: false,
        onDelete: "CASCADE" 
    })
    @JoinColumn({ name: "exercise_id" })
    @Index("idx_fk_formanalysis_exercise")
    exercise: Exercise;

    @Column("uuid")
    @Index("idx_formanalysis_exercise_id")
    exercise_id: string;

    /**
     * Workout session this analysis is part of (optional)
     * When the session is deleted, this reference will be set to null
     */
    @ManyToOne(() => WorkoutSession, workoutSession => workoutSession.formAnalysis)
    @JoinColumn({ name: "workout_session_id", referencedColumnName: "id" })
    workoutSession: WorkoutSession;

    @Column({ name: "workout_session_id" })
    @IsUUID()
    workoutSessionId: string = '';

    /**
     * Type of analysis performed
     */
    @Column({ length: 50 })
    @Index("idx_formanalysis_type")
    analysisType: string;

    /**
     * When the exercise was performed
     */
    @Column({ type: "timestamp" })
    @Index("idx_formanalysis_date")
    performedAt: Date;

    /**
     * Duration of the exercise in seconds
     */
    @Column({ type: "float" })
    durationSeconds: number;

    /**
     * Number of repetitions detected
     */
    @Column({ type: "integer" })
    repetitionsDetected: number;

    /**
     * Number of repetitions with good form
     */
    @Column({ type: "integer" })
    goodFormRepetitions: number;

    /**
     * Video recording of the exercise
     * When the media is deleted, this reference will be set to null
     */
    @ManyToOne(() => Media, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "video_media_id" })
    @Index("idx_fk_formanalysis_video")
    video: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_formanalysis_video_id")
    video_media_id: string;

    /**
     * Overall form quality score (0-100)
     */
    @Column({ type: "integer" })
    @Index("idx_formanalysis_score")
    overallScore: number;

    /**
     * Summary of the analysis
     */
    @Column({ type: "text" })
    summary: string;

    /**
     * Individual correction points
     * When the analysis is deleted, all its correction points will be deleted
     */
    @OneToMany(() => FormCorrectionPoint, (point: FormCorrectionPoint) => point.analysis, {
        cascade: ["insert", "update", "remove"],
        eager: true
    })
    correctionPoints: FormCorrectionPoint[];

    /**
     * Whether the user has viewed this analysis
     */
    @Column({ type: "boolean", default: false })
    @Index("idx_formanalysis_viewed")
    isViewed: boolean;

    /**
     * Whether the user has dismissed/archived this analysis
     */
    @Column({ type: "boolean", default: false })
    @Index("idx_formanalysis_dismissed")
    isDismissed: boolean;

    /**
     * Link to metric tracking for this analysis
     * When the analysis is deleted, the related metric tracking will be deleted
     */
    @OneToOne(() => MetricTracking, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "metric_tracking_id" })
    @Index("idx_fk_formanalysis_metric")
    metricTracking: MetricTracking;

    @Column("uuid", { nullable: true })
    @Index("idx_formanalysis_metric_id")
    metric_tracking_id: string;

    /**
     * Consolidated AI and analysis data
     */
    @Column({ type: "jsonb", nullable: true })
    analysisData: {
        // AI Model Info
        model: {
            version: string;
            type: "SKLEARN" | "DEEP_LEARNING";
            confidence: number;
            processingTime: number;
            keypoints: Record<string, number[]>;
        };
        
        // Exercise Metrics
        metrics: {
            angles: Record<string, number[]>;
            ratios: Record<string, number[]>;
            stages: {
                current: string;
                history: Array<{
                    stage: string;
                    timestamp: number;
                    confidence: number;
                }>;
            };
            rangeOfMotion?: {
                achieved: number;
                target: number;
                percentage: number;
            };
            tempo?: {
                concentric: number;
                eccentric: number;
                isConsistent: boolean;
            };
            stability?: {
                score: number;
                issues: string[];
            };
        };

        // Error Analysis
        errors: {
            items: Array<{
                type: string;
                severity: FeedbackSeverity;
                timestamp: number;
                confidence: number;
                metrics: Record<string, number>;
                message: string;
                correctionInstruction: string;
            }>;
            summary: {
                totalErrors: number;
                errorTypes: Record<string, number>;
                severityDistribution: Record<FeedbackSeverity, number>;
            };
        };
    };

    /**
     * Additional metadata for the analysis
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        deviceInfo?: {
            type: string;
            position: string;
            cameraResolution?: string;
        };
        environmentalFactors?: {
            lighting: string;
            space: string;
            obstructions: string[];
        };
        movementBreakdown?: {
            phases: Array<{
                name: string;
                timeRange: [number, number];
                qualityScore: number;
                notes: string;
            }>;
        };
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Interface for creating form analysis
 */
export interface ExerciseFormAnalysisData {
    userId: string;
    exerciseId: string;
    workoutSessionId?: string;
    analysisType: string;
    performedAt: Date;
    durationSeconds: number;
    repetitionsDetected: number;
    goodFormRepetitions: number;
    videoMediaId?: string;
    overallScore: number;
    summary: string;
    correctionPoints?: Array<{
        timeOffset: number;
        bodyPart: string;
        state: BodyPositionState;
        detectedAngle?: number;
        targetAngle?: number;
        severity: FeedbackSeverity;
        message: string;
        correctionInstruction: string;
        imageMediaId?: string;
        metadata?: {
            confidence?: number;
            jointCoordinates?: Record<string, number[]>;
            referenceImageUrl?: string;
            relatedBodyParts?: string[];
            aiConfidence?: number;
        };
    }>;
    metadata?: {
        deviceInfo?: {
            type: string;
            position: string;
            cameraResolution?: string;
        };
        environmentalFactors?: {
            lighting: string;
            space: string;
            obstructions: string[];
        };
        movementBreakdown?: {
            phases: Array<{
                name: string;
                timeRange: [number, number];
                qualityScore: number;
                notes: string;
            }>;
        };
    };
    analysisData?: {
        model?: {
            version: string;
            type: "SKLEARN" | "DEEP_LEARNING";
            confidence: number;
            processingTime: number;
            keypoints: Record<string, number[]>;
        };
        metrics?: {
            angles: Record<string, number[]>;
            ratios: Record<string, number[]>;
            stages: {
                current: string;
                history: Array<{
                    stage: string;
                    timestamp: number;
                    confidence: number;
                }>;
            };
            rangeOfMotion?: {
                achieved: number;
                target: number;
                percentage: number;
            };
            tempo?: {
                concentric: number;
                eccentric: number;
                isConsistent: boolean;
            };
            stability?: {
                score: number;
                issues: string[];
            };
        };
        errors?: {
            items: Array<{
                type: string;
                severity: FeedbackSeverity;
                timestamp: number;
                confidence: number;
                metrics: Record<string, number>;
                message: string;
                correctionInstruction: string;
            }>;
            summary: {
                totalErrors: number;
                errorTypes: Record<string, number>;
                severityDistribution: Record<FeedbackSeverity, number>;
            };
        };
    };
} 