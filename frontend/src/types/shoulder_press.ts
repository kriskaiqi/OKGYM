import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface ShoulderPressMetrics extends ExerciseMetrics {
  // Add exercise-specific metrics here
  repCount?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  // isVisible is handled separately and not part of the metrics
}

export interface ShoulderPressAnalysisResult {
  stage: ExerciseStage;
  metrics: ShoulderPressMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  isVisible?: boolean;
}

export interface ShoulderPressAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: ShoulderPressAnalysisResult;
} 