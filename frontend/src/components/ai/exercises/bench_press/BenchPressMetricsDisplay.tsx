import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { BenchPressMetrics } from '../../../../types/bench_press';
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

interface BenchPressMetricsDisplayProps {
  metrics?: BenchPressMetrics;
  errors?: ExerciseError[];
  isVisible?: boolean;
}

export const BenchPressMetricsDisplay: React.FC<BenchPressMetricsDisplayProps> = ({ 
  metrics = {}, 
  errors = [],
  isVisible
}) => {
  // Check for common errors
  const hasUnevenPressing = errors.some(error => error.type === 'uneven_pressing');
  const hasIncompleteForm = errors.some(error => error.type === 'incorrect_form');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  // Get angles
  const leftShoulderAngle = metrics.leftShoulderAngle;
  const rightShoulderAngle = metrics.rightShoulderAngle;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Bench Press Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Even Pressing" 
              value={!hasUnevenPressing}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Complete Range of Motion" 
              value={!hasIncompleteForm}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Joints Visible" 
              value={isVisible}
            />
          </Grid>
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
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Left Shoulder Angle" 
              value={leftShoulderAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Right Shoulder Angle" 
              value={rightShoulderAngle}
              unit="°"
            />
          </Grid>
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
    </Paper>
  );
}; 