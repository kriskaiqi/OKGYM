# Exercise Service DTOs Reference

This document provides reference implementations for the Data Transfer Objects (DTOs) needed for the Exercise Service.

## Table of Contents
1. [Exercise DTOs](#exercise-dtos)
2. [Category DTOs](#category-dtos)
3. [Equipment DTOs](#equipment-dtos)
4. [Relation DTOs](#relation-dtos)
5. [Filter Options](#filter-options)
6. [Response DTOs](#response-dtos)

## Exercise DTOs

### ExerciseDTO
This DTO is used for creating and updating exercises.

```typescript
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
    Max
} from "class-validator";
import { Type } from "class-transformer";
import { 
    Difficulty, 
    ExerciseType, 
    MovementPattern, 
    MuscleGroup,
    MeasurementType
} from "../models/shared/Enums";

export class ExerciseDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(ExerciseType)
    type: ExerciseType;

    @IsNotEmpty()
    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(MuscleGroup, { each: true })
    muscleGroups: MuscleGroup[];

    @IsNotEmpty()
    @IsEnum(MovementPattern)
    movementPattern: MovementPattern;

    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    categoryIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    equipmentIds?: string[];

    @IsOptional()
    @IsString()
    instructions?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExecutionStepDTO)
    executionSteps?: ExecutionStepDTO[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    safetyTips?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    defaultDuration?: number;  // in seconds

    @IsOptional()
    @IsNumber()
    @Min(0)
    defaultReps?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    defaultSets?: number;

    @IsOptional()
    @IsEnum(MeasurementType)
    primaryMeasurement?: MeasurementType;

    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    mediaIds?: string[];
}

export class ExecutionStepDTO {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    stepNumber: number;

    @IsNotEmpty()
    @IsString()
    instruction: string;

    @IsOptional()
    @IsUUID("4")
    mediaId?: string;
}
```

### ExerciseResponseDTO
DTO for returning exercise data to clients.

```typescript
// Simplified response DTO for exercises (removes sensitive or unnecessary fields)
export class ExerciseResponseDTO {
    id: string;
    name: string;
    description: string;
    type: ExerciseType;
    difficulty: Difficulty;
    muscleGroups: MuscleGroup[];
    movementPattern: MovementPattern;
    categories: { id: string; name: string }[];
    equipment: { id: string; name: string }[];
    instructions?: string;
    executionSteps?: { stepNumber: number; instruction: string; media?: MediaResponseDTO }[];
    safetyTips?: string[];
    defaultDuration?: number;
    defaultReps?: number;
    defaultSets?: number;
    primaryMeasurement?: MeasurementType;
    media?: MediaResponseDTO[];
    primaryMedia?: MediaResponseDTO;
    createdAt: Date;
    updatedAt: Date;
}

export class MediaResponseDTO {
    id: string;
    url: string;
    type: string;
    thumbnailUrl?: string;
}
```

## Category DTOs

### CategoryDTO
DTO for creating and updating exercise categories.

```typescript
import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";

export class CategoryDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID("4")
    parentCategoryId?: string;

    @IsOptional()
    @IsString()
    iconName?: string;
}
```

### CategoryResponseDTO
DTO for returning category data to clients.

```typescript
export class CategoryResponseDTO {
    id: string;
    name: string;
    description?: string;
    parentCategory?: { id: string; name: string };
    iconName?: string;
    exerciseCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
```

## Equipment DTOs

### EquipmentDTO
DTO for creating and updating equipment.

```typescript
import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean } from "class-validator";

export class EquipmentDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    alternatives?: string[];

    @IsOptional()
    @IsBoolean()
    isCommon?: boolean;
}
```

### EquipmentResponseDTO
DTO for returning equipment data to clients.

```typescript
export class EquipmentResponseDTO {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    alternatives?: string[];
    isCommon: boolean;
    exerciseCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
```

## Relation DTOs

### ExerciseRelationDTO
DTO for creating and managing exercise relationships.

```typescript
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsString } from "class-validator";
import { RelationType } from "../models/ExerciseRelation";

export class ExerciseRelationDTO {
    @IsNotEmpty()
    @IsUUID("4")
    sourceExerciseId: string;

    @IsNotEmpty()
    @IsUUID("4")
    targetExerciseId: string;

    @IsNotEmpty()
    @IsEnum(RelationType)
    relationType: RelationType;

    @IsOptional()
    @IsString()
    notes?: string;
}
```

### ExerciseRelationResponseDTO
DTO for returning exercise relationship data.

```typescript
export class ExerciseRelationResponseDTO {
    id: string;
    sourceExercise: { id: string; name: string };
    targetExercise: { id: string; name: string };
    relationType: RelationType;
    notes?: string;
}
```

## Filter Options

### ExerciseFilterOptions
Interface for filtering exercise lists.

```typescript
import { 
    Difficulty, 
    ExerciseType, 
    MovementPattern, 
    MuscleGroup 
} from "../models/shared/Enums";

export interface ExerciseFilterOptions {
    // Pagination
    page?: number;
    limit?: number;
    
    // Sorting
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    
    // Filters
    categoryIds?: string[];
    equipmentIds?: string[];
    difficulty?: Difficulty;
    muscleGroups?: MuscleGroup[];
    type?: ExerciseType;
    movementPattern?: MovementPattern;
    search?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    creatorId?: string;
}
```

### CategoryFilterOptions
Interface for filtering category lists.

```typescript
export interface CategoryFilterOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    parentCategoryId?: string;
}
```

### EquipmentFilterOptions
Interface for filtering equipment lists.

```typescript
export interface EquipmentFilterOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    isCommon?: boolean;
}
```

## Response DTOs

### PaginatedResponseDTO
Generic interface for paginated responses.

```typescript
export interface PaginatedResponseDTO<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
```

### ErrorResponseDTO
Interface for returning error responses.

```typescript
export interface ErrorResponseDTO {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
    timestamp?: string;
}
```

These DTO definitions can be adjusted as needed during implementation, but they provide a good starting point that follows the established patterns in the codebase. 