import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';
import { 
  MediaPipeResults, 
  MediaPipeLandmark,
  isMediaPipeResults,
  validateLandmarks,
  CameraOptions
} from '../../../types/ai/mediapipe';
import { ExerciseError } from '../../../types/ai/exercise';
import { logger } from '../../../utils/logger';
import {
  CameraConfig,
  CanvasConfig,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_CANVAS_CONFIG
} from './types';
import { drawPoseLandmarks, clearCanvas, DEFAULT_DRAW_CONFIG } from '../../../utils/canvas/pose';
import { usePoseDetection } from '../../../contexts/PoseDetectionContext';
import ExerciseOverlay from '../overlay/ExerciseOverlay';

// Add WASM configuration before component
declare global {
  interface Window {
    Module: any;
    WASMLOADER: any;
  }
}

// Ensure WASM loader is properly configured
if (typeof window !== 'undefined') {
  // Configure WASM Module to prevent "Module.arguments" error
  if (!window.Module) {
    window.Module = {
      arguments: [],
      noInitialRun: true,
      onRuntimeInitialized: () => console.log('WASM Runtime initialized'),
    };
  }
  
  // Set important WASM configuration to prevent module.arguments error
  window.WASMLOADER = {
    BASE_PATH: '/mediapipe/',
    OVERRIDE_WASM_LOCATION: '/mediapipe/pose_solution_simd_wasm_bin.wasm',
    SINGLE_INSTANCE_ONLY: true  // Important: ensures only one WASM module runs at a time
  };
}

interface CameraProps {
  onResults: (results: MediaPipeResults) => void;
  onError?: (error: ExerciseError) => void;
  dimensions?: {
    width: number;
    height: number;
  };
  mode: 'live' | 'upload';
  videoUrl?: string;
  showSkeleton?: boolean;
  isAnalyzing?: boolean;
  metrics?: any;
  errors?: ExerciseError[];
  exerciseType?: string;
}

