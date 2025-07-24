import { ExerciseError, ExerciseStage } from './exercise';

export interface LungeMetrics {
  leftKneeAngle?: number;
  rightKneeAngle?: number;
  kneeOverToe?: boolean;
  [key: string]: number | boolean | undefined;
}

export interface LungeAnalysisResult {
  stage: ExerciseStage;
  metrics: LungeMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  errorFlags?: {
    kneeAngleError?: boolean;
    kneeOverToeError?: boolean;
    leftKneeError?: boolean;
    rightKneeError?: boolean;
  };
}

export interface LungeAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: LungeAnalysisResult;
}

// Constants for lunge thresholds
export const LUNGE_KNEE_ANGLE_THRESHOLD = [60, 125];
export const PREDICTION_PROB_THRESHOLD = 0.8; 