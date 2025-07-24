// Exercise categories enum
export enum ExerciseCategory {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  FLEXIBILITY = 'FLEXIBILITY',
  BALANCE = 'BALANCE',
  CIRCUIT = 'CIRCUIT'
}

// Exercise muscle groups enum
export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  ARMS = 'ARMS',
  LEGS = 'LEGS',
  CORE = 'CORE',
  FULL_BODY = 'FULL_BODY'
}

// Exercise equipment enum
export enum Equipment {
  NONE = 'NONE',
  DUMBBELLS = 'DUMBBELLS',
  BARBELL = 'BARBELL',
  KETTLEBELL = 'KETTLEBELL',
  RESISTANCE_BANDS = 'RESISTANCE_BANDS',
  MEDICINE_BALL = 'MEDICINE_BALL',
  PULL_UP_BAR = 'PULL_UP_BAR',
  BENCH = 'BENCH',
  STABILITY_BALL = 'STABILITY_BALL',
  YOGA_MAT = 'YOGA_MAT',
  FOAM_ROLLER = 'FOAM_ROLLER',
  CABLE_MACHINE = 'CABLE_MACHINE',
  SMITH_MACHINE = 'SMITH_MACHINE',
  TREADMILL = 'TREADMILL',
  STATIONARY_BIKE = 'STATIONARY_BIKE',
  ELLIPTICAL = 'ELLIPTICAL',
  ROWING_MACHINE = 'ROWING_MACHINE',
  TRX = 'TRX'
}

// Exercise difficulty type
export enum ExerciseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Exercise relationship types
export enum RelationType {
  VARIATION = 'VARIATION',
  ALTERNATIVE = 'ALTERNATIVE',
  PROGRESSION = 'PROGRESSION',
  REGRESSION = 'REGRESSION'
}

// Exercise status in a workout session
export enum ExerciseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED'
}

// Interface for exercises
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[] | string;
  equipment: string[] | string;
  difficulty: ExerciseDifficulty;
  instructions: string[] | string;
  imageUrl?: string;
  videoUrl?: string;
  media?: any[]; // Array of media items associated with the exercise
  estimatedDuration: number; // in minutes
  calories: number; // estimated calories burned in 30 mins
  createdAt: string;
  updatedAt: string;
  
  // Additional properties for enhancing exercise details
  tips?: string[] | string;
  benefits?: string[] | string;
  
  // New fields from the database schema
  measurementType?: string;
  types?: string;
  level?: string;
  movementPattern?: string;
  trackingFeatures?: string | string[];
  synergistMuscleGroups?: string | string[];
  targetMuscleGroups?: string | string[];
  
  // Form JSON data
  form?: {
    joints?: {
      primary?: string[];
    };
    safety?: {
      tips?: string[];
      cautions?: string[];
      prerequisites?: string[];
    };
    muscles?: {
      primary?: string[];
      secondary?: string[];
    };
    execution?: {
      setup?: string[];
      steps?: string[];
      tempo?: string;
      keyPoints?: string[];
    };
  };
  
  // AI configuration JSON data
  aiConfig?: any;
  
  // Stats object for performance metrics
  stats?: {
    rating?: {
      count?: number;
      value?: number;
      distribution?: Record<string, number>;
    };
    calories?: {
      avg?: number;
      max?: number;
      min?: number;
    };
    duration?: {
      avg?: number; // in seconds
      max?: number;
      min?: number;
    };
    completion?: {
      rate?: number;
      total?: number;
      successful?: number;
    };
    popularity?: {
      score?: number;
      trend?: string;
      lastUpdated?: string;
    };
    _debug?: {
      isDataAvailable?: boolean;
      dataSource?: string;
    };
  };
  
  // Optional relationship properties that may be loaded
  variations?: Exercise[];
  alternatives?: Exercise[];
  progressions?: Exercise[];
  regressions?: Exercise[];
}

// Interface for exercise filter options
export interface ExerciseFilterOptions {
  category?: ExerciseCategory;
  muscleGroup?: MuscleGroup;
  equipment?: string;
  difficulty?: ExerciseDifficulty;
  search?: string;
  page?: number;
  limit?: number;
}

// Interface for creating a new exercise
export interface CreateExerciseRequest {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: string[];
  difficulty: ExerciseDifficulty;
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  estimatedDuration: number;
  calories: number;
}

// Interface for updating an exercise
export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  category?: ExerciseCategory;
  muscleGroups?: MuscleGroup[];
  equipment?: string[];
  difficulty?: ExerciseDifficulty;
  instructions?: string[];
  imageUrl?: string;
  videoUrl?: string;
  estimatedDuration?: number;
  calories?: number;
}

export interface ExerciseRelation {
  id: string;
  relationType: RelationType;
  relatedExercise: Exercise;
  notes?: string;
  similarityScore?: number;
}

// Exercise attempt in a workout session
export interface ExerciseAttempt {
  timestamp: Date;
  repetitions: number;
  duration: number;
  formScore: number;
  weight?: number;
  resistance?: number;
  notes?: string;
}

// Best result from exercise attempts
export interface BestResult {
  weight?: number;
  reps?: number;
  duration?: number;
  difficultyScore?: number;
  formScore?: number;
  notes?: string;
}

// Combined results for all attempts at an exercise
export interface ExerciseResult {
  attempts: ExerciseAttempt[];
  bestResult: BestResult;
  feedback?: string;
  difficultyRating?: number;
}

// Planned exercise configuration
export interface PlannedExercise {
  exerciseId: string;
  order: number;
  targetRepetitions: number;
  targetDuration: number;
  targetSets: number;
  restTime: number;
  notes?: string;
}

// Actual exercise execution
export interface ActualExercise {
  exerciseId: string;
  order: number;
  startTime: Date;
  endTime?: Date;
  status: ExerciseStatus;
  completedSets: number;
  notes?: string;
}

// Log for tracking exercise performance
export interface ExerciseLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: {
    setNumber: number;
    reps: number;
    weight?: number;
    duration?: number;
    restTime?: number;
    formScore: number;
    notes?: string;
    timestamp: Date;
  }[];
  status: ExerciseStatus;
  formScore: number;
  personalRecord: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 