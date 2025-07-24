import { ExerciseError, ExerciseStage } from './ai/exercise';

// Define metrics without extending ExerciseMetrics
export interface PushupMetrics {
  repCount?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  armAngleDelta?: number;
  stage?: ExerciseStage;
  formScore?: number;
  [key: string]: number | string | undefined;
}

export interface PushupAnalysisResult {
  stage: ExerciseStage;
  metrics: PushupMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  isVisible?: boolean;
}

export interface PushupAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: PushupAnalysisResult;
} 