import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';

// Define the PlankMetrics interface
interface PlankMetrics {
  holdTime?: number; // Time in seconds
  formScore?: number;
  backAlignment?: number;
  stage?: string; // Add stage property
  [key: string]: any; // Allow other properties
}

interface PlankOverlayProps {
  metrics: PlankMetrics;
  errors: ExerciseError[];
  isLiveMode?: boolean;
}

const PlankOverlay: React.FC<PlankOverlayProps> = ({ 
  metrics, 
  errors,
  isLiveMode = false
}) => {
  // Extract metrics
  const holdTime = metrics.holdTime || 0; // Time in seconds
  const formScore = metrics.formScore || 100;
  const stage = metrics.stage || 'correct'; // Default to correct if not specified
  
  // Format hold time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get main error message
  const mainError = errors.length > 0 ? errors[0] : null;
  
  // Counter-transform style to apply to text elements in live mode
  const counterTransform = isLiveMode ? { transform: 'scaleX(-1)' } : {};
  
  // Determine border color and glow based on errors
  const getBorderStyle = () => {
    if (errors.length > 0) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: '8px solid rgba(255, 67, 54, 0.6)',
        boxShadow: '0 0 20px rgba(255, 67, 54, 0.8), inset 0 0 20px rgba(255, 67, 54, 0.4)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 10
      };
    } else {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: '8px solid rgba(76, 175, 80, 0.6)',
        boxShadow: '0 0 20px rgba(76, 175, 80, 0.8), inset 0 0 20px rgba(76, 175, 80, 0.4)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 10
      };
    }
  };

  // Format the stage text for display
  const getStageText = () => {
    // Check for errors first to determine stage
    if (errors.length > 0) {
      const errorType = errors[0].type as string;
      
      // Use string comparison instead of switch case to avoid type errors
      if (errorType === 'high_back') {
        return 'HIGH BACK';
      } else if (errorType === 'low_back') {
        return 'LOW BACK';
      } else if (errorType === 'hip_sag') {
        return 'HIP SAG';
      } else {
        return 'INCORRECT';
      }
    }
    
    // If no errors, return correct
    return 'CORRECT';
  };

  // Choose stage background color
  const getStageColor = () => {
    // If there are errors, show red
    if (errors.length > 0) {
      return '#f44336'; // Red
    }
    // Otherwise show green for correct form
    return '#4caf50'; // Green
  };
  
  return (
    <>
      {/* Glowing border based on error state */}
      <Box sx={getBorderStyle()} />
      
      {/* Top bar with hold time, stage indicator, and form score */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px',
          alignItems: 'flex-start',
        }}
      >
        {/* Hold time - left corner */}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '12px',
            padding: '10px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          style={counterTransform}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '-5px',
            }}
          >
            HOLD TIME
          </Typography>
          <Typography
            sx={{
              fontSize: '4rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {formatTime(holdTime)}
          </Typography>
        </Box>

        {/* Stage indicator - center */}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: getStageColor(),
            borderRadius: '12px',
            padding: '10px 25px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 15,
          }}
          style={counterTransform}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            STAGE
          </Typography>
          <Typography
            sx={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {getStageText()}
          </Typography>
        </Box>

        {/* Form score - right corner */}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: formScore > 80 ? '#4caf50' : formScore > 60 ? '#ff9800' : '#f44336',
            borderRadius: '12px',
            padding: '10px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          style={counterTransform}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '-5px',
              color: 'white',
            }}
          >
            FORM
          </Typography>
          <Typography
            sx={{
              fontSize: '4rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {formScore}
          </Typography>
        </Box>
      </Box>

      {/* Error message - bottom left */}
      {mainError && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '30px',
            left: '20px',
            backgroundColor: 
              mainError.severity === 'high' ? 'rgba(244, 67, 54, 0.9)' : 
              mainError.severity === 'medium' ? 'rgba(255, 152, 0, 0.9)' : 
              'rgba(33, 150, 243, 0.9)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            maxWidth: '40%',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 20,
          }}
          style={counterTransform}
        >
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}
          >
            {mainError.message}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default PlankOverlay; 