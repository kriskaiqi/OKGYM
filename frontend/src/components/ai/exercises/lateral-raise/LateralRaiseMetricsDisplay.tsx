import React from 'react';
import { Box, Typography, Divider, Chip, Paper, Grid, Alert } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ErrorIcon from '@mui/icons-material/Error';
import { LateralRaiseMetrics } from '../../../../types/lateral_raise';
import { ExerciseError } from '../../../../types/ai/exercise';

interface MetricItemProps {
  label: string;
  value: boolean | number | string | undefined;
  valueColor?: string;
  unit?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, valueColor = 'inherit', unit }) => {
  if (value === undefined) return null;

  // Format boolean values as "Yes"/"No"
  const displayValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  // Handle boolean values with Chip component
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

  // Handle numeric or string values
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium" color={valueColor}>
        {typeof displayValue === 'number' && !isNaN(displayValue) 
          ? (unit ? `${Math.round(displayValue)}${unit}` : displayValue)
          : displayValue}
      </Typography>
    </Box>
  );
};

interface LateralRaiseMetricsDisplayProps {
  metrics?: LateralRaiseMetrics;
  errors?: Array<{type: string; message: string; severity: string}>;
}

export const LateralRaiseMetricsDisplay: React.FC<LateralRaiseMetricsDisplayProps> = ({ metrics = {}, errors = [] }) => {
  // Check for common errors
  const hasUnevenArmsError = errors.some(error => error.type === 'uneven_arms');
  const hasExcessiveRaiseError = errors.some(error => error.type === 'excessive_raise');
  const hasInsufficientRaiseError = errors.some(error => error.type === 'insufficient_raise');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lateral Raise Metrics
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
              value={!hasUnevenArmsError}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Proper Range of Motion" 
              value={!hasInsufficientRaiseError && !hasExcessiveRaiseError}
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
              value={metrics.leftArmAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Right Arm Angle" 
              value={metrics.rightArmAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Arm Difference" 
              value={metrics.armAngleDelta}
              unit="°"
              valueColor={metrics.armAngleDelta && metrics.armAngleDelta < 20 ? 'success.main' : 'error.main'}
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