export const Camera: React.FC<CameraProps> = ({
  onResults,
  onError,
  dimensions = { width: 480, height: 360 },
  mode,
  videoUrl,
  showSkeleton = true,
  isAnalyzing = false,
  metrics,
  errors = [],
  exerciseType = 'squat'
}) => {
  // Context
  const { pose, isPoseModelReady, registerResultsHandler, unregisterResultsHandler } = usePoseDetection();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const cleanupRef = useRef<boolean>(false);
  const lastFrameTime = useRef<number>(0);
  const frameSkipCount = useRef<number>(0);
  const FPS = 60;
  const frameInterval = 1000 / FPS;
  const PROCESS_EVERY_N_FRAMES = 2;
  const lastVideoUrlRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);

  // Draw pose landmarks with error highlighting
  const drawResults = useCallback((results: MediaPipeResults) => {
    if (!canvasRef.current || !results.poseLandmarks || !showSkeleton) return;
    if (!validateLandmarks(results.poseLandmarks)) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    clearCanvas(ctx, dimensions.width, dimensions.height);

    const drawConfig = {
      ...DEFAULT_DRAW_CONFIG,
      width: dimensions.width,
      height: dimensions.height,
      flipHorizontal: mode === 'live',
      lineWidth: 1.5,
      skeletonLineWidth: 1.5
    };

    // Pass errors to drawPoseLandmarks for highlighting
    drawPoseLandmarks(ctx, results.poseLandmarks, drawConfig, errors, exerciseType);
  }, [dimensions, showSkeleton, mode, errors, exerciseType]);

  // Handle pose results with frame rate control and frame skipping
  const handleResults = useCallback((results: Results) => {
    if (!isMediaPipeResults(results) || cleanupRef.current) return;

    // Process frame at controlled rate
    const now = performance.now();
    if (now - lastFrameTime.current < frameInterval) return;
    
    // Skip frames to reduce processing load
    frameSkipCount.current = (frameSkipCount.current + 1) % PROCESS_EVERY_N_FRAMES;
    
    // Always draw landmarks if available, even on skipped frames
    const hasPoseLandmarks = !!results.poseLandmarks && results.poseLandmarks.length > 0;
    if (showSkeleton && hasPoseLandmarks) {
      drawResults(results as MediaPipeResults);
    }
    
    // Only process analysis on non-skipped frames
    if (frameSkipCount.current !== 0) return;
    
    lastFrameTime.current = now;
    
    // Debug logging to verify results contain landmarks
    if (isAnalyzing && hasPoseLandmarks) {
      // Only log when actually analyzing and we have landmarks
      logger.debug(`Camera: Processing landmarks for analysis, count=${results.poseLandmarks.length}`);
      // Send data for analysis
      onResults(results as MediaPipeResults);
    } else if (isAnalyzing && !hasPoseLandmarks) {
      // Only log warning if we're actually trying to analyze but have no landmarks
      logger.debug('Analysis is on but no landmarks detected in this frame');
    }
  }, [showSkeleton, drawResults, onResults, frameInterval, isAnalyzing]);

  // Register results handler
  useEffect(() => {
    if (!isPoseModelReady || !pose) return;
    
    const handler = handleResults; // Capture the current handler
    logger.info('Registering pose detection results handler');
    registerResultsHandler(handler);
    
    return () => {
      logger.info('Unregistering pose detection results handler');
      unregisterResultsHandler();
    };
  }, [isPoseModelReady, pose, registerResultsHandler, unregisterResultsHandler, handleResults]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      clearCanvas(ctx, dimensions.width, dimensions.height);
    }
  }, [dimensions.width, dimensions.height]);

  // Handle live camera mode
  useEffect(() => {
    if (mode !== 'live' || !videoRef.current || isInitializedRef.current || !pose || !isPoseModelReady) return;
    
    let isMounted = true; // Add mounted flag
    cleanupRef.current = false;
    
    const initializeCamera = async () => {
      if (!videoRef.current || !isMounted) return;
      
      try {
        const camera = new MediaPipeCamera(videoRef.current, {
          onFrame: async () => {
            if (!videoRef.current || !pose || cleanupRef.current) return;
            if (videoRef.current.readyState < 2) return;
            
            try {
              await pose.send({ image: videoRef.current });
            } catch (error) {
              logger.error('Frame processing error:', error);
            }
          },
          width: dimensions.width,
          height: dimensions.height
        });
        
        if (isMounted) {
          cameraRef.current = camera;
          isInitializedRef.current = true;
          setIsInitialized(true);
          await camera.start();
        }
      } catch (error) {
        if (isMounted) {
          logger.error('Camera initialization error:', error);
          onError?.({
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: 'Failed to initialize camera'
          });
        }
      }
    };
    
    initializeCamera();
    
    return () => {
      isMounted = false;
      cleanupRef.current = true;
      
      // Properly cleanup camera resources
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
          cameraRef.current = null;
        } catch (error) {
          logger.warn('Error stopping camera:', error);
        }
      }
      
      // Explicitly release WebGL context to prevent memory leaks
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Clear any existing drawing
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      isInitializedRef.current = false;
      setIsInitialized(false);
    };
  }, [mode, dimensions.width, dimensions.height, pose, isPoseModelReady]);

  // Handle video upload mode - Fixed for proper video switching
  useEffect(() => {
    // Early return if not in upload mode or missing required elements
    if (mode !== 'upload' || !videoRef.current || !pose) return;
    
    // Check if the video URL has changed
    const hasVideoUrlChanged = videoUrl !== lastVideoUrlRef.current;
    
    // If we're already initialized and the URL hasn't changed, don't reinitialize
    if (isInitializedRef.current && !hasVideoUrlChanged) return;
    
    // Update the last video URL
    lastVideoUrlRef.current = videoUrl || null;
    
    // If no videoUrl provided, just cleanup and return
    if (!videoUrl) {
      isInitializedRef.current = false;
      setIsInitialized(false);
      return;
    }
    
    logger.info(`Initializing video processing for uploaded video: ${videoUrl.substring(0, 20)}...`);
    
    let isMounted = true; // Add mounted flag
    cleanupRef.current = false;
    const video = videoRef.current;
    
    // Reset the video element
    video.pause();
    video.currentTime = 0;
    
    const processFrame = async () => {
      if (cleanupRef.current || !videoRef.current || !pose || !isMounted) return;
      if (videoRef.current.paused || videoRef.current.ended) return;
      
      try {
        await pose.send({ image: videoRef.current });
        if (!cleanupRef.current && isMounted) {
          requestAnimationFrame(processFrame);
        }
      } catch (error) {
        logger.error('Error processing video frame:', error);
      }
    };
    
    const handlePlay = () => {
      if (!cleanupRef.current && isMounted) {
        processFrame();
      }
    };
    
    // Clean up previous event listeners if any
    video.removeEventListener('play', handlePlay);
    
    // Set up new event listeners and source
    video.addEventListener('play', handlePlay);
    video.src = videoUrl;
    
    if (isMounted) {
      isInitializedRef.current = true;
      setIsInitialized(true);
    }
    
    return () => {
      isMounted = false;
      cleanupRef.current = true;
      video.removeEventListener('play', handlePlay);
      video.pause();
      video.src = '';
      isInitializedRef.current = false;
      setIsInitialized(false);
    };
  }, [mode, videoUrl, pose]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      minHeight: '360px',
      aspectRatio: `${dimensions.width}/${dimensions.height}`
    }}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: mode === 'live' ? 'scaleX(-1)' : 'none'
        }}
        playsInline
        muted={mode === 'live'}
        controls={mode === 'upload'}
      />
      {showSkeleton && (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transform: mode === 'live' ? 'scaleX(-1)' : 'none'
          }}
        />
      )}
      
      {/* Add the overlay component */}
      {isAnalyzing && metrics && (
        <ExerciseOverlay
          metrics={metrics}
          errors={errors}
          exerciseType={exerciseType}
          style={{
            transform: mode === 'live' ? 'scaleX(-1)' : 'none'
          }}
          isLiveMode={mode === 'live'}
        />
      )}
    </div>
  );
};

export default Camera;
 