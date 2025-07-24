import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { PushupMetrics } from '../../../../types/pushup';
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

interface PushupMetricsDisplayProps {
  metrics?: PushupMetrics;
  errors?: ExerciseError[];
  isVisible?: boolean;
}

export const PushupMetricsDisplay: React.FC<PushupMetricsDisplayProps> = ({ 
  metrics = {}, 
  errors = [],
  isVisible
}) => {
  // Check for common errors
  const hasUnevenArms = errors.some(error => error.type === 'uneven_arms');
  const hasIncompletePushup = errors.some(error => error.type === 'incomplete_pushup');
  const hasBackAlignment = errors.some(error => error.type === 'back_alignment');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  // Get angles
  const leftArmAngle = metrics.leftArmAngle;
  const rightArmAngle = metrics.rightArmAngle;
  const armAngleDelta = metrics.armAngleDelta;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Push-up Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Even Arms" 
              value={!hasUnevenArms}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Full Range of Motion" 
              value={!hasIncompletePushup}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Straight Back" 
              value={!hasBackAlignment}
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
              label="Left Arm Angle" 
              value={leftArmAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Right Arm Angle" 
              value={rightArmAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Arm Angle Difference" 
              value={armAngleDelta}
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