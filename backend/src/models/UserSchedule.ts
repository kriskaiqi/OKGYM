import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    OneToMany
} from 'typeorm';
import { User } from './User';
import { WorkoutPlan } from './WorkoutPlan';
import { RecurrencePattern, ScheduleItemType, ScheduleItemStatus } from './shared/Enums';

/**
 * The UserSchedule entity represents a user's workout schedule
 * 
 * Relationships:
 * - ManyToOne with User (the user who owns this schedule)
 * - OneToMany with ScheduleItem (schedule items belonging to this schedule)
 */
@Entity("user_schedules")
export class UserSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * User who owns this schedule
     * When the user is deleted, their schedules will be deleted
     */
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_userschedule_user")
    user: User;

    @Column("uuid")
    @Index("idx_userschedule_user_id")
    user_id: string;

    @Column("varchar")
    name: string; // e.g., "Weekly Workout Schedule", "Morning Routine"

    @Column("text", { nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "date", nullable: true })
    startDate: Date;

    @Column({ type: "date", nullable: true })
    endDate: Date;

    @Column({
        type: "enum",
        enum: RecurrencePattern,
        default: RecurrencePattern.WEEKLY
    })
    recurrencePattern: RecurrencePattern;

    @Column("jsonb", { nullable: true })
    recurrenceRules: {
        daysOfWeek?: number[]; // 0-6 for Sunday to Saturday
        interval?: number; // Every X days/weeks/etc.
        specificDates?: Date[];
        exceptions?: Date[];
        timeOfDay?: string; // HH:MM format
        duration?: number; // In minutes
    };

    @Column("jsonb", { nullable: true })
    preferredTimes: {
        morning?: boolean;
        afternoon?: boolean;
        evening?: boolean;
        specificTimes?: Array<{
            dayOfWeek: number; // 0-6
            timeSlots: string[]; // HH:MM format
        }>;
    };

    /**
     * Schedule items belonging to this schedule
     * When the schedule is deleted, all its items will be deleted
     */
    @OneToMany(() => ScheduleItem, item => item.schedule, { 
        cascade: ["insert", "update", "remove"],
        onDelete: "CASCADE"
    })
    items: ScheduleItem[];

    @Column("jsonb", { nullable: true })
    notifications: {
        enabled: boolean;
        reminderTime: number; // Minutes before scheduled time
        channels: string[]; // "EMAIL", "PUSH", "SMS"
        customMessage?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * Individual scheduled items within a user's schedule
 * 
 * Relationships:
 * - ManyToOne with UserSchedule (the schedule this item belongs to)
 * - ManyToOne with WorkoutPlan (the workout plan scheduled for this item)
 */
@Entity("schedule_items")
export class ScheduleItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * The schedule this item belongs to
     * When the schedule is deleted, all its items will be deleted
     */
    @ManyToOne(() => UserSchedule, schedule => schedule.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "schedule_id" })
    @Index("idx_fk_scheduleitem_schedule")
    schedule: UserSchedule;

    @Column("uuid")
    @Index("idx_scheduleitem_schedule_id")
    schedule_id: string;

    @Column({
        type: "enum",
        enum: ScheduleItemType,
        default: ScheduleItemType.WORKOUT
    })
    @Index("idx_scheduleitem_type")
    type: ScheduleItemType;

    @Column("varchar")
    title: string;

    @Column("text", { nullable: true })
    description: string;

    @Column({ type: "date" })
    @Index("idx_scheduleitem_date")
    date: Date;

    @Column("time")
    startTime: string; // HH:MM:SS

    @Column("int", { default: 60 })
    duration: number; // In minutes

    /**
     * The workout plan scheduled for this item
     * When the workout plan is deleted, the reference will be set to null
     */
    @ManyToOne(() => WorkoutPlan, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "workout_plan_id" })
    @Index("idx_fk_scheduleitem_workout")
    workoutPlan?: WorkoutPlan;

    @Column("integer", { nullable: true })
    @Index("idx_scheduleitem_workout_id")
    workout_plan_id?: number;

    @Column({
        type: "enum",
        enum: ScheduleItemStatus,
        default: ScheduleItemStatus.UPCOMING
    })
    @Index("idx_scheduleitem_status")
    status: ScheduleItemStatus;

    @Column({ nullable: true })
    workoutSessionId: string;

    @Column("jsonb", { nullable: true })
    adjustments: {
        exercises?: Array<{
            exerciseId: string;
            include: boolean;
            order?: number;
            sets?: number;
            reps?: number;
            duration?: number;
            notes?: string;
        }>;
        intensity?: number; // Percentage of normal intensity
        focusAreas?: string[]; // Body areas to focus on
        modifications?: string[];
        equipment?: string[];
    };

    @Column("jsonb", { nullable: true })
    completion: {
        completedAt?: Date;
        percentCompleted?: number;
        userFeedback?: string;
        difficultyRating?: number;
        energyLevel?: number;
        notes?: string;
    };

    @Column("jsonb", { nullable: true })
    reminders: Array<{
        time: number; // Minutes before scheduled time
        sent: boolean;
        type: string; // "EMAIL", "PUSH", "SMS"
    }>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * Data for creating a schedule
 */
export interface UserScheduleData {
    userId: string;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    recurrencePattern?: RecurrencePattern;
    recurrenceRules?: {
        daysOfWeek?: number[];
        interval?: number;
        specificDates?: Date[];
        exceptions?: Date[];
        timeOfDay?: string;
        duration?: number;
    };
    preferredTimes?: {
        morning?: boolean;
        afternoon?: boolean;
        evening?: boolean;
        specificTimes?: Array<{
            dayOfWeek: number;
            timeSlots: string[];
        }>;
    };
    notifications?: {
        enabled: boolean;
        reminderTime: number;
        channels: string[];
        customMessage?: string;
    };
    items?: Array<{
        type: ScheduleItemType;
        title: string;
        description?: string;
        date: Date;
        startTime: string;
        duration?: number;
        workoutPlanId?: number;
        adjustments?: any;
        reminders?: any[];
    }>;
} 