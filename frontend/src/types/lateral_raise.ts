import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface LateralRaiseMetrics extends ExerciseMetrics {
  // Add exercise-specific metrics here
  repCount?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  armAngleDelta?: number;
  leftDelta?: number;
  rightDelta?: number;
  formScore?: number;
}

export interface LateralRaiseAnalysisResult {
  stage: ExerciseStage;
  metrics: LateralRaiseMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  isVisible?: boolean;
}

export interface LateralRaiseAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: LateralRaiseAnalysisResult;
} 