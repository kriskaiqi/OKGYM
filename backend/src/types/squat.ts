export type FormError = {
  type: 'INVALID_INPUT' | 'ANALYSIS_ERROR' | 'INVALID_LANDMARK' | 'METRICS_CALCULATION_ERROR' | 'foot_placement' | 'knee_placement' | 'visibility' | 'UNKNOWN' | 'VIDEO_ERROR';
  severity: 'error' | 'warning' | 'low' | 'medium' | 'high' | 'info';
  message: string;
};

export interface SquatMetrics {
  shoulderWidth?: number;
  feetWidth?: number;
  kneeWidth?: number;
  feetToShoulderRatio?: number;
  kneeToFeetRatio?: number;
  hipAngle?: number;
  kneeAngle?: number;
  ankleAngle?: number;
}

export interface SquatAnalysisResult {
  stage: 'up' | 'down' | 'middle' | 'unknown';
  metrics: SquatMetrics;
  errors: FormError[];
  formScore: number;
  repCount: number;
}

export interface SquatAnalysisResponse {
  success: boolean;
  error?: FormError;
  result?: SquatAnalysisResult;
} 