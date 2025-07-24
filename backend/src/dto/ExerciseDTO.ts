import { 
    IsEnum, 
    IsNotEmpty, 
    IsString, 
    IsArray, 
    IsOptional, 
    IsUUID, 
    ValidateNested, 
    ArrayMinSize,
    IsNumber,
    Min,
    Max,
    IsBoolean
} from "class-validator";
import { Type } from "class-transformer";
import { 
    Difficulty, 
    ExerciseType, 
    MeasurementType, 
    MovementPattern,
    TrackingFeature
} from '../models/shared/Enums';
import { MuscleGroup } from "../models/shared/Validation";
import { RelationType } from "../models/ExerciseRelation";

export class ExerciseDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ExerciseType)
    type: ExerciseType;

    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @ValidateNested()
    @Type(() => MuscleGroup)
    muscleGroups: MuscleGroup;

    @IsEnum(MovementPattern)
    movementPattern: MovementPattern;

    @IsArray()
    @IsOptional()
    @IsUUID(4, { each: true })
    categoryIds?: string[];

    @IsArray()
    @IsOptional()
    @IsUUID(4, { each: true })
    equipmentIds?: string[];

    @IsArray()
    @IsOptional()
    @IsUUID(4, { each: true })
    mediaIds?: string[];

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ExecutionStepDTO)
    executionSteps?: ExecutionStepDTO[];

    @IsString()
    @IsOptional()
    safetyTips?: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    defaultDuration?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    defaultReps?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    defaultSets?: number;

    @IsEnum(MeasurementType)
    @IsOptional()
    primaryMeasurement?: MeasurementType;
}

export class ExecutionStepDTO {
    @IsNumber()
    @Min(1)
    stepNumber: number;

    @IsString()
    @IsNotEmpty()
    instruction: string;

    @IsUUID(4)
    @IsOptional()
    mediaId?: string;
}

export interface WorkoutExerciseInfo {
    id: string;
    workoutPlanId: string;
    workoutPlanName?: string;
    order: number;
    sets: number;
    repetitions?: number;
    duration?: number;
    restTime?: number;
    setType: string;
    exerciseRole: string;
    intensity?: {
        level?: string;
        weight?: number;
        resistance?: number;
        percentOfOneRepMax?: number;
        rateOfPerceivedExertion?: number;
    };
    notes?: string;
    tempo?: {
        eccentric?: number;
        concentric?: number;
        pause?: number;
        pauseAtTop?: number;
    };
    rangeOfMotion?: {
        partial?: boolean;
        rangeRestriction?: string;
    };
    progressionStrategy?: {
        autoRegulate?: boolean;
        deloadFrequency?: number;
        progressionRate?: number;
        targetProgressionType?: string;
    };
    substitutionOptions?: {
        allowRegressions?: boolean;
        allowProgressions?: boolean;
        preferredSubstitutes?: string[];
        allowEquipmentVariations?: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export class ExerciseResponseDTO {
    id: string;
    name: string;
    description?: string;
    type: ExerciseType;
    difficulty: Difficulty;
    muscleGroups: MuscleGroup;
    movementPattern: MovementPattern;
    equipment?: EquipmentResponseDTO[];
    media?: MediaResponseDTO[];
    categories?: CategoryResponseDTO[];
    createdAt: Date;
    updatedAt: Date;
    stats?: {
        duration?: {
            avg?: number;
            min?: number;
            max?: number;
        };
        calories?: {
            avg?: number;
            min?: number;
            max?: number;
        };
        completion?: {
            rate?: number;
            total?: number;
            successful?: number;
        };
        rating?: {
            value?: number;
            count?: number;
            distribution?: Record<string, number>;
        };
        popularity?: {
            score?: number;
            trend?: string;
            lastUpdated?: string;
        };
    };
    measurementType?: MeasurementType;
    types?: ExerciseType[];
    trackingFeatures?: TrackingFeature[];
    targetMuscleGroups?: string[];
    synergistMuscleGroups?: string[];
    form?: any;
    aiConfig?: any;
    workoutExercises?: WorkoutExerciseInfo[];
}

export class CategoryDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsNumber()
    @IsOptional()
    displayOrder?: number;
}

export class CategoryResponseDTO {
    id: string;
    name: string;
    description?: string;
    type: string;
    icon?: string;
    color?: string;
    displayOrder?: number;
}

export class EquipmentDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;
}

export class EquipmentResponseDTO {
    id: string;
    name: string;
    description?: string;
    category: string;
    difficulty?: string;
    costTier?: string;
    spaceRequired?: string;
    muscleGroupsTargeted?: any[];
    trainingTypes?: any[];
    imageUrl?: string;
    videoUrl?: string;
    manufacturer?: string;
    purchaseUrl?: string;
    estimatedPrice?: number;
    media?: any[];
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
    createdAt?: Date;
    updatedAt?: Date;
}

export class ExerciseRelationDTO {
    @IsUUID(4)
    @IsNotEmpty()
    sourceExerciseId: string;

    @IsUUID(4)
    @IsNotEmpty()
    targetExerciseId: string;

    @IsEnum(RelationType)
    type: RelationType;

    @IsString()
    @IsOptional()
    description?: string;
}

export class ExerciseRelationResponseDTO {
    id: string;
    sourceExerciseId: string;
    targetExerciseId: string;
    type: RelationType;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class MediaResponseDTO {
    id: string;
    type: string;
    url: string;
}

export interface ExerciseFilterOptions {
    type?: ExerciseType;
    difficulty?: Difficulty;
    muscleGroup?: string;
    equipment?: string;
    search?: string;
    page?: number;
    limit?: number;
    category?: string;
    categoryIds?: number[];
}

export interface CategoryFilterOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    parentCategoryId?: string;
}

export interface EquipmentFilterOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    isCommon?: boolean;
    category?: string;
    muscleGroup?: string;
    difficulty?: string;
    costTier?: string;
    spaceRequired?: string;
    manufacturer?: string;
    priceRange?: { min?: number; max?: number };
}

export interface PaginatedResponseDTO<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ErrorResponseDTO {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
    timestamp?: string;
} 