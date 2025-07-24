import React, { useState, useEffect } from 'react';
import SquatAnalyzer from '../../components/ai/exercises/squat/SquatAnalyzer';
import BicepAnalyzer from '../../components/ai/exercises/bicep/BicepAnalyzer';
import LungeAnalyzer from '../../components/ai/exercises/lunge/LungeAnalyzer';
import PlankAnalyzer from '../../components/ai/exercises/plank/PlankAnalyzer';
import SitupAnalyzer from '../../components/ai/exercises/situp/SitupAnalyzer';
import ShoulderPressAnalyzer from '../../components/ai/exercises/shoulder_press/ShoulderPressAnalyzer';
import BenchPressAnalyzer from '../../components/ai/exercises/bench_press/BenchPressAnalyzer';
import PushupAnalyzer from '../../components/ai/exercises/pushup/PushupAnalyzer';
import LateralRaiseAnalyzer from '../../components/ai/exercises/lateral-raise/LateralRaiseAnalyzer';
import { ExerciseAnalysisResult, ExerciseError } from '../../types/ai/exercise';
import { 
  Box, 
  Container, 
  Paper, 
  Select, 
  MenuItem, 
  Typography, 
  Alert, 
  CircularProgress,
  Grid,
  Chip,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  FitnessCenter as FitnessCenterIcon,
  AccessTime as TimeIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  MoreHoriz as MiddleIcon,
  Help as UnknownIcon
} from '@mui/icons-material';
import { logger } from '../../utils/logger';
import { PoseDetectionProvider } from '../../contexts/PoseDetectionContext';
import { AnalysisStateProvider } from '../../contexts/AnalysisStateContext';

