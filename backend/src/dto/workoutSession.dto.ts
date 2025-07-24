import { IsNumber, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean, Min, Max, IsNotEmpty, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '../models/shared/Enums';

export class StartSessionDto {
  @IsNotEmpty({ message: 'Workout Plan ID is required' })
  @ValidateIf(o => typeof o.workoutPlanId === 'string')
  @IsString({ message: 'Workout Plan ID must be a string or number' })
  @ValidateIf(o => typeof o.workoutPlanId === 'number')
  @IsNumber({}, { message: 'Workout Plan ID must be a string or number' })
  workoutPlanId: string | number;
}

export class GetUserSessionsDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  startDateMin?: string;

  @IsOptional()
  @IsString()
  startDateMax?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class RecordExerciseCompletionDto {
  @IsNumber()
  @Min(0)
  repetitions?: number;

  @IsNumber()
  @Min(0)
  weight?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  formScore: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(1)
  setNumber: number;
}

export class SkipExerciseDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSessionStatusDto {
  @IsEnum(SessionStatus)
  status: SessionStatus;
}

export class CompleteExerciseDto {
  @IsNumber()
  @Min(0)
  repetitions?: number;

  @IsNumber()
  @Min(0)
  weight?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  formScore: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitSessionFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyRating: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsArray()
  @IsString({ each: true })
  focusAreas: string[];
} 