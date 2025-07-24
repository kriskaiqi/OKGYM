import React from 'react';
import { Card, Skeleton, Box } from '@mui/material';

interface CardSkeletonProps {
  height?: number | string;
  width?: number | string;
  variant?: 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | false;
}

/**
 * CardSkeleton component for displaying loading states
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  height = 300,
  width = '100%',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  return (
    <Card sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Skeleton 
        variant={variant} 
        height={height} 
        width={width} 
        animation={animation}
      />
      <Box sx={{ pt: 2 }}>
        <Skeleton variant="text" width="80%" height={30} animation={animation} />
        <Skeleton variant="text" width="60%" height={20} animation={animation} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="rectangular" width="30%" height={30} animation={animation} />
          <Skeleton variant="rectangular" width="30%" height={30} animation={animation} />
        </Box>
      </Box>
    </Card>
  );
}; 