import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { SquatMetrics } from '../../../../types/squat';
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

interface SquatMetricsDisplayProps {
  metrics?: SquatMetrics;
  errors?: Array<{type: string; message: string; severity: string}>;
}

export const SquatMetricsDisplay: React.FC<SquatMetricsDisplayProps> = ({ metrics = {}, errors = [] }) => {
  // Check if we have any foot placement errors
  const hasFootPlacementError = errors.some(error => error.type === 'foot_placement');
  
  // Check if we have any knee placement errors
  const hasKneePlacementError = errors.some(error => error.type === 'knee_placement');
  
  // Check if we have any visibility errors
  const hasVisibilityError = errors.some(error => error.type === 'visibility');
  
  // Get rep count
  const repCount = metrics.repCount || 0;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Squat Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Body Visible" 
              value={!hasVisibilityError}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Foot Placement
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasFootPlacementError ? 'Error' : 'Good'} 
                  color={hasFootPlacementError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Knee Alignment
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasKneePlacementError ? 'Error' : 'Good'} 
                  color={hasKneePlacementError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
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
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Foot Placement
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasFootPlacementError ? 'Error' : 'Good'} 
                  color={hasFootPlacementError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Knee Tracking
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasKneePlacementError ? 'Error' : 'Good'} 
                  color={hasKneePlacementError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Visibility
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasVisibilityError ? 'Error' : 'Good'} 
                  color={hasVisibilityError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
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
      
      <Divider sx={{ my: 2 }} />
      
      {/* Original Angle Metrics (Kept for reference) */}
      <Typography variant="subtitle2" gutterBottom>
        Detailed Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Hip Angle" 
            value={metrics.hipAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Knee Angle" 
            value={metrics.kneeAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Ankle Angle" 
            value={metrics.ankleAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Feet/Shoulder Ratio" 
            value={metrics.feetToShoulderRatio}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Knee/Feet Ratio" 
            value={metrics.kneeToFeetRatio}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Shoulder Width" 
            value={metrics.shoulderWidth}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Feet Width" 
            value={metrics.feetWidth}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Knee Width" 
            value={metrics.kneeWidth}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}; 