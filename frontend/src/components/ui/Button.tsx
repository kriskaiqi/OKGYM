import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  styled,
  alpha
} from '@mui/material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { 
  pulse, fadeIn, ripple, glow, pop 
} from '../../styles/animations';

// Extend the MUI Button props
export interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
  animationDelay?: number;
}

// Style extensions for the base button
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'animationDelay'
})<{ animationDelay?: number }>(({ theme, animationDelay = 0 }) => ({
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.4s ease-out ${animationDelay}s`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: alpha(theme.palette.common.white, 0.1),
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 0,
    pointerEvents: 'none',
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    animation: `${pulse} 0.3s ease-in-out`,
    '&::before': {
      opacity: 1,
    },
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: theme.shadows[2],
    animation: `${ripple} 0.5s ease-out`,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '5px',
    height: '5px',
    background: 'rgba(255, 255, 255, 0.5)',
    opacity: '0',
    borderRadius: '100%',
    transform: 'scale(1, 1) translate(-50%)',
    transformOrigin: '50% 50%',
  },
  
  '&:active::after': {
    animation: `${ripple} 1s ease-out`,
  },
  
  // Size variants
  '&.MuiButton-sizeLarge': {
    fontSize: '1rem',
    padding: theme.spacing(1.5, 3),
  },
  
  '&.MuiButton-sizeSmall': {
    fontSize: '0.75rem',
  },
  
  // Variant specific styles
  '&.MuiButton-contained': {
    boxShadow: theme.shadows[2],
    '&.MuiButton-containedPrimary': {
      '&:hover': {
        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
      },
    },
    '&.MuiButton-containedSecondary': {
      '&:hover': {
        boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
      },
    },
  },
  
  '&.MuiButton-outlined': {
    borderWidth: '1.5px',
    '&:hover': {
      borderWidth: '1.5px',
      animation: `${glow} 1.5s ease-in-out infinite`,
    },
  },
  
  '&.MuiButton-text': {
    '&:hover': {
      boxShadow: 'none',
      transform: 'translateX(4px)',
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
}));

// Style extensions for the loading button
const StyledLoadingButton = styled(LoadingButton, {
  shouldForwardProp: (prop) => prop !== 'animationDelay'
})<{ animationDelay?: number }>(({ theme, animationDelay = 0 }) => ({
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.4s ease-out ${animationDelay}s`,
  
  '&:not(.MuiLoadingButton-loading):hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    animation: `${pulse} 0.3s ease-in-out`,
  },
  
  '&.MuiLoadingButton-loading': {
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: theme.shadows[2],
  },
  
  // Size variants
  '&.MuiLoadingButton-sizeLarge': {
    fontSize: '1rem',
    padding: theme.spacing(1.5, 3),
  },
  
  '&.MuiLoadingButton-sizeSmall': {
    fontSize: '0.75rem',
  },
  
  // Variant specific styles
  '&.MuiLoadingButton-contained': {
    boxShadow: theme.shadows[2],
    '&.MuiLoadingButton-containedPrimary': {
      '&:hover': {
        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
      },
    },
    '&.MuiLoadingButton-containedSecondary': {
      '&:hover': {
        boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
      },
    },
  },
  
  '&.MuiLoadingButton-outlined': {
    borderWidth: '1.5px',
    '&:hover': {
      borderWidth: '1.5px',
    },
  },
  
  '&.MuiLoadingButton-text': {
    '&:hover': {
      boxShadow: 'none',
      transform: 'translateX(4px)',
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
}));

/**
 * Enhanced Button component that extends Material-UI Button with consistent styling
 * and loading state support.
 */
export const Button: React.FC<ButtonProps> = ({ 
  isLoading = false,
  children, 
  animationDelay = 0,
  ...props 
}) => {
  // Create a new object without animationDelay
  const { animationDelay: _, ...buttonProps } = props as any;

  if (isLoading) {
    // Pass props directly to LoadingButton but with loading=true
    return <StyledLoadingButton {...buttonProps} loading={true} animationDelay={animationDelay}>{children}</StyledLoadingButton>;
  }
  
  // Use regular button when not loading
  return <StyledButton {...buttonProps} animationDelay={animationDelay}>{children}</StyledButton>;
};

export default Button; 