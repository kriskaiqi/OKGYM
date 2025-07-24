import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface PlankMetrics extends ExerciseMetrics {
  // Plank-specific metrics
  durationInSeconds?: number;
  // Convert boolean flags to numbers (0/1) to match ExerciseMetrics index signature
  highBackFlag?: number; // 1 if high back error, 0 if not
  lowBackFlag?: number;  // 1 if low back error, 0 if not
}

export interface PlankAnalysisResult {
  stage: ExerciseStage;
  metrics: PlankMetrics;
  errors: ExerciseError[];
  formScore: number;
  durationInSeconds: number;
}

export interface PlankAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: PlankAnalysisResult;
}

export enum PlankErrorType {
  HIGH_BACK = 'high_back',
  LOW_BACK = 'low_back',
}

export enum PlankStage {
  CORRECT = 'correct',
  HIGH_BACK = 'high_back',
  LOW_BACK = 'low_back',
  UNKNOWN = 'unknown',
} 