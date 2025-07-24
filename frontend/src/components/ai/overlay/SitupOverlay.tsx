import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';
import { SitupMetrics } from '../../../types/situp';

interface SitupOverlayProps {
  metrics: SitupMetrics;
  errors: ExerciseError[];
  isLiveMode?: boolean;
}

const SitupOverlay: React.FC<SitupOverlayProps> = ({ 
  metrics, 
  errors,
  isLiveMode = false
}) => {
  // Extract metrics
  const repCount = metrics.repCount || 0;
  const formScore = metrics.formScore || 100;
  const stage = metrics.stage || 'unknown';
  
  // Get first and second errors (if they exist)
  const mainError = errors.length > 0 ? errors[0] : null;
  const secondError = errors.length > 1 ? errors[1] : null;
  
  // Counter-transform style to apply to text elements in live mode
  const counterTransform = isLiveMode ? { transform: 'scaleX(-1)' } : {};
  
  // Format the stage text for display
  const getStageText = () => {
    // Convert stage to string for safe comparison
    const stageStr = String(stage);
    
    switch(stageStr) {
      case 'up':
        return 'UP';
      case 'down':
        return 'DOWN';
      default:
        return 'READY';
    }
  };

  // Choose stage background color
  const getStageColor = () => {
    // Convert stage to string for safe comparison
    const stageStr = String(stage);
    
    switch(stageStr) {
      case 'up':
        return '#4caf50'; // Green
      case 'down':
        return '#2196f3'; // Blue
      default:
        return '#757575'; // Gray
    }
  };
  
  // Determine border color and glow based on errors
  const getBorderStyle = () => {
    // If there are errors, check the severity of the most critical one (first in the array)
    if (errors.length > 0) {
      const highSeverityError = errors.find(error => error.severity === 'high');
      const mediumSeverityError = errors.find(error => error.severity === 'medium');
      
      if (highSeverityError) {
        // Red glow for high severity errors
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
      } else if (mediumSeverityError) {
        // Yellow glow for medium severity errors
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '8px solid rgba(255, 193, 7, 0.6)',
          boxShadow: '0 0 20px rgba(255, 193, 7, 0.8), inset 0 0 20px rgba(255, 193, 7, 0.4)',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 10
        };
      } else {
        // Blue glow for low severity errors
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '8px solid rgba(33, 150, 243, 0.6)',
          boxShadow: '0 0 20px rgba(33, 150, 243, 0.8), inset 0 0 20px rgba(33, 150, 243, 0.4)',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 10
        };
      }
    } else {
      // Green glow for good form (no errors)
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
  
  return (
    <>
      {/* Glowing border based on error state */}
      <Box sx={getBorderStyle()} />
      
      {/* Top bar with rep count, stage indicator, and form score */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px',
          alignItems: 'flex-start',
        }}
      >
        {/* Rep counter - left corner */}
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
            REPS
          </Typography>
          <Typography
            sx={{
              fontSize: '4rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {repCount}
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

      {/* First error message - positioned at bottom left */}
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

      {/* Second error message - positioned at bottom right */}
      {secondError && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            backgroundColor: 
              secondError.severity === 'high' ? 'rgba(244, 67, 54, 0.9)' : 
              secondError.severity === 'medium' ? 'rgba(255, 152, 0, 0.9)' : 
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
            {secondError.message}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default SitupOverlay; 