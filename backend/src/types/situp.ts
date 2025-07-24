import { ExerciseError, ExerciseStage, ExerciseMetrics } from './exercise';

export interface SitupMetrics extends ExerciseMetrics {
  torsoAngle?: number;
  kneeAngle?: number;
  // Additional situp-specific metrics can be added here
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