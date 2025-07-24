import { ExerciseError } from './exercise';

export interface BicepMetrics {
  // Angle measurements
  leftCurlAngle?: number;
  rightCurlAngle?: number;
  leftUpperArmAngle?: number;
  rightUpperArmAngle?: number;
  
  // Visibility flags
  leftArmVisible?: boolean;
  rightArmVisible?: boolean;
  
  // Common metrics
  shoulderWidth?: number;
  hipAngle?: number;
  
  // Allow any other metrics
  [key: string]: number | boolean | undefined;
}

export interface BicepAnalysisResult {
  stage: 'up' | 'down' | 'middle' | 'unknown';
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