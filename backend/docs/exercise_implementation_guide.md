# Exercise Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing new exercises in the AI exercise analysis system. The system follows a consistent architecture across exercises, built around MediaPipe pose detection, JavaScript/TypeScript for the frontend, Node.js for the backend, and Python for the core analysis algorithms.

## Table of Contents

1. [Implementation Architecture](#implementation-architecture)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Python Analysis Script](#python-analysis-script)
5. [Testing and Integration](#testing-and-integration)
6. [Troubleshooting](#troubleshooting)
7. [Additional Files](#additional-files)

## Implementation Architecture

### Data Flow

1. **Frontend Pose Detection**: MediaPipe tracks body landmarks in real-time
2. **Data Transmission**: Landmark data is sent to the backend via HTTP API
3. **Backend Processing**: Node.js services route data to Python analysis scripts
4. **Analysis**: Python scripts process landmark data and calculate metrics
5. **Response**: Results are returned to the frontend for display
6. **UI Updates**: Metrics and feedback are displayed to the user

### Component Relationships

- **BaseExerciseAnalyzer**: Common code shared by all exercises
  - Reference: `backend/src/services/BaseExerciseAnalyzer.ts`
- **ExerciseAnalyzerFactory**: Creates specific analyzer services
  - Reference: `backend/src/services/ExerciseAnalyzerFactory.ts`
- **Exercise-specific Components**: Handle exercise-specific logic and display
  - Squat reference: `frontend/src/components/ai/exercises/squat/SquatAnalyzer.tsx`
  - Bicep reference: `frontend/src/components/ai/exercises/bicep/BicepAnalyzer.tsx`
- **Context Providers**: Manage shared state
  - Reference: `frontend/src/contexts/PoseDetectionContext.tsx`
  - Reference: `frontend/src/contexts/AnalysisStateContext.tsx`

## Frontend Implementation

### Step 1: Type Definitions

Create a new type file at `frontend/src/types/[exercise].ts`:

**Reference examples:**
- Squat: `frontend/src/types/squat.ts`
- Bicep: `frontend/src/types/bicep.ts`
- Base exercise types: `frontend/src/types/ai/exercise.ts`
- MediaPipe types: `frontend/src/types/ai/mediapipe.ts`

```typescript
import { ExerciseError, ExerciseMetrics, ExerciseStage } from './ai/exercise';

export interface [Exercise]Metrics extends ExerciseMetrics {
  // Add exercise-specific metrics here
  repCount?: number;
  // Example: Add angle measurements specific to your exercise
  // kneeAngle?: number;
}

export interface [Exercise]AnalysisResult {
  stage: ExerciseStage;
  metrics: [Exercise]Metrics;
  errors: ExerciseError[];
  formScore: number;
  repCount: number;
}

export interface [Exercise]AnalysisResponse {
  success: boolean;
  error?: ExerciseError;
  result?: [Exercise]AnalysisResult;
}

// Add any exercise-specific constants or thresholds
```

### Step 2: Create Metrics Display Component

Create a new file at `frontend/src/components/ai/exercises/[exercise]/[Exercise]MetricsDisplay.tsx`:

**Reference examples:**
- Squat: `frontend/src/components/ai/exercises/squat/SquatMetricsDisplay.tsx`
- Bicep: `frontend/src/components/ai/exercises/bicep/BicepMetricsDisplay.tsx`

```typescript
import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { [Exercise]Metrics } from '../../../../types/[exercise]';
import { ExerciseError } from '../../../../types/ai/exercise';

interface MetricItemProps {
  label: string;
  value: number | boolean | undefined;
  unit?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, unit }) => {
  // Handle boolean values
  if (typeof value === 'boolean') {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box mt={0.5}>
          <Chip 
            size="small" 
            label={value ? 'Yes' : 'No'} 
            color={value ? 'success' : 'error'} 
            variant="outlined" 
          />
        </Box>
      </Box>
    );
  }

  // Handle numeric values
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {value !== undefined && value !== null ? value.toFixed(0) : 'N/A'}{unit || ''}
      </Typography>
    </Box>
  );
};

interface [Exercise]MetricsDisplayProps {
  metrics?: [Exercise]Metrics;
  errors?: Array<{type: string; message: string; severity: string}>;
}

export const [Exercise]MetricsDisplay: React.FC<[Exercise]MetricsDisplayProps> = ({ metrics = {}, errors = [] }) => {
  // Check for common errors based on exercise requirements
  const hasError1 = errors.some(error => error.type === 'error_type_1');
  const hasError2 = errors.some(error => error.type === 'error_type_2');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        [Exercise] Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          {/* Status indicators specific to your exercise */}
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Status 1" 
              value={!hasError1}
            />
          </Grid>
          {/* Add more status indicators */}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Rep Counts */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Repetition Count
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Total Reps
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {repCount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Form Check */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Form Check
        </Typography>
        <Grid container spacing={2}>
          {/* Form check indicators specific to your exercise */}
        </Grid>
      </Box>
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Form Feedback
          </Typography>
          {errors.map((error, index) => (
            <Alert 
              key={index} 
              severity={
                error.severity === 'high' ? 'error' : 
                error.severity === 'medium' ? 'warning' : 'info'
              }
              sx={{ mb: 1 }}
            >
              {error.message}
            </Alert>
          ))}
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Detailed Metrics */}
      <Typography variant="subtitle2" gutterBottom>
        Detailed Metrics
      </Typography>
      <Grid container spacing={2}>
        {/* Add your exercise-specific metrics here */}
      </Grid>
    </Paper>
  );
};
```

### Step 3: Create Exercise Analyzer Component

Create a new file at `frontend/src/components/ai/exercises/[exercise]/[Exercise]Analyzer.tsx`:

**Reference examples:**
- Squat: `frontend/src/components/ai/exercises/squat/SquatAnalyzer.tsx`
- Bicep: `frontend/src/components/ai/exercises/bicep/BicepAnalyzer.tsx`
- Base analyzer: `frontend/src/components/ai/exercises/BaseExerciseAnalyzer.tsx`

```typescript
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MediaPipeResults } from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import { [Exercise]MetricsDisplay } from './[Exercise]MetricsDisplay';
import { [Exercise]Metrics } from '../../../../types/[exercise]';

export interface [Exercise]AnalysisResult {
  stage: string;
  metrics: Record<string, number>;
  errors: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  formScore: number;
  repCount: number;
}

// Skip frames to reduce server load
const FRAME_SKIP_COUNT = 2;

// Track if connection attempt is in progress
let isConnecting = false;

interface [Exercise]AnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
}

// Add reset counter to Window interface
declare global {
  interface Window {
    reset[Exercise]Counter?: () => void;
  }
}

const [Exercise]Analyzer = forwardRef<{ resetCounter: () => void }, [Exercise]AnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true }, ref) => {
    // State
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [currentMetrics, setCurrentMetrics] = useState<[Exercise]Metrics>({});
    const [currentErrors, setCurrentErrors] = useState<Array<{type: string; message: string; severity: string}>>([]);
    
    // Create HTTP-based API connection
    const connectAPI = useCallback(() => {
      if (isConnecting) return;
      isConnecting = true;
    
      try {
        logger.info('Setting up HTTP-based API connection for [exercise] analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for [exercise] analysis');
      } catch (error) {
        logger.error('Error setting up API connection:', error);
        isConnecting = false;
        
        // Retry after delay
        setTimeout(connectAPI, 3000);
      }
    }, []);
    
    // Reset counter via HTTP API
    const resetCounter = useCallback(() => {
      try {
        fetch('http://localhost:3001/api/[exercise]/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseType: '[exercise]' })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset [exercise] counter');
          } else {
            logger.error('Failed to reset [exercise] counter:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting [exercise] counter:', error);
        });
      } catch (error) {
        logger.error('Error preparing reset counter request:', error);
      }
    }, []);
    
    // Expose reset method to parent
    useImperativeHandle(ref, () => ({ resetCounter }), [resetCounter]);
    
    // Setup reset event listener
    useEffect(() => {
      window.addEventListener('workout_set_complete', resetCounter);
      window.reset[Exercise]Counter = resetCounter;
    
      return () => {
        window.removeEventListener('workout_set_complete', resetCounter);
        delete window.reset[Exercise]Counter;
      };
    }, [resetCounter]);
    
    // Setup connection and monitoring
    useEffect(() => {
      connectAPI();
      
      const interval = setInterval(() => {
        if (!apiReady) {
          connectAPI();
        }
      }, 5000);
    
      return () => {
        clearInterval(interval);
      };
    }, [connectAPI, apiReady]);
    
    // Handler for API response
    const handleAnalysisResponse = useCallback((data: any) => {
      if (data.result) {
        // Create a copy of the metrics and ensure repCount is included
        const updatedMetrics = {
          ...(data.result.metrics || {}),
          repCount: data.result.repCount
        };
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        setCurrentErrors(data.result.errors || []);
        
        // Pass to callback
        onAnalysisComplete(data.result);
      }
      
      if (data.error) {
        onError({
          type: 'ANALYSIS_ERROR', 
          message: data.error.message, 
          severity: 'error'
        });
      }
    }, [onAnalysisComplete, onError]);
    
    // Process pose results via HTTP API
    const handleResults = useCallback((results: MediaPipeResults) => {
      if (!isAnalyzing || !apiReady || !results.poseLandmarks) {
        return;
      }
    
      frameCounter.current++;
      if (frameCounter.current % (FRAME_SKIP_COUNT + 1) !== 0) {
        return;
      }
    
      try {
        // Format payload for HTTP API 
        const payload = {
          landmarks: results.poseLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 0
          }))
        };
        
        // Log payload size for debugging
        const payloadJson = JSON.stringify(payload);
        const payloadSize = new Blob([payloadJson]).size;
        if (payloadSize > 16000) {
          logger.warn(`Large payload: ${payloadSize} bytes`);
        }
        
        // Use HTTP API
        fetch('http://localhost:3001/api/analyze/[exercise]', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadJson
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(handleAnalysisResponse)
        .catch(err => logger.error('API error:', err));
      } catch (error) {
        logger.error('Error preparing pose data:', error);
      }
    }, [apiReady, isAnalyzing, handleAnalysisResponse]);
    
    // Toggle metrics display
    const toggleMetrics = useCallback(() => {
      setShowMetrics(prev => !prev);
    }, []);
    
    return (
      <>
        <BaseExerciseAnalyzer
          onResults={handleResults}
          onAnalysisComplete={onAnalysisComplete}
          onError={onError}
        />
        {showMetrics && (
          <[Exercise]MetricsDisplay 
            metrics={currentMetrics} 
            errors={currentErrors}
          />
        )}
      </>
    );
  }
);

export default [Exercise]Analyzer;
```

### Step 4: Update AI Testing Dashboard

Modify `frontend/src/pages/ai-testing/AITestingPage.tsx` to include the new exercise:

**Reference: `frontend/src/pages/ai-testing/AITestingPage.tsx`**

```typescript
// Code template as before
```

## Backend Implementation

### Step 1: Create Analyzer Service

Create a new file at `backend/src/services/[Exercise]AnalyzerService.ts`:

**Reference examples:**
- Squat: `backend/src/services/SquatAnalyzerService.ts`
- Bicep: `backend/src/services/BicepAnalyzerService.ts`
- Python service: `backend/src/services/PythonService.ts`

```typescript
import { Logger } from '../utils/logger';
import { BaseExerciseAnalyzer } from './BaseExerciseAnalyzer';
import { PythonService } from './PythonService';
import { ExerciseType } from '../types/exercise';

export class [Exercise]AnalyzerService extends BaseExerciseAnalyzer {
  private logger: Logger;

  constructor(pythonService: PythonService) {
    super(pythonService);
    this.logger = new Logger('[Exercise]AnalyzerService');
    this.exerciseType = ExerciseType.[EXERCISE]; // Update the enum in types/exercise.ts
  }

  // Override any necessary methods from BaseExerciseAnalyzer
  // For example, you might need custom validation logic:
  
  protected validatePoseData(poseData: any): boolean {
    // Add any [exercise]-specific validation
    return super.validatePoseData(poseData);
  }
}
```

### Step 2: Update Exercise Type Enum

Modify `backend/src/types/exercise.ts` to include the new exercise type:

**Reference: `backend/src/types/exercise.ts`**

```typescript
export enum ExerciseType {
  SQUAT = 'squat',
  BICEP = 'bicep',
  [EXERCISE] = '[exercise]',
  // Add your new exercise
}
```

### Step 3: Update Exercise Analyzer Factory

Modify `backend/src/services/ExerciseAnalyzerFactory.ts` to include the new exercise analyzer:

**Reference: `backend/src/services/ExerciseAnalyzerFactory.ts`**

```typescript
import { [Exercise]AnalyzerService } from './[Exercise]AnalyzerService';

// Inside the class
private createSpecificAnalyzer(type: ExerciseType): BaseExerciseAnalyzer {
  switch (type) {
    case ExerciseType.SQUAT:
      return this.createSquatAnalyzer();
    case ExerciseType.BICEP:
      return this.createBicepAnalyzer();
    case ExerciseType.[EXERCISE]:
      return this.create[Exercise]Analyzer();
    default:
      throw new Error(`Unsupported exercise type: ${type}`);
  }
}

private create[Exercise]Analyzer(): [Exercise]AnalyzerService {
  return new [Exercise]AnalyzerService(this.pythonService);
}
```

### Step 4: Create API Routes

Create a new file at `backend/src/routes/[exercise]AnalysisRoutes.ts`:

**Reference examples:**
- Squat: `backend/src/routes/squatAnalysisRoutes.ts`
- Bicep: `backend/src/routes/bicepAnalysisRoutes.ts`

```typescript
import express, { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { ExerciseAnalyzerFactory } from '../services/ExerciseAnalyzerFactory';
import { ExerciseType } from '../types/exercise';
import { PythonService } from '../services/PythonService';

export const [exercise]AnalysisRouter = express.Router();
const logger = new Logger('[Exercise]AnalysisRoutes');
const pythonService = new PythonService();
const analyzerFactory = new ExerciseAnalyzerFactory(pythonService);

// POST endpoint for analyzing [exercise] poses
[exercise]AnalysisRouter.post('/analyze/[exercise]', async (req: Request, res: Response) => {
  try {
    const poseData = req.body;
    
    // Get the analyzer for this exercise
    const analyzer = analyzerFactory.getAnalyzer(ExerciseType.[EXERCISE]);
    
    // Analyze the pose data
    const result = await analyzer.analyzePoseData(poseData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing [exercise] pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to analyze [exercise] pose',
        details: error.message
      } 
    });
  }
});

// POST endpoint for resetting [exercise] counter
[exercise]AnalysisRouter.post('/[exercise]/reset', (req: Request, res: Response) => {
  try {
    // No special logic needed for reset in most cases
    return res.json({ success: true });
  } catch (error) {
    logger.error('Error resetting [exercise] counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to reset counter' } 
    });
  }
});
```

### Step 5: Register Routes

Update `backend/src/app.ts` to include the new routes:

**Reference: `backend/src/app.ts`**

```typescript
import { [exercise]AnalysisRouter } from './routes/[exercise]AnalysisRoutes';

// Inside app setup where routes are registered
app.use('/api', [exercise]AnalysisRouter);
```

## Python Analysis Script

### Step 1: Create Python Analyzer

Create a new file at `core/[exercise]_analyzer.py`:

**Reference examples:**
- Squat: `core/squat_analyzer.py`
- Bicep: `core/bicep_analyzer.py`
- Utilities: `core/utils/angle_utils.py` (if applicable)

```python
import numpy as np
import pandas as pd
import json
import sys
import logging
from typing import Dict, List, Tuple, Any, Optional, Union

# Setup logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('[exercise]_analyzer')

# Define required landmarks for this exercise
REQUIRED_LANDMARKS = [
    # List the landmarks required for your exercise
    # Example: 0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28
]

class [Exercise]PoseAnalysis:
    """Class to hold [exercise] analysis results"""
    def __init__(self):
        self.stage = "unknown"
        self.rep_count = 0
        self.form_score = 100
        self.errors = []
        self.metrics = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary for JSON response"""
        return {
            "stage": self.stage,
            "repCount": self.rep_count,
            "formScore": self.form_score,
            "errors": self.errors,
            "metrics": self.metrics
        }

class [Exercise]Analyzer:
    """Analyzer for [exercise] poses"""
    
    def __init__(self):
        """Initialize the analyzer with default values"""
        # Counter for reps
        self.counter = 0
        
        # Track state
        self.current_stage = "unknown"
        self.previous_stage = "unknown"
        
        # Thresholds for analysis
        self.VISIBILITY_THRESHOLD = 0.6
        
        # Other thresholds specific to your exercise
        # self.ANGLE_THRESHOLD_1 = 160
        # self.ANGLE_THRESHOLD_2 = 90
        
        logger.info("[Exercise] analyzer initialized")
    
    def get_joints(self, landmarks: List[Dict[str, float]]) -> Dict[str, Tuple[float, float, float]]:
        """Extract joint coordinates from landmarks"""
        # Extract the specific landmarks you need for your exercise
        # Return as a dictionary mapping joint names to (x, y, visibility) tuples
        joints = {}
        
        # Example:
        # joints["left_shoulder"] = (landmarks[11]["x"], landmarks[11]["y"], landmarks[11]["visibility"])
        
        return joints
    
    def calculate_angle(self, a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
        """Calculate the angle between three points"""
        # Convert to numpy arrays for vector operations
        a = np.array([a[0], a[1]])
        b = np.array([b[0], b[1]])
        c = np.array([c[0], c[1]])
        
        # Calculate vectors
        ba = a - b
        bc = c - b
        
        # Calculate angle in radians
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        # Convert to degrees
        angle = np.degrees(angle)
        
        return angle
    
    def calculate_distance(self, a: Tuple[float, float], b: Tuple[float, float]) -> float:
        """Calculate distance between two points"""
        return np.sqrt((b[0] - a[0])**2 + (b[1] - a[1])**2)
    
    def detect_errors(self, joints: Dict[str, Tuple[float, float, float]], metrics: Dict[str, float]) -> List[Dict[str, str]]:
        """Detect errors in the [exercise] form"""
        errors = []
        
        # Check for visibility issues
        for joint_name, (_, _, visibility) in joints.items():
            if visibility < self.VISIBILITY_THRESHOLD:
                errors.append({
                    "type": "visibility",
                    "message": f"Cannot see {joint_name.replace('_', ' ')} clearly",
                    "severity": "medium"
                })
        
        # Check for specific errors based on your exercise
        # Example:
        # if metrics["some_angle"] < self.SOME_THRESHOLD:
        #     errors.append({
        #         "type": "some_error",
        #         "message": "Specific error message",
        #         "severity": "high"
        #     })
        
        return errors
    
    def detect_stage(self, metrics: Dict[str, float]) -> str:
        """Determine the current stage of the exercise"""
        # Logic to determine the stage based on joint angles or other metrics
        # Example:
        # if metrics["primary_angle"] > self.UP_THRESHOLD:
        #     return "up"
        # elif metrics["primary_angle"] < self.DOWN_THRESHOLD:
        #     return "down"
        # else:
        #     return "middle"
        
        return "unknown"
    
    def calculate_form_score(self, errors: List[Dict[str, str]]) -> int:
        """Calculate a form score based on detected errors"""
        score = 100
        
        for error in errors:
            if error["severity"] == "high":
                score -= 15
            elif error["severity"] == "medium":
                score -= 10
            elif error["severity"] == "low":
                score -= 5
        
        # Ensure score is between 0 and 100
        return max(0, min(100, score))
    
    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """Analyze the [exercise] pose and return results"""
        analysis = [Exercise]PoseAnalysis()
        
        try:
            # Extract joints from landmarks
            joints = self.get_joints(landmarks)
            
            # Calculate metrics (angles, distances, etc.)
            metrics = {}
            
            # Example metrics calculations:
            # metrics["primary_angle"] = self.calculate_angle(
            #     (joints["joint1"][0], joints["joint1"][1]),
            #     (joints["joint2"][0], joints["joint2"][1]),
            #     (joints["joint3"][0], joints["joint3"][1])
            # )
            
            # Detect current stage
            current_stage = self.detect_stage(metrics)
            
            # Count reps when transitioning from down to up
            if (self.current_stage == "down" and current_stage == "up"):
                self.counter += 1
                logger.info(f"Rep counted: {self.counter}")
            
            # Update stage
            self.previous_stage = self.current_stage
            self.current_stage = current_stage
            
            # Detect form errors
            errors = self.detect_errors(joints, metrics)
            
            # Calculate form score
            form_score = self.calculate_form_score(errors)
            
            # Update analysis object
            analysis.stage = current_stage
            analysis.rep_count = self.counter
            analysis.metrics = metrics
            analysis.errors = errors
            analysis.form_score = form_score
            
            return {
                "success": True,
                "result": analysis.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing [exercise] pose: {str(e)}")
            return {
                "success": False,
                "error": {
                    "message": f"Failed to analyze [exercise] pose: {str(e)}"
                }
            }

def extract_important_keypoints(data: Dict[str, Any]) -> List[Dict[str, float]]:
    """Extract and format keypoints from the input data"""
    try:
        # Extract landmarks from the data
        if "landmarks" in data:
            landmarks = data["landmarks"]
            
            # Ensure we have the required landmarks
            if len(landmarks) < max(REQUIRED_LANDMARKS) + 1:
                raise ValueError(f"Not enough landmarks: {len(landmarks)}")
            
            # Check if we have the necessary fields
            for landmark in landmarks:
                if not all(k in landmark for k in ["x", "y", "visibility"]):
                    # If visibility is missing, default to 1.0
                    if "visibility" not in landmark:
                        landmark["visibility"] = 1.0
                    else:
                        raise ValueError("Missing required fields in landmarks")
            
            return landmarks
        
        raise ValueError("No landmarks found in the data")
    except Exception as e:
        logger.error(f"Error extracting keypoints: {str(e)}")
        raise

def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """Analyze [exercise] pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        
        # Extract keypoints
        landmarks = extract_important_keypoints(data)
        
        # Create analyzer and analyze the pose
        analyzer = [Exercise]Analyzer()
        result = analyzer.analyze_pose(landmarks)
        
        return result
    except Exception as e:
        logger.error(f"Error in [exercise] analysis: {str(e)}")
        return {
            "success": False,
            "error": {
                "message": f"Error in [exercise] analysis: {str(e)}"
            }
        }

if __name__ == "__main__":
    # Read JSON data from stdin
    json_data = sys.stdin.read()
    
    # Analyze the pose
    result = analyze_from_json(json_data)
    
    # Print the result as JSON
    print(json.dumps(result))
```

### Step 2: Create Test Data

Create test data files for your new exercise:

**Reference: `test-data/[exercise]-pose.json`**

```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.5, "visibility": 0.9},
    {"x": 0.6, "y": 0.6, "visibility": 0.9},
    // Additional landmarks for testing
  ]
}
```

### Step 3: Add Documentation

Add documentation for your Python analyzer:

**Reference: `core/README.md`** (if applicable)

```markdown
## [Exercise] Analyzer

The [exercise] analyzer (`[exercise]_analyzer.py`) processes pose landmarks to:

1. Track exercise stage (up/down/middle)
2. Count repetitions
3. Detect form errors specific to [exercise]
4. Calculate form score

### Key Metrics:
- [List specific metrics calculated]

### Form Errors:
- [List specific form errors detected]
```

## Testing and Integration

### Step 1: Test the Backend API

Test the backend API using curl or Postman:

**Reference testing commands:**
```bash
# Example for squat testing
curl -X POST http://localhost:3001/api/analyze/squat -H 'Content-Type: application/json' -d @test-data/squat-pose.json

# For your new exercise
curl -X POST \
  http://localhost:3001/api/analyze/[exercise] \
  -H 'Content-Type: application/json' \
  -d '{
    "landmarks": [
      {"x": 0.5, "y": 0.5, "visibility": 0.9},
      {"x": 0.6, "y": 0.6, "visibility": 0.9},
      // Add more landmarks for testing
    ]
  }'
```

### Step 2: Test the Frontend Integration

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. Navigate to the AI Testing Dashboard in your browser
4. Select your new exercise from the dropdown
5. Test with live camera input or upload a video

### Step 3: Debug Common Issues

Common issues to watch for:

1. **Python Integration**:
   - Ensure Python path is correctly set in PythonService
   - Verify all required Python packages are installed
   - Check Python script permissions

2. **Frontend Rendering**:
   - Check for React key warnings or errors
   - Verify all props are passed correctly to components

3. **API Communication**:
   - Monitor network requests for errors
   - Verify correct JSON structure in requests/responses

## Advanced Implementation Topics

### ML Model Integration

When implementing exercises that use machine learning models:

1. **Model Loading**: 
   ```python
   def __init__(self):
     # Set model paths as constants
     self.STAGE_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/stage_model.pkl')
     self.ERROR_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/error_model.pkl')
     self.INPUT_SCALER_PATH = os.path.join(os.path.dirname(__file__), '../models/input_scaler.pkl')
     
     # Load models
     self._load_models()
     
   def _load_models(self):
     """Load ML models with robust error handling"""
     try:
       # Load stage detection model
       if os.path.exists(self.STAGE_MODEL_PATH):
         self.stage_model = joblib.load(self.STAGE_MODEL_PATH)
         
       # Load error detection model
       if os.path.exists(self.ERROR_MODEL_PATH):
         self.error_model = joblib.load(self.ERROR_MODEL_PATH)
         
       # Load input scaler
       if os.path.exists(self.INPUT_SCALER_PATH):
         self.input_scaler = joblib.load(self.INPUT_SCALER_PATH)
         
       # Test with dummy data to ensure models work
       self._test_models()
       
     except Exception as e:
       logger.error(f"Error loading ML models: {str(e)}")
       self.stage_model = None
       self.error_model = None
   ```

2. **Input Preprocessing**:
   ```python
   def _preprocess_landmarks(self, landmarks):
     """Preprocess landmarks for ML model input"""
     # Extract important landmarks
     important_landmarks = [landmarks[i] for i in IMPORTANT_LANDMARKS]
     
     # Flatten the landmarks
     flattened = []
     for lm in important_landmarks:
       flattened.extend([lm['x'], lm['y'], lm['z'], lm['visibility']])
       
     # Scale inputs if scaler is available
     if hasattr(self, 'input_scaler') and self.input_scaler is not None:
       try:
         flattened = self.input_scaler.transform([flattened])[0]
       except Exception as e:
         logger.error(f"Error scaling inputs: {str(e)}")
         
     return flattened
   ```

3. **Fallback Mechanisms**:
   ```python
   def detect_stage(self, landmarks):
     """Detect exercise stage with ML fallback to geometric approach"""
     try:
       # Try ML approach first
       if hasattr(self, 'stage_model') and self.stage_model is not None:
         processed_input = self._preprocess_landmarks(landmarks)
         prediction = self.stage_model.predict([processed_input])
         probability = self.stage_model.predict_proba([processed_input])
         
         # Check confidence
         if np.max(probability) > self.PREDICTION_THRESHOLD:
           return prediction[0]
       
       # Fallback to geometric approach
       return self._detect_stage_geometric(landmarks)
     
     except Exception as e:
       logger.error(f"Error in ML stage detection: {str(e)}")
       return self._detect_stage_geometric(landmarks)
   ```

### Exercise Counter Reset Functionality

Implement consistent reset functionality across exercise analyzers:

1. **Backend Reset Service**:
   ```typescript
   // In BaseExerciseAnalyzer.ts
   
   public async resetRepCounter(): Promise<boolean> {
     try {
       // For Python-based analyzers
       if (this.pythonService) {
         return await this.pythonService.resetRepCounter(this.exerciseType);
       }
       
       // For JavaScript-based analyzers
       this.repCount = 0;
       return true;
     } catch (error) {
       this.logger.error(`Error resetting rep counter: ${error}`);
       return false;
     }
   }
   ```

2. **Frontend Reset Integration**:
   ```typescript
   // In [Exercise]Analyzer.tsx
   
   const resetCounter = useCallback(() => {
     try {
       fetch(`http://localhost:3001/api/${exerciseType}/reset`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ exerciseType })
       })
       .then(response => response.json())
       .then(data => {
         if (data.success) {
           logger.info(`Successfully reset ${exerciseType} counter`);
         } else {
           logger.error(`Failed to reset ${exerciseType} counter:`, data.error);
         }
       })
       .catch(error => {
         logger.error(`Error resetting ${exerciseType} counter:`, error);
       });
     } catch (error) {
       logger.error('Error preparing reset counter request:', error);
     }
   }, [exerciseType]);
   
   // Expose the resetCounter method via ref
   useImperativeHandle(ref, () => ({ resetCounter }), [resetCounter]);
   ```

3. **SessionTracker Integration**:
   ```typescript
   // In SessionTracker.tsx
   
   // Create refs for each exercise analyzer
   const squatAnalyzerRef = useRef(null);
   const bicepAnalyzerRef = useRef(null);
   const lungeAnalyzerRef = useRef(null);
   // Add refs for other exercise analyzers
   
   // Reset all exercise analyzers
   const resetExerciseAnalyzers = useCallback(() => {
     // Reset all exercise analyzers
     if (squatAnalyzerRef.current?.resetCounter) {
       squatAnalyzerRef.current.resetCounter();
     }
     if (bicepAnalyzerRef.current?.resetCounter) {
       bicepAnalyzerRef.current.resetCounter();
     }
     if (lungeAnalyzerRef.current?.resetCounter) {
       lungeAnalyzerRef.current.resetCounter();
     }
     // Reset other analyzers as needed
   }, []);
   
   // Call resetExerciseAnalyzers when:
   // 1. Completing a set
   // 2. Moving to next/previous exercise
   // 3. Starting a new session
   ```

### Frontend-Backend Communication

Establish robust communication between frontend and backend components:

1. **HTTP API Communication**:
   ```typescript
   // In [Exercise]Analyzer.tsx
   
   const handleResults = useCallback((results: MediaPipeResults) => {
     if (!isAnalyzing || !apiReady || !results.poseLandmarks) {
       return;
     }
   
     frameCounter.current++;
     if (frameCounter.current % (FRAME_SKIP_COUNT + 1) !== 0) {
       return;
     }
   
     try {
       // Format payload for HTTP API
       const payload = {
         landmarks: results.poseLandmarks.map(lm => ({
           x: lm.x,
           y: lm.y,
           z: lm.z || 0,
           visibility: lm.visibility || 0
         }))
       };
       
       // Log payload size for debugging
       const payloadJson = JSON.stringify(payload);
       const payloadSize = new Blob([payloadJson]).size;
       if (payloadSize > 16000) {
         logger.warn(`Large payload: ${payloadSize} bytes`);
       }
       
       // Use HTTP API with timeout and retry logic
       fetch(`http://localhost:3001/api/analyze/${exerciseType}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: payloadJson,
         signal: AbortSignal.timeout(3000) // 3 second timeout
       })
       .then(response => {
         if (!response.ok) {
           throw new Error(`HTTP error! Status: ${response.status}`);
         }
         return response.json();
       })
       .then(handleAnalysisResponse)
       .catch(err => {
         if (err.name === 'AbortError') {
           logger.warn('Request timed out, will retry on next frame');
         } else {
           logger.error('API error:', err);
         }
       });
     } catch (error) {
       logger.error('Error preparing pose data:', error);
     }
   }, [apiReady, isAnalyzing, exerciseType, handleAnalysisResponse]);
   ```

2. **State Management**:
   ```typescript
   // In [Exercise]Analyzer.tsx
   
   const handleAnalysisResponse = useCallback((data: any) => {
     if (data.result) {
       // Create a copy of the metrics and ensure repCount is included
       const updatedMetrics = {
         ...(data.result.metrics || {}),
         repCount: data.result.repCount
       };
       
       // Update our state with the latest metrics and errors
       setCurrentMetrics(updatedMetrics);
       setCurrentErrors(data.result.errors || []);
       
       // Pass to parent component callback
       onAnalysisComplete(data.result);
       
       // Dispatch events for other components if needed
       window.dispatchEvent(new CustomEvent('exercise_update', { 
         detail: { 
           type: exerciseType,
           metrics: updatedMetrics,
           errors: data.result.errors || [],
           stage: data.result.stage
         } 
       }));
     }
     
     if (data.error) {
       onError({
         type: 'ANALYSIS_ERROR', 
         message: data.error.message, 
         severity: 'error'
       });
     }
   }, [exerciseType, onAnalysisComplete, onError]);
   ```

### Model Path Configuration

Configure ML model paths properly across environments:

1. **Centralized Path Configuration**:
   ```python
   # In a central configuration file (e.g., core/config.py)
   
   import os
   
   # Base paths
   BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
   MODELS_DIR = os.path.join(BASE_DIR, 'models')
   
   # Exercise-specific paths
   EXERCISE_MODEL_PATHS = {
     'squat': {
       'stage_model': os.path.join(MODELS_DIR, 'squat', 'stage_model.pkl'),
       'error_model': os.path.join(MODELS_DIR, 'squat', 'error_model.pkl'),
       'input_scaler': os.path.join(MODELS_DIR, 'squat', 'input_scaler.pkl'),
     },
     'bicep': {
       'stage_model': os.path.join(MODELS_DIR, 'bicep', 'stage_model.pkl'),
       'error_model': os.path.join(MODELS_DIR, 'bicep', 'error_model.pkl'),
       'input_scaler': os.path.join(MODELS_DIR, 'bicep', 'input_scaler.pkl'),
     },
     'lunge': {
       'stage_model': os.path.join(MODELS_DIR, 'lunge', 'stage_model.pkl'),
       'error_model': os.path.join(MODELS_DIR, 'lunge', 'error_model.pkl'),
       'input_scaler': os.path.join(MODELS_DIR, 'lunge', 'input_scaler.pkl'),
     },
   }
   
   def get_model_paths(exercise_type):
     """Get model paths for a specific exercise type"""
     if exercise_type in EXERCISE_MODEL_PATHS:
       return EXERCISE_MODEL_PATHS[exercise_type]
     raise ValueError(f"No model paths defined for exercise type: {exercise_type}")
   ```

2. **Environment-aware Path Resolution**:
   ```python
   # In [Exercise]Analyzer.py
   
   def __init__(self):
     # Determine environment (development, testing, production)
     self.env = os.getenv('NODE_ENV', 'development')
     
     # Get model paths from config
     from core.config import get_model_paths
     model_paths = get_model_paths('lunge')
     
     # Override with environment-specific paths if needed
     if self.env == 'testing':
       # Use testing models
       self.STAGE_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../test_models/stage_model.pkl')
     else:
       # Use production models
       self.STAGE_MODEL_PATH = model_paths['stage_model']
     
     self.ERROR_MODEL_PATH = model_paths['error_model']
     self.INPUT_SCALER_PATH = model_paths['input_scaler']
     
     # Verify model files exist
     self._verify_model_files()
     
     # Load models
     self._load_models()
   ```

### Error Handling

Implement robust error handling across the system:

1. **Python Analyzer Error Handling**:
   ```python
   # In [Exercise]Analyzer.py
   
   def analyze_pose(self, landmarks):
     """Analyze the pose with comprehensive error handling"""
     analysis = ExercisePoseAnalysis()
     
     try:
       # Validate input data
       if not landmarks or len(landmarks) < 33:
         raise ValueError("Invalid landmark data: insufficient landmarks")
       
       # Extract joints with visibility check
       joints = self.get_joints(landmarks)
       if not joints:
         raise ValueError("Failed to extract joint data from landmarks")
       
       # Continue with analysis
       # ...
       
       return {
         "success": True,
         "result": analysis.to_dict()
       }
       
     except ValueError as e:
       # Handle validation errors
       logger.warning(f"Validation error in pose analysis: {str(e)}")
       return {
         "success": False,
         "error": {
           "type": "VALIDATION_ERROR",
           "message": str(e)
         }
       }
       
     except Exception as e:
       # Handle unexpected errors
       logger.error(f"Unexpected error in pose analysis: {str(e)}", exc_info=True)
       return {
         "success": False,
         "error": {
           "type": "ANALYSIS_ERROR",
           "message": f"Analysis failed: {str(e)}"
         }
       }
   ```

2. **Frontend Error Handling**:
   ```typescript
   // In [Exercise]Analyzer.tsx
   
   const [connectionErrors, setConnectionErrors] = useState(0);
   const [lastErrorTime, setLastErrorTime] = useState(0);
   const MAX_ERRORS = 5;
   const ERROR_RESET_TIME = 30000; // 30 seconds
   
   const handleApiError = useCallback((error) => {
     const now = Date.now();
     
     // Reset error count if enough time has passed
     if (now - lastErrorTime > ERROR_RESET_TIME) {
       setConnectionErrors(1);
     } else {
       setConnectionErrors(prev => prev + 1);
     }
     
     setLastErrorTime(now);
     
     // Log the error
     logger.error('API error:', error);
     
     // Notify the user if we've had too many errors
     if (connectionErrors >= MAX_ERRORS) {
       onError({
         type: 'CONNECTION_ERROR',
         message: 'Connection to analysis service is unstable. Please try again later.',
         severity: 'error'
       });
       
       // Temporarily stop sending requests
       setApiReady(false);
       
       // Try reconnecting after a delay
       setTimeout(() => {
         setConnectionErrors(0);
         setApiReady(true);
       }, 5000);
     }
   }, [connectionErrors, lastErrorTime, onError]);
   ```

### Comprehensive Logging

Implement detailed logging for debugging:

1. **Backend Logging**:
   ```typescript
   // In [Exercise]AnalyzerService.ts
   
   import { Logger } from '../utils/logger';
   
   export class [Exercise]AnalyzerService extends BaseExerciseAnalyzer {
     private logger: Logger;
   
     constructor(pythonService: PythonService) {
       super(pythonService);
       this.logger = new Logger('[Exercise]AnalyzerService');
       this.exerciseType = ExerciseType.[EXERCISE];
       
       this.logger.info(`Initializing ${this.exerciseType} analyzer service`);
     }
     
     public async analyzePoseData(poseData: any): Promise<any> {
       this.logger.debug(`Analyzing ${this.exerciseType} pose data`, {
         timestamp: new Date().toISOString(),
         dataSize: JSON.stringify(poseData).length,
         hasLandmarks: Boolean(poseData.landmarks || poseData.poseLandmarks)
       });
       
       const startTime = performance.now();
       const result = await super.analyzePoseData(poseData);
       const duration = performance.now() - startTime;
       
       this.logger.debug(`Completed ${this.exerciseType} analysis in ${duration.toFixed(2)}ms`, {
         success: result.success,
         hasResult: Boolean(result.result),
         processingTime: duration
       });
       
       return result;
     }
   }
   ```

2. **Python Logging**:
   ```python
   # In [Exercise]Analyzer.py
   
   import logging
   import time
   import traceback
   
   # Configure logging
   logging.basicConfig(level=logging.INFO,
                     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
   logger = logging.getLogger('[exercise]_analyzer')
   
   class [Exercise]Analyzer:
     def __init__(self):
       # Enable debug logging
       self.DEBUG = os.getenv('DEBUG_EXERCISE_ANALYSIS', 'false').lower() == 'true'
       if self.DEBUG:
         logger.setLevel(logging.DEBUG)
         logger.warning("[EXERCISE]_DEBUG: Initializing with debug logging enabled")
       
       # Rest of initialization
       # ...
     
     def analyze_pose(self, landmarks):
       start_time = time.time()
       
       if self.DEBUG:
         logger.debug(f"[EXERCISE]_DEBUG: Starting analysis with {len(landmarks)} landmarks")
       
       try:
         # Analysis code
         # ...
         
         end_time = time.time()
         processing_time = end_time - start_time
         
         if self.DEBUG:
           logger.debug(f"[EXERCISE]_DEBUG: Analysis completed in {processing_time:.4f}s")
           logger.debug(f"[EXERCISE]_DEBUG: Stage={analysis.stage}, RepCount={analysis.rep_count}")
         
         return {
           "success": True,
           "result": analysis.to_dict(),
           "processingTime": processing_time
         }
         
       except Exception as e:
         end_time = time.time()
         processing_time = end_time - start_time
         
         if self.DEBUG:
           logger.error(f"[EXERCISE]_DEBUG: Analysis failed in {processing_time:.4f}s")
           logger.error(f"[EXERCISE]_DEBUG: Error details: {str(e)}")
           logger.error(f"[EXERCISE]_DEBUG: Traceback: {traceback.format_exc()}")
         
         return {
           "success": False,
           "error": {
             "message": f"Analysis failed: {str(e)}"
           },
           "processingTime": processing_time
         }
   ```

### SessionTracker Integration

Integrate with the SessionTracker component:

1. **Update SessionTracker.tsx**:
   ```typescript
   // In SessionTracker.tsx renderExerciseAnalyzer method
   
   const renderExerciseAnalyzer = () => {
     const exerciseName = currentExercise?.exercise?.name || '';
     
     // Determine which analyzer to render based on exercise type
     if (isSquatExercise(exerciseName)) {
       return (
         <SquatAnalyzer
           ref={squatAnalyzerRef}
           onAnalysisComplete={handleAnalysisComplete}
           onError={handleAnalysisError}
           isAnalyzing={isAnalyzing}
         />
       );
     } else if (isBicepCurlExercise(exerciseName)) {
       return (
         <BicepAnalyzer
           ref={bicepAnalyzerRef}
           onAnalysisComplete={handleAnalysisComplete}
           onError={handleAnalysisError}
           isAnalyzing={isAnalyzing}
         />
       );
     } else if (isLungeExercise(exerciseName)) {
       return (
         <LungeAnalyzer
           ref={lungeAnalyzerRef}
           onAnalysisComplete={handleAnalysisComplete}
           onError={handleAnalysisError}
           isAnalyzing={isAnalyzing}
         />
       );
     }
     
     // Default case
     return (
       <Typography variant="body1" color="text.secondary" align="center" mt={2}>
         No AI analysis available for this exercise type
       </Typography>
     );
   };
   ```

2. **Modify handleLogSet function to reset counters**:
   ```typescript
   // In SessionTracker.tsx handleLogSet method
   
   const handleLogSet = async () => {
     // Existing code to log the set
     // ...
     
     // Reset exercise analyzers after logging a set
     resetExerciseAnalyzers();
     
     // Continue with existing code
     // ...
   };
   ```

### Exercise Type Detection

Update the exercise type detection utility:

1. **Add Exercise Detection Functions**:
   ```typescript
   // In exerciseTypeUtils.ts
   
   // Update EXERCISE_TYPES to include new exercises
   export const EXERCISE_TYPES = {
     SQUAT: 'squat',
     DEADLIFT: 'deadlift',
     BENCH_PRESS: 'bench_press',
     LUNGE: 'lunge',
     PLANK: 'plank',
     BICEP_CURL: 'bicep_curl',
     // Add new exercise types here
     [NEW_EXERCISE]: '[new_exercise]'
   } as const;
   
   // Update EXERCISE_MAPPINGS to include variations
   const EXERCISE_MAPPINGS = {
     // Existing mappings
     // ...
     
     // New exercise variations
     [EXERCISE_TYPES.[NEW_EXERCISE]]: [
       'Variation 1',
       'Variation 2',
       'Variation 3',
       // Add more variations as needed
     ],
   };
   
   // Add type detection function for the new exercise
   export const is[NewExercise]Exercise = (exerciseName: string): boolean => {
     return isExerciseType(exerciseName, EXERCISE_TYPES.[NEW_EXERCISE]);
   };
   ```

### Performance Considerations

Address performance in exercise analysis implementations:

1. **Frame Skipping & Optimization**:
   ```typescript
   // In [Exercise]Analyzer.tsx
   
   // Configure frame skipping based on device capability
   const [frameSkipCount, setFrameSkipCount] = useState(2); // Default skip 2 frames
   
   // Adaptive frame skipping based on performance
   useEffect(() => {
     // Check if running on a mobile device
     const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
     
     // Increase frame skip on mobile devices
     if (isMobile) {
       setFrameSkipCount(3); // Skip more frames on mobile
     }
     
     // Optionally check for low-end devices
     if ('deviceMemory' in navigator) {
       // @ts-ignore - deviceMemory is not in the standard navigator type
       const memory = navigator.deviceMemory;
       if (memory && memory < 4) {
         setFrameSkipCount(4); // Skip even more frames on low-memory devices
       }
     }
   }, []);
   
   // Use frame skipping in handleResults
   const handleResults = useCallback((results: MediaPipeResults) => {
     if (!isAnalyzing || !apiReady || !results.poseLandmarks) {
       return;
     }
   
     frameCounter.current++;
     if (frameCounter.current % (frameSkipCount + 1) !== 0) {
       return;
     }
     
     // Rest of the code
     // ...
   }, [frameSkipCount, apiReady, isAnalyzing]);
   ```

2. **Backend Performance Optimization**:
   ```python
   # In [Exercise]Analyzer.py
   
   class [Exercise]Analyzer:
     def __init__(self):
       # Cache for landmark preprocessing
       self.landmark_cache = {}
       self.cache_size = 100
       
       # Rest of the code
       # ...
     
     def _preprocess_landmarks(self, landmarks):
       """Preprocess landmarks with caching for performance"""
       # Generate a cache key based on landmark positions
       cache_key = self._generate_cache_key(landmarks)
       
       # Check if we have cached results
       if cache_key in self.landmark_cache:
         return self.landmark_cache[cache_key]
       
       # Preprocess the landmarks
       processed = []
       # Processing code
       # ...
       
       # Cache the result
       if len(self.landmark_cache) >= self.cache_size:
         # Remove oldest entry
         oldest_key = next(iter(self.landmark_cache))
         del self.landmark_cache[oldest_key]
       
       self.landmark_cache[cache_key] = processed
       return processed
     
     def _generate_cache_key(self, landmarks):
       """Generate a cache key from landmarks"""
       key_parts = []
       for i in IMPORTANT_LANDMARKS:
         if i < len(landmarks):
           lm = landmarks[i]
           # Use lower precision for the key
           key_parts.append(f"{i}:{round(lm['x'], 3)},{round(lm['y'], 3)}")
       
       return "|".join(key_parts)
   ```

### Example Implementation: Lunge Analyzer

This section provides a reference implementation for the lunge exercise analyzer, demonstrating how the concepts in this guide are applied to a real exercise.

### Overview

The lunge analyzer detects lunge stages, counts repetitions, and identifies form errors such as knee angle issues and knee-over-toe errors.

### ML Model Integration

The lunge analyzer uses two key machine learning models:

1. **Stage Detection Model**: Identifies the current stage of the exercise (init, down, up)
2. **Error Detection Model**: Detects form errors such as incorrect knee angle

```python
class LungeAnalyzer:
    """Lunge exercise analyzer with ML model support"""
    
    # Class constants
    STAGE_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../core/lunge_model/model/sklearn/stage_LR_model.pkl')
    ERROR_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../core/lunge_model/model/sklearn/err_LR_model.pkl')
    INPUT_SCALER_PATH = os.path.join(os.path.dirname(__file__), '../../core/lunge_model/model/input_scaler.pkl')
    PREDICTION_PROB_THRESHOLD = 0.6
    
    def __init__(self):
        # Initialize rep counter and stage tracking
        self.counter = 0
        self.current_stage = "init"
        self.previous_stage = "init"
        
        # Log paths for debugging
        logger.warning(f"LUNGE_DEBUG: Stage model path: {self.STAGE_MODEL_PATH}")
        logger.warning(f"LUNGE_DEBUG: Error model path: {self.ERROR_MODEL_PATH}")
        logger.warning(f"LUNGE_DEBUG: Input scaler path: {self.INPUT_SCALER_PATH}")
        
        # Check if model files exist
        logger.warning(f"LUNGE_DEBUG: Checking if model files exist")
        logger.warning(f"LUNGE_DEBUG: Stage model file exists: {os.path.exists(self.STAGE_MODEL_PATH)}")
        logger.warning(f"LUNGE_DEBUG: Error model file exists: {os.path.exists(self.ERROR_MODEL_PATH)}")
        logger.warning(f"LUNGE_DEBUG: Input scaler file exists: {os.path.exists(self.INPUT_SCALER_PATH)}")
        
        # Load ML models
        self._load_models()
```

### Important Landmarks

The lunge analyzer uses specific landmarks for analysis:

```python
# Key landmarks for lunge analysis
IMPORTANT_LANDMARKS = [
    23, 24, 25, 26, 27, 28,  # Hip, knee, ankle landmarks
    11, 12, 13, 14,          # Shoulder and elbow landmarks
    0                        # Nose for orientation
]
```

### ML Model Loading

Implementation of robust model loading:

```python
def _load_models(self):
    """Load ML models with validation and error handling"""
    try:
        # Check pandas is available (required for ML models)
        try:
            import pandas as pd
            logger.warning("LUNGE_DEBUG: Successfully imported pandas")
        except ImportError:
            logger.error("LUNGE_DEBUG: Failed to import pandas, ML detection unavailable")
            self.stage_model = None
            self.error_model = None
            self.input_scaler = None
            return
        
        # Load stage detection model
        logger.warning("LUNGE_DEBUG: Loading stage detection model file")
        if os.path.exists(self.STAGE_MODEL_PATH):
            self.stage_model = joblib.load(self.STAGE_MODEL_PATH)
            logger.warning("LUNGE_DEBUG: Stage detection model loaded successfully")
        else:
            logger.error("LUNGE_DEBUG: Stage detection model file not found")
            self.stage_model = None
        
        # Load error detection model
        logger.warning("LUNGE_DEBUG: Loading error detection model file")
        if os.path.exists(self.ERROR_MODEL_PATH):
            self.error_model = joblib.load(self.ERROR_MODEL_PATH)
            logger.warning("LUNGE_DEBUG: Error detection model loaded successfully")
        else:
            logger.error("LUNGE_DEBUG: Error detection model file not found")
            self.error_model = None
        
        # Load input scaler
        logger.warning("LUNGE_DEBUG: Loading input scaler file")
        if os.path.exists(self.INPUT_SCALER_PATH):
            self.input_scaler = joblib.load(self.INPUT_SCALER_PATH)
            logger.warning("LUNGE_DEBUG: Input scaler loaded successfully")
        else:
            logger.error("LUNGE_DEBUG: Input scaler file not found")
            self.input_scaler = None
        
        # Test the models with dummy data to ensure they work
        logger.warning("LUNGE_DEBUG: Testing models with sample data")
        self._test_models()
        
    except Exception as e:
        logger.error(f"LUNGE_DEBUG: Error loading models: {str(e)}")
        self.stage_model = None
        self.error_model = None
        self.input_scaler = None
```

### Stage Detection

The stage detection combines ML and geometric approaches:

```python
def detect_stage(self, landmarks):
    """Detect exercise stage using ML models with fallback to geometric method"""
    try:
        # Try ML approach if model is available
        if hasattr(self, 'stage_model') and self.stage_model is not None and self.input_scaler is not None:
            # Preprocess landmarks for model input
            features = self._preprocess_landmarks(landmarks)
            
            # Scale features using the input scaler
            scaled_features = self.input_scaler.transform([features])
            
            # Get prediction and probability
            prediction = self.stage_model.predict(scaled_features)
            probabilities = self.stage_model.predict_proba(scaled_features)
            
            # Only use prediction if confidence is high enough
            max_prob = np.max(probabilities)
            if max_prob >= self.PREDICTION_PROB_THRESHOLD:
                return prediction[0]
            else:
                logger.warning(f"LUNGE_DEBUG: Low confidence in stage prediction ({max_prob}), falling back to geometric method")
        else:
            logger.warning("LUNGE_DEBUG: Stage model unavailable, using geometric method")
        
        # Fallback to geometric method
        return self._detect_stage_geometric(landmarks)
    except Exception as e:
        logger.error(f"LUNGE_DEBUG: Error in ML stage detection: {str(e)}")
        # Fallback to geometric method on error
        return self._detect_stage_geometric(landmarks)
```

### Error Detection

Lunge-specific error detection focuses on knee angle and knee-over-toe errors:

```python
def detect_knee_errors(self, landmarks):
    """Detect knee-related errors using ML or geometric approach"""
    errors = []
    error_flags = {
        "kneeAngleError": False,
        "kneeOverToeError": False,
        "leftKneeError": False,
        "rightKneeError": False
    }
    
    try:
        # Calculate knee angles
        left_knee_angle = self._calculate_knee_angle(landmarks, "left")
        right_knee_angle = self._calculate_knee_angle(landmarks, "right")
        
        # Record knee angles in metrics
        metrics = {
            "leftKneeAngle": left_knee_angle,
            "rightKneeAngle": right_knee_angle
        }
        
        # Use ML for error detection if available
        if hasattr(self, 'error_model') and self.error_model is not None and self.input_scaler is not None:
            # Similar to stage detection, process with ML model
            # ...
        
        # Geometric method for knee angle errors
        if left_knee_angle < 90 or left_knee_angle > 130:
            errors.append({
                "type": "knee_angle_error",
                "message": "Keep front knee at 90° angle when lunging",
                "severity": "medium"
            })
            error_flags["kneeAngleError"] = True
            error_flags["leftKneeError"] = True
        
        # Check knee-over-toe error
        knee_toe_error = self._check_knee_over_toe(landmarks)
        if knee_toe_error:
            errors.append({
                "type": "knee_over_toe_error",
                "message": "Don't let your knee extend over your toes",
                "severity": "high"
            })
            error_flags["kneeOverToeError"] = True
        
        return errors, error_flags, metrics
    except Exception as e:
        logger.error(f"LUNGE_DEBUG: Error in knee error detection: {str(e)}")
        return errors, error_flags, {}
```

### Analyze Pose Entry Point

The main analysis entry point which ties everything together:

```python
def analyze_pose(self, landmarks):
    """Analyze the lunge pose and return results"""
    analysis = LungePoseAnalysis()
    
    try:
        # Validate landmarks
        if not landmarks or len(landmarks) < 33:
            return {
                "success": False,
                "error": {
                    "message": "Invalid landmark data: insufficient landmarks"
                }
            }
        
        # Detect current stage
        current_stage = self.detect_stage(landmarks)
        
        # Count reps when transitioning from down to up
        if (self.current_stage == "down" and current_stage == "up"):
            self.counter += 1
            logger.info(f"Lunge rep counted: {self.counter}")
        
        # Update stage tracking
        self.previous_stage = self.current_stage
        self.current_stage = current_stage
        
        # Detect errors
        errors, error_flags, metrics = self.detect_knee_errors(landmarks)
        
        # Calculate form score based on errors
        form_score = 100
        for error in errors:
            if error["severity"] == "high":
                form_score -= 15
            elif error["severity"] == "medium":
                form_score -= 10
            else:
                form_score -= 5
        
        # Ensure score is between 0 and 100
        form_score = max(0, min(100, form_score))
        
        # Update analysis object
        analysis.stage = current_stage
        analysis.metrics = metrics
        analysis.errors = errors
        analysis.error_flags = error_flags
        analysis.form_score = form_score
        analysis.rep_count = self.counter
        
        return {
            "success": True,
            "result": analysis.to_dict()
        }
    except Exception as e:
        logger.error(f"Error analyzing lunge pose: {str(e)}")
        return {
            "success": False,
            "error": {
                "message": f"Failed to analyze lunge pose: {str(e)}"
            }
        }
```

### Front-end Integration

The lunge analyzer is integrated with the `SessionTracker` component in `frontend/src/components/workout/SessionTracker.tsx`:

```typescript
// Lunge analyzer reference
const lungeAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);

// Reset all exercise analyzers
const resetExerciseAnalyzers = useCallback(() => {
  // Reset lunge counter when necessary
  if (lungeAnalyzerRef.current?.resetCounter) {
    lungeAnalyzerRef.current.resetCounter();
    logger.info('Reset lunge counter');
  }
  // Reset other analyzers as well
}, []);

// Render the appropriate analyzer based on exercise type
const renderExerciseAnalyzer = () => {
  const exerciseName = currentExercise?.exercise?.name || '';
  
  // Check if current exercise is a lunge variation
  if (isLungeExercise(exerciseName)) {
    return (
      <LungeAnalyzer
        ref={lungeAnalyzerRef}
        onAnalysisComplete={handleAnalysisComplete}
        onError={handleAnalysisError}
        isAnalyzing={isAnalyzing}
      />
    );
  }
  
  // Other exercise analyzer checks...
};
```

### Key Implementation Challenges and Solutions

1. **Model Loading Robustness**: 
   - Challenge: Ensuring ML models load correctly in different environments
   - Solution: Added verification of file existence and model test with sample data

2. **Error Recovery**:
   - Challenge: Handling failures in ML pipeline
   - Solution: Implemented fallback geometric methods for stage and error detection

3. **Counter Reset Logic**:
   - Challenge: Ensuring rep counters reset properly between sets
   - Solution: Implemented ref-based resetCounter function exposed to SessionTracker

4. **Input Landmark Normalization**:
   - Challenge: Preparing landmarks for ML model input
   - Solution: Created standardized preprocessing with scaling and normalization

5. **Performance Optimization**:
   - Challenge: Reducing computation on each frame
   - Solution: Implemented frame skipping and caching of processed landmarks

This lunge analyzer implementation demonstrates a complete integration of ML-based exercise analysis that handles all aspects of the exercise guide including robust error handling, fallback mechanisms, and seamless frontend integration.

## Troubleshooting

### Type Issues

If you encounter TypeScript errors:

1. Make sure all interfaces are correctly defined
2. Verify that optional properties have the `?` suffix
3. Check that imported types match their definitions

### Network Issues

If API calls fail:

1. Verify the backend server is running
2. Check that the API routes are correctly registered
3. Verify API endpoint URLs in the frontend code
4. Check for CORS issues if frontend/backend are on different ports

### Python Script Issues

If Python analysis fails:

1. Run the Python script directly to test:
   ```bash
   # Example for squat testing
   cat test-data/squat-pose.json | python core/squat_analyzer.py
   
   # For your new exercise
   echo '{"landmarks":[...]}' | python core/[exercise]_analyzer.py
   ```
2. Check Python logs for errors
3. Verify all required packages are installed
4. Test with simplistic landmark data first

## Additional Files

### Context Providers
- **PoseDetectionContext**: `frontend/src/contexts/PoseDetectionContext.tsx`
  - Provides MediaPipe pose detection functionality to components
- **AnalysisStateContext**: `frontend/src/contexts/AnalysisStateContext.tsx`
  - Manages analysis state across components

### Utility Files
- **Logger**: `frontend/src/utils/logger.ts`
  - Logging utility for client-side logging
- **PoseUtils**: `frontend/src/utils/poseUtils.ts`
  - Utility functions for pose processing
- **Server Logger**: `backend/src/utils/logger.ts`
  - Logging utility for server-side logging

### Type Definitions
- **Exercise Types**: `frontend/src/types/ai/exercise.ts`
  - Core exercise type definitions
- **MediaPipe Types**: `frontend/src/types/ai/mediapipe.ts`
  - Type definitions for MediaPipe pose detection
- **Backend Types**: `backend/src/types/exercise.ts`
  - Backend type definitions for exercises

### Common Components
- **BaseExerciseAnalyzer**: `frontend/src/components/ai/exercises/BaseExerciseAnalyzer.tsx`
  - Base component for all exercise analyzers
- **PoseDetector**: `frontend/src/components/ai/PoseDetector.tsx`
  - Component for pose detection

---

Following this guide will help you implement new exercises consistently within the existing architecture. Each exercise follows the same pattern but can implement custom metrics and feedback relevant to the specific exercise type.
