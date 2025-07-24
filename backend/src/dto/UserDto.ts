import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength, IsArray, IsNumber, Min, Max, ArrayMinSize, ArrayMaxSize, IsBoolean, IsIn, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus, WeightHistoryEntry } from '../models/User';
import { Gender, ActivityLevel, FitnessGoal, WorkoutLocation, ExercisePreference, BodyArea, MeasurementUnit, AppTheme, Difficulty } from '../models/shared/Enums';

// Define our own WeightHistoryEntry for the DTO with proper string date handling
class WeightHistoryEntryDto {
  @IsOptional()
  @Type(() => Date)
  date: Date | string;

  @IsNumber()
  @Min(0)
  weight: number;
}

/**
 * DTO for creating a new user
 */
export class UserCreateDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid user status' })
  status?: UserStatus;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;
}

/**
 * DTO for updating a user
 */
export class UserUpdateDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid user status' })
  status?: UserStatus;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;
}

/**
 * DTO for updating a user's fitness profile
 */
export class UserFitnessProfileDto {
  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age cannot exceed 120' })
  age?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(30, { message: 'Height must be at least 30 cm' })
  @Max(300, { message: 'Height cannot exceed 300 cm' })
  heightCm?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(20, { message: 'Weight must be at least 20 kg' })
  @Max(300, { message: 'Weight cannot exceed 300 kg' })
  weightKg?: number;

  @IsOptional()
  @IsEnum(Gender, { message: 'Invalid gender value' })
  gender?: Gender;

  @IsOptional()
  @IsEnum(ActivityLevel, { message: 'Invalid activity level' })
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsArray({ message: 'Fitness goals must be an array' })
  @ArrayMinSize(0, { message: 'Fitness goals array cannot be null' })
  @ArrayMaxSize(10, { message: 'Cannot select more than 10 fitness goals' })
  @IsEnum(FitnessGoal, { each: true, message: 'Invalid fitness goal' })
  fitnessGoals?: FitnessGoal[];

  @IsOptional()
  @IsEnum(Difficulty, { message: 'Invalid fitness level' })
  fitnessLevel?: Difficulty;

  @IsOptional()
  @IsEnum(WorkoutLocation, { message: 'Invalid preferred workout location' })
  preferredLocation?: WorkoutLocation;

  @IsOptional()
  @IsArray({ message: 'Exercise preferences must be an array' })
  @ArrayMinSize(0, { message: 'Exercise preferences array cannot be null' })
  @ArrayMaxSize(10, { message: 'Cannot select more than 10 exercise preferences' })
  @IsEnum(ExercisePreference, { each: true, message: 'Invalid exercise preference' })
  exercisePreferences?: ExercisePreference[];

  @IsOptional()
  @IsArray({ message: 'Target body areas must be an array' })
  @ArrayMinSize(0, { message: 'Target body areas array cannot be null' })
  @ArrayMaxSize(10, { message: 'Cannot select more than 10 target body areas' })
  @IsEnum(BodyArea, { each: true, message: 'Invalid target body area' })
  targetBodyAreas?: BodyArea[];
  
  @IsOptional()
  @IsNumber({}, { message: 'Birth year must be a number' })
  @Min(1900, { message: 'Birth year must be at least 1900' })
  @Max(new Date().getFullYear(), { message: 'Birth year cannot be in the future' })
  birthYear?: number;
}

/**
 * DTO for updating a user's preferences
 */
export class UserPreferencesDto {
  @IsOptional()
  @IsEnum(MeasurementUnit, { message: 'Invalid preferred measurement unit' })
  preferredUnit?: MeasurementUnit;

  @IsOptional()
  @IsEnum(AppTheme, { message: 'Invalid preferred app theme' })
  preferredTheme?: AppTheme;

  @IsOptional()
  @IsArray({ message: 'Notification preferences must be an array' })
  notificationPreferences?: string[];

  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  language?: string;
  
  @IsOptional()
  @IsString({ message: 'Date of birth must be a string in ISO format' })
  dateOfBirth?: string;
}

/**
 * Data transfer object for filtering users
 * Used for both API requests and repository queries
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
  @MaxLength(50)
  searchTerm?: string;
  
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
  
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;
  
  @IsOptional()
  @IsEnum(Difficulty)
  minimumFitnessLevel?: Difficulty;
  
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
  @IsBoolean()
  includePreferences?: boolean;
  
  @IsOptional()
  @IsBoolean()
  includeFitnessGoals?: boolean;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
  
  @IsOptional()
  @IsString()
  sortBy?: string;
  
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC';
  
  /**
   * Converts string array parameters to proper arrays
   * Useful when dealing with query parameters from HTTP requests
   */
  static formatQueryParams(query: any): UserFilterDto {
    const formatted: UserFilterDto = { ...query };
    
    // Convert string arrays to actual arrays
    if (query.exercisePreferences && typeof query.exercisePreferences === 'string') {
      formatted.exercisePreferences = query.exercisePreferences.split(',');
    }
    
    if (query.targetBodyAreas && typeof query.targetBodyAreas === 'string') {
      formatted.targetBodyAreas = query.targetBodyAreas.split(',');
    }
    
    if (query.fitnessGoals && typeof query.fitnessGoals === 'string') {
      formatted.fitnessGoals = query.fitnessGoals.split(',');
    }
    
    // Convert string boolean values
    if (query.includePreferences !== undefined) {
      formatted.includePreferences = query.includePreferences === 'true';
    }
    
    if (query.includeFitnessGoals !== undefined) {
      formatted.includeFitnessGoals = query.includeFitnessGoals === 'true';
    }
    
    // Convert numeric strings
    if (query.limit !== undefined) {
      formatted.limit = parseInt(query.limit, 10);
    }
    
    if (query.offset !== undefined) {
      formatted.offset = parseInt(query.offset, 10);
    }
    
    return formatted;
  }
}

/**
 * DTO for changing user password
 */
export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(100, { message: 'New password cannot exceed 100 characters' })
  newPassword: string;
}

/**
 * Response DTO for user data
 * Used for transforming user entity to response
 */
export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string;
  dateOfBirth?: Date;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User stats DTO
 */
export class UserStatsDto {
  currentWeight?: number;
  startingWeight?: number;
  weightHistory?: WeightHistoryEntryDto[];
  weightUnit?: string = 'METRIC';
  lastWorkoutDate?: Date;
}

/**
 * DTO for updating specific user stats
 */
export class UserStatsUpdateDto {
  @IsOptional()
  @IsDate()
  lastWorkoutDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  currentWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  startingWeight?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightHistoryEntryDto)
  weightHistory?: WeightHistoryEntryDto[];
}

/**
 * Complete user profile DTO with relationships
 */
export class UserProfileDto {
  @Type(() => UserResponseDto)
  user: UserResponseDto;
  
  @Type(() => UserStatsDto)
  stats: UserStatsDto;
  
  @IsArray()
  @Type(() => Object)
  recentActivities: any[] = [];
  
  @IsArray()
  @Type(() => Object)
  achievements: any[] = [];
  
  @IsArray()
  @Type(() => Object)
  fitnessGoals: any[] = [];
  
  @IsArray()
  @Type(() => Object)
  bodyMetrics: any[] = [];
  
  @IsArray()
  @Type(() => Object)
  favoriteWorkouts: any[] = [];
} 