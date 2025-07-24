import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { SitupMetrics } from '../../../../types/situp';
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

interface SitupMetricsDisplayProps {
  metrics?: SitupMetrics;
  errors?: Array<{type: string; message: string; severity: string}>;
}

export const SitupMetricsDisplay: React.FC<SitupMetricsDisplayProps> = ({ metrics = {}, errors = [] }) => {
  // Check for common errors
  const hasIncompleteSitup = errors.some(error => error.type === 'incomplete_situp');
  const hasStraightLegs = errors.some(error => error.type === 'straight_legs');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sit-up Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Full Range of Motion" 
              value={!hasIncompleteSitup}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Proper Knee Bend" 
              value={!hasStraightLegs}
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
              label="Torso Angle" 
              value={metrics.torsoAngle}
              unit="°"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Knee Angle" 
              value={metrics.kneeAngle}
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