import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
    Index,
    JoinColumn
} from "typeorm";
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max, IsBoolean, IsDate } from "class-validator";
import { Type } from 'class-transformer';
import { User } from "./User";
import { ProgramWorkout } from "./ProgramWorkout";
import { WorkoutPlan } from "./WorkoutPlan";
import { WorkoutTag } from "./WorkoutTag";
import { Equipment } from "./Equipment";
import { ExerciseCategory } from "./ExerciseCategory";
import { 
    Difficulty, 
    SplitType, 
    ProgressionType,
    FitnessGoal,
    WorkoutCategory
} from './shared/Enums';
import {
    NumericalRange,
    ScaleOfTen,
    NormalizedScore
} from './shared/Validation';
import * as ModelUtils from './shared/Utils';
import { ProgramEnrollment } from "./ProgramEnrollment";

/**
 * Class for program prerequisites
 */
class ProgramPrerequisites {
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    minStrengthLevels?: { [exercise: string]: number }; // Minimum strength benchmarks
    
    @IsOptional()
    @IsString()
    experienceLevel?: string;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    timeAvailability?: number; // Minimum minutes per week
}

/**
 * Class for weekly breakdown in program metadata
 */
class WeeklyBreakdown {
    @IsString()
    @IsNotEmpty()
    focus: string;
    
    @IsString()
    description: string;
    
    @IsNumber()
    @Min(1)
    @Max(10)
    intensity: number; // 1-10 scale
    
    @IsArray()
    @IsEnum(FitnessGoal, { each: true })
    goals: FitnessGoal[];
}

/**
 * Class for program metadata
 */
