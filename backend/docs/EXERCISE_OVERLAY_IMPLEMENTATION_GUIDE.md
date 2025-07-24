# Exercise Overlay Implementation Guide

## Overview

This guide outlines the process for implementing real-time metrics overlays for new exercises in the AI-powered fitness system. The overlay displays exercise metrics (rep count, form score, stage) and error feedback directly on the exercise video, providing users with immediate visual feedback during their workout.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Steps](#implementation-steps)
3. [Component File Structure](#component-file-structure)
4. [Integration with Camera Component](#integration-with-camera-component)
5. [Styling Guidelines](#styling-guidelines)
6. [Advanced Features](#advanced-features)
7. [Testing and Validation](#testing-and-validation)

## Architecture Overview

The overlay system consists of multiple components:

- **ExerciseOverlay**: A wrapper component that selects the appropriate overlay based on exercise type
- **[Exercise]Overlay**: Exercise-specific overlay component (e.g., SquatOverlay)
- **Camera**: Component that captures and processes video, then displays the overlay
- **Pose Utility**: Handles skeleton drawing with error highlighting

The system receives metrics and error data from the exercise analyzer and displays them in real-time over the video feed.

## Implementation Steps

### 1. Create Exercise-Specific Overlay Component

For each new exercise, create a specific overlay component in `frontend/src/components/ai/overlay/[Exercise]Overlay.tsx`.

Use the existing `SquatOverlay.tsx` as a template and customize for the specific exercise:

```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';
import { [Exercise]Metrics } from '../../../types/[exercise]';

interface [Exercise]OverlayProps {
  metrics: [Exercise]Metrics;
  errors: ExerciseError[];
  isLiveMode?: boolean;
}

const [Exercise]Overlay: React.FC<[Exercise]OverlayProps> = ({ 
  metrics, 
  errors,
  isLiveMode = false
}) => {
  // Extract metrics relevant to this exercise
  const repCount = metrics.repCount || 0;
  const formScore = metrics.formScore || 100;
  const stage = metrics.stage || 'unknown';
  
  // Get error messages
  const mainError = errors.length > 0 ? errors[0] : null;
  const secondError = errors.length > 1 ? errors[1] : null;
  
  // Counter-transform style for live mode (fixes mirroring)
  const counterTransform = isLiveMode ? { transform: 'scaleX(-1)' } : {};
  
  // Exercise-specific stage formatting
  const getStageText = () => {
    // Convert stage to string for safe comparison
    const stageStr = String(stage);
    
    switch(stageStr) {
      case 'up':
        return 'UP';
      case 'down':
        return 'DOWN';
      // Add exercise-specific stages
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
      // Add exercise-specific colors
      default:
        return '#757575'; // Gray
    }
  };
  
  return (
    <>
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
          <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '-5px' }}>
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
          <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
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
          <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '-5px', color: 'white' }}>
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

      {/* Error messages */}
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

      {/* Add exercise-specific visual elements */}
    </>
  );
};

export default [Exercise]Overlay;
```

### 2. Update ExerciseOverlay Component

Modify `frontend/src/components/ai/overlay/ExerciseOverlay.tsx` to include the new exercise:

```typescript
import React from 'react';
import { Box } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';
import SquatOverlay from './SquatOverlay';
import [Exercise]Overlay from './[Exercise]Overlay';

interface ExerciseOverlayProps {
  metrics: any;
  errors: ExerciseError[];
  exerciseType: string;
  style?: React.CSSProperties;
  isLiveMode?: boolean;
}

const ExerciseOverlay: React.FC<ExerciseOverlayProps> = ({ 
  metrics, 
  errors, 
  exerciseType,
  style,
  isLiveMode = false
}) => {
  // Render the appropriate overlay based on exercise type
  const renderExerciseOverlay = () => {
    switch (exerciseType) {
      case 'squat':
        return <SquatOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case '[exercise]':
        return <[Exercise]Overlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      // Add other exercise types here
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      style={style}
    >
      {renderExerciseOverlay()}
    </Box>
  );
};

export default ExerciseOverlay;
```

### 3. Update Pose Utility for Error Highlighting

Ensure `frontend/src/utils/canvas/pose.ts` handles exercise-specific error highlighting:

```typescript
// In drawPoseLandmarks function
export function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: MediaPipeLandmark[],
  config: DrawConfig = DEFAULT_DRAW_CONFIG,
  errors: ExerciseError[] = [],
  exerciseType: string = 'squat'
) {
  // Default drawing logic
  // ...

  // Exercise-specific error highlighting
  if (errors.length > 0) {
    switch (exerciseType) {
      case 'squat':
        highlightSquatErrors(ctx, landmarks, errors, config);
        break;
      case '[exercise]':
        highlight[Exercise]Errors(ctx, landmarks, errors, config);
        break;
      // Add other exercises
    }
  }
}

// Add a new function for each exercise
function highlight[Exercise]Errors(
  ctx: CanvasRenderingContext2D,
  landmarks: MediaPipeLandmark[],
  errors: ExerciseError[],
  config: DrawConfig
) {
  // Highlight specific body parts based on error types
  for (const error of errors) {
    switch (error.type) {
      case '[error_type_1]':
        // Highlight relevant connections with thicker, colored lines
        drawConnection(ctx, landmarks, [[LANDMARK_INDEX_1, LANDMARK_INDEX_2]], config, {
          color: 'red',
          lineWidth: 5
        });
        break;
      // Add more error types
    }
  }
}
```

### 4. Update Exercise Analyzer

Modify the exercise analyzer component to pass the correct metrics to the overlay:

```typescript
// In [Exercise]Analyzer.tsx
// Make sure metrics are properly formatted for the overlay
const processResults = (results: [Exercise]AnalysisResponse) => {
  if (results.success && results.result) {
    setAnalysisResult(results.result);
    
    // Format metrics for overlay
    const overlayMetrics = {
      repCount: results.result.repCount,
      formScore: results.result.formScore,
      stage: results.result.stage,
      // Add exercise-specific metrics
    };
    
    setMetrics(overlayMetrics);
    setErrors(results.result.errors || []);
  }
};
```

### 5. Update Camera Component Integration

Ensure your exercise's overlay is properly passed to the Camera component:

```typescript
// In your exercise page/component
<Camera
  onResults={handlePoseResults}
  dimensions={videoDimensions}
  mode={mode}
  videoUrl={videoUrl}
  showSkeleton={showSkeleton}
  isAnalyzing={isAnalyzing}
  metrics={metrics}
  errors={errors}
  exerciseType="[exercise]" // Specify your exercise type
/>
```

## Component File Structure

```
frontend/src/
├── components/
│   ├── ai/
│   │   ├── overlay/
│   │   │   ├── ExerciseOverlay.tsx    # Wrapper component
│   │   │   ├── SquatOverlay.tsx       # Squat-specific overlay
│   │   │   └── [Exercise]Overlay.tsx  # Your exercise overlay
│   │   ├── camera/
│   │   │   └── Camera.tsx             # Camera component with overlay integration
│   │   └── exercises/
│   │       ├── squat/
│   │       │   └── SquatAnalyzer.tsx  # Squat analyzer
│   │       └── [exercise]/
│   │           └── [Exercise]Analyzer.tsx # Your exercise analyzer
├── utils/
│   └── canvas/
│       └── pose.ts                  # Pose drawing utilities
└── types/
    ├── ai/
    │   └── exercise.ts              # Common exercise types
    └── [exercise].ts                # Exercise-specific types
```

## Integration with Camera Component

The Camera component handles:

1. Video capture (live or uploaded)
2. Pose detection through MediaPipe
3. Drawing the skeleton with error highlighting
4. Displaying the overlay with metrics

Ensure the Camera component receives these props:
- `metrics`: Exercise metrics (rep count, form score, stage)
- `errors`: Array of form errors
- `exerciseType`: String identifier for the exercise
- `isLiveMode`: Boolean to handle mirroring

## Styling Guidelines

1. **Consistency**: Maintain the same styling approach across all exercises:
   - Black semi-transparent backgrounds for metric boxes
   - Consistent font sizes and weights
   - Same positioning system

2. **Error Highlighting**:
   - High severity: Red
   - Medium severity: Orange
   - Low severity: Blue

3. **Readability**:
   - Use high contrast colors
   - Add text shadows for better readability
   - Keep text concise and large enough to read during exercise

4. **Responsiveness**:
   - Test on different screen sizes
   - Ensure metrics remain visible on mobile devices

## Advanced Features

### 1. Exercise-Specific Visual Guides

Add visual guides specific to each exercise:

```typescript
// In [Exercise]Overlay.tsx

// For a bench press exercise example
const renderGuides = () => {
  if (stage === 'down') {
    return (
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '4px',
          zIndex: 5
        }}
        style={isLiveMode ? { transform: 'translate(-50%, -50%) scaleX(-1)' } : {}}
      />
    );
  }
  return null;
};

// Then in the return
return (
  <>
    {/* Existing overlay components */}
    {renderGuides()}
  </>
);
```

### 2. Animated Transitions

Add animations for stage transitions:

```typescript
// Use React's useState and useEffect to track stage changes
const [prevStage, setPrevStage] = useState(stage);
const [isTransitioning, setIsTransitioning] = useState(false);

useEffect(() => {
  if (prevStage !== stage) {
    setPrevStage(stage);
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [stage, prevStage]);

// Then in your style for the stage indicator
<Box
  sx={{
    // Normal styles
    transition: 'all 0.3s ease-in-out',
    transform: isTransitioning ? 'scale(1.2)' : 'scale(1)',
  }}
>
  {/* Stage content */}
</Box>
```

## Testing and Validation

1. **Test with Real-Time Video**:
   - Ensure text remains readable during movement
   - Verify error highlighting is visible and accurate
   - Check for performance issues

2. **Test with Different Stages**:
   - Verify each exercise stage displays correctly
   - Ensure transitions between stages are smooth

3. **Validate Error Highlighting**:
   - Confirm the correct body parts are highlighted
   - Check that error messages match highlighted areas

4. **Cross-Browser Testing**:
   - Test in Chrome, Firefox, Safari, and Edge
   - Verify mobile compatibility

## Common Issues and Solutions

1. **Mirrored Text in Live Mode**:
   - Apply `transform: scaleX(-1)` to text elements to counter the camera mirroring

2. **Performance Issues**:
   - Reduce drawing frequency
   - Simplify animations
   - Use `React.memo` to prevent unnecessary re-renders

3. **Inconsistent Metrics**:
   - Verify data flow from analyzer to overlay
   - Add prop validation and default values

4. **Skeleton Highlighting Not Visible**:
   - Increase line width for highlighted connections
   - Use brighter colors with good contrast
   - Make regular skeleton more subtle (lighter color, thinner lines) 