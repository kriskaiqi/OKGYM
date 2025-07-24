import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { 
    IsArray, 
    IsBoolean,
    IsDate, 
    IsEnum, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString,
    IsUUID, 
    Max, 
    Min,
    ValidateNested 
} from "class-validator";
import { Type } from "class-transformer";
import { MeasurementUnit } from "./shared/Enums";

/**
 * Goal types for different fitness objectives
 */
export enum GoalType {
    WEIGHT_LOSS = "WEIGHT_LOSS",
    WEIGHT_GAIN = "WEIGHT_GAIN",
    STRENGTH = "STRENGTH",
    ENDURANCE = "ENDURANCE",
    FLEXIBILITY = "FLEXIBILITY",
    MUSCLE_GAIN = "MUSCLE_GAIN",
    BODY_FAT_PERCENTAGE = "BODY_FAT_PERCENTAGE",
    WORKOUT_FREQUENCY = "WORKOUT_FREQUENCY",
    DISTANCE = "DISTANCE",
    STEP_COUNT = "STEP_COUNT",
    CUSTOM = "CUSTOM"
}

/**
 * Status tracking for fitness goals
 */
export enum GoalStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    ABANDONED = "ABANDONED",
    PAUSED = "PAUSED"
}

/**
 * Checkpoint data for tracking milestones
 */
export class GoalCheckpoint {
    @IsNumber()
    @Min(0)
    value: number;

    @IsDate()
    date: Date;

    @IsString()
    @IsOptional()
    notes?: string;
}

/**
 * Milestone data for tracking important points in a goal journey
 */
export class GoalMilestone {
    @IsNumber()
    @Min(0)
    value: number;

    @IsString()
    @IsOptional()
    reward?: string;

    @IsBoolean()
    completed: boolean;
}

/**
 * Goal metadata for additional context
 */
export class GoalMetadata {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    relatedExercises?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    relatedWorkouts?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    relatedPrograms?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GoalMilestone)
    @IsOptional()
    milestones?: GoalMilestone[];

    @IsString()
    @IsOptional()
    reminderFrequency?: string;
    
    /**
     * Starting weight for weight loss goals
     */
    @IsNumber()
    @IsOptional()
    startWeight?: number;
    
    /**
     * Track recent changes to progress
     */
    @IsArray()
    @IsOptional()
    recentChanges?: Array<{
        date: Date;
        change: number;
        value: number;
    }>;
}

/**
 * FitnessGoal entity represents a specific goal a user is working towards
 * 
 * Relationships:
 * - ManyToOne with User (the user who owns this goal)
 */
@Entity("fitness_goals")
@Index("idx_fitnessgoal_type_status", ["type", "status"])
@Index("idx_fitnessgoal_deadline", ["deadline"])
export class FitnessGoal {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    description: string;

    @Column({
        type: "enum",
        enum: GoalType,
        default: GoalType.CUSTOM
    })
    @IsEnum(GoalType)
    @Index("idx_fitnessgoal_type")
    type: GoalType;

    @Column("float")
    @IsNumber()
    @Min(0)
    target: number;

    @Column("float", { default: 0 })
    @IsNumber()
    @Min(0)
    current: number;

    @Column({
        type: "enum",
        enum: MeasurementUnit,
        default: MeasurementUnit.CUSTOM
    })
    @IsEnum(MeasurementUnit)
    unit: MeasurementUnit;

    @Column({ nullable: true })
    @IsDate()
    @IsOptional()
    startDate: Date;

    @Column()
    @IsDate()
    deadline: Date;

    @Column("float", { default: 0 })
    @IsNumber()
    @Min(0)
    @Max(100)
    progress: number;

    @Column({
        type: "enum",
        enum: GoalStatus,
        default: GoalStatus.ACTIVE
    })
    @IsEnum(GoalStatus)
    @Index("idx_fitnessgoal_status")
    status: GoalStatus;

    @Column("jsonb", { nullable: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GoalCheckpoint)
    @IsOptional()
    checkpoints: GoalCheckpoint[];

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => GoalMetadata)
    @IsOptional()
    metadata: GoalMetadata;

    /**
     * User who owns this goal
     * When the user is deleted, their goals will be deleted
     */
    @ManyToOne(() => User, user => user.fitnessGoals, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_fitnessgoal_user")
    user: User;

    @Column("uuid")
    @Index("idx_fitnessgoal_user_id")
    user_id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /**
     * Calculate progress based on current and target values
     * @returns Updated progress percentage (0-100)
     */
    calculateProgress(): number {
        if (this.target <= 0) return 0;
        
        let progress = 0;
        
        // Different calculation methods based on goal type
        switch (this.type) {
            case GoalType.WEIGHT_LOSS:
                // For weight loss, we want to know what percentage of weight we've lost
                // If baseline is not available, we'll use the target as 100%
                const startWeight = this.metadata?.startWeight || this.target * 1.2;
                if (startWeight <= this.target) return 100; // Already reached goal
                progress = ((startWeight - this.current) / (startWeight - this.target)) * 100;
                break;
                
            case GoalType.WORKOUT_FREQUENCY:
                // For frequency goals, count as percentage of target
                progress = (this.current / this.target) * 100;
                break;
                
            default:
                // Default method: progress as percentage of target
                progress = (this.current / this.target) * 100;
        }
        
        // Ensure progress is between 0-100
        progress = Math.max(0, Math.min(100, progress));
        this.progress = progress;
        return progress;
    }
    
    /**
     * Check if goal is completed
     * @returns True if the goal is completed
     */
    isCompleted(): boolean {
        // For most goals, we consider it complete when progress reaches 100%
        if (this.progress >= 100) {
            this.status = GoalStatus.COMPLETED;
            return true;
        }
        
        // For some goal types, we have specific completion logic
        switch(this.type) {
            case GoalType.WEIGHT_LOSS:
                if (this.current <= this.target) {
                    this.status = GoalStatus.COMPLETED;
                    return true;
                }
                break;
                
            // Add other special cases as needed
        }
        
        return false;
    }
    
    /**
     * Update progress with a new value
     * @param newValue The new current value
     * @returns True if goal is now completed
     */
    updateProgress(newValue: number): boolean {
        // Store the previous value for tracking
        const previousValue = this.current;
        this.current = newValue;
        
        // Calculate percentage change
        if (previousValue !== 0) {
            const change = ((newValue - previousValue) / Math.abs(previousValue)) * 100;
            
            // Store with the goal or in checkpoints
            if (!this.metadata) this.metadata = new GoalMetadata();
            if (!this.metadata.recentChanges) this.metadata.recentChanges = [];
            this.metadata.recentChanges.push({
                date: new Date(),
                change: change,
                value: newValue
            });
        }
        
        // Recalculate overall progress
        this.calculateProgress();
        
        // Check if goal is now completed
        return this.isCompleted();
    }
    
    /**
     * Add a checkpoint to track progress over time
     * @param value The value at this checkpoint
     * @param date The date of the checkpoint
     * @param notes Optional notes about this checkpoint
     */
    addCheckpoint(value: number, date: Date = new Date(), notes?: string): void {
        const checkpoint = new GoalCheckpoint();
        checkpoint.value = value;
        checkpoint.date = date;
        if (notes) checkpoint.notes = notes;
        
        if (!this.checkpoints) this.checkpoints = [];
        this.checkpoints.push(checkpoint);
        
        // Sort checkpoints by date (newest first)
        this.checkpoints.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
} 