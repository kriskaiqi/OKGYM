import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    ManyToMany,
    JoinTable
} from "typeorm";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { WorkoutSession } from "./WorkoutSession";
import { Exercise } from "./Exercise";
import * as ModelUtils from "./shared/Utils";

/**
 * Achievement categories
 */
export enum AchievementCategory {
    MILESTONE = "MILESTONE",          // Based on accumulated counts (e.g., 100 workouts)
    PERFORMANCE = "PERFORMANCE",      // Based on performance metrics (e.g., 100kg bench press)
    CONSISTENCY = "CONSISTENCY",      // Based on regular activity (e.g., 30 day streak)
    EXPLORER = "EXPLORER",            // Based on trying new things (e.g., 10 different exercises)
    IMPROVEMENT = "IMPROVEMENT",      // Based on personal improvement (e.g., 10% strength increase)
    CHALLENGE = "CHALLENGE",          // Based on completing specific challenges
    SOCIAL = "SOCIAL",                // Based on social interactions (e.g., 5 workout buddies)
    SPECIAL = "SPECIAL"               // Special event or seasonal achievements
}

/**
 * Achievement tiers for progression
 */
export enum AchievementTier {
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
    PLATINUM = "PLATINUM",
    DIAMOND = "DIAMOND",
    MASTER = "MASTER"
}

/**
 * Types of achievement criteria
 */
export enum AchievementCriteriaType {
    COUNT = "COUNT",                  // Simple counting criteria
    STREAK = "STREAK",                // Consecutive occurrences
    THRESHOLD = "THRESHOLD",          // Meeting a specific value
    PERCENTAGE = "PERCENTAGE",        // Meeting a percentage-based target
    COMPLETION = "COMPLETION",        // Completing something specific
    MULTI_CRITERIA = "MULTI_CRITERIA" // Multiple requirements
}

/**
 * Achievement progress data
 */
export class AchievementProgress {
    @IsNumber()
    @Min(0)
    current: number;
    
    @IsNumber()
    @Min(0)
    required: number;
    
    @IsOptional()
    @IsString()
    unit?: string;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    lastIncremented?: number;
    
    @IsDate()
    @IsOptional()
    startDate?: Date;
}

/**
 * Achievement reward data
 */
export class AchievementReward {
    @IsNumber()
    @IsOptional()
    points?: number;
    
    @IsString()
    @IsOptional()
    badge?: string;
    
    @IsBoolean()
    @IsOptional()
    unlockFeature?: boolean;
    
    @IsString()
    @IsOptional()
    featureId?: string;
}

/**
 * Entity for tracking user achievements and gamification
 */
@Entity("achievement")
export class Achievement {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    /**
     * Short name for the achievement
     */
    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    name: string;

    /**
     * Description of what the achievement represents
     */
    @Column({ type: "text" })
    @IsString()
    @IsNotEmpty()
    description: string;

    /**
     * Category that this achievement belongs to
     */
    @Column({
        type: "enum",
        enum: AchievementCategory
    })
    @IsEnum(AchievementCategory)
    category: AchievementCategory;

    /**
     * Tier/level of the achievement
     */
    @Column({
        type: "enum",
        enum: AchievementTier
    })
    @IsEnum(AchievementTier)
    tier: AchievementTier;

    /**
     * Value points for this achievement
     */
    @Column({ type: "integer", default: 10 })
    @IsNumber()
    @Min(0)
    points: number;

    /**
     * Path to the badge icon
     */
    @Column({ length: 255, nullable: true })
    @IsString()
    @IsOptional()
    icon: string;

    /**
     * Type of criteria used to unlock the achievement
     */
    @Column({
        type: "enum",
        enum: AchievementCriteriaType
    })
    @IsEnum(AchievementCriteriaType)
    criteriaType: AchievementCriteriaType;

    /**
     * Criteria description in human-readable form
     */
    @Column({ type: "text" })
    @IsString()
    @IsNotEmpty()
    criteriaDescription: string;

    /**
     * Current progress toward achievement
     */
    @Column({ type: "jsonb" })
    @ValidateNested()
    @Type(() => AchievementProgress)
    progress: AchievementProgress;

    /**
     * Rules for calculating progress
     */
    @Column({ type: "jsonb", nullable: true })
    @IsOptional()
    progressRules: any;

    /**
     * Formula/rule for calculating achievement completion
     */
    @Column({ type: "text", nullable: true })
    @IsString()
    @IsOptional()
    progressionFormula: string;

    /**
     * Related achievements that are prerequisites
     */
    @ManyToMany(() => Achievement)
    @JoinTable({
        name: "achievement_prerequisites",
        joinColumn: { name: "achievement_id" },
        inverseJoinColumn: { name: "prerequisite_id" }
    })
    prerequisites: Achievement[];

    /**
     * Rewards granted upon completion
     */
    @Column({ type: "jsonb", nullable: true })
    @ValidateNested()
    @Type(() => AchievementReward)
    @IsOptional()
    rewards: AchievementReward;

    /**
     * Reference to the user if this is a user-specific instance
     */
    @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index()
    @IsOptional()
    user: User;

    /**
     * Related exercise if this is an exercise-specific achievement
     */
    @ManyToOne(() => Exercise, { nullable: true })
    @JoinColumn({ name: "exercise_id" })
    @Index()
    @IsOptional()
    exercise: Exercise;

    /**
     * Related workout session if this is a session-specific achievement
     */
    @ManyToOne(() => WorkoutSession, workoutSession => workoutSession.achievements, { nullable: true })
    @JoinColumn({ name: "workout_session_id", referencedColumnName: "id" })
    @IsOptional()
    workoutSession: WorkoutSession;

    @Column({ name: "workout_session_id" })
    @IsUUID()
    workoutSessionId: string = '';

    /**
     * Flag indicating if the achievement is a template (not assigned to user)
     */
    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isTemplate: boolean;

    /**
     * Flag indicating if the achievement is secret (hidden until unlocked)
     */
    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isSecret: boolean;

    /**
     * Flag indicating if achievement has been unlocked
     */
    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isUnlocked: boolean;

    /**
     * When the achievement was unlocked
     */
    @Column({ type: "timestamp with time zone", nullable: true })
    @IsDate()
    @IsOptional()
    unlockedAt: Date;

    /**
     * Whether the achievement is currently active (can be progressed)
     */
    @Column({ type: "boolean", default: true })
    @IsBoolean()
    isActive: boolean;

    /**
     * Optional expiration date for limited-time achievements
     */
    @Column({ type: "timestamp with time zone", nullable: true })
    @IsDate()
    @IsOptional()
    expiresAt: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    /**
     * Calculate the completion percentage
     * @returns Percentage completed from 0-100
     */
    calculateCompletionPercentage(): number {
        if (!this.progress) return 0;
        
        const { current, required } = this.progress;
        if (required === 0) return 100; // Avoid division by zero
        
        // Ensure percentage is between 0-100
        return ModelUtils.normalize(
            (current / required) * 100,
            0, 100
        );
    }
    
    /**
     * Updates progress value and checks if achievement is complete
     * @param amount Amount to increment by
     * @returns True if the achievement was completed by this update
     */
    updateProgress(amount: number): boolean {
        if (!this.progress) {
            this.progress = {
                current: 0,
                required: 100,
            };
        }
        
        // Don't update if already completed
        if (this.isUnlocked) return false;
        
        const wasIncomplete = this.progress.current < this.progress.required;
        
        // Increment progress
        this.progress.current = Math.min(
            this.progress.current + amount,
            this.progress.required
        );
        
        this.progress.lastIncremented = Date.now();
        
        // Check if newly completed
        const isNowComplete = this.progress.current >= this.progress.required;
        
        if (wasIncomplete && isNowComplete) {
            this.isUnlocked = true;
            this.unlockedAt = new Date();
            return true;
        }
        
        return false;
    }
}

/**
 * Interface for creating new achievements
 */
export interface AchievementData {
    name: string;
    description: string;
    category: AchievementCategory;
    tier: AchievementTier;
    points?: number;
    icon?: string;
    criteriaType: AchievementCriteriaType;
    criteriaDescription: string;
    progress: AchievementProgress;
    progressRules?: any;
    progressionFormula?: string;
    prerequisites?: string[];
    rewards?: AchievementReward;
    userId?: string;
    exerciseId?: string;
    workoutSessionId?: string;
    isTemplate?: boolean;
    isSecret?: boolean;
    isActive?: boolean;
    expiresAt?: Date;
}

/**
 * Entity to track when users earn achievements
 */
@Entity("user_achievements")
export class UserAchievement {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * User who earned the achievement
     */
    @Column({ name: "user_id" })
    @Index()
    userId: string;

    /**
     * Achievement that was earned
     */
    @Column({ name: "achievement_id" })
    @Index()
    achievementId: string;

    /**
     * Date when the achievement was earned
     */
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    earnedAt: Date;

    /**
     * Whether the user has viewed the achievement notification
     */
    @Column({ type: "boolean", default: false })
    isViewed: boolean;

    /**
     * Optional actual value that triggered the achievement
     */
    @Column({ type: "float", nullable: true })
    triggerValue: number;

    /**
     * Optional related entity id (workout, program, etc.)
     */
    @Column({ length: 50, nullable: true })
    relatedEntityId: string;

    /**
     * Optional additional data about achievement
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: Record<string, any>;
} 