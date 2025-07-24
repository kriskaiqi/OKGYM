import { CSSProperties, MutableRefObject } from 'react';
import { MediaPipeLandmark, MediaPipeResults } from '../../../types/ai/mediapipe/types';
import { Pose } from '@mediapipe/pose';
import { ExerciseError } from '../../../types/ai/exercise';

export interface DrawConfig {
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  skeletonColor?: string;
  skeletonLineWidth?: number;
  mirror: boolean;
  scale: { x: number; y: number };
  width: number;
  height: number;
}

export interface CameraConfig {
  width: number;
  height: number;
  containerStyle?: CSSProperties;
  videoStyle?: CSSProperties;
  drawConfig?: DrawConfig;
}

export interface CanvasConfig {
  width: number;
  height: number;
  style?: CSSProperties;
  drawConfig?: DrawConfig;
}

export interface PoseDetectionConfig {
  modelComplexity: 0 | 1 | 2;
  smoothLandmarks: boolean;
  enableSegmentation: boolean;
  smoothSegmentation: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

export interface BaseCameraModeProps {
  poseRef: MutableRefObject<Pose | null>;
  isPoseModelReady: boolean;
  isAnalyzing: boolean;
  onResults: (results: MediaPipeResults) => void;
  setError: (error: ExerciseError | null) => void;
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  onPoseModelReady: () => void;
  dimensions?: {
    width: number;
    height: number;
  };
  poseConfig?: PoseDetectionConfig;
  cameraConfig?: CameraConfig;
  canvasConfig?: CanvasConfig;
}

export interface LiveCameraModeProps extends BaseCameraModeProps {
  mirrorVideo?: boolean;
}

export interface VideoUploadModeProps {
  isPoseModelReady: boolean;
  onResults: (results: MediaPipeResults) => void;
  setError: (error: ExerciseError | null) => void;
  videoUrl: string | null;
  onVideoLoad: () => void;
  dimensions?: {
    width: number;
    height: number;
  };
  showControls?: boolean;
  controlsList?: string;
  debugMode?: boolean;
  showSkeleton?: boolean;
}

// Default configurations
export const DEFAULT_DRAW_CONFIG: DrawConfig = {
  lineWidth: 2,
  lineColor: '#00ff00',
  fillColor: '#ff0000',
  skeletonColor: '#00ff00',
  skeletonLineWidth: 2,
  mirror: false,
  scale: { x: 1, y: 1 },
  width: 640,
  height: 480
};

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  width: 640,
  height: 480,
  containerStyle: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  videoStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  drawConfig: DEFAULT_DRAW_CONFIG
};

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 640,
  height: 480,
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  drawConfig: DEFAULT_DRAW_CONFIG
};

export const DEFAULT_POSE_CONFIG: PoseDetectionConfig = {
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
};

// Pose landmark connections for skeleton drawing
export const POSE_CONNECTIONS = [
  // Torso
  [11, 12], [12, 24], [24, 23], [23, 11],
  // Right arm
  [12, 14], [14, 16],
  // Left arm
  [11, 13], [13, 15],
  // Right leg
  [24, 26], [26, 28],
  // Left leg
  [23, 25], [25, 27],
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8]
] as const; 