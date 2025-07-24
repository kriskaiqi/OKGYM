import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { ExerciseFormAnalysis } from "./ExerciseFormAnalysis";

/**
 * Enum for exercise types that have specific analysis
 */
export enum ExerciseAnalysisType {
    SQUAT = "SQUAT",
    PLANK = "PLANK",
    LUNGE = "LUNGE",
    BICEP_CURL = "BICEP_CURL"
}

/**
 * Entity for exercise-specific form analysis
 * 
 * Relationships:
 * - ManyToOne with ExerciseFormAnalysis (the parent analysis)
 */
@Entity("exercise_specific_analysis")
@Index("idx_specific_analysis_type", ["exerciseType"])
export class ExerciseSpecificAnalysis {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * The form analysis this specific analysis belongs to
     * When the parent analysis is deleted, this specific analysis will be deleted
     */
    @ManyToOne(() => ExerciseFormAnalysis, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "analysis_id" })
    @Index("idx_fk_specificanalysis_parent")
    analysis: ExerciseFormAnalysis;

    @Column("uuid")
    @Index("idx_specificanalysis_analysis_id")
    analysis_id: string;

    /**
     * Type of exercise being analyzed
     */
    @Column({
        type: "enum",
        enum: ExerciseAnalysisType,
        nullable: false
    })
    @Index("idx_specificanalysis_exercise_type")
    exerciseType: ExerciseAnalysisType;

    /**
     * Exercise-specific analysis data
     */
    @Column({ type: "jsonb", nullable: true })
    analysisData: {
        // Squat Analysis
        squat?: {
            footPlacement: {
                ratio: number;
                status: "CORRECT" | "TOO_TIGHT" | "TOO_WIDE";
            };
            kneePlacement: {
                ratio: number;
                status: "CORRECT" | "TOO_TIGHT" | "TOO_WIDE";
            };
            depth: {
                current: number;
                target: number;
                status: "CORRECT" | "TOO_HIGH" | "TOO_LOW";
            };
        };

        // Plank Analysis
        plank?: {
            backAlignment: {
                angle: number;
                status: "CORRECT" | "HIGH" | "LOW";
            };
            hipHeight: {
                ratio: number;
                status: "CORRECT" | "TOO_HIGH" | "TOO_LOW";
            };
        };

        // Lunge Analysis
        lunge?: {
            kneeAlignment: {
                angle: number;
                status: "CORRECT" | "OVER_TOE" | "BEHIND_TOE";
            };
            depth: {
                ratio: number;
                status: "CORRECT" | "TOO_SHALLOW" | "TOO_DEEP";
            };
        };

        // Bicep Analysis
        bicep?: {
            upperArmPosition: {
                angle: number;
                status: "CORRECT" | "LOOSE";
            };
            peakContraction: {
                angle: number;
                status: "CORRECT" | "INSUFFICIENT";
            };
            rangeOfMotion: {
                min: number;
                max: number;
                status: "CORRECT" | "LIMITED";
            };
        };
    };

    /**
     * Additional metadata for the analysis
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        confidence?: number;
        processingTime?: number;
        modelVersion?: string;
        keypoints?: Record<string, number[]>;
        additionalData?: any;
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
} 