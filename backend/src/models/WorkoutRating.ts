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
    OneToOne
} from 'typeorm';
import { User } from './User';
import { WorkoutPlan } from './WorkoutPlan';
import { WorkoutSession } from './WorkoutSession';
import { Feedback } from './Feedback';
import { DifficultyRating, EnjoymentRating } from './shared/Enums';
import { IsUUID } from 'class-validator';

/**
 * @deprecated Use Feedback model with appropriate type instead
 * WorkoutRating entity represents a user's rating and review of a workout
 * Links to both the workout plan and the specific session if applicable
 * 
 * Relationships:
 * - ManyToOne with User (the user who submitted the rating)
 * - ManyToOne with WorkoutPlan (the workout being rated)
 * - ManyToOne with WorkoutSession (optional link to a specific session)
 * - OneToOne with Feedback (associated feedback entry)
 */
@Entity("workout_ratings")
@Unique(["user", "workoutPlan"]) // Ensure one rating per workout per user
export class WorkoutRating {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string = '';

    /**
     * User who submitted the rating
     * When the user is deleted, their ratings will be deleted
     */
    @ManyToOne(() => User, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_workoutrating_user")
    user: User;

    @Column("uuid")
    @Index("idx_workoutrating_user_id")
    user_id: string;

    /**
     * Workout plan being rated
     * When the workout plan is deleted, its ratings will be deleted
     */
    @ManyToOne(() => WorkoutPlan, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "workout_plan_id" })
    @Index("idx_fk_workoutrating_workout")
    workoutPlan: WorkoutPlan;

    @Column("integer")
    @Index("idx_workoutrating_workout_id")
    workout_plan_id: number;

    /**
     * Optional link to a specific workout session
     * When the session is deleted, this reference will be set to null
     */
    @ManyToOne(() => WorkoutSession, workoutSession => workoutSession.ratings)
    @JoinColumn({ name: "workout_session_id", referencedColumnName: "id" })
    workoutSession: WorkoutSession;

    @Column({ name: "workout_session_id" })
    @IsUUID()
    workoutSessionId: string = '';

    /**
     * Associated feedback entry
     * When the rating is deleted, the feedback will be deleted
     */
    @OneToOne(() => Feedback, {
        cascade: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "feedback_id" })
    @Index("idx_fk_workoutrating_feedback")
    feedback: Feedback;

    @Column("uuid", { nullable: true })
    @Index("idx_workoutrating_feedback_id")
    feedback_id: string;

    @Column({
        type: "enum",
        enum: DifficultyRating,
        default: DifficultyRating.JUST_RIGHT
    })
    difficultyRating: DifficultyRating;

    @Column({
        type: "enum",
        enum: EnjoymentRating,
        default: EnjoymentRating.NEUTRAL
    })
    enjoymentRating: EnjoymentRating;

    @Column({ type: "integer", nullable: true })
    effectivenessRating: number;

    @Column({ type: "integer", nullable: true })
    timeSuitabilityRating: number;

    @Column({ type: "integer", nullable: true })
    equipmentSuitabilityRating: number;

    @Column({ type: "text", nullable: true })
    reviewText: string;

    @Column("simple-array", { nullable: true })
    positiveAspects: string[];

    @Column("simple-array", { nullable: true })
    improvementAspects: string[];

    @Column({ type: "boolean", default: false })
    wouldRecommend: boolean;

    @Column({ type: "boolean", default: false })
    isFlagged: boolean;

    @Column({ type: "boolean", default: true })
    isApproved: boolean;

    @Column({ type: "boolean", default: true })
    isPublic: boolean;

    /**
     * @deprecated Use Feedback model's metadata instead
     */
    @Column("jsonb", { nullable: true })
    metadata: {
        exerciseFeedback?: Record<string, { 
            rating: number;
            comment?: string;
        }>;
        targetMuscleGroups?: string[];
        equipmentUsed?: string[];
        completionTime?: number;
        muscleGroupsWorked?: string[];
        userFitnessLevel?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * @deprecated Use FeedbackData with type WORKOUT_RATING instead
 * Interface for creating workout ratings
 */
export interface WorkoutRatingData {
    userId: string;
    workoutPlanId: number;
    workoutSessionId?: number;
    rating: number;
    difficultyRating?: DifficultyRating;
    enjoymentRating?: EnjoymentRating;
    effectivenessRating?: number;
    timeSuitabilityRating?: number;
    equipmentSuitabilityRating?: number;
    reviewText?: string;
    positiveAspects?: string[];
    improvementAspects?: string[];
    wouldRecommend?: boolean;
    isPublic?: boolean;
    metadata?: {
        exerciseFeedback?: Record<string, { 
            rating: number;
            comment?: string;
        }>;
        targetMuscleGroups?: string[];
        equipmentUsed?: string[];
        completionTime?: number;
        muscleGroupsWorked?: string[];
        userFitnessLevel?: string;
    };
} 