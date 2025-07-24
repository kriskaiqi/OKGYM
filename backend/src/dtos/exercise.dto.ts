import { IsString, IsArray, IsInt, IsOptional, Min, Max, IsUrl, ArrayMinSize } from 'class-validator';

export class CreateExerciseDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    type: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    keyPoints: string[];

    @IsOptional()
    @IsUrl()
    videoUrl?: string;

    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    difficulty: number;

    @IsString()
    muscleGroups: string;

    @IsOptional()
    @IsString()
    equipment?: string;
}

export class UpdateExerciseDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    keyPoints?: string[];

    @IsOptional()
    @IsUrl()
    videoUrl?: string;

    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    difficulty?: number;

    @IsOptional()
    @IsString()
    muscleGroups?: string;

    @IsOptional()
    @IsString()
    equipment?: string;
} 