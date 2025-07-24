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
import { WorkoutPlan } from './WorkoutPlan';
import { TrainingProgram } from './TrainingProgram';
import { Equipment } from './Equipment';
import { TagCategory, TagScope } from './shared/Enums';

/**
 * WorkoutTag represents a tag that can be applied to workouts
 * This enables better categorization, filtering, and discovery
 * 
 * Relationships:
 * - ManyToMany with WorkoutPlan (workouts with this tag)
 * - ManyToMany with TrainingProgram (training programs with this tag)
 * - ManyToMany with Equipment (equipment associated with this type of workout)
 */
@Entity("workout_tags")
@Index("idx_tag_search", ["name", "category", "isActive"])
export class WorkoutTag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    @Index("idx_tag_name")
    name: string;

    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    description: string;

    @Column({
        type: "enum",
        enum: TagCategory,
        default: TagCategory.SPECIAL
    })
    @IsEnum(TagCategory)
    @Index("idx_tag_category")
    category: TagCategory;

    @Column({
        type: "enum",
        enum: TagScope,
        default: TagScope.SYSTEM
    })
    @IsEnum(TagScope)
    @Index("idx_tag_scope")
    scope: TagScope;

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
    displayOrder: number; // For controlling display order in UI

    @Column({ default: true })
    @IsBoolean()
    @Index("idx_tag_active")
    isActive: boolean;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    createdBy: string; // User ID if user-created

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    metadata: {
        aliases?: string[];             // Alternative names
        appliesTo?: string[];           // What types of workouts this applies to
        relatedTags?: number[];         // IDs of related tags
        autoApplyCriteria?: {           // Criteria for auto-applying this tag
            muscleGroups?: string[];
            duration?: {
                min: number;
                max: number;
            };
            difficulty?: string;
            equipment?: string[];
        };
    };

    @Column({ default: 0 })
    @IsNumber()
    usageCount: number; // How many times the tag has been used

    /**
     * Workouts that have this tag
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    workouts: WorkoutPlan[];

    /**
     * Training programs that have this tag
     */
    @ManyToMany(() => TrainingProgram, program => program.tags)
    @JoinTable({
        name: "program_tags",
        joinColumn: { name: "tag_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "program_id", referencedColumnName: "id" }
    })
    trainingPrograms: TrainingProgram[];

    /**
     * Equipment associated with this type of workout
     */
    @ManyToMany(() => Equipment, equipment => equipment.trainingTypes)
    @JoinTable({
        name: "equipment_training_types",
        joinColumn: { name: "tag_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "equipment_id", referencedColumnName: "id" }
    })
    equipment: Equipment[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Data structure for creating a new workout tag
 */
export interface WorkoutTagData {
    name: string;
    description?: string;
    category: TagCategory;
    scope?: TagScope;
    icon?: string;
    color?: string;
    displayOrder?: number;
    isActive?: boolean;
    createdBy?: string;
    metadata?: {
        aliases?: string[];
        appliesTo?: string[];
        relatedTags?: number[];
        autoApplyCriteria?: {
            muscleGroups?: string[];
            duration?: {
                min: number;
                max: number;
            };
            difficulty?: string;
            equipment?: string[];
        };
    };
} 