import { MediaPipeLandmark } from '../../types/ai/mediapipe/types';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { ExerciseError } from '../../types/ai/exercise';

// Map error types to bodyparts for squats
const SQUAT_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'foot_placement': {
    joints: [27, 28, 31, 32], // Ankles and feet
    connections: [[27, 31], [28, 32]], // Ankle to foot connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'knee_placement': {
    joints: [25, 26], // Knees
    connections: [[23, 25], [24, 26], [25, 27], [26, 28]], // Hip to knee and knee to ankle
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for situps
const SITUP_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'incomplete_situp': {
    joints: [0, 11, 12], // Nose and shoulders
    connections: [[0, 11], [0, 12], [11, 12], [11, 23], [12, 24]], // Head to shoulders, shoulders to hips
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'straight_legs': {
    joints: [25, 26], // Knees
    connections: [[23, 25], [24, 26], [25, 27], [26, 28]], // Hip to knee and knee to ankle
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for shoulder press
const SHOULDER_PRESS_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'uneven_pressing': {
    joints: [13, 14, 15, 16], // Elbows and wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16]], // Shoulders to elbows to wrists
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'incorrect_form': {
    joints: [11, 12, 13, 14, 15, 16], // Shoulders, elbows, wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12]], // Full arm + shoulder connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for bench press
const BENCH_PRESS_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'uneven_pressing': {
    joints: [13, 14, 15, 16], // Elbows and wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16]], // Shoulders to elbows to wrists
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'incorrect_form': {
    joints: [11, 12, 13, 14, 15, 16], // Shoulders, elbows, wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12]], // Full arm + shoulder connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for pushups
const PUSHUP_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'uneven_arms': {
    joints: [13, 14, 15, 16], // Elbows and wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16]], // Shoulders to elbows to wrists
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'incomplete_pushup': {
    joints: [11, 12, 13, 14, 15, 16], // Shoulders, elbows, wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12]], // Full arm + shoulder connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'back_alignment': {
    joints: [11, 12, 23, 24], // Shoulders and hips
    connections: [[11, 23], [12, 24], [11, 12], [23, 24]], // Shoulders to hips
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for lateral raises
const LATERAL_RAISE_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'uneven_arms': {
    joints: [13, 14, 15, 16], // Elbows and wrists
    connections: [[11, 13], [13, 15], [12, 14], [14, 16]], // Shoulders to elbows to wrists
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'excessive_raise': {
    joints: [15, 16], // Wrists
    connections: [[13, 15], [14, 16]], // Elbows to wrists
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'insufficient_raise': {
    joints: [11, 12, 13, 14], // Shoulders and elbows
    connections: [[11, 13], [12, 14]], // Shoulders to elbows
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for lunges
const LUNGE_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'knee_angle': {
    joints: [25, 26], // Knees
    connections: [[23, 25], [24, 26], [25, 27], [26, 28]], // Hip to knee and knee to ankle connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'knee_over_toe': {
    joints: [25, 26, 27, 28, 31, 32], // Knees, ankles, and feet
    connections: [[25, 27], [26, 28], [27, 31], [28, 32]], // Knee to ankle and ankle to foot connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for bicep curls
const BICEP_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'loose_upper_arm': {
    joints: [11, 12, 13, 14], // Shoulders and elbows
    connections: [[11, 13], [12, 14], [11, 23], [12, 24]], // Shoulder to elbow and shoulder to hip connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'peak_contraction': {
    joints: [13, 14, 15, 16], // Elbows and wrists
    connections: [[13, 15], [14, 16]], // Elbow to wrist connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'lean_back': {
    joints: [11, 12, 23, 24, 27, 28], // Shoulders, hips, and ankles
    connections: [[11, 23], [12, 24], [23, 27], [24, 28]], // Shoulder to hip and hip to ankle connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

// Map error types to bodyparts for plank
const PLANK_ERROR_MAPPINGS: Record<string, {joints: number[], connections: number[][], color: string}> = {
  'high_back': {
    joints: [11, 12, 23, 24], // Shoulders and hips
    connections: [[11, 23], [12, 24], [23, 25], [24, 26]], // Shoulder to hip and hip to knee connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'low_back': {
    joints: [11, 12, 23, 24], // Shoulders and hips
    connections: [[11, 23], [12, 24], [23, 25], [24, 26]], // Shoulder to hip and hip to knee connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'hip_sag': {
    joints: [23, 24], // Hips
    connections: [[11, 23], [12, 24], [23, 25], [24, 26]], // Shoulder to hip and hip to knee connections
    color: '#ff4d4dff' // Bright red with full opacity
  },
  'visibility': {
    joints: [], // No specific joints for visibility
    connections: [],
    color: '#ff4d4dff' // Bright red with full opacity
  }
};

export interface DrawConfig {
  width: number;
  height: number;
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  skeletonColor?: string;
  skeletonLineWidth?: number;
  scale?: {
    x: number;
    y: number;
  };
  mirror?: boolean;
  offsetX?: number;
  offsetY?: number;
}

export const DEFAULT_DRAW_CONFIG: DrawConfig = {
  width: 640,
  height: 480,
  lineWidth: 2,
  lineColor: '#75757580', // Light gray with transparency for landmarks
  fillColor: '#75757580', // Light gray with transparency for dots
  skeletonColor: '#75757580', // Light gray with transparency for skeleton lines
  skeletonLineWidth: 1.5, // Slightly thinner lines
  scale: { x: 1, y: 1 },
  mirror: false,
  offsetX: 0,
  offsetY: 0
};

export const drawPoseLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: MediaPipeLandmark[],
  config: Partial<DrawConfig> = {},
  errors?: ExerciseError[], 
  exerciseType: string = 'squat'
): void => {
  if (!ctx || !landmarks || landmarks.length === 0) return;

  const mergedConfig = { ...DEFAULT_DRAW_CONFIG, ...config };
  const { width, height, scale, mirror, offsetX = 0, offsetY = 0 } = mergedConfig;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Apply mirror transformation if needed
  if (mirror) {
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
  }

  // Apply scaling
  if (scale) {
    ctx.scale(scale.x, scale.y);
  }
  
  // Apply custom offset to fine-tune position
  ctx.translate(offsetX, offsetY);

  // Draw landmarks - smaller, more subtle dots
  ctx.strokeStyle = mergedConfig.lineColor;
  ctx.fillStyle = mergedConfig.fillColor;
  ctx.lineWidth = mergedConfig.lineWidth;

  landmarks.forEach((landmark: MediaPipeLandmark) => {
    // Draw all landmarks regardless of visibility
    const x = landmark.x * width;
    const y = landmark.y * height;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI); // Smaller circles for regular landmarks
    ctx.fill();
  });

  // Draw skeleton - thinner, more subtle lines
  ctx.beginPath();
  ctx.strokeStyle = mergedConfig.skeletonColor || '#75757580'; // Use configured color but ensure it's subtle
  ctx.lineWidth = mergedConfig.skeletonLineWidth || 1.5; // Slightly thinner lines

  POSE_CONNECTIONS.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    if (startPoint && endPoint) {
      const startX = startPoint.x * width;
      const startY = startPoint.y * height;
      const endX = endPoint.x * width;
      const endY = endPoint.y * height;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }
  });

  ctx.stroke();

  // Now highlight error-specific parts if errors are provided - keep this prominently visible
  if (errors && errors.length > 0) {
    // Only highlight the most significant error (first in array)
    const mainError = errors[0];
    
    // Determine which error mapping to use based on exercise type
    let mappingObject;
    switch(exerciseType) {
      case 'squat':
        mappingObject = SQUAT_ERROR_MAPPINGS;
        break;
      case 'situp':
        mappingObject = SITUP_ERROR_MAPPINGS;
        break;
      case 'shoulder_press':
        mappingObject = SHOULDER_PRESS_ERROR_MAPPINGS;
        break;
      case 'bench_press':
        mappingObject = BENCH_PRESS_ERROR_MAPPINGS;
        break;
      case 'pushup':
        mappingObject = PUSHUP_ERROR_MAPPINGS;
        break;
      case 'lateral_raise':
        mappingObject = LATERAL_RAISE_ERROR_MAPPINGS;
        break;
      case 'lunge':
        mappingObject = LUNGE_ERROR_MAPPINGS;
        break;
      case 'bicep_curl':
        mappingObject = BICEP_ERROR_MAPPINGS;
        break;
      case 'plank':
        mappingObject = PLANK_ERROR_MAPPINGS;
        break;
      default:
        mappingObject = SQUAT_ERROR_MAPPINGS; // Default to squat if not recognized
    }
    
    // Now get the specific error mapping based on the error type
    const errorMapping = mappingObject[mainError.type];
    
    // Highlight error-specific parts if there's a mapping for this error
    if (errorMapping) {
      // Draw highlighted joints
      ctx.fillStyle = errorMapping.color;
      errorMapping.joints.forEach(jointIndex => {
        const joint = landmarks[jointIndex];
        if (joint) {
          const x = joint.x * width;
          const y = joint.y * height;
          
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI); // Larger radius for highlighted joints
          ctx.fill();
        }
      });
      
      // Draw highlighted connections
      ctx.strokeStyle = errorMapping.color;
      ctx.lineWidth = (mergedConfig.skeletonLineWidth || mergedConfig.lineWidth) + 4; // Much thicker line for highlights
      
      ctx.beginPath();
      errorMapping.connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        if (startPoint && endPoint) {
          const startX = startPoint.x * width;
          const startY = startPoint.y * height;
          const endX = endPoint.x * width;
          const endY = endPoint.y * height;

          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
        }
      });
      
      ctx.stroke();
    }
  }

  ctx.restore();
};

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  if (!ctx) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations
  ctx.clearRect(0, 0, width, height);
  ctx.restore();
};

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number = window.devicePixelRatio || 1
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Set canvas size accounting for device pixel ratio
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale context to account for device pixel ratio
  ctx.scale(dpr, dpr);

  return ctx;
}; 