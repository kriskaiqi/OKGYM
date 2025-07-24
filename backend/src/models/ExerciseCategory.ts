import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    Index
} from 'typeorm';
import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Exercise } from './Exercise';
import { WorkoutPlan } from './WorkoutPlan';
import { Equipment } from './Equipment';
import { TrainingProgram } from './TrainingProgram';

/**
 * Category types for exercise classification
 * NOTE: This should be moved to shared/Enums.ts in a future update for consistency
 */
export enum CategoryType {
    MUSCLE_GROUP = "MUSCLE_GROUP",         // Primary muscles worked
    MOVEMENT_PATTERN = "MOVEMENT_PATTERN", // Type of movement (push, pull, etc.)
    EQUIPMENT = "EQUIPMENT",               // Required equipment
    EXPERIENCE_LEVEL = "EXPERIENCE_LEVEL", // Beginner, intermediate, advanced
    GOAL = "GOAL",                         // Strength, hypertrophy, endurance
    BODY_PART = "BODY_PART",               // Body part targeted
    SPECIAL = "SPECIAL"                    // Other special categories
}

/**
 * ExerciseCategory entity provides a hierarchical categorization system for exercises
 * This allows for better organization, filtering, and discovery of exercises
 * 
 * Relationships:
 * - ManyToMany with Exercise (exercises in this category)
 * - ManyToMany with WorkoutPlan (workouts targeting this muscle group)
 * - ManyToMany with Equipment (equipment that targets this muscle group)
 * - ManyToMany with TrainingProgram (programs that target this muscle group)
 */
@Entity("exercise_categories")
@Index("idx_category_search", ["name", "type", "isActive"])
export class ExerciseCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    @Index("idx_category_name")
    name: string;

    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    description: string;

    @Column({
        type: "enum",
        enum: CategoryType,
        default: CategoryType.MUSCLE_GROUP
    })
    @IsEnum(CategoryType)
    @Index("idx_category_type")
    type: CategoryType;

    @Column({ nullable: true })
    @IsNumber()
    @IsOptional()
    parentId: number; // For hierarchical categories (e.g., "Upper Body" > "Chest")

    @Column("varchar", { nullable: true })
    @IsString()
    @IsOptional()
    icon: string; // Icon identifier or CSS class

    @Column("varchar", { nullable: true })
    @IsString()
    @IsOptional()
    color: string; // Color code for UI display

    @Column({ default: 0 })
    @IsNumber()
    @IsOptional()
    displayOrder: number; // For controlling display order in UI

    @Column({ default: true })
    @IsBoolean()
    @Index("idx_category_active")
    isActive: boolean;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    metadata: {
        aliases?: string[];          // Alternative names
        anatomicalInfo?: string;     // Anatomical details (for muscle groups)
        benefits?: string[];         // Benefits of training this category
        recommendedFrequency?: string; // How often to train this category
        relatedCategories?: number[]; // IDs of related categories
        imageUrl?: string;           // Image for the category
    };

    /**
     * Exercises that belong to this category
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    exercises: Exercise[];

    /**
     * Workouts that target this muscle group
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    workouts: WorkoutPlan[];

    /**
     * Equipment that targets this muscle group
     */
    @ManyToMany(() => Equipment, equipment => equipment.muscleGroupsTargeted)
    equipment: Equipment[];

    /**
     * Programs that target this muscle group
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    programs: TrainingProgram[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    // Category hierarchy - handled through code rather than direct relationships
    childCategories: ExerciseCategory[] = [];
}

/**
 * Data structure for creating a new exercise category
 */
export interface ExerciseCategoryData {
    name: string;
    description?: string;
    type: CategoryType;
    parentId?: number;
    icon?: string;
    color?: string;
    displayOrder?: number;
    isActive?: boolean;
    metadata?: {
        aliases?: string[];
        anatomicalInfo?: string;
        benefits?: string[];
        recommendedFrequency?: string;
        relatedCategories?: number[];
        imageUrl?: string;
    };
} 