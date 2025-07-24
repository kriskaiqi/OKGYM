import { Exercise, ExerciseAttempt, ExerciseResult, PlannedExercise, ActualExercise, ExerciseStatus } from './exercise';
import { User } from './user';

// Difficulty enum for workout plans
export enum WorkoutDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Category enum for workout plans
export enum WorkoutCategory {
  FULL_BODY = 'FULL_BODY',
  UPPER_BODY = 'UPPER_BODY',
  LOWER_BODY = 'LOWER_BODY',
  PUSH = 'PUSH',
  PULL = 'PULL',
  LEGS = 'LEGS',
  CORE = 'CORE',
  CARDIO = 'CARDIO',
  HIIT = 'HIIT',
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  FLEXIBILITY = 'FLEXIBILITY',
  RECOVERY = 'RECOVERY',
  CUSTOM = 'CUSTOM'
}

// Sort options for workout plans
export enum WorkoutSortOption {
  NEWEST = 'createdAt',
  OLDEST = 'createdAt',
  POPULARITY = 'popularity',
  RATING = 'rating',
  DURATION_ASC = 'estimatedDuration',
  DURATION_DESC = 'estimatedDuration'
}

// Session status
export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Workout location
export enum WorkoutLocation {
  HOME = 'HOME',
  GYM = 'GYM',
  OUTDOOR = 'OUTDOOR',
  OTHER = 'OTHER'
}

// Interface for workout plans
export interface WorkoutPlan {
  id: string | number;
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  estimatedDuration: number; // In minutes
  isCustom: boolean;
  rating: number;
  ratingCount: number;
  popularity: number;
  workoutCategory: WorkoutCategory;
  estimatedCaloriesBurn: number;
  exercises: WorkoutExercise[];
  imageUrl?: string; // URL to the workout plan image
  videoUrl?: string; // URL to the workout plan video
  media?: any[]; // Array of media items associated with the workout
  createdAt: Date;
  updatedAt: Date;
  creatorId?: number; // Optional for system-generated workouts
  creator?: User; // The user who created the workout plan (if any)
  isFavorite?: boolean;
  exerciseCount?: number;
  severity?: string; // Severity level for the workout
}

// Interface for workout exercises (junction entity between WorkoutPlan and Exercise)
export interface WorkoutExercise {
  id: string | number;
  order: number;
  repetitions: number | null;
  duration: number | null; // In seconds
  sets: number;
  restTime: number; // In seconds
  intensity?: string; // Exercise intensity level
  exercise: Exercise;
  notes?: string;
}

// Interface for filtering workout plans
export interface WorkoutPlanFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: WorkoutDifficulty;
  categoryIds?: number[];
  duration?: { min?: number; max?: number };
  isCustom?: boolean;
  creatorId?: string;
  sortBy?: WorkoutSortOption;
  sortOrder?: 'ASC' | 'DESC';
  isFavorite?: boolean;
}

// DTO for creating a workout plan
export interface CreateWorkoutPlanRequest {
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  estimatedDuration: number;
  workoutCategory: WorkoutCategory;
  imageUrl?: string;
  exercises?: CreateWorkoutExerciseRequest[];
}

// DTO for creating a workout exercise
export interface CreateWorkoutExerciseRequest {
  exerciseId: string;
  order: number;
  repetitions?: number;
  duration?: number;
  sets: number;
  restTime: number;
  intensity?: string;
  notes?: string;
}

// Interface for workout progress tracking
export interface WorkoutProgress {
  userId: number;
  totalWorkoutsCompleted: number;
  totalCaloriesBurned: number;
  totalDuration: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: {
    date: Date;
    workoutsCompleted: number;
    caloriesBurned: number;
    duration: number; // in minutes
  }[];
  exerciseProgress: {
    exerciseId: number;
    exerciseName: string;
    totalReps: number;
    totalSets: number;
    maxWeight: number;
    progressOverTime: {
      date: Date;
      reps: number;
      weight?: number;
    }[];
  }[];
}

// Interface for exercise sequence in a workout session
export interface ExerciseSequence {
  originalPlan: PlannedExercise[];
  actualSequence: ActualExercise[];
}

// Exercise summary in workout results
export interface ExerciseSummary {
  exerciseId: string;
  name: string;
  totalAttempts: number;
  bestResult: {
    weight?: number;
    reps?: number;
    duration?: number;
    difficultyScore?: number;
    notes?: string;
  };
}

// Summary of workout session results
export interface WorkoutSummary {
  totalExercises: number;
  uniqueExercises: number;
  totalDuration: number;
  caloriesBurned: number;
  averageHeartRate?: number;
  peakHeartRate?: number;
  difficultyRating?: number;
  focusAreas: string[];
  muscleGroups: string[];
  totalSets: number;
  totalReps: number;
  formScore: number;
  exerciseSummaries: ExerciseSummary[];
}

// Location data for workout
export interface LocationData {
  type: WorkoutLocation;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

// Environment data for workout
export interface EnvironmentData {
  temperature?: number;
  humidity?: number;
  weather?: string;
  altitude?: number;
}

// Health data for workout
export interface HealthData {
  avgHeartRate?: number;
  peakHeartRate?: number;
  caloriesBurned?: number;
  stepsCount?: number;
  weightBefore?: number;
  weightAfter?: number;
  stressLevel?: number;
  hydrationLevel?: number;
}

// Interface for workout session
export interface WorkoutSession {
  id: string;
  user: User;
  workoutPlan: WorkoutPlan;
  status: SessionStatus;
  exerciseSequence: ExerciseSequence;
  exerciseResults: { [exerciseId: string]: ExerciseResult };
  summary: WorkoutSummary;
  startTime?: Date;
  endTime?: Date;
  totalDuration: number;
  caloriesBurned: number;
  difficultyRating: number;
  userFeedback?: string;
  locationData?: LocationData;
  environmentData?: EnvironmentData;
  healthData?: HealthData;
  createdAt: Date;
  updatedAt: Date;
} 