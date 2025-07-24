import { useRef, useEffect, useCallback } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose } from '@mediapipe/pose';
import { CameraConfig } from '../components/ai/camera/types';
import { ExerciseError } from '../types/ai/exercise';
import { ERROR_TYPES, ERROR_SEVERITIES } from '../constants/squat';

interface UseCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  poseRef: React.RefObject<Pose>;
  isAnalyzing: boolean;
  config: CameraConfig;
  setError: (error: ExerciseError | null) => void;
  onFrame?: () => Promise<void>;
}

export const useCamera = ({
  videoRef,
  poseRef,
  isAnalyzing,
  config,
  setError,
  onFrame
}: UseCameraProps) => {
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!videoRef.current) {
      setError({
        type: ERROR_TYPES.ANALYSIS_ERROR,
        severity: ERROR_SEVERITIES.ERROR,
        message: 'Video initialization failed'
      });
      return;
    }

    const setupCamera = async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        // Reset video element
        video.srcObject = null;
        video.src = '';
        video.controls = false;
        video.style.display = 'block';

        // Initialize camera
        cameraRef.current = new Camera(video, {
          onFrame: async () => {
            if (!video || !poseRef.current || !isAnalyzing) return;
            try {
              if (onFrame) {
                await onFrame();
              } else {
                await poseRef.current.send({ image: video });
              }
            } catch (error) {
              console.error('Frame processing error:', error);
              setError({
                type: ERROR_TYPES.ANALYSIS_ERROR,
                severity: ERROR_SEVERITIES.ERROR,
                message: 'Error processing camera feed'
              });
            }
          },
          width: config.width,
          height: config.height
        });

        console.log('Starting camera...');
        await cameraRef.current.start();
        console.log('Camera started successfully');
      } catch (error) {
        console.error('Camera setup error:', error);
        setError({
          type: ERROR_TYPES.ANALYSIS_ERROR,
          severity: ERROR_SEVERITIES.ERROR,
          message: 'Failed to start camera. Please check permissions.'
        });
      }
    };

    setupCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [videoRef, poseRef, isAnalyzing, config, setError, onFrame]);

  return cameraRef;
}; 