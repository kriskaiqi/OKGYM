import { IsString, IsInt, IsArray, IsBoolean, IsOptional, Min, Max, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class WorkoutExerciseDto {
    @IsUUID()
    exerciseId: string;

    @IsInt()
    @Min(0)
    order: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    repetitions?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    duration?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateWorkoutPlanDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsInt()
    @Min(1)
    @Max(5)
    difficulty: number;

    @IsInt()
    @Min(0)
    estimatedDuration: number;

    @IsBoolean()
    isCustom: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkoutExerciseDto)
    exercises: WorkoutExerciseDto[];
}

export class UpdateWorkoutPlanDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    difficulty?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    estimatedDuration?: number;

    @IsOptional()
    @IsBoolean()
    isCustom?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkoutExerciseDto)
    exercises?: WorkoutExerciseDto[];
} 