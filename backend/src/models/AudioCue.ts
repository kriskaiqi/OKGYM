import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { IsEnum, IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsUUID, ValidateNested, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { WorkoutPlan } from "./WorkoutPlan";
import { AudioCueType, AudioCueTrigger } from "./shared/Enums";

/**
 * Entity for audio cues with voice guidance
 * 
 * Relationships:
 * - ManyToOne with Exercise (audio cues can be associated with specific exercises)
 * - ManyToMany with WorkoutPlan (audio cues can be used in multiple workout plans)
 * - ManyToOne with User (the creator of the audio cue)
 */
@Entity("audio_cues")
export class AudioCue {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    /**
     * Name/title of the audio cue
     */
    @Column({ length: 100 })
    @IsString()
    name: string;

    /**
     * Type of audio cue
     */
    @Column({
        type: "enum",
        enum: AudioCueType
    })
    @IsEnum(AudioCueType)
    @Index()
    type: AudioCueType;

    /**
     * Trigger mechanism
     */
    @Column({
        type: "enum",
        enum: AudioCueTrigger
    })
    @IsEnum(AudioCueTrigger)
    trigger: AudioCueTrigger;

    /**
     * Text content of the cue
     */
    @Column({ type: "text" })
    script: string;

    /**
     * URL to the pre-recorded audio file
     */
    @Column({ length: 255, nullable: true })
    audioUrl: string;

    /**
     * Duration of the audio in seconds
     */
    @Column({ type: "float", nullable: true })
    durationSeconds: number;

    /**
     * Trigger timing for time-based cues (seconds into workout/exercise)
     */
    @Column({ type: "float", nullable: true })
    triggerTime: number;

    /**
     * Trigger repetition for rep-based cues
     */
    @Column({ type: "integer", nullable: true })
    triggerRepetition: number;

    /**
     * For event-based cues: the event that triggers this cue
     */
    @Column({ length: 100, nullable: true })
    triggerEvent: string;

    /**
     * Volume level (0-100)
     */
    @Column({ type: "integer", default: 80 })
    volume: number;

    /**
     * Voice type/gender
     */
    @Column({ length: 50, default: "neutral" })
    voiceType: string;

    /**
     * Language of the cue
     */
    @Column({ length: 50, default: "English" })
    language: string;

    /**
     * Whether this cue is enabled
     */
    @Column({ type: "boolean", default: true })
    isEnabled: boolean;

    /**
     * Whether to vibrate device along with audio
     */
    @Column({ type: "boolean", default: false })
    includeVibration: boolean;

    /**
     * Priority level (higher priority cues interrupt lower ones)
     */
    @Column({ type: "integer", default: 5 })
    priority: number;

    /**
     * Exercise this cue is associated with (if any)
     * When the exercise is deleted, this cue's exercise reference will be set to null
     */
    @ManyToOne(() => Exercise, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "exercise_id" })
    @Index("idx_fk_audiocue_exercise")
    exercise: Exercise;

    @Column({ nullable: true })
    @Index("idx_audiocue_exercise_id")
    exercise_id: string;

    /**
     * Workout plans this cue is associated with
     * Audio cues can be associated with multiple workout plans
     * When this cue is deleted, the association with workout plans will be removed
     */
    @ManyToMany(() => WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "workout_audio_cues",
        joinColumn: { name: "cue_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    })
    workoutPlans: WorkoutPlan[];

    /**
     * Creator of the audio cue
     * When the creator is deleted, the creator reference will be set to null
     */
    @ManyToOne(() => User, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "created_by" })
    @Index("idx_fk_audiocue_creator")
    createdBy: User;

    @Column({ nullable: true })
    @Index("idx_audiocue_created_by")
    created_by: string;

    /**
     * Whether this is a system default cue
     */
    @Column({ type: "boolean", default: false })
    isSystemDefault: boolean;

    /**
     * Whether this is a premium cue (requires subscription)
     */
    @Column({ type: "boolean", default: false })
    isPremium: boolean;

    /**
     * Additional data as JSON
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        specificMuscleGroups?: string[];
        specificMovements?: string[];
        formCriteria?: {
            targetJoint?: string;
            condition?: string;
            threshold?: number;
        };
        alternateScripts?: Record<string, string>;
        tags?: string[];
        categoryIds?: string[];
        relatedCueIds?: string[];
        intensity?: string;
        tone?: string;
        isBackgroundMusic?: boolean;
        backgroundMusicUrl?: string;
        visualCue?: {
            enabled: boolean;
            imageUrl?: string;
            textColor?: string;
            backgroundColor?: string;
        };
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Interface for creating audio cues
 */
export interface AudioCueData {
    name: string;
    type: AudioCueType;
    trigger: AudioCueTrigger;
    script: string;
    audioUrl?: string;
    durationSeconds?: number;
    triggerTime?: number;
    triggerRepetition?: number;
    triggerEvent?: string;
    volume?: number;
    voiceType?: string;
    language?: string;
    isEnabled?: boolean;
    includeVibration?: boolean;
    priority?: number;
    exerciseId?: string;
    workoutPlanIds?: string[];
    createdById?: string;
    isSystemDefault?: boolean;
    isPremium?: boolean;
    metadata?: {
        specificMuscleGroups?: string[];
        specificMovements?: string[];
        formCriteria?: {
            targetJoint?: string;
            condition?: string;
            threshold?: number;
        };
        alternateScripts?: Record<string, string>;
        tags?: string[];
        categoryIds?: string[];
        relatedCueIds?: string[];
        intensity?: string;
        tone?: string;
        isBackgroundMusic?: boolean;
        backgroundMusicUrl?: string;
        visualCue?: {
            enabled: boolean;
            imageUrl?: string;
            textColor?: string;
            backgroundColor?: string;
        };
    };
} 