const AITestingPage: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<string>('squat');
  const [testResults, setTestResults] = useState<ExerciseAnalysisResult | null>(null);
  const [error, setError] = useState<ExerciseError | null>(null);
  const bicepAnalyzerRef = React.useRef<{ resetCounter: () => void }>(null);
  const squatAnalyzerRef = React.useRef<{ resetCounter: () => void }>(null);
  const lungeAnalyzerRef = React.useRef<{ resetCounter: () => void }>(null);
  const plankAnalyzerRef = React.useRef<{ resetTimer: () => void }>(null);
  const situpAnalyzerRef = React.useRef<{ resetCounter: () => void }>(null);
  const shoulderPressAnalyzerRef = React.useRef<{ resetCounter: () => void }>(null);
  const benchPressAnalyzerRef = React.useRef<{ resetCounter: () => void } | null>(null);
  const pushupAnalyzerRef = React.useRef<{ resetCounter: () => void } | null>(null);
  const lateralRaiseAnalyzerRef = React.useRef<{ resetCounter: () => void } | null>(null);
  const [lastKnownStage, setLastKnownStage] = useState<string>('unknown');

  // Reset state when switching exercises
  const handleExerciseChange = (newExercise: string) => {
    // Reset the current exercise counter before switching
    if (selectedTest === 'squat' && squatAnalyzerRef.current) {
      squatAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'bicep' && bicepAnalyzerRef.current) {
      bicepAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'lunge' && lungeAnalyzerRef.current) {
      lungeAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'plank' && plankAnalyzerRef.current) {
      plankAnalyzerRef.current.resetTimer();
    } else if (selectedTest === 'situp' && situpAnalyzerRef.current) {
      situpAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'shoulder_press' && shoulderPressAnalyzerRef.current) {
      shoulderPressAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'bench_press' && benchPressAnalyzerRef.current) {
      benchPressAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'pushup' && pushupAnalyzerRef.current) {
      pushupAnalyzerRef.current.resetCounter();
    } else if (selectedTest === 'lateral_raise' && lateralRaiseAnalyzerRef.current) {
      lateralRaiseAnalyzerRef.current.resetCounter();
    }
    
    // Clear results and errors
    setTestResults(null);
    setError(null);
    
    // Set the new exercise
    setSelectedTest(newExercise);
    
    // Log the exercise change
    logger.info(`Switched exercise test from ${selectedTest} to ${newExercise}`);
  };

  // Update the last known stage when we get valid results
  useEffect(() => {
    if (testResults && testResults.stage && testResults.stage !== 'unknown') {
      setLastKnownStage(testResults.stage);
    }
  }, [testResults]);

  const handleAnalysisComplete = (result: ExerciseAnalysisResult) => {
    logger.info('Analysis complete:', result);
    setTestResults(result);
    setError(null);
  };

  const handleError = (error: ExerciseError | null) => {
    if (error) {
      // Skip connection messages - don't show these to the user
      if (error.type === 'connection') {
        return;
      }
      
      // Don't show visibility warnings which are too common
      if (error.type === 'INVALID_LANDMARK' || error.type === 'visibility') {
        logger.debug('Landmark visibility warning:', error);
        return;
      }
      
      // Only show critical analysis errors
      logger.error('Analysis error:', error);
      setError(error);
    } else {
      // Clear errors when null is passed
      setError(null);
    }
  };

  // Map error severity to MUI Alert severity
  const mapErrorSeverity = (error: ExerciseError): 'error' | 'warning' | 'info' | 'success' => {
    switch (error.severity) {
      case 'error':
        return 'error';
      case 'warning':
      case 'medium':
        return 'warning';
      case 'low':
      case 'info':
        return 'info';
      case 'high':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Get the stage icon
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'up':
        return <UpIcon />;
      case 'down':
        return <DownIcon />;
      case 'middle':
        return <MiddleIcon />;
      default:
        return <UnknownIcon />;
    }
  };

  // Get stage color
  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'up':
        return '#4caf50'; // green
      case 'down':
        return '#f44336'; // red
      case 'middle':
        return '#ff9800'; // orange
      case 'correct':
        return '#4caf50'; // green
      case 'high_back':
      case 'low_back':
        return '#f44336'; // red
      default:
        return '#9e9e9e'; // grey
    }
  };

  // Get stage display name
  const getStageDisplayName = (stage: string): string => {
    switch (stage) {
      case 'up':
        return selectedTest === 'squat' ? 'Standing' : 
               selectedTest === 'bicep' ? 'Contracted' : 
               selectedTest === 'shoulder_press' ? 'Arms Extended' :
               selectedTest === 'bench_press' ? 'Arms Up' : 'Up';
      case 'down':
        return selectedTest === 'squat' ? 'Squatting' : 
               selectedTest === 'bicep' ? 'Extended' : 
               selectedTest === 'shoulder_press' ? 'Arms Lowered' :
               selectedTest === 'bench_press' ? 'Arms Down' : 'Down';
      case 'middle':
        return 'Halfway';
      case 'init':
        return 'Initial Position';
      case 'mid':
        return 'Mid Position';
      case 'correct':
        return 'Correct Form';
      case 'high_back':
        return 'High Back';
      case 'low_back':
        return 'Low Back';
      default:
        return 'Unknown';
    }
  };

  // Format duration from seconds to mm:ss
  const formatDuration = (durationInSeconds: number) => {
    if (!durationInSeconds && durationInSeconds !== 0) return '00:00';
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Testing Dashboard
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Test
        </Typography>
        <Select
          value={selectedTest}
          onChange={(e) => handleExerciseChange(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="squat">Squat Analysis</MenuItem>
          <MenuItem value="bicep">Bicep Curl Analysis</MenuItem>
          <MenuItem value="lunge">Lunge Analysis</MenuItem>
          <MenuItem value="plank">Plank Analysis</MenuItem>
          <MenuItem value="situp">Situp Analysis</MenuItem>
          <MenuItem value="shoulder_press">Shoulder Press Analysis</MenuItem>
          <MenuItem value="bench_press">Bench Press Analysis</MenuItem>
          <MenuItem value="pushup">Pushup Analysis</MenuItem>
          <MenuItem value="lateral_raise">Lateral Raise Analysis</MenuItem>
          {/* Add more AI tests here */}
        </Select>

        {error && (
          <Alert 
            severity={mapErrorSeverity(error)}
            sx={{ mb: 2 }}
          >
            {error.message}
          </Alert>
        )}

        {testResults && (
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Stage */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Current Stage
                  </Typography>
                  <Chip
                    icon={getStageIcon(testResults.stage)}
                    label={getStageDisplayName(testResults.stage)}
                    sx={{ 
                      bgcolor: getStageColor(testResults.stage),
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      p: 2,
                      height: 'auto'
                    }}
                  />
                </Box>
              </Grid>
              
              {/* Rep Count or Duration */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    {selectedTest === 'plank' ? 'Duration' : 'Repetitions'}
                  </Typography>
                  <Chip
                    icon={selectedTest === 'plank' ? <TimeIcon /> : <FitnessCenterIcon />}
                    label={selectedTest === 'plank' ? 
                      formatDuration(testResults.metrics?.durationInSeconds || 0) : 
                      testResults.repCount}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      p: 2,
                      height: 'auto'
                    }}
                  />
                </Box>
              </Grid>
              
              {/* Form Score */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Form Score
                  </Typography>
                  <Chip
                    label={`${testResults.formScore}%`}
                    sx={{ 
                      bgcolor: 
                        testResults.formScore > 80 ? 'success.main' : 
                        testResults.formScore > 60 ? 'warning.main' : 'error.main',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      p: 2,
                      height: 'auto'
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {selectedTest === 'squat' ? 'Squat' : 
           selectedTest === 'bicep' ? 'Bicep Curl' : 
           selectedTest === 'lunge' ? 'Lunge' : 
           selectedTest === 'plank' ? 'Plank' :
           selectedTest === 'situp' ? 'Situp' :
           selectedTest === 'shoulder_press' ? 'Shoulder Press' :
           selectedTest === 'pushup' ? 'Pushup' :
           selectedTest === 'lateral_raise' ? 'Lateral Raise' : 'Exercise'} Analysis
        </Typography>
        
        <AnalysisStateProvider>
          <PoseDetectionProvider>
            {selectedTest === 'squat' && (
              <SquatAnalyzer 
                ref={squatAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'bicep' && (
              <BicepAnalyzer 
                ref={bicepAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'lunge' && (
              <LungeAnalyzer 
                ref={lungeAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'plank' && (
              <PlankAnalyzer 
                ref={plankAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'situp' && (
              <SitupAnalyzer 
                ref={situpAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'shoulder_press' && (
              <ShoulderPressAnalyzer 
                ref={shoulderPressAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'bench_press' && (
              <BenchPressAnalyzer 
                ref={benchPressAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'pushup' && (
              <PushupAnalyzer 
                ref={pushupAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
            {selectedTest === 'lateral_raise' && (
              <LateralRaiseAnalyzer 
                ref={lateralRaiseAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            )}
          </PoseDetectionProvider>
        </AnalysisStateProvider>
      </Paper>
    </Container>
  );
};

export default AITestingPage; 