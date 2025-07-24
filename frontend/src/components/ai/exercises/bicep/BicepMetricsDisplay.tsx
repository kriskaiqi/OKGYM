import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { BicepMetrics } from '../../../../types/bicep';

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

interface BicepMetricsDisplayProps {
  metrics?: BicepMetrics;
  errors?: Array<{type: string; message: string; severity: string}>;
}

const BicepMetricsDisplay: React.FC<BicepMetricsDisplayProps> = ({ metrics = {}, errors = [] }) => {
  // Check if we have any lean back errors
  const hasLeanBackError = errors.some(error => error.type === 'lean_back');
  
  // Check if we have any loose upper arm errors
  const hasLooseArmError = errors.some(error => error.type === 'loose_upper_arm');
  
  // Check if we have any peak contraction errors
  const hasPeakContractionError = errors.some(error => error.type === 'peak_contraction');
  
  // Get rep counts
  const leftReps = metrics.reps?.left || 0;
  const rightReps = metrics.reps?.right || 0;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Bicep Curl Metrics
      </Typography>
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercise Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Left Arm Visible" 
              value={metrics.leftArmVisible}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Right Arm Visible" 
              value={metrics.rightArmVisible}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Leaning Back Detected
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasLeanBackError ? 'Yes' : 'No'} 
                  color={hasLeanBackError ? 'error' : 'success'} 
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
          Repetition Counts
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Left Arm Reps
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {leftReps}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Right Arm Reps
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {rightReps}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Form Errors */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Form Check
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Loose Upper Arm
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasLooseArmError ? 'Error' : 'Good'} 
                  color={hasLooseArmError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Peak Contraction
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasPeakContractionError ? 'Error' : 'Good'} 
                  color={hasPeakContractionError ? 'error' : 'success'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Leaning Back
              </Typography>
              <Box mt={0.5}>
                <Chip 
                  size="small" 
                  label={hasLeanBackError ? 'Error' : 'Good'} 
                  color={hasLeanBackError ? 'error' : 'success'} 
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
      
      {/* Original Angle Metrics (Kept for reference but less prominent) */}
      <Typography variant="subtitle2" gutterBottom>
        Detailed Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Left Curl Angle" 
            value={metrics.leftCurlAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Right Curl Angle" 
            value={metrics.rightCurlAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Left Upper Arm Angle" 
            value={metrics.leftUpperArmAngle} 
            unit="°"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricItem 
            label="Right Upper Arm Angle" 
            value={metrics.rightUpperArmAngle} 
            unit="°"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BicepMetricsDisplay; 