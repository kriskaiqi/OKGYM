import { MediaPipeLandmark } from './mediapipe';

// Constants
export const ERROR_TYPES = [
  'INVALID_INPUT',
  'INVALID_LANDMARK',
  'METRICS_CALCULATION_ERROR',
  'ANALYSIS_ERROR',
  'foot_placement',
  'knee_placement',
  'visibility',
  'VIDEO_ERROR',
  'connection',
  'UNKNOWN',
  'uneven_pressing',
  'incorrect_form',
  'uneven_arms',
  'incomplete_pushup',
  'back_alignment',
  'excessive_raise',
  'insufficient_raise',
  'incomplete_situp',
  'straight_legs',
  'knee_angle',
  'knee_over_toe'
] as const;

export const ERROR_SEVERITIES = [
  'error',
  'warning',
  'info',
  'low',
  'medium',
  'high'
] as const;

export const STAGE_TYPES = [
  'up',
  'down',
  'middle',
  'unknown'
] as const;

// Error types
export interface ExerciseError {
  type: typeof ERROR_TYPES[number];
  severity: typeof ERROR_SEVERITIES[number];
  message: string;
}

// Exercise metrics
export interface ExerciseMetrics {
  shoulderWidth?: number;
  feetWidth?: number;
  kneeWidth?: number;
  feetToShoulderRatio?: number;
  kneeToFeetRatio?: number;
  hipAngle?: number;
  kneeAngle?: number;
  ankleAngle?: number;
  [key: string]: number | undefined;
}

// Exercise stages
export type ExerciseStage = typeof STAGE_TYPES[number];

// Analysis result
export interface ExerciseAnalysisResult {
  stage: ExerciseStage;
  metrics: ExerciseMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
}

// Analysis response
export interface ExerciseAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: ExerciseAnalysisResult;
}

// Analysis configuration
export interface ExerciseConfig {
  dimensions: {
    width: number;
    height: number;
  };
  showSkeleton: boolean;
  mirrorView: boolean;
}

// Default configuration
export const DEFAULT_EXERCISE_CONFIG: ExerciseConfig = {
  dimensions: {
    width: 640,
    height: 480
  },
  showSkeleton: true,
  mirrorView: true
};

// Component props
export interface BaseExerciseAnalyzerProps {
  onAnalysisComplete: (result: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  config?: Partial<ExerciseConfig>;
  children?: React.ReactNode;
} 