class ProgramMetadata {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    prerequisites?: string[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    expectedResults?: string[];
    
    @IsOptional()
    @IsArray()
    @IsEnum(FitnessGoal, { each: true })
    fitnessGoals?: FitnessGoal[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    idealFor?: string[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notRecommendedFor?: string[];
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedCalorieBurn?: number;
    
    @IsOptional()
    @IsString()
    intensity?: string;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    timeCommitmentPerWeek?: number; // In minutes
    
    @IsOptional()
    @IsString()
    flexibility?: string; // How flexible the program is
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    weeklyBreakdown?: {
        [week: number]: WeeklyBreakdown;
    };
}

/**
 * Class for progression strategy
 */
class ProgressionStrategy {
    @IsOptional()
    @IsBoolean()
    autoAdjust?: boolean; // Whether the program adjusts based on user performance
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    deloadFrequency?: number; // Every X weeks
    
    @IsOptional()
    @IsEnum(ProgressionType)
    progressionType?: ProgressionType; // How progression is implemented
    
    @IsOptional()
    @IsArray()
    adaptationRules?: any[]; // Rules for adapting the program
}

/**
 * TrainingProgram represents a structured, multi-week workout plan
 * designed to help users achieve specific fitness goals over time.
 * 
 * Relationships:
 * - ManyToMany with WorkoutPlan (workouts included in this program)
 * - ManyToMany with WorkoutTag (tags describing this program)
 * - ManyToMany with Equipment (equipment needed for this program)
 * - ManyToMany with ExerciseCategory (muscle groups targeted)
 * - ManyToOne with User (creator of the program)
 * - OneToMany with ProgramEnrollment (users enrolled in this program)
 */
@Entity("training_programs")
@Index("idx_program_search", ["name", "category", "difficulty"])
export class TrainingProgram {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index("idx_program_name")
    @IsString()
    @IsNotEmpty()
    name: string;

    @Column("text")
    @IsString()
    @IsNotEmpty()
    description: string;
    
    @Column({
        type: "enum",
        enum: Difficulty,
        default: Difficulty.BEGINNER
    })
    @IsEnum(Difficulty)
    @Index("idx_program_difficulty")
    difficulty: Difficulty;
    
    @Column({
        type: "enum",
        enum: WorkoutCategory,
        default: WorkoutCategory.FULL_BODY
    })
    @IsEnum(WorkoutCategory)
    @Index("idx_program_category")
    category: WorkoutCategory;

    @Column()
    @IsNumber()
    @Min(1)
    durationWeeks: number;
    
    @Column()
    @IsNumber()
    @Min(1)
    workoutsPerWeek: number;
    
    @Column()
    @IsNumber()
    @Min(5)
    @Max(180)
    estimatedMinutesPerWorkout: number;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    imageUrl: string;
    
    /**
     * Tags associated with this program
     */
    @ManyToMany(() => WorkoutTag)
    @JoinTable({
        name: "program_tags",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" }
    })
    tags: WorkoutTag[];
    
    @Column({ default: false })
    @IsBoolean()
    @Index("idx_program_published")
    isPublished: boolean;
    
    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    enrollmentCount: number;
    
    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    completionCount: number;
    
    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;
    
    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    ratingCount: number;
    
    @Column("float", { default: 0 })
    @IsNumber()
    @Min(0)
    @Max(1)
    successRate: number;
    
    @Column({
        type: "enum",
        enum: ProgressionType,
        default: ProgressionType.LINEAR,
        nullable: true
    })
    @IsEnum(ProgressionType)
    programStructure: ProgressionType;
    
    @Column({
        type: "enum",
        enum: SplitType,
        nullable: true
    })
    @IsEnum(SplitType)
    splitType: SplitType;
    
    /**
     * Creator of this program
     */
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "creator_id" })
    @Index("idx_fk_program_creator")
    creator: User;

    @Column({ nullable: true })
    creator_id: number;

    /**
     * Workouts included in this program
     */
    @OneToMany(() => ProgramWorkout, programWorkout => programWorkout.program, {
        cascade: true,
        eager: true
    })
    programWorkouts: ProgramWorkout[];

    /**
     * Workout plans included in this program
     */
    @ManyToMany(() => WorkoutPlan)
    @JoinTable({
        name: "program_workout_plans",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    })
    workoutPlans: WorkoutPlan[];

    /**
     * Equipment required for this program
     */
    @ManyToMany(() => Equipment)
    @JoinTable({
        name: "program_equipment",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "equipment_id", referencedColumnName: "id" }
    })
    requiredEquipment: Equipment[];

    /**
     * Muscle groups targeted by this program
     */
    @ManyToMany(() => ExerciseCategory)
    @JoinTable({
        name: "program_muscle_groups",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    })
    targetMuscleGroups: ExerciseCategory[];

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ProgramMetadata)
    metadata: ProgramMetadata;
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ProgressionStrategy)
    progressionStrategy: ProgressionStrategy;
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ProgramPrerequisites)
    prerequisites: ProgramPrerequisites;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    /**
     * Calculate program completion rate
     * @returns Completion rate as a normalized value between 0-1
     */
    calculateCompletionRate(): number {
        if (this.enrollmentCount === 0) return 0;
        return this.completionCount / this.enrollmentCount;
    }
    
    /**
     * Calculate total program duration in minutes
     * @returns Total program duration
     */
    calculateTotalDuration(): number {
        return this.durationWeeks * this.workoutsPerWeek * this.estimatedMinutesPerWorkout;
    }
    
    /**
     * Check if program is suitable for a given experience level
     * @param level User experience level
     * @returns Boolean indicating suitability
     */
    isSuitableForLevel(level: Difficulty): boolean {
        // Programs are suitable for the matching level and one level below
        const levels = [Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED, Difficulty.ELITE];
        const programIndex = levels.indexOf(this.difficulty);
        const userIndex = levels.indexOf(level);
        
        // If program is beginner, it's suitable for all
        if (programIndex === 0) return true;
        
        // If user level is equal or one below program level
        return userIndex >= programIndex - 1;
    }

    /**
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    enrollments: ProgramEnrollment[];
} 