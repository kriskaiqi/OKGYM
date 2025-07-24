import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface SitupMetrics extends ExerciseMetrics {
  // Add exercise-specific metrics here
  repCount?: number;
  torsoAngle?: number;
  kneeAngle?: number;
}

export interface SitupAnalysisResult {
  stage: ExerciseStage;
  metrics: SitupMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  isVisible?: boolean;
}

export interface SitupAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: SitupAnalysisResult;
} 