// User roles enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER'
}

// User activity level enum
export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTREMELY_ACTIVE = 'EXTREMELY_ACTIVE'
}

// User fitness goal enum
export enum FitnessGoal {
  GENERAL_FITNESS = 'GENERAL_FITNESS',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  FAT_LOSS = 'FAT_LOSS',
  MUSCLE_BUILDING = 'MUSCLE_BUILDING',
  STRENGTH_GAIN = 'STRENGTH_GAIN',
  HYPERTROPHY = 'HYPERTROPHY',
  ENDURANCE = 'ENDURANCE'
}

// Interface for user profiles
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  weight?: number; // in kg
  height?: number; // in cm
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
  fitnessLevel?: string;
  mainGoal?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  preferences?: any; // User preferences as a JSON object
  stats?: {
    totalWorkouts?: number;
    totalWorkoutTime?: number;
    averageWorkoutsPerWeek?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastWorkoutDate?: Date;
    currentWeight?: number;
    startingWeight?: number;
    weightHistory?: Array<{date: Date, weight: number}>;
    completedGoals?: number;
    earnedAchievements?: number;
  };
}

// Interface for user registration
export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: string;
  birthYear?: number;
  height?: number;
  fitnessLevel?: string;
  mainGoal?: string;
  activityLevel?: string;
  stats?: {
    weightUnit?: string;
    currentWeight?: number;
    startingWeight?: number;
    weightHistory?: Array<{date: Date, weight: number}>;
  };
  preferences?: {
    dateOfBirth?: string;
  };
  bodyMetrics?: {
    weight: number;
    bodyArea: string;
    valueType: string;
    unit: string;
    notes?: string;
    targetValue?: number;
    desiredTrend?: string;
    source?: string;
  };
  fitnessGoals?: Array<{
    title: string;
    type: string;
    target: number;
    current: number;
    unit: string;
    startDate: Date;
    deadline: Date;
    status: string;
    description?: string;
  }>;
}

// Interface for user login
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface for authentication response
export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

// Interface for updating user profile
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  weight?: number;
  height?: number;
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
  bio?: string;
  profilePicture?: string;
}

// Interface for changing password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
} 