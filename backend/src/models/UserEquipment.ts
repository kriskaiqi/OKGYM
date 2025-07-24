import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    Unique
} from 'typeorm';
import { User } from './User';
import { EquipmentCategory } from './shared/Enums';

/**
 * Equipment locations
 */
export enum EquipmentLocation {
    HOME = "HOME",
    GYM = "GYM",
    OFFICE = "OFFICE",
    OUTDOOR = "OUTDOOR",
    TRAVEL = "TRAVEL",
    OTHER = "OTHER"
}

/**
 * UserEquipment entity tracks what exercise equipment a user has access to
 * This helps recommend appropriate exercises and workouts
 */
@Entity("user_equipment")
@Unique(["user", "equipmentName", "location"])
export class UserEquipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    @Index()
    user: User;

    @Column("varchar")
    equipmentName: string; // e.g., "Dumbbells", "Treadmill", "Resistance Bands"

    @Column({
        type: "enum",
        enum: EquipmentCategory,
        default: EquipmentCategory.ACCESSORIES
    })
    category: EquipmentCategory;

    @Column({
        type: "enum",
        enum: EquipmentLocation,
        default: EquipmentLocation.HOME
    })
    location: EquipmentLocation;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    model: string;

    @Column("jsonb", { nullable: true })
    specifications: {
        weightRange?: {
            min: number;
            max: number;
            unit: string;
        };
        adjustable?: boolean;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            unit: string;
        };
        resistance?: {
            levels: number;
            maxResistance?: number;
            unit?: string;
        };
        features?: string[];
    };

    @Column("text", { nullable: true })
    notes: string;

    @Column({ nullable: true })
    purchaseDate: Date;

    @Column("float", { nullable: true })
    condition: number; // 1-10 rating

    @Column({ nullable: true })
    imageUrl: string;

    @Column("jsonb", { nullable: true })
    usageStats: {
        lastUsed?: Date;
        usageFrequency?: number; // Uses per week
        favoriteExercises?: string[]; // Exercise IDs used with this equipment
        totalUses?: number;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * Data structure for adding new equipment
 */
export interface UserEquipmentData {
    userId: string;
    equipmentName: string;
    category: EquipmentCategory;
    location: EquipmentLocation;
    isAvailable?: boolean;
    brand?: string;
    model?: string;
    specifications?: {
        weightRange?: {
            min: number;
            max: number;
            unit: string;
        };
        adjustable?: boolean;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            unit: string;
        };
        resistance?: {
            levels: number;
            maxResistance?: number;
            unit?: string;
        };
        features?: string[];
    };
    notes?: string;
    purchaseDate?: Date;
    condition?: number;
    imageUrl?: string;
} 