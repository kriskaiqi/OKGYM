import { ExerciseError, ExerciseStage } from './ai/exercise';

// Define metrics without extending ExerciseMetrics
export interface BenchPressMetrics {
  repCount?: number;
  leftShoulderAngle?: number;
  rightShoulderAngle?: number;
  stage?: ExerciseStage;
  formScore?: number;
  [key: string]: number | string | undefined;
}

export interface BenchPressAnalysisResult {
  stage: ExerciseStage;
  metrics: BenchPressMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
  isVisible?: boolean;
}

export interface BenchPressAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: BenchPressAnalysisResult;
} 