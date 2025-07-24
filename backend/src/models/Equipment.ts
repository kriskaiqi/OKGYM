import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsArray, ValidateNested, Min, Max, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { Exercise } from './Exercise';
import { ExerciseCategory } from './ExerciseCategory';
import { WorkoutPlan } from './WorkoutPlan';
import { WorkoutTag } from './WorkoutTag';
import { TrainingProgram } from './TrainingProgram';
import { Media } from './Media';
import { 
    Difficulty, 
    SpaceRequirement,
    CostTier,
    EquipmentCategory
} from './shared/Enums';

/**
 * Equipment entity represents a standard catalog of exercise equipment
 * This acts as a reference database for all available equipment
 * 
 * Relationships:
 * - ManyToMany with Exercise (exercises that use this equipment)
 * - ManyToMany with WorkoutPlan (workouts that need this equipment)
 * - ManyToMany with TrainingProgram (programs that require this equipment)
 * - ManyToMany with ExerciseCategory (muscle groups targeted)
 * - ManyToMany with WorkoutTag (training types this equipment is used for)
 * - ManyToOne with Media (image and video of the equipment)
 * 
 * Optimization notes:
 * - All foreign keys are properly indexed
 * - All relationships have appropriate cascade options
 * - Join tables use consistent naming conventions
 * - Search fields are indexed for performance
 */
@Entity("equipment")
@Index("idx_equipment_search", ["name", "category"])
export class Equipment {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    @Column({ default: "Unnamed Equipment" })
    @IsString()
    @IsNotEmpty()
    @Index("idx_equipment_name")
    name: string;

    @Column("text")
    @IsString()
    description: string;

    @Column({
        type: "enum",
        enum: EquipmentCategory,
        default: EquipmentCategory.ACCESSORIES
    })
    @IsEnum(EquipmentCategory)
    @Index("idx_equipment_category")
    category: EquipmentCategory;

    @Column({
        type: "enum",
        enum: Difficulty,
        default: Difficulty.BEGINNER
    })
    @IsEnum(Difficulty)
    @Index("idx_equipment_difficulty")
    difficulty: Difficulty;

    @Column({
        type: "enum",
        enum: CostTier, 
        default: CostTier.MID_RANGE
    })
    @IsEnum(CostTier)
    @Index("idx_equipment_cost_tier")
    costTier: CostTier;

    @Column({
        type: "enum",
        enum: SpaceRequirement,
        default: SpaceRequirement.SMALL
    })
    @IsEnum(SpaceRequirement)
    @Index("idx_equipment_space_required")
    spaceRequired: SpaceRequirement;

    /**
     * Muscle groups targeted by this equipment
     * When equipment is deleted, the association with muscle groups is removed
     */
    @ManyToMany(() => ExerciseCategory, category => category.equipment, { 
        cascade: ["insert", "update"],
        onDelete: "CASCADE" 
    })
    @JoinTable({
        name: "equipment_muscle_groups",
        joinColumn: { name: "equipment_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    })
    muscleGroupsTargeted: ExerciseCategory[];

    /**
     * Training types this equipment is used for
     * When equipment is deleted, the association with training types is removed
     */
    @ManyToMany(() => WorkoutTag, tag => tag.equipment, { 
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "equipment_training_types",
        joinColumn: { name: "equipment_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" }
    })
    trainingTypes: WorkoutTag[];

    /**
     * Exercises that use this equipment
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    exercises: Exercise[];

    /**
     * Workouts that need this equipment
     * When equipment is deleted, the association with workouts is removed
     */
    @ManyToMany(() => WorkoutPlan, workoutPlan => workoutPlan.equipmentNeeded, { 
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    workouts: WorkoutPlan[];

    /**
     * Programs that require this equipment
     * When equipment is deleted, the association with programs is removed
     */
    @ManyToMany(() => TrainingProgram, program => program.requiredEquipment, { 
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    programs: TrainingProgram[];

    /**
     * Image of the equipment
     * When equipment is deleted, the image reference is set to null
     */
    @ManyToOne(() => Media, { 
        nullable: true, 
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "image_id" })
    @Index("idx_fk_equipment_image")
    image: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_equipment_image_id")
    image_id: string;

    /**
     * Video demonstration of the equipment
     * When equipment is deleted, the video reference is set to null
     */
    @ManyToOne(() => Media, { 
        nullable: true, 
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "video_id" })
    @Index("idx_fk_equipment_video")
    video: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_equipment_video_id")
    video_id: string;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    purchaseUrl: string;

    @Column({ type: "float", nullable: true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Index("idx_equipment_price")
    estimatedPrice: number;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    @Index("idx_equipment_manufacturer")
    manufacturer: string;

    /**
     * Detailed technical specifications of the equipment
     * Stored as a JSON object for flexibility
     */
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    specifications: {
        weight?: number;
        dimensions?: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
        material?: string;
        color?: string;
        adjustable?: boolean;
        maxUserWeight?: number;
        warranty?: string;
        features?: string[];
        accessories?: string[];
        assembly?: {
            required: boolean;
            difficulty: number; // 1-5 scale
            estimatedTime: number; // minutes
        };
    };

    /**
     * Alternative equipment options for different scenarios
     * Useful for workout substitutions and recommendations
     */
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    alternatives: {
        homeMade?: string[];
        budget?: string[];
        premium?: string[];
        similar?: string[];
    };

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Data structure for creating a new equipment
 * Used for API request validation and service layer processing
 */
export interface EquipmentData {
    name: string;
    description: string;
    category: EquipmentCategory;
    difficulty?: Difficulty;
    costTier?: CostTier;
    spaceRequired?: SpaceRequirement;
    muscleGroupsTargeted?: string[];
    trainingTypes?: string[];
    imageId?: string;
    videoId?: string;
    purchaseUrl?: string;
    estimatedPrice?: number;
    manufacturer?: string;
    specifications?: {
        weight?: number;
        dimensions?: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
        material?: string;
        color?: string;
        adjustable?: boolean;
        maxUserWeight?: number;
        warranty?: string;
        features?: string[];
        accessories?: string[];
        assembly?: {
            required: boolean;
            difficulty: number;
            estimatedTime: number;
        };
    };
    alternatives?: {
        homeMade?: string[];
        budget?: string[];
        premium?: string[];
        similar?: string[];
    };
} 