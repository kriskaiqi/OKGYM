import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { Exercise } from "./Exercise";

/**
 * ExerciseDetails entity stores detailed analytics and form data for exercises
 * 
 * This entity captures granular data about exercise execution, including:
 * - Form analysis with scores and feedback
 * - Repetition data including timestamps and quality metrics
 * - Raw data from motion tracking systems
 * 
 * Relationships:
 * - ManyToOne with Exercise (each detail record belongs to one exercise)
 */
@Entity("exercise_details")
export class ExerciseDetails {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * Form analysis data including overall score and detailed breakdown
     */
    @Column("jsonb", { nullable: true })
    formAnalysis: {
        overallScore: number;
        keyPointScores?: {
            [keyPoint: string]: number;
        };
        angleScores?: {
            [joint: string]: number;
        };
        feedback?: string[];
        detectedIssues?: string[];
    };

    /**
     * Repetition tracking data including count, timing, and quality metrics
     */
    @Column("jsonb", { nullable: true })
    repData: {
        count: number;
        timestamps: number[];
        qualityScores: number[];
        invalidReps?: {
            timestamp: number;
            reason: string;
        }[];
    };

    /**
     * Confidence score for the analysis (0-1)
     */
    @Column("float", { nullable: true })
    confidenceScore: number;

    /**
     * Raw tracking data from motion capture
     */
    @Column("jsonb", { nullable: true })
    rawData: {
        keypoints?: any[];
        angles?: any[];
        trajectories?: any[];
        timestamps: number[];
    };

    /**
     * Timestamp when the exercise was analyzed
     */
    @Column("timestamp", { nullable: true })
    analyzedAt: Date;

    /**
     * The exercise this detail record belongs to
     * When the exercise is deleted, all its detail records will be deleted
     */
    @ManyToOne(() => Exercise, exercise => exercise.details, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "exercise_id" })
    @Index("idx_fk_exercisedetails_exercise")
    exercise: Exercise;

    /**
     * Foreign key to the parent exercise
     */
    @Column("uuid")
    @Index("idx_exercisedetails_exercise_id")
    exercise_id: string;

    /**
     * Timestamp when the record was created
     */
    @CreateDateColumn()
    created_at: Date;

    /**
     * Timestamp when the record was last updated
     */
    @UpdateDateColumn()
    updated_at: Date;
} 