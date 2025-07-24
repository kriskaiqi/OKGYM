import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingStateProps {
  fullScreen?: boolean;
  message?: string;
  showSkeleton?: boolean;
  skeletonCount?: number;
  height?: string | number;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  fullScreen = false,
  message = 'Loading...',
  showSkeleton = false,
  skeletonCount = 3,
  height,
}) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  if (showSkeleton) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        {[...Array(skeletonCount)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={60}
            sx={{ mb: 2, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        gap: 2,
        height: height || 'auto',
        minHeight: height ? 'unset' : '200px',
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState; 