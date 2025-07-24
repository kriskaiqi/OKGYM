import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface LungeMetrics extends ExerciseMetrics {
  repCount?: number;
  leftKneeAngle?: number;
  rightKneeAngle?: number;
  // Boolean metrics should be handled via separate properties, not included in the index signature
  [key: string]: number | undefined;
}

// Separate interface for boolean metrics to avoid type conflicts
export interface LungeErrorFlags {
  kneeAngleError?: boolean;
  kneeOverToeError?: boolean;
  leftKneeError?: boolean;
  rightKneeError?: boolean;
}

export interface LungeAnalysisResult {
  stage: ExerciseStage;
  metrics: LungeMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  errorFlags?: LungeErrorFlags;
}

export interface LungeAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: LungeAnalysisResult;
}

// Constants for lunge thresholds
export const LUNGE_KNEE_ANGLE_THRESHOLD = [60, 125];
export const PREDICTION_PROB_THRESHOLD = 0.8; 