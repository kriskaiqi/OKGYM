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
  'UNKNOWN'
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