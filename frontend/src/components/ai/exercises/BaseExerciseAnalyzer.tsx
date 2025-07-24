import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Container, Tabs, Tab, Paper, Button, Typography } from '@mui/material';
import { VideoCameraFront, Upload, PlayArrow, Stop } from '@mui/icons-material';
import { MediaPipeResults } from '../../../types/ai/mediapipe';
import { ExerciseAnalysisResult, ExerciseError } from '../../../types/ai/exercise';
import { Camera } from '../camera/Camera';
import { usePoseDetection } from '../../../contexts/PoseDetectionContext';
import { useAnalysisState } from '../../../contexts/AnalysisStateContext';
import { logger } from '../../../utils/logger';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

// Props interface
export interface BaseExerciseAnalyzerProps {
  onAnalysisComplete: (result: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  children?: React.ReactNode;
  onResults?: (results: MediaPipeResults) => void;
  metrics?: any;
  errors?: ExerciseError[];
  exerciseType?: string;
}

// Main component
export const BaseExerciseAnalyzer: React.FC<BaseExerciseAnalyzerProps> = ({
  onAnalysisComplete,
  onError,
  children,
  onResults,
  metrics,
  errors = [],
  exerciseType = 'squat'
}) => {
  // Context hooks
  const { isPoseModelReady } = usePoseDetection();
  const { isAnalyzing, setIsAnalyzing } = useAnalysisState();
  
  // Refs and state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousVideoUrlRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [canvasDimensions] = useState({ width: 640, height: 480 });
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Countdown state
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);

  // Tab change handler
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    // Stop analysis before switching tabs
    if (isAnalyzing) {
    setIsAnalyzing(false);
    }
    
    // Cancel countdown if it's active
    if (showCountdown) {
      setShowCountdown(false);
    }
    
    // Set the new tab
    setActiveTab(newValue);
  }, [setIsAnalyzing, isAnalyzing, showCountdown]);

  // Clean up the previous video URL to prevent memory leaks
  const cleanupPreviousVideo = useCallback(() => {
    if (previousVideoUrlRef.current) {
      try {
        URL.revokeObjectURL(previousVideoUrlRef.current);
        logger.info('Revoked previous video URL');
      } catch (error) {
        logger.error('Error revoking previous video URL:', error);
      }
      previousVideoUrlRef.current = null;
    }
  }, []);

  // File upload handler - use memo instead of callback to prevent uncessary renders
  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Stop analysis and reset states
    setIsAnalyzing(false);
    setShowCountdown(false);
    setIsVideoLoaded(false);
    
    // Clean up previous video URL if it exists
    cleanupPreviousVideo();
    
    // Create new object URL and store it
    const newVideoUrl = URL.createObjectURL(file);
    previousVideoUrlRef.current = newVideoUrl;
    
    // Update state after all preparation
    setUploadedVideo(newVideoUrl);
    
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    logger.info(`New video uploaded: ${file.name}`);
  }, [setIsAnalyzing, cleanupPreviousVideo]);

  // Toggle analysis state with countdown
  const toggleAnalysis = useCallback(() => {
    if (isAnalyzing || showCountdown) {
      // If already analyzing or in countdown, stop immediately
      logger.info('Stopping analysis or countdown');
      setIsAnalyzing(false);
      setShowCountdown(false);
    } else {
      // If not analyzing, start countdown first
      logger.info('Starting countdown before analysis');
      setShowCountdown(true);
      setCountdownValue(5);
    }
  }, [setIsAnalyzing, isAnalyzing, showCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreviousVideo();
    };
  }, [cleanupPreviousVideo]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showCountdown) {
      interval = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            // When countdown reaches 0, start analysis and hide countdown
            clearInterval(interval);
            setShowCountdown(false);
            logger.info('Countdown complete, starting analysis');
            setIsAnalyzing(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showCountdown, setIsAnalyzing]);

  // Handle results
  const handleResults = useCallback((results: MediaPipeResults) => {
    // IMPORTANT: Read isAnalyzing state directly from context rather than from closure
    const currentIsAnalyzing = isAnalyzing; // Get fresh value
    
    if (currentIsAnalyzing && results.poseLandmarks?.length > 0) {
      logger.info(`BaseExerciseAnalyzer: Forwarding ${results.poseLandmarks.length} landmarks with isAnalyzing=${currentIsAnalyzing}`);
      if (onResults) onResults(results);
    }
  }, [onResults, isAnalyzing]);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab icon={<VideoCameraFront />} label="Live Camera" />
          <Tab icon={<Upload />} label="Upload Video" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ position: 'relative', height: '480px', mb: 10 }}>
            <Camera
              mode="live"
              onResults={handleResults}
              onError={onError}
              dimensions={canvasDimensions}
              showSkeleton={showSkeleton}
              isAnalyzing={isAnalyzing}
              metrics={metrics}
              errors={errors}
              exerciseType={exerciseType}
            />
            
            {/* Countdown Overlay */}
            {showCountdown && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  zIndex: 1000,
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                  Get Ready!
                </Typography>
                <Typography variant="h1" sx={{ 
                  color: 'white', 
                  fontSize: '8rem',
                  fontWeight: 'bold',
                  animation: 'pulse 1s infinite'
                }}>
                  {countdownValue}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
                  Position yourself correctly
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', position: 'absolute', bottom: -60, width: '100%' }}>
              <Button
                variant="contained"
                color={isAnalyzing || showCountdown ? "error" : "primary"}
                startIcon={isAnalyzing || showCountdown ? <Stop /> : <PlayArrow />}
                onClick={toggleAnalysis}
                disabled={!isPoseModelReady}
                sx={{ minWidth: '180px' }}
              >
                {isAnalyzing ? 'Stop Analysis' : showCountdown ? 'Cancel' : 'Start Analysis'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
              <Button
              variant="contained"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Upload />}
              sx={{ mb: 2 }}
              >
                Upload Video
              </Button>
            
            {uploadedVideo && (
              <Box sx={{ position: 'relative', height: '480px', mb: 10 }}>
                <Camera
                  mode="upload"
                  videoUrl={uploadedVideo}
                  onResults={handleResults}
                  onError={onError}
                  dimensions={canvasDimensions}
                  showSkeleton={showSkeleton}
                  isAnalyzing={isAnalyzing}
                  metrics={metrics}
                  errors={errors}
                  exerciseType={exerciseType}
                />
                
                {/* Countdown Overlay for upload mode */}
                {showCountdown && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      zIndex: 1000,
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                      Starting Analysis...
                    </Typography>
                    <Typography variant="h1" sx={{ 
                      color: 'white', 
                      fontSize: '8rem',
                      fontWeight: 'bold',
                      animation: 'pulse 1s infinite'
                    }}>
                      {countdownValue}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', position: 'absolute', bottom: -60, width: '100%' }}>
                  <Button
                    variant="contained"
                    color={isAnalyzing || showCountdown ? "error" : "primary"}
                    startIcon={isAnalyzing || showCountdown ? <Stop /> : <PlayArrow />}
                    onClick={toggleAnalysis}
                    disabled={!isPoseModelReady}
                    sx={{ minWidth: '180px' }}
                  >
                    {isAnalyzing ? 'Stop Analysis' : showCountdown ? 'Cancel' : 'Start Analysis'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
        
        {children}
      </Paper>
    </Container>
  );
};

export default BaseExerciseAnalyzer; 