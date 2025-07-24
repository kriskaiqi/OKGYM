import { useEffect, useCallback, useRef } from 'react';
import { Results } from '@mediapipe/pose';
import { CanvasConfig, DrawConfig as CanvasDrawConfig } from '../components/ai/camera/types';
import { ExerciseError } from '../types/ai/exercise';
import { ERROR_TYPES, ERROR_SEVERITIES } from '../constants/squat';
import { drawPoseLandmarks, clearCanvas, setupCanvas, DrawConfig } from '../utils/canvas/pose';

interface UseCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  config: CanvasConfig;
  setError: (error: ExerciseError | null) => void;
  mirror?: boolean;
}

export const useCanvas = ({
  canvasRef,
  videoRef,
  config,
  setError,
  mirror = false
}: UseCanvasProps) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas with proper DPR handling
  useEffect(() => {
    if (!canvasRef.current) {
      setError({
        type: ERROR_TYPES.ANALYSIS_ERROR,
        severity: ERROR_SEVERITIES.ERROR,
        message: 'Canvas initialization failed'
      });
      return;
    }

    const ctx = setupCanvas(canvasRef.current, config.width, config.height);
    if (!ctx) {
      setError({
        type: ERROR_TYPES.ANALYSIS_ERROR,
        severity: ERROR_SEVERITIES.ERROR,
        message: 'Canvas context initialization failed'
      });
      return;
    }

    ctxRef.current = ctx;

    // Clear canvas on unmount
    return () => {
      if (ctxRef.current) {
        clearCanvas(ctxRef.current, config.width, config.height);
      }
    };
  }, [config.width, config.height, canvasRef, setError]);

  const drawFrame = useCallback((results: Results) => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;

    // Clear previous frame
    clearCanvas(ctx, config.width, config.height);

    // Draw video frame if available
    if (videoRef.current) {
      ctx.save();
      if (mirror) {
        ctx.scale(-1, 1);
        ctx.translate(-config.width, 0);
      }
      ctx.drawImage(videoRef.current, 0, 0, config.width, config.height);
      ctx.restore();
    }

    // Draw pose landmarks if available
    if (results.poseLandmarks) {
      const drawConfig: DrawConfig = {
        width: config.width,
        height: config.height,
        lineWidth: config.drawConfig?.lineWidth || 2,
        lineColor: config.drawConfig?.lineColor || '#FF0000',
        fillColor: config.drawConfig?.fillColor || '#FF0000',
        skeletonColor: config.drawConfig?.skeletonColor,
        skeletonLineWidth: config.drawConfig?.skeletonLineWidth,
        mirror,
        scale: { x: 1, y: 1 }
      };

      drawPoseLandmarks(ctx, results.poseLandmarks, drawConfig);
    }
  }, [config, videoRef, mirror]);

  const clearFrame = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    clearCanvas(ctx, config.width, config.height);
  }, [config.width, config.height]);

  return { drawFrame, clearFrame };
}; 