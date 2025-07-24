import React from 'react';
import { styled } from '@mui/system';
import { useThemeContext } from '../../contexts/ThemeContext';

// Types
type ProgressVariant = 'linear' | 'circular';
type ProgressSize = 'small' | 'medium' | 'large';
type ProgressColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | string;

type ProgressProps = {
  value: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  color?: ProgressColor;
  thickness?: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'right' | 'bottom';
  className?: string;
  max?: number;
  animate?: boolean;
  label?: string;
  formatLabel?: (value: number, max: number) => string;
};

// Styled Components
const ProgressContainer = styled('div')<{ 
  variant: ProgressVariant; 
  labelPosition: string;
}>(({ variant, labelPosition }) => ({
  display: 'flex',
  alignItems: labelPosition === 'bottom' ? 'center' : 'center',
  flexDirection: labelPosition === 'bottom' ? 'column' : 'row',
  gap: '12px',
  width: variant === 'linear' ? '100%' : 'auto',
}));

const LinearProgressContainer = styled('div')({
  width: '100%',
  height: '8px',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
});

const LinearProgressBar = styled('div')<{ 
  value: number; 
  max: number; 
  color: string; 
  animate: boolean;
  isDark: boolean;
}>(({ value, max, color, animate, isDark, theme }) => {
  const getColorValue = () => {
    // Handle color names
    switch (color) {
      case 'primary': return isDark ? theme.palette.primary.main : theme.palette.primary.main;
      case 'secondary': return isDark ? theme.palette.secondary.main : theme.palette.secondary.main;
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return color; // Custom color
    }
  };

  return {
    height: '100%',
    width: `${Math.min(100, (value / max) * 100)}%`,
    backgroundColor: getColorValue(),
    borderRadius: '4px',
    transition: animate ? 'width 0.4s ease-in-out' : 'none',
  };
});

const CircularProgressContainer = styled('div')<{ size: ProgressSize }>(({ size }) => {
  const sizes = {
    small: '32px',
    medium: '48px',
    large: '64px',
  };

  return {
    position: 'relative',
    width: sizes[size],
    height: sizes[size],
  };
});

const CircularProgressSVG = styled('svg')({
  transform: 'rotate(-90deg)',
});

const CircularProgressBackground = styled('circle')({
  fill: 'none',
  stroke: 'rgba(0, 0, 0, 0.1)',
});

const CircularProgressIndicator = styled('circle')<{ 
  color: string; 
  animate: boolean;
  isDark: boolean;
}>(({ color, animate, isDark, theme }) => {
  const getColorValue = () => {
    // Handle color names
    switch (color) {
      case 'primary': return isDark ? theme.palette.primary.main : theme.palette.primary.main;
      case 'secondary': return isDark ? theme.palette.secondary.main : theme.palette.secondary.main;
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return color; // Custom color
    }
  };

  return {
    fill: 'none',
    stroke: getColorValue(),
    strokeLinecap: 'round',
    transition: animate ? 'stroke-dashoffset 0.4s ease-in-out' : 'none',
  };
});

const ProgressLabel = styled('div')<{ 
  variant: ProgressVariant; 
  position: string;
  size: ProgressSize;
}>(({ theme, variant, position, size }) => {
  const fontSize = size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem';

  return {
    fontSize,
    fontWeight: 500,
    color: theme.palette.text.primary,
    position: variant === 'circular' && position === 'inside' ? 'absolute' : 'relative',
    top: variant === 'circular' && position === 'inside' ? '50%' : 'auto',
    left: variant === 'circular' && position === 'inside' ? '50%' : 'auto',
    transform: variant === 'circular' && position === 'inside' ? 'translate(-50%, -50%)' : 'none',
    textAlign: variant === 'circular' && position === 'inside' ? 'center' : 'left',
  };
});

// Components
export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'linear',
  size = 'medium',
  color = 'primary',
  thickness = 4,
  showLabel = false,
  labelPosition = 'right',
  className,
  max = 100,
  animate = true,
  label,
  formatLabel,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';
  const normalizedValue = Math.max(0, Math.min(value, max));

  const getProgressLabel = () => {
    if (label) return label;
    
    if (formatLabel) {
      return formatLabel(normalizedValue, max);
    }
    
    return `${Math.round((normalizedValue / max) * 100)}%`;
  };

  const renderLinearProgress = () => (
    <LinearProgressContainer>
      <LinearProgressBar 
        value={normalizedValue} 
        max={max} 
        color={color} 
        animate={animate}
        isDark={isDark}
      />
    </LinearProgressContainer>
  );

  const renderCircularProgress = () => {
    const sizes = {
      small: { size: 32, thickness: Math.max(1, thickness - 1) },
      medium: { size: 48, thickness },
      large: { size: 64, thickness: Math.min(8, thickness + 1) },
    };
    
    const { size: sizeValue, thickness: thicknessValue } = sizes[size];
    const radius = (sizeValue / 2) - (thicknessValue / 2);
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (normalizedValue / max) * circumference;
    
    return (
      <CircularProgressContainer size={size}>
        <CircularProgressSVG width="100%" height="100%" viewBox={`0 0 ${sizeValue} ${sizeValue}`}>
          <CircularProgressBackground
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            r={radius}
            strokeWidth={thicknessValue}
          />
          <CircularProgressIndicator
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            r={radius}
            strokeWidth={thicknessValue}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            color={color}
            animate={animate}
            isDark={isDark}
          />
        </CircularProgressSVG>
        {showLabel && labelPosition === 'inside' && (
          <ProgressLabel variant={variant} position={labelPosition} size={size}>
            {getProgressLabel()}
          </ProgressLabel>
        )}
      </CircularProgressContainer>
    );
  };

  return (
    <ProgressContainer 
      variant={variant} 
      labelPosition={labelPosition}
      className={className}
    >
      {variant === 'linear' ? renderLinearProgress() : renderCircularProgress()}
      
      {showLabel && labelPosition !== 'inside' && (
        <ProgressLabel variant={variant} position={labelPosition} size={size}>
          {getProgressLabel()}
        </ProgressLabel>
      )}
    </ProgressContainer>
  );
}; 