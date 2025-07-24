import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { User } from './User';

/**
 * Types of activities users can perform
 */
export enum ActivityType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    VIEW_WORKOUT = "VIEW_WORKOUT",
    COMPLETE_WORKOUT = "COMPLETE_WORKOUT",
    CREATE_WORKOUT = "CREATE_WORKOUT",
    SAVE_WORKOUT = "SAVE_WORKOUT",
    RATE_WORKOUT = "RATE_WORKOUT",
    VIEW_EXERCISE = "VIEW_EXERCISE",
    UPDATE_PROFILE = "UPDATE_PROFILE",
    SET_GOAL = "SET_GOAL",
    ACHIEVE_GOAL = "ACHIEVE_GOAL",
    EARN_ACHIEVEMENT = "EARN_ACHIEVEMENT",
    ENROLL_PROGRAM = "ENROLL_PROGRAM",
    COMPLETE_PROGRAM = "COMPLETE_PROGRAM",
    SEARCH = "SEARCH",
    UPDATE_SCHEDULE = "UPDATE_SCHEDULE",
    UPDATE_METRICS = "UPDATE_METRICS",
    SHARE_CONTENT = "SHARE_CONTENT",
    VIEW_ANALYTICS = "VIEW_ANALYTICS",
    CREATE_EQUIPMENT = "CREATE_EQUIPMENT",
    OTHER = "OTHER"
}

/**
 * Platform/device where the activity occurred
 */
export enum ActivityPlatform {
    WEB = "WEB",
    ANDROID = "ANDROID",
    IOS = "IOS",
    DESKTOP = "DESKTOP",
    API = "API"
}

/**
 * UserActivity entity tracks user's interactions with the application
 * This enables behavior analysis, personalization, and activity tracking
 */
@Entity("user_activities")
export class UserActivity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    @Index()
    user: User;

    @Column({
        type: "enum",
        enum: ActivityType,
        default: ActivityType.OTHER
    })
    @Index()
    type: ActivityType;

    @Column({
        type: "enum",
        enum: ActivityPlatform,
        default: ActivityPlatform.WEB
    })
    platform: ActivityPlatform;

    @CreateDateColumn()
    @Index()
    timestamp: Date;

    @Column("jsonb", { nullable: true })
    details: {
        entityId?: string;       // ID of related entity (workout, exercise, etc.)
        entityType?: string;     // Type of related entity
        action?: string;         // Specific action taken
        result?: string;         // Result of the action
        duration?: number;       // Duration of the activity in seconds
        previousState?: any;     // Previous state (before change)
        newState?: any;          // New state (after change)
        searchQuery?: string;    // Search query if activity was a search
        referrer?: string;       // Referrer URL or source
    };

    @Column("jsonb", { nullable: true })
    context: {
        sessionId?: string;      // Browser/app session ID
        ip?: string;             // IP address
        userAgent?: string;      // Browser/device user agent
        location?: {             // Geographic location
            country?: string;
            city?: string;
            latitude?: number;
            longitude?: number;
        };
        deviceInfo?: {           // Device information
            type?: string;       // "mobile", "tablet", "desktop"
            os?: string;         // Operating system
            browser?: string;    // Browser name and version
            screenSize?: string; // Screen dimensions
        };
        appVersion?: string;     // App version
    };
}

/**
 * Data structure for recording a new user activity
 */
export interface UserActivityData {
    userId: string;
    type: ActivityType;
    platform?: ActivityPlatform;
    details?: {
        entityId?: string;
        entityType?: string;
        action?: string;
        result?: string;
        duration?: number;
        previousState?: any;
        newState?: any;
        searchQuery?: string;
        referrer?: string;
    };
    context?: {
        sessionId?: string;
        ip?: string;
        userAgent?: string;
        location?: {
            country?: string;
            city?: string;
            latitude?: number;
            longitude?: number;
        };
        deviceInfo?: {
            type?: string;
            os?: string;
            browser?: string;
            screenSize?: string;
        };
        appVersion?: string;
    };
} 