import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface SquatMetrics extends ExerciseMetrics {
  // Add any squat-specific metrics here
  repCount?: number;
}

export interface SquatAnalysisResult {
  stage: ExerciseStage;
  metrics: SquatMetrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
}

export interface SquatAnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: SquatAnalysisResult;
}

export interface ExerciseThresholds {
  PREDICTION_PROB: number;
  VISIBILITY: number;
  FOOT_SHOULDER_RATIO: [number, number];
  KNEE_FOOT_RATIO: {
    up: [number, number];
    middle: [number, number];
    down: [number, number];
  };
  ANGLES: {
    up: number;
    middle: number;
    down: number;
  };
}

// Constants matching Python implementation
export const THRESHOLDS: ExerciseThresholds = {
  PREDICTION_PROB: 0.7,
  VISIBILITY: 0.6,
  FOOT_SHOULDER_RATIO: [1.2, 2.8],
  KNEE_FOOT_RATIO: {
    up: [0.5, 1.0],
    middle: [0.7, 1.0],
    down: [0.7, 1.1]
  },
  ANGLES: {
    up: 160,
    middle: 120,
    down: 90
  }
}; 