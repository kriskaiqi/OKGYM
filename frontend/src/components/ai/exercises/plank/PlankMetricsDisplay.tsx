import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Alert } from '@mui/material';
import { PlankMetrics } from '../../../../types/plank';
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

interface PlankMetricsDisplayProps {
  metrics?: PlankMetrics;
  errors?: Array<{type: string; message: string; severity: string}>;
  durationInSeconds?: number;
}

export const PlankMetricsDisplay: React.FC<PlankMetricsDisplayProps> = ({ 
  metrics = {}, 
  errors = [], 
  durationInSeconds = 0 
}) => {
  // Check for specific errors
  const hasHighBackError = errors.some(error => error.type === 'high_back');
  const hasLowBackError = errors.some(error => error.type === 'low_back');
  
  // Format duration
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Get form score
  const formScore = metrics.formScore || 100;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plank Metrics
      </Typography>
      
      {/* Duration Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Duration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Hold Time
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {/* First try to get holdTime from metrics, then fall back to the durationInSeconds prop */}
                {(() => {
                  // Get holdTime from metrics or fall back to durationInSeconds
                  const seconds = metrics.holdTime || metrics.durationInSeconds || durationInSeconds || 0;
                  // Format to MM:SS
                  const minutes = Math.floor(seconds / 60);
                  const remainingSeconds = Math.floor(seconds % 60);
                  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
                })()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Status Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Plank Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Correct Form" 
              value={!hasHighBackError && !hasLowBackError}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="High Back" 
              value={hasHighBackError}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <MetricItem 
              label="Low Back" 
              value={hasLowBackError}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Form Score */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Form Score
        </Typography>
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Overall Score
          </Typography>
          <Typography 
            variant="h5" 
            color={formScore > 80 ? 'success.main' : formScore > 60 ? 'warning.main' : 'error.main'} 
            fontWeight="bold"
          >
            {formScore}/100
          </Typography>
        </Box>
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
        <Grid item xs={6} md={4}>
          <MetricItem 
            label="Back Alignment" 
            value={100 - ((hasHighBackError ? 50 : 0) + (hasLowBackError ? 50 : 0))}
            unit="%"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricItem 
            label="Form Score" 
            value={formScore}
            unit="%"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}; 