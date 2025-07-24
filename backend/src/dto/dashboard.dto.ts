import { IsString, IsNumber, IsOptional, Min, Max, IsEnum, IsArray, IsDate, IsBoolean, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRecentWorkoutsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class GetRecommendedWorkoutsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class GetScheduledWorkoutsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class CreateFitnessGoalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  target: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsDate()
  @Type(() => Date)
  deadline: Date;
}

export class UpdateFitnessGoalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  target?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current?: number;
}

export class CreateBodyMetricDto {
  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  muscleMass?: number;

  @IsDate()
  @Type(() => Date)
  date: Date;
}

export class GetWorkoutStatsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}

export class UpdateNotificationDto {
  @IsBoolean()
  read: boolean;
} 