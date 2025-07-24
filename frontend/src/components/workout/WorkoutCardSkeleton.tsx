import React from 'react';
import { styled } from '@mui/material/styles';
import { Skeleton, Box } from '@mui/material';
import { shimmer } from '../../styles/animations';

const SkeletonCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(
      90deg,
      transparent,
      ${theme.palette.action.hover},
      transparent
    )`,
    animation: `${shimmer} 1.5s infinite`,
  },
}));

const GradientBar = styled(Box)(({ theme }) => ({
  height: '4px',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

export const WorkoutCardSkeleton: React.FC = () => {
  return (
    <SkeletonCard>
      <GradientBar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={200} height={24} />
          <Skeleton variant="text" width={80} height={24} />
        </Box>

        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} variant="rounded" width={80} height={24} />
          ))}
        </Box>
      </Box>
    </SkeletonCard>
  );
}; 