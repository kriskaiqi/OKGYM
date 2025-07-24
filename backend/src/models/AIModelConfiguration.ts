import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { ExerciseAnalysisType } from "./ExerciseSpecificAnalysis";
import { FeedbackSeverity } from "./ExerciseFormAnalysis";

/**
 * Enum for AI model types
 */
export enum AIModelType {
    SKLEARN = "SKLEARN",
    DEEP_LEARNING = "DEEP_LEARNING"
}

/**
 * Entity for AI model configuration
 * Stores configuration and parameters for different exercise analysis models
 */
@Entity("ai_model_configuration")
@Index("idx_model_config_type", ["exerciseType", "modelType"])
export class AIModelConfiguration {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * Type of exercise this model analyzes
     */
    @Column({
        type: "enum",
        enum: ExerciseAnalysisType,
        nullable: false
    })
    @Index("idx_model_config_exercise_type")
    exerciseType: ExerciseAnalysisType;

    /**
     * Type of AI model used
     */
    @Column({
        type: "enum",
        enum: AIModelType,
        nullable: false
    })
    @Index("idx_model_config_model_type")
    modelType: AIModelType;

    /**
     * Model parameters and configuration
     */
    @Column({ type: "jsonb", nullable: false })
    modelParameters: {
        version: string;
        thresholds: Record<string, number>;
        landmarks: string[];
        preprocessing: {
            scaling: boolean;
            normalization: boolean;
        };
    };

    /**
     * Rules for analyzing exercise form
     */
    @Column({ type: "jsonb", nullable: false })
    analysisRules: {
        stages: Array<{
            name: string;
            conditions: Record<string, any>;
        }>;
        errors: Array<{
            type: string;
            conditions: Record<string, any>;
            severity: FeedbackSeverity;
        }>;
    };

    /**
     * Additional configuration metadata
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        description?: string;
        lastUpdated?: Date;
        performance?: {
            accuracy?: number;
            processingTime?: number;
            confidence?: number;
        };
        dependencies?: string[];
        requirements?: {
            minFPS?: number;
            resolution?: {
                width: number;
                height: number;
            };
        };
    };

    /**
     * Whether this configuration is currently active
     */
    @Column({ type: "boolean", default: true })
    @Index("idx_model_config_active")
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
} 