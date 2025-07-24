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
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, Max } from "class-validator";
import { TrainingProgram } from "./TrainingProgram";
import { WorkoutPlan } from "./WorkoutPlan";
import { DayOfWeek } from "./shared/Enums";

/**
 * ProgramWorkout is a junction entity that assigns specific workouts to specific days
 * within a training program, creating a structured schedule.
 */
@Entity("program_workouts")
@Index(["program", "week", "day"])
@Index(["workout", "program"])
export class ProgramWorkout {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    @ManyToOne(() => TrainingProgram, program => program.programWorkouts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "program_id" })
    @Index()
    program: TrainingProgram;

    @ManyToOne(() => WorkoutPlan, workout => workout.programWorkouts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "workout_id" })
    @Index()
    workout: WorkoutPlan;

    @Column({ type: "integer" })
    @IsNumber()
    @Min(1)
    week: number;

    @Column({
        type: "enum",
        enum: DayOfWeek
    })
    @IsEnum(DayOfWeek)
    day: DayOfWeek;

    @Column({ type: "integer", default: 1 })
    @IsNumber()
    @Min(1)
    order: number;

    @Column({ type: "boolean", default: false })
    isOptional: boolean;

    @Column({ type: "boolean", default: false })
    isDeload: boolean;

    @Column({ type: "text", nullable: true })
    @IsOptional()
    notes: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
} 