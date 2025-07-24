import React from 'react';
import {
  Badge as MuiBadge,
  BadgeProps as MuiBadgeProps,
  styled,
  keyframes,
  alpha
} from '@mui/material';

export interface BadgeProps extends MuiBadgeProps {
  pulse?: boolean;
  outline?: boolean;
  subtle?: boolean;
}

// Pulse animation for badges
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--pulse-color), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
  }
`;

// Get RGB values for different badge colors to use with the pulse animation
const getRgbColor = (color: string): string => {
  switch (color) {
    case 'primary': return '63, 81, 181'; // Indigo
    case 'secondary': return '255, 87, 34'; // Deep Orange
    case 'error': return '244, 67, 54'; // Red
    case 'warning': return '255, 152, 0'; // Amber
    case 'info': return '0, 176, 255'; // Light Blue
    case 'success': return '67, 160, 71'; // Green
    default: return '97, 97, 97'; // Grey
  }
};

// Enhanced Badge with various style options
const StyledBadge = styled(MuiBadge)<BadgeProps>(({ theme, color = 'primary', pulse, outline, subtle }) => {
  const rgbColor = getRgbColor(color);
  
  return {
    '& .MuiBadge-badge': {
      fontWeight: 600,
      fontSize: '0.65rem',
      letterSpacing: 0.2,
      height: subtle ? 16 : 18,
      minWidth: subtle ? 16 : 18,
      padding: subtle ? '0 3px' : '0 4px',
      ...(pulse && {
        '&::after': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          animation: `${pulseAnimation} 1.5s infinite`,
          content: '""',
          '--pulse-color': rgbColor,
        },
      }),
      ...(outline && {
        backgroundColor: 'transparent',
        border: `1.5px solid ${
          color === 'default'
            ? theme.palette.grey[500]
            : theme.palette[color].main
        }`,
        color: 
          color === 'default'
            ? theme.palette.text.primary
            : theme.palette[color].main,
      }),
      ...(subtle && {
        backgroundColor: 
          color === 'default'
            ? alpha(theme.palette.grey[500], 0.15)
            : alpha(theme.palette[color].main, 0.15),
        color: 
          color === 'default'
            ? theme.palette.text.primary
            : theme.palette[color].main,
      }),
    },
  };
});

/**
 * Enhanced Badge component with improved styling and animation options
 */
export const Badge: React.FC<BadgeProps> = ({ 
  children,
  pulse = false,
  outline = false,
  subtle = false,
  color = 'primary',
  ...props 
}) => {
  return (
    <StyledBadge 
      pulse={pulse} 
      outline={outline} 
      subtle={subtle} 
      color={color}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

export default Badge; 