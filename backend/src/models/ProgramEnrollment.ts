import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsDate, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { TrainingProgram } from "./TrainingProgram";
import { EnrollmentStatus } from "./shared/Enums";

/**
 * ProgramEnrollment tracks a user's enrollment and progress
 * through a specific training program.
 * 
 * Relationships:
 * - ManyToOne with User (participant in program)
 * - ManyToOne with TrainingProgram (program being followed)
 */
@Entity("program_enrollments")
@Index("idx_enrollment_user_program", ["user_id", "program_id"], { unique: true })
@Index("idx_enrollment_status", ["status"])
export class ProgramEnrollment {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * User enrolled in the program
     */
    @ManyToOne(() => User, user => user.programEnrollments, {
        onDelete: "CASCADE" // When user is deleted, enrollments are deleted
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    @Index("idx_fk_enrollment_user")
    user_id: string;

    /**
     * Training program the user is enrolled in
     */
    @ManyToOne(() => TrainingProgram, program => program.enrollments, {
        onDelete: "CASCADE" // When program is deleted, enrollments are deleted
    })
    @JoinColumn({ name: "program_id" })
    program: TrainingProgram;

    @Column()
    @Index("idx_fk_enrollment_program")
    program_id: number;

    /**
     * Current status of the enrollment
     */
    @Column({
        type: "enum",
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ACTIVE
    })
    @IsEnum(EnrollmentStatus)
    status: EnrollmentStatus;

    /**
     * Current week of the program
     */
    @Column({ default: 1 })
    @IsNumber()
    @IsNotEmpty()
    currentWeek: number;

    /**
     * Number of workouts completed in this program
     */
    @Column({ default: 0 })
    @IsNumber()
    completedWorkouts: number;

    /**
     * Date when the user started the program
     */
    @Column({ type: "date" })
    @IsDate()
    startDate: Date;

    /**
     * Date when the user completed the program (if applicable)
     */
    @Column({ type: "date", nullable: true })
    @IsDate()
    @IsOptional()
    completionDate: Date;
    
    /**
     * User's rating of the program (1-5)
     */
    @Column({ nullable: true })
    @IsNumber()
    @IsOptional()
    userRating: number;
    
    /**
     * User's feedback about the program
     */
    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    userFeedback: string;

    /**
     * Detailed progress tracking for the program
     */
    @Column("jsonb", { default: {} })
    @ValidateNested()
    @Type(() => Object)
    progress: {
        workoutHistory?: {
            [key: string]: {  // Format: "W1D3" for Week 1, Day 3
                completed: boolean;
                completionDate?: Date;
                skipped?: boolean;
                notes?: string;
                rating?: number;  // User's rating for this specific workout
                difficulty?: number;  // User's perceived difficulty rating
            }
        };
        weeklyNotes?: {
            [key: number]: string;  // Week number -> notes
        };
        adaptations?: {
            [key: string]: {  // Format: "W1D3" for Week 1, Day 3
                originalWorkoutId: number;
                replacementWorkoutId: number;
                reason: string;
            }
        };
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 