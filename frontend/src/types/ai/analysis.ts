import { ExerciseError, ExerciseAnalysisResponse, ExerciseConfig } from './exercise';

export interface AnalysisResult extends ExerciseAnalysisResponse {
  // Add any additional analysis-specific properties here
}

export type AnalysisConfig = ExerciseConfig;

export interface AnalysisState {
  isAnalyzing: boolean;
  isPoseModelReady: boolean;
  error: ExerciseError | null;
  result: ExerciseAnalysisResponse | null;
}

export interface AnalysisProps {
  onAnalysisComplete?: (result: ExerciseAnalysisResponse) => void;
  config?: Partial<ExerciseConfig>;
} 