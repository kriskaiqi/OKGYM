import React from 'react';
import { 
  Skeleton as MuiSkeleton, 
  SkeletonProps as MuiSkeletonProps,
  styled,
  Card,
  CardContent,
  CardHeader,
  Box,
  Grid,
  Stack
} from '@mui/material';

// Enhanced skeleton with subtle animation
const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&::after': {
    background: `linear-gradient(90deg, 
      transparent, 
      ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)'}, 
      transparent)`,
  }
}));

// Basic skeleton component
export const Skeleton: React.FC<MuiSkeletonProps> = (props) => {
  return <StyledSkeleton {...props} />;
};

// Card skeleton
export interface CardSkeletonProps {
  hasHeader?: boolean;
  hasMedia?: boolean;
  mediaHeight?: number;
  hasAction?: boolean;
  contentHeight?: number;
  width?: string | number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  hasHeader = true,
  hasMedia = false,
  mediaHeight = 200,
  hasAction = false,
  contentHeight = 100,
  width = '100%',
}) => {
  return (
    <Card sx={{ width, maxWidth: '100%' }}>
      {hasHeader && (
        <CardHeader
          avatar={<StyledSkeleton variant="circular" width={40} height={40} />}
          title={<StyledSkeleton width="80%" height={24} />}
          subheader={<StyledSkeleton width="40%" height={20} />}
        />
      )}
      
      {hasMedia && (
        <StyledSkeleton 
          variant="rectangular" 
          width="100%" 
          height={mediaHeight} 
          sx={{ transform: 'scale(1, 1)' }} 
        />
      )}
      
      <CardContent>
        <StyledSkeleton width="90%" height={20} sx={{ mb: 1 }} />
        <StyledSkeleton width="95%" height={20} sx={{ mb: 1 }} />
        <StyledSkeleton width="60%" height={20} />
        
        {contentHeight > 100 && (
          <Box sx={{ mt: 2 }}>
            <StyledSkeleton width="100%" height={contentHeight - 100} />
          </Box>
        )}
      </CardContent>
      
      {hasAction && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <StyledSkeleton width={90} height={36} sx={{ borderRadius: 5 }} />
        </Box>
      )}
    </Card>
  );
};

// Table skeleton
export interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  hasHeader?: boolean;
  width?: string | number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rowCount = 5,
  columnCount = 4,
  hasHeader = true,
  width = '100%',
}) => {
  return (
    <Box sx={{ width, overflow: 'hidden' }}>
      {hasHeader && (
        <Stack direction="row" spacing={2} sx={{ mb: 1, px: 2, py: 1.5 }}>
          {Array.from(new Array(columnCount)).map((_, index) => (
            <StyledSkeleton 
              key={`header-${index}`} 
              width={`${100 / columnCount}%`} 
              height={32} 
            />
          ))}
        </Stack>
      )}
      
      {Array.from(new Array(rowCount)).map((_, rowIndex) => (
        <Stack 
          key={`row-${rowIndex}`} 
          direction="row" 
          spacing={2} 
          sx={{ 
            px: 2, 
            py: 1.5, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            }
          }}
        >
          {Array.from(new Array(columnCount)).map((_, colIndex) => (
            <StyledSkeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              width={`${100 / columnCount}%`} 
              height={24} 
            />
          ))}
        </Stack>
      ))}
    </Box>
  );
};

// List skeleton
export interface ListSkeletonProps {
  itemCount?: number;
  withAvatar?: boolean;
  avatarSize?: number;
  itemHeight?: number;
  width?: string | number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  itemCount = 5,
  withAvatar = true,
  avatarSize = 40,
  itemHeight = 60,
  width = '100%',
}) => {
  return (
    <Box sx={{ width }}>
      {Array.from(new Array(itemCount)).map((_, index) => (
        <Box 
          key={`list-item-${index}`} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            py: 1,
            height: itemHeight,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            }
          }}
        >
          {withAvatar && (
            <StyledSkeleton 
              variant="circular" 
              width={avatarSize} 
              height={avatarSize} 
              sx={{ mr: 2, flexShrink: 0 }}
            />
          )}
          <Box sx={{ width: '100%' }}>
            <StyledSkeleton width="60%" height={20} sx={{ mb: 0.5 }} />
            <StyledSkeleton width="40%" height={16} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Skeleton; 