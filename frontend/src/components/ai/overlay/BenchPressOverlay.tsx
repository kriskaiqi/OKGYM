import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';
import { BenchPressMetrics } from '../../../types/bench_press';

interface BenchPressOverlayProps {
  metrics: BenchPressMetrics;
  errors: ExerciseError[];
  isLiveMode?: boolean;
}

const BenchPressOverlay: React.FC<BenchPressOverlayProps> = ({ 
  metrics, 
  errors,
  isLiveMode = false
}) => {
  // Log the received metrics for debugging
  console.log('BenchPressOverlay received metrics:', metrics);
  console.log('BenchPressOverlay received errors:', errors);
  
  // Extract metrics with more explicit fallbacks 
  const repCount = metrics.repCount || 0;
  const formScore = metrics.formScore !== undefined ? metrics.formScore : 100;
  const stage = metrics.stage !== undefined ? metrics.stage : 'unknown';
  const leftShoulderAngle = metrics.leftShoulderAngle || 0;
  const rightShoulderAngle = metrics.rightShoulderAngle || 0;
  
  // Log extracted values
  console.log(`BenchPressOverlay extracted: stage=${stage}, formScore=${formScore}, repCount=${repCount}`);
  console.log('Stage type:', typeof stage, 'FormScore type:', typeof formScore);
  
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
        return 'ARMS UP';
      case 'down':
        return 'ARMS DOWN';
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
  
  // Calculate shoulder angle difference and determine if they're even
  const shoulderAngleDifference = Math.abs(leftShoulderAngle - rightShoulderAngle);
  const shouldersEven = shoulderAngleDifference <= 15; // Consider shoulders even if within 15 degrees
  
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

      {/* Shoulder angles comparison - positioned at the bottom to avoid overlap with stage indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '12px',
          padding: '10px 15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 14,
        }}
        style={counterTransform}
      >
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          SHOULDER EVENNESS
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}
          >
            {leftShoulderAngle.toFixed(0)}°
          </Typography>
          <Box sx={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: shouldersEven ? '#4caf50' : '#f44336' 
          }} />
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}
          >
            {rightShoulderAngle.toFixed(0)}°
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

export default BenchPressOverlay; 