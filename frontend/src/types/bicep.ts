import { ExerciseError } from './ai/exercise';

// Define a custom metrics interface that doesn't inherit from ExerciseMetrics
export interface BicepMetrics {
  // Angle measurements
  leftCurlAngle?: number;
  rightCurlAngle?: number;
  leftUpperArmAngle?: number;
  rightUpperArmAngle?: number;
  
  // Visibility flags
  leftArmVisible?: boolean;
  rightArmVisible?: boolean;
  
  // Common metrics that might be in the base ExerciseMetrics
  shoulderWidth?: number;
  hipAngle?: number;
  
  // Rep counts
  reps?: {
    left: number;
    right: number;
  };
  
  // Allow any other numeric metrics
  [key: string]: number | boolean | undefined | {
    left: number;
    right: number;
  };
}

export interface BicepAnalysisResult {
  stage: string;
  metrics: BicepMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
}

export interface BicepAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: BicepAnalysisResult;
} 