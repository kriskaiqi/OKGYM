declare module '@mediapipe/pose' {
  export interface GpuBuffer {
    width: number;
    height: number;
  }

  export interface Results {
    poseLandmarks: Array<{
      x: number;
      y: number;
      z: number;
      visibility: number;
    }>;
    image: GpuBuffer | HTMLCanvasElement | HTMLImageElement | ImageBitmap;
    segmentationMask?: GpuBuffer | HTMLCanvasElement | ImageBitmap;
  }

  export interface PoseConfig {
    modelComplexity: 0 | 1 | 2;
    smoothLandmarks: boolean;
    enableSegmentation: boolean;
    smoothSegmentation: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }

  export class Pose {
    constructor(config?: {
      locateFile?: (file: string) => string;
    });

    setOptions(options: Partial<PoseConfig>): void;
    
    onResults(callback: (results: Results) => void): void;
    
    send(options: {
      image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
    }): Promise<void>;
    
    close(): void;
  }

  export const POSE_LANDMARKS: {
    [key: string]: number;
  };

  export const POSE_CONNECTIONS: ReadonlyArray<[number, number]>;
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
  }

  export class Camera {
    constructor(
      videoElement: HTMLVideoElement,
      options: CameraOptions
    );

    start(): Promise<void>;
    stop(): void;
  }
} 