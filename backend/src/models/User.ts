// Add enums at the top of the file, before imports
export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    TRAINER = "TRAINER",
    CONTENT_CREATOR = "CONTENT_CREATOR"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED",
    DELETED = "DELETED"
}

import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    Index,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max, IsBoolean, IsDate, IsEmail, IsUUID } from "class-validator";
import { Type } from 'class-transformer';
import { WorkoutSession } from './WorkoutSession';
import { Achievement } from './Achievement';
import { FitnessGoal as UserFitnessGoal } from './FitnessGoal'; // Renamed to avoid confusion
import { BodyMetric } from './BodyMetric';
import { Notification } from './Notification';
import { WorkoutPlan } from './WorkoutPlan';
import { TrainingProgram } from './TrainingProgram';
import { UserProgress } from './UserProgress';
import { UserActivity } from './UserActivity';
import { 
    Difficulty,         // Replaces FitnessLevel
    FitnessGoal,        // For shared fitness goals
    Gender,             // User gender options
    ActivityLevel,      // User activity classifications
    WorkoutLocation,    // Workout location preferences
    ExercisePreference, // Exercise preference options
    BodyArea,           // Body parts/areas that can be targeted
    MeasurementUnit,    // Measurement units
    AppTheme            // App theme options
} from './shared/Enums';
import { 
    NormalizedScore,    // For normalized scores
    ScaleOfTen          // For 1-10 scale ratings
} from './shared/Validation';
import { ProgramEnrollment } from './ProgramEnrollment';

/**
 * Notification preferences class
 */
export class NotificationPreferences {
    @IsBoolean()
    @Column({ default: true })
    pushEnabled: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    emailEnabled: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    smsEnabled: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    workoutReminders: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    progressUpdates: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    achievementAlerts: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    friendActivity: boolean = true;

    @IsBoolean()
    @Column({ default: true })
    systemAnnouncements: boolean = true;
}

/**
 * User preferences class for strong typing and validation
 */
export class UserPreferences {
    // Workout preferences
    @IsOptional()
    @IsEnum(WorkoutLocation)
    workoutLocation?: WorkoutLocation;
    
    @IsOptional()
    @IsArray()
    @IsEnum(ExercisePreference, { each: true })
    preferredExerciseTypes?: ExercisePreference[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dislikedExercises?: string[]; // Exercise IDs
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    favoriteExercises?: string[]; // Exercise IDs
    
    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(180)
    workoutDuration?: number; // Preferred workout length in minutes
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(300)
    restTime?: number; // Preferred rest time between exercises in seconds
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(7)
    workoutFrequency?: number; // Preferred workouts per week (1-7)
    
    // Equipment preferences
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    availableEquipment?: string[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferredEquipment?: string[];
    
    // Health considerations
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    bodyDiscomfort?: string[]; // Areas of discomfort/injury
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    healthConditions?: string[];
    
    // App preferences
    @IsOptional()
    @IsEnum(MeasurementUnit)
    measurementUnit?: MeasurementUnit;
    
    @IsOptional()
    @IsEnum(AppTheme)
    theme?: AppTheme;
    
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationPreferences)
    notifications?: NotificationPreferences;
}

/**
 * Personal record class
 */
export class PersonalRecord {
    @IsNumber()
    @Min(0)
    maxReps: number = 0;
    
    @IsNumber()
    @Min(0)
    maxWeight: number = 0;
    
    @IsNumber()
    @Min(0)
    @Max(10)
    bestFormScore: number = 0;
    
    @IsDate()
    date: Date = new Date();
}

/**
 * Weight history entry class
 */
export class WeightHistoryEntry {
    @IsDate()
    date: Date = new Date();
    
    @IsNumber()
    @Min(0)
    weight: number = 0;
}

/**
 * User statistics class
 */
export class UserStats {
    // Weight tracking properties (keep these)
    @IsNumber()
    @Min(0)
    @IsOptional()
    startingWeight?: number;
    
    @IsNumber()
    @Min(0)
    @IsOptional()
    currentWeight?: number;
    
    @IsEnum(MeasurementUnit)
    @IsOptional()
    weightUnit?: MeasurementUnit = MeasurementUnit.METRIC;
    
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WeightHistoryEntry)
    weightHistory?: WeightHistoryEntry[];
    
    // Other properties that might be useful to keep
    @IsDate()
    @IsOptional()
    lastWorkoutDate?: Date;
}

/**
 * User entity representing app users
 */
@Entity("users")
@Index("idx_user_email_admin_premium", ['email', 'isAdmin', 'isPremium'])
@Index("idx_user_fitness_goal_activity", ['fitnessLevel', 'mainGoal', 'activityLevel'])
@Index(['email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    firstName: string = '';

    @Column()
    @IsString()
    @IsNotEmpty()
    lastName: string = '';

    @Column({ unique: true })
    @IsEmail()
    @IsNotEmpty()
    email: string = '';

    @Column()
    @IsString()
    @IsNotEmpty()
    password: string = ''; // This will be hashed

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    @IsEnum(UserRole)
    userRole: UserRole = UserRole.USER;

    @Column({ default: false })
    @IsBoolean()
    isAdmin: boolean = false;

    @Column({ default: false })
    @IsBoolean()
    isPremium: boolean = false;
    
    @Column({
        type: "enum",
        enum: Gender,
        nullable: true
    })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
    
    @Column({ nullable: true })
    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear())
    @IsOptional()
    birthYear?: number;
    
    @Column({ type: 'float', nullable: true })
    @IsNumber()
    @Min(50)
    @Max(250)
    @IsOptional()
    height?: number; // in cm
    
    @Column({
        type: "enum",
        enum: FitnessGoal,
        nullable: true
    })
    @IsEnum(FitnessGoal)
    @IsOptional()
    mainGoal?: FitnessGoal;
    
    @Column({
        type: "enum",
        enum: ActivityLevel,
        nullable: true
    })
    @IsEnum(ActivityLevel)
    @IsOptional()
    activityLevel?: ActivityLevel;
    
    @Column({
        type: "enum",
        enum: Difficulty,
        default: Difficulty.BEGINNER,
        nullable: true
    })
    @IsEnum(Difficulty)
    @IsOptional()
    fitnessLevel?: Difficulty;
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => UserPreferences)
    @IsOptional()
    preferences?: UserPreferences = new UserPreferences();
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => UserStats)
    @IsOptional()
    stats?: UserStats = new UserStats();
    
    /**
     * Workouts that the user has marked as favorites
     * Many-to-many relationship with WorkoutPlan
     * When user is deleted, their favorite workouts relationship will be removed
     */
    @ManyToMany(() => WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "user_favorite_workouts",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    })
    favoriteWorkouts: WorkoutPlan[];
    
    /**
     * Workouts that the user has completed in the past
     * Many-to-many relationship with WorkoutPlan
     * When user is deleted, their workout history relationship will be removed
     */
    @ManyToMany(() => WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "user_workout_history",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    })
    workoutHistory: WorkoutPlan[];

    /**
     * User's workout sessions
     * When a user is deleted, their workout sessions will be deleted
     */
    @OneToMany(() => WorkoutSession, session => session.user)
    sessions: WorkoutSession[];

    /**
     * User's achievements
     * When a user is deleted, their achievements will be deleted
     */
    @OneToMany(() => Achievement, achievement => achievement.user, {
        onDelete: "CASCADE"
    })
    achievements: Achievement[];

    /**
     * User's fitness goals
     * When a user is deleted, their fitness goals will be deleted
     */
    @OneToMany(() => UserFitnessGoal, goal => goal.user, {
        onDelete: "CASCADE"
    })
    fitnessGoals: UserFitnessGoal[];

    /**
     * User's body metrics
     * When a user is deleted, their body metrics will be deleted
     */
    @OneToMany(() => BodyMetric, metric => metric.user, {
        onDelete: "CASCADE"
    })
    bodyMetrics: BodyMetric[];

    /**
     * User's notifications
     * When a user is deleted, their notifications will be deleted
     */
    @OneToMany(() => Notification, notification => notification.user, {
        onDelete: "CASCADE"
    })
    notifications: Notification[];

    @CreateDateColumn()
    createdAt: Date = new Date();

    @UpdateDateColumn()
    updatedAt: Date = new Date();
    
    /**
     * Workouts created by this user
     * Inverse side of the relationship with WorkoutPlan.creator
     * When a user is deleted, set the creator to null rather than deleting workouts
     */
    @OneToMany(() => WorkoutPlan, workoutPlan => workoutPlan.creator, {
        onDelete: "SET NULL"
    })
    createdWorkouts: WorkoutPlan[];
    
    /**
     * Programs that the user is enrolled in
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    @OneToMany(() => ProgramEnrollment, enrollment => enrollment.user)
    programEnrollments: ProgramEnrollment[];
    
    /**
     * Calculate user's age based on birthYear
     * @returns User's age in years
     */
    calculateAge(): number | null {
        if (!this.birthYear) return null;
        return new Date().getFullYear() - this.birthYear;
    }
    
    /**
     * Calculate user's BMI (Body Mass Index)
     * @param weight Weight in kg (optional, uses currentWeight from stats if not provided)
     * @returns BMI value or null if data is missing
     */
    calculateBMI(weight?: number): number | null {
        const userWeight = weight || (this.stats?.currentWeight || null);
        if (!userWeight || !this.height) return null;
        
        // BMI formula: weight (kg) / height (m)²
        const heightInMeters = this.height / 100;
        return userWeight / (heightInMeters * heightInMeters);
    }
    
    /**
     * Update user's last workout date
     * @param workoutDate Date of the workout (defaults to current date)
     */
    updateLastWorkoutDate(workoutDate: Date = new Date()): void {
        if (!this.stats) {
            this.stats = new UserStats();
        }
        
        // Update last workout date
        this.stats.lastWorkoutDate = workoutDate;
    }

    @OneToMany(() => UserProgress, progress => progress.user)
    @IsOptional()
    @IsArray()
    progress?: UserProgress[];

    @OneToMany(() => UserActivity, activity => activity.user)
    @IsOptional()
    @IsArray()
    activity?: UserActivity[];
}

/**
 * Interface for user data transfer object
 */
export interface UserDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isAdmin: boolean;
    isPremium: boolean;
    gender?: Gender;
    birthYear?: number;
    height?: number;
    mainGoal?: FitnessGoal;
    activityLevel?: ActivityLevel;
    fitnessLevel?: Difficulty;
    preferences?: UserPreferences;
    stats?: UserStats;
    fitnessGoals?: any[];
    bodyMetrics?: any[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface for user registration data
 */
export interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

/**
 * Interface for user preferences update data
 */
export interface UserPreferencesUpdateData {
    userId: string;
    preferences: UserPreferences;
} 