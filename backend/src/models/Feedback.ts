import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    Unique,
    OneToOne,
    Check
} from "typeorm";
import { IsEnum, Min, Max, IsOptional, IsUUID } from "class-validator";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { WorkoutPlan } from "./WorkoutPlan";
import { WorkoutSession } from "./WorkoutSession";
import { TrainingProgram } from "./TrainingProgram";
import { WorkoutRating } from "./WorkoutRating";

/**
 * Types of feedback
 */
export enum FeedbackType {
    WORKOUT_RATING = "WORKOUT_RATING",
    EXERCISE_FORM = "EXERCISE_FORM",
    PROGRAM_REVIEW = "PROGRAM_REVIEW",
    EQUIPMENT_REVIEW = "EQUIPMENT_REVIEW",
    TUTORIAL_FEEDBACK = "TUTORIAL_FEEDBACK",
    ACHIEVEMENT_FEEDBACK = "ACHIEVEMENT_FEEDBACK",
    USER_SUGGESTION = "USER_SUGGESTION",
    BUG_REPORT = "BUG_REPORT",
    FEATURE_REQUEST = "FEATURE_REQUEST"
}

/**
 * Categories for rating different aspects
 */
export enum RatingCategory {
    DIFFICULTY = "DIFFICULTY",
    ENJOYMENT = "ENJOYMENT",
    EFFECTIVENESS = "EFFECTIVENESS",
    ACCURACY = "ACCURACY",
    QUALITY = "QUALITY",
    VALUE = "VALUE",
    USABILITY = "USABILITY"
}

/**
 * Sentiment analysis of feedback
 */
export enum FeedbackSentiment {
    VERY_NEGATIVE = "VERY_NEGATIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL",
    POSITIVE = "POSITIVE",
    VERY_POSITIVE = "VERY_POSITIVE"
}

/**
 * Entity for unified feedback handling across the application
 * 
 * Relationships:
 * - ManyToOne with User (user who provided the feedback)
 * - ManyToOne with Exercise (exercise being rated, if applicable)
 * - ManyToOne with WorkoutPlan (workout plan being rated, if applicable)
 * - ManyToOne with WorkoutSession (session being rated, if applicable)
 * - ManyToOne with TrainingProgram (program being rated, if applicable)
 * - OneToOne with WorkoutRating (linking to legacy workout rating, if applicable)
 */
@Entity("feedback")
@Unique(["user", "type", "entityId", "category"])
@Index("idx_feedback_type_entity", ["type", "entityType", "entityId"])
@Index("idx_feedback_user_type", ["user", "type", "isPublic"])
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Feedback {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    /**
     * User who provided the feedback
     * When the user is deleted, their feedback will be deleted
     */
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    @Index("idx_fk_feedback_user")
    user: User;

    @Column({ name: "userId" })
    @Index("idx_feedback_user_id")
    userId: string;

    /**
     * Type of feedback
     */
    @Column({
        type: "enum",
        enum: FeedbackType
    })
    @IsEnum(FeedbackType)
    @Index("idx_feedback_type")
    type: FeedbackType;

    /**
     * Specific category of the rating
     */
    @Column({
        type: "enum",
        enum: RatingCategory,
        nullable: true
    })
    @IsEnum(RatingCategory)
    @IsOptional()
    @Index("idx_feedback_category")
    category?: RatingCategory;

    /**
     * Numeric rating (1-5 stars)
     */
    @Column({ type: "float", nullable: true })
    @IsOptional()
    @Min(1)
    @Max(5)
    rating: number;

    /**
     * Textual feedback comments
     */
    @Column({ type: "text", nullable: true })
    comment: string;

    /**
     * Analyzed sentiment of the feedback
     */
    @Column({
        type: "enum",
        enum: FeedbackSentiment,
        nullable: true
    })
    @IsEnum(FeedbackSentiment)
    @IsOptional()
    sentiment: FeedbackSentiment;

    /**
     * ID of the entity being rated (exercise, workout, etc.)
     */
    @Column({ length: 50 })
    @Index("idx_feedback_entity_id")
    entityId: string;

    /**
     * Type of entity being rated
     */
    @Column({ length: 50 })
    @Index("idx_feedback_entity_type")
    entityType: string;

    /**
     * Referenced exercise, if this feedback is about an exercise
     * When the exercise is deleted, this reference will be set to null
     */
    @ManyToOne(() => Exercise, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "exerciseId" })
    @Index("idx_fk_feedback_exercise")
    exercise?: Exercise;

    @Column({ name: "exerciseId" })
    @Index("idx_feedback_exercise_id")
    exerciseId?: string;

    /**
     * Referenced workout plan, if this feedback is about a workout plan
     * When the workout plan is deleted, this reference will be set to null
     */
    @ManyToOne(() => WorkoutPlan, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "workoutPlanId" })
    @Index("idx_fk_feedback_workout")
    workoutPlan?: WorkoutPlan;

    @Column({ name: "workoutPlanId" })
    @Index("idx_feedback_workout_id")
    workoutPlanId?: number;

    /**
     * Referenced workout session, if this feedback is about a session
     * When the session is deleted, this reference will be set to null
     */
    @ManyToOne(() => WorkoutSession, workoutSession => workoutSession.feedback)
    @JoinColumn({ name: "workoutSessionId", referencedColumnName: "id" })
    workoutSession: WorkoutSession;

    @Column({ name: "workoutSessionId" })
    @IsUUID()
    workoutSessionId: string = '';

    /**
     * Referenced training program, if this feedback is about a program
     * When the program is deleted, this reference will be set to null
     */
    @ManyToOne(() => TrainingProgram, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "programId" })
    @Index("idx_fk_feedback_program")
    program?: TrainingProgram;

    @Column({ name: "programId" })
    @Index("idx_feedback_program_id")
    programId?: number;

    /**
     * Link to legacy workout rating
     * This relationship is bidirectional with WorkoutRating.feedback
     * When feedback is deleted, the rating reference will be set to null
     */
    @OneToOne(() => WorkoutRating, rating => rating.feedback, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "workoutRatingId" })
    @Index("idx_fk_feedback_rating")
    workoutRating?: WorkoutRating;

    @Column({ name: "workoutRatingId" })
    @Index("idx_feedback_rating_id")
    workoutRatingId?: string;

    /**
     * Positive aspects mentioned in the feedback
     */
    @Column("simple-array", { nullable: true })
    positiveAspects: string[];

    /**
     * Areas for improvement mentioned in the feedback
     */
    @Column("simple-array", { nullable: true })
    improvementAreas: string[];

    /**
     * Whether the user would recommend this entity to others
     */
    @Column({ type: "boolean", default: false })
    wouldRecommend: boolean;

    /**
     * Whether this feedback needs review by staff
     */
    @Column({ type: "boolean", default: false })
    needsReview: boolean;

    /**
     * Whether this feedback has been approved for public display
     */
    @Column({ type: "boolean", default: true })
    isApproved: boolean;

    /**
     * Whether this feedback is publicly visible
     */
    @Column({ type: "boolean", default: true })
    @Index("idx_feedback_visibility")
    isPublic: boolean;

    /**
     * Additional metadata for the feedback
     */
    @Column("jsonb", { nullable: true })
    metadata: {
        context?: {
            location?: string;
            device?: string;
            platform?: string;
            version?: string;
        };
        metrics?: {
            [key: string]: number;
        };
        tags?: string[];
        attachments?: Array<{
            type: string;
            url: string;
            description?: string;
        }>;
        responses?: Array<{
            userId: string;
            response: string;
            timestamp: Date;
        }>;
        status?: {
            resolved?: boolean;
            resolution?: string;
            assignedTo?: string;
            priority?: string;
        };
        sentiment?: {
            score: number;
            confidence: number;
            keywords?: Array<{
                word: string;
                sentiment: FeedbackSentiment;
            }>;
        };
        moderation?: {
            status: string;
            reason?: string;
            moderatorId?: string;
            moderatedAt?: Date;
        };
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Interface for creating new feedback
 */
export interface FeedbackData {
    userId: string;
    type: FeedbackType;
    category?: RatingCategory;
    rating?: number;
    comment?: string;
    entityId: string;
    entityType: string;
    exerciseId?: string;
    workoutPlanId?: number;
    workoutSessionId?: string;
    programId?: string;
    positiveAspects?: string[];
    improvementAreas?: string[];
    wouldRecommend?: boolean;
    isPublic?: boolean;
    metadata?: {
        context?: {
            location?: string;
            device?: string;
            platform?: string;
            version?: string;
        };
        metrics?: {
            [key: string]: number;
        };
        tags?: string[];
        attachments?: Array<{
            type: string;
            url: string;
            description?: string;
        }>;
    };
} 