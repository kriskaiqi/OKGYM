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
import { User } from "./User";

/**
 * Notification types to categorize different types of notifications
 */
export enum NotificationType {
    // Workout related
    WORKOUT_REMINDER = "WORKOUT_REMINDER",
    WORKOUT_COMPLETED = "WORKOUT_COMPLETED",
    WORKOUT_MISSED = "WORKOUT_MISSED",
    WORKOUT_RECOMMENDATION = "WORKOUT_RECOMMENDATION",
    
    // Achievement related
    ACHIEVEMENT_EARNED = "ACHIEVEMENT_EARNED",
    ACHIEVEMENT_PROGRESS = "ACHIEVEMENT_PROGRESS",
    
    // Goal related
    GOAL_REMINDER = "GOAL_REMINDER",
    GOAL_MILESTONE = "GOAL_MILESTONE",
    GOAL_ACHIEVED = "GOAL_ACHIEVED",
    
    // Program related
    PROGRAM_REMINDER = "PROGRAM_REMINDER",
    PROGRAM_MILESTONE = "PROGRAM_MILESTONE",
    PROGRAM_COMPLETED = "PROGRAM_COMPLETED",
    
    // System notifications
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
    FEATURE_RELEASE = "FEATURE_RELEASE",
    
    // User related
    PROFILE_INCOMPLETE = "PROFILE_INCOMPLETE",
    STREAK_REMINDER = "STREAK_REMINDER",
    INACTIVITY_REMINDER = "INACTIVITY_REMINDER",
    
    // Custom notifications
    CUSTOM = "CUSTOM"
}

/**
 * Notification priorities
 */
export enum NotificationPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}

/**
 * Notification delivery statuses
 */
export enum NotificationStatus {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}

/**
 * Delivery channels for notifications
 */
export enum NotificationChannel {
    IN_APP = "IN_APP",
    PUSH = "PUSH",
    EMAIL = "EMAIL",
    SMS = "SMS",
    ALL = "ALL"
}

/**
 * Entity to represent notifications sent to users
 */
@Entity("notifications")
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * User who receives the notification
     */
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index()
    user: User;

    /**
     * Notification type
     */
    @Column({
        type: "enum",
        enum: NotificationType,
        default: NotificationType.SYSTEM_ANNOUNCEMENT
    })
    @Index()
    type: NotificationType;

    /**
     * Notification title
     */
    @Column({ length: 100 })
    title: string;

    /**
     * Notification message body
     */
    @Column({ type: "text" })
    message: string;

    /**
     * Priority level
     */
    @Column({
        type: "enum",
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    })
    priority: NotificationPriority;

    /**
     * Current status of the notification
     */
    @Column({
        type: "enum",
        enum: NotificationStatus,
        default: NotificationStatus.PENDING
    })
    @Index()
    status: NotificationStatus;

    /**
     * Delivery channel(s)
     */
    @Column({
        type: "enum",
        enum: NotificationChannel,
        default: NotificationChannel.IN_APP
    })
    channel: NotificationChannel;

    /**
     * When to deliver the notification
     */
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    @Index()
    scheduledFor: Date;

    /**
     * When the notification was actually delivered
     */
    @Column({ type: "timestamp", nullable: true })
    deliveredAt: Date;

    /**
     * When the user read the notification
     */
    @Column({ type: "timestamp", nullable: true })
    readAt: Date;

    /**
     * Link to open when notification is clicked
     */
    @Column({ length: 255, nullable: true })
    actionUrl: string;

    /**
     * Action label text
     */
    @Column({ length: 50, nullable: true })
    actionLabel: string;

    /**
     * Image URL to display with notification
     */
    @Column({ length: 255, nullable: true })
    imageUrl: string;

    /**
     * Icon to display with notification
     */
    @Column({ length: 50, nullable: true })
    icon: string;

    /**
     * Related entity type (workout, goal, etc.)
     */
    @Column({ length: 50, nullable: true })
    @Index()
    relatedEntityType: string;

    /**
     * Related entity ID
     */
    @Column({ length: 50, nullable: true })
    @Index()
    relatedEntityId: string;

    /**
     * Whether the notification is dismissible
     */
    @Column({ type: "boolean", default: true })
    isDismissible: boolean;

    /**
     * Whether the notification expires after a certain time
     */
    @Column({ type: "boolean", default: false })
    hasExpiration: boolean;

    /**
     * When the notification expires
     */
    @Column({ type: "timestamp", nullable: true })
    expiresAt: Date;

    /**
     * Additional data as JSON
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        deviceTokens?: string[];
        emailAddresses?: string[];
        phoneNumbers?: string[];
        deliveryAttempts?: number;
        errorMessage?: string;
        campaignId?: string;
        groupId?: string;
        tags?: string[];
        sound?: string;
        badgeCount?: number;
        customAttributes?: Record<string, any>;
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Interface for creating notifications
 */
export interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    channel?: NotificationChannel;
    scheduledFor?: Date;
    actionUrl?: string;
    actionLabel?: string;
    imageUrl?: string;
    icon?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    isDismissible?: boolean;
    hasExpiration?: boolean;
    expiresAt?: Date;
    metadata?: {
        deviceTokens?: string[];
        emailAddresses?: string[];
        phoneNumbers?: string[];
        campaignId?: string;
        groupId?: string;
        tags?: string[];
        sound?: string;
        badgeCount?: number;
        customAttributes?: Record<string, any>;
    };
} 