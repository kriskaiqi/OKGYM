// Important landmarks for squat analysis (matching Python backend)
export const IMPORTANT_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
} as const;

// Thresholds for squat analysis (matching Python backend)
export const THRESHOLDS = {
  VISIBILITY: 0.6,
  PREDICTION_PROB: 0.7,
  FOOT_SHOULDER_RATIO: {
    MIN: 1.2,
    MAX: 2.8
  },
  KNEE_FOOT_RATIO: {
    UP: {
      MIN: 0.5,
      MAX: 1.0
    },
    MIDDLE: {
      MIN: 0.7,
      MAX: 1.0
    },
    DOWN: {
      MIN: 0.7,
      MAX: 1.1
    }
  },
  ANGLE: {
    UP: 160,
    MIDDLE: 120,
    DOWN: 90
  }
} as const;

// Stage definitions (matching Python backend)
export const STAGES = {
  UP: 'up',
  DOWN: 'down',
  MIDDLE: 'middle',
  UNKNOWN: 'unknown'
} as const;

export type Stage = typeof STAGES[keyof typeof STAGES];

// Error types (matching Python backend)
export const ERROR_TYPES = {
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_LANDMARK: 'INVALID_LANDMARK',
  METRICS_CALCULATION_ERROR: 'METRICS_CALCULATION_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  FOOT_PLACEMENT: 'foot_placement',
  KNEE_PLACEMENT: 'knee_placement',
  VISIBILITY: 'visibility',
  VIDEO_ERROR: 'VIDEO_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

// Error severities (matching Python backend)
export const ERROR_SEVERITIES = {
  ERROR: 'error',
  WARNING: 'warning',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export type ErrorSeverity = typeof ERROR_SEVERITIES[keyof typeof ERROR_SEVERITIES];

// MediaPipe configuration
export const MEDIAPIPE_CONFIG = {
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  selfieMode: false
} as const; 