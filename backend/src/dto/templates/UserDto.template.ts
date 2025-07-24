import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  Length, 
  IsEnum, 
  IsBoolean,
  IsObject,
  ValidateNested,
  IsArray,
  IsDate,
  MinDate,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '../../models/User';
import {
  Gender,
  ActivityLevel,
  FitnessGoal,
  WorkoutLocation,
  ExercisePreference,
  BodyArea,
  MeasurementUnit,
  AppTheme,
  Difficulty
} from '../../models/shared/Enums';

/**
 * DTO for creating a new user
 */
export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsObject()
  preferences?: any;
}

/**
 * DTO for updating user data
 */
export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsObject()
  preferences?: any;
}

/**
 * DTO for user fitness profile
 */
export class UserFitnessProfileDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @Min(30)
  @Max(300)
  heightCm?: number;

  @IsOptional()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsArray()
  @IsEnum(FitnessGoal, { each: true })
  fitnessGoals?: FitnessGoal[];

  @IsOptional()
  @IsEnum(Difficulty)
  fitnessLevel?: Difficulty;

  @IsOptional()
  @IsEnum(WorkoutLocation)
  preferredLocation?: WorkoutLocation;

  @IsOptional()
  @IsArray()
  @IsEnum(ExercisePreference, { each: true })
  exercisePreferences?: ExercisePreference[];

  @IsOptional()
  @IsArray()
  @IsEnum(BodyArea, { each: true })
  targetBodyAreas?: BodyArea[];

  @IsOptional()
  @IsEnum(MeasurementUnit)
  preferredUnit?: MeasurementUnit;

  @IsOptional()
  @IsEnum(AppTheme)
  preferredTheme?: AppTheme;
}

/**
 * DTO for filtering users
 */
export class UserFilterDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActiveAfter?: Date;

  @IsOptional()
  @IsBoolean()
  hasCompletedProfile?: boolean;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsArray()
  @IsEnum(FitnessGoal, { each: true })
  fitnessGoals?: FitnessGoal[];

  @IsOptional()
  @IsEnum(WorkoutLocation)
  preferredLocation?: WorkoutLocation;

  @IsOptional()
  @IsArray()
  @IsEnum(ExercisePreference, { each: true })
  exercisePreferences?: ExercisePreference[];

  @IsOptional()
  @IsArray()
  @IsEnum(BodyArea, { each: true })
  targetBodyAreas?: BodyArea[];

  @IsOptional()
  @IsEnum(MeasurementUnit)
  preferredUnit?: MeasurementUnit;

  @IsOptional()
  @IsEnum(AppTheme)
  preferredTheme?: AppTheme;

  @IsOptional()
  @IsEnum(Difficulty)
  minimumFitnessLevel?: Difficulty;

  @IsOptional()
  @IsBoolean()
  includePreferences?: boolean;

  @IsOptional()
  @IsBoolean()
  includeFitnessGoals?: boolean;

  @IsOptional()
  @IsBoolean()
  includeFavoriteWorkouts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeWorkoutHistory?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteWorkoutIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workoutHistoryIds?: string[];

  @IsOptional()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * DTO for user response (excludes sensitive data)
 */
export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profilePicture?: string;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
  // Note: password is explicitly excluded
}

/**
 * Convert User entity to UserResponseDto
 */
export const toUserResponseDto = (user: any): UserResponseDto => {
  const { password, ...userDto } = user;
  return userDto;
}; 