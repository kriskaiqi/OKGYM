import React from 'react';
import { styled, Box, alpha } from '@mui/material';
import { useThemeContext } from '../../contexts/ThemeContext';
import type { SxProps, Theme } from '@mui/material/styles';
import { 
  fadeIn, scaleIn, pulse, slideUp, 
  pop, ripple, gradientFlow, glow 
} from '../../styles/animations';

// Types
type CardVariant = 'default' | 'outlined' | 'elevated';
type CardRadius = 'small' | 'medium' | 'large' | 'rounded';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  radius?: CardRadius;
  hoverEffect?: boolean;
  onClick?: () => void;
  padding?: string | number;
  bgcolor?: string;
  elevation?: 0 | 1 | 2 | 3;
  animationDelay?: number;
};

type CardHeaderProps = {
  title: React.ReactNode;
  subheader?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  className?: string;
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  sx?: SxProps<Theme>;
};

type CardActionsProps = {
  children: React.ReactNode;
  className?: string;
  disableSpacing?: boolean;
};

type CardMediaProps = {
  image: string;
  height?: number | string;
  alt?: string;
  className?: string;
  borderRadius?: string;
};

// Styled Components
const CardContainer = styled('div')<{
  variant: CardVariant;
  radius: CardRadius;
  hoverEffect: boolean;
  clickable: boolean;
  customPadding?: string | number;
  customBgColor?: string;
  elevation: 0 | 1 | 2 | 3;
  isDark: boolean;
  animationDelay?: number;
}>(({ 
  theme, 
  variant, 
  radius, 
  hoverEffect, 
  clickable, 
  customPadding, 
  customBgColor,
  elevation,
  isDark,
  animationDelay = 0
}) => {
  const getRadius = () => {
    switch (radius) {
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      case 'rounded': return '24px';
      default: return '12px';
    }
  };

  const getElevation = () => {
    const darkShadows = [
      'none',
      '0 4px 10px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
      '0 8px 16px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
      '0 12px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.12)'
    ];
    
    const lightShadows = [
      'none',
      '0 4px 10px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
      '0 8px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.05)',
      '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)'
    ];
    
    return isDark ? darkShadows[elevation] : lightShadows[elevation];
  };

  return {
    backgroundColor: customBgColor || (isDark 
      ? theme.palette.background.paper
      : theme.palette.background.paper),
    border: variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'none',
    borderRadius: getRadius(),
    padding: customPadding !== undefined ? customPadding : '16px',
    boxShadow: variant === 'elevated' ? getElevation() : 'none',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    animation: `${fadeIn} 0.4s ease-out ${animationDelay}s, ${slideUp} 0.4s ease-out ${animationDelay}s`,
    '&:hover': {
      boxShadow: hoverEffect 
        ? isDark 
          ? '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)'
          : '0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.10)'
        : variant === 'elevated' ? getElevation() : 'none',
      transform: hoverEffect ? 'translateY(-5px)' : 'none',
      cursor: clickable ? 'pointer' : 'default',
      animation: hoverEffect ? `${pulse} 0.3s ease-in-out` : 'none',
    },
    '&::before': hoverEffect ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
      zIndex: 0,
    } : {},
    '&:hover::before': hoverEffect ? {
      opacity: 1,
      animation: `${gradientFlow} 3s ease infinite`,
    } : {},
    '&:active': {
      transform: clickable ? 'translateY(0px)' : 'none',
      animation: clickable ? `${ripple} 0.5s ease-out` : 'none',
    },
  };
});

const CardHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  paddingBottom: '8px',
  position: 'relative',
  animation: `${slideUp} 0.4s ease-out`,
}));

const HeaderContent = styled('div')({
  flex: '1 1 auto',
});

const HeaderTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.4,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateX(4px)',
    color: theme.palette.primary.main,
  },
}));

const HeaderSubheader = styled('div')(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: '2px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: alpha(theme.palette.primary.main, 0.8),
  },
}));

const HeaderAction = styled('div')({
  marginLeft: 'auto',
  '& > *': {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
});

const HeaderAvatar = styled('div')({
  marginRight: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.08)',
    animation: `${pulse} 0.3s ease-in-out`,
  },
});

const CardContentContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'noPadding'
})<{ noPadding?: boolean }>(({ theme, noPadding }) => ({
  padding: noPadding ? 0 : '16px',
  flex: '1 1 auto',
  position: 'relative',
  animation: `${slideUp} 0.4s ease-out`,
}));

const CardActionsContainer = styled('div')<{ disableSpacing: boolean }>(({ theme, disableSpacing }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  justifyContent: disableSpacing ? 'flex-start' : 'space-between',
  gap: disableSpacing ? '8px' : '0',
  transition: 'all 0.2s ease-in-out',
  animation: `${slideUp} 0.4s ease-out 0.2s`,
  '& > *': {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
}));

const CardMediaContainer = styled('div')<{ 
  height: number | string;
  imageSrc: string;
  borderRadius?: string;
}>(({ theme, height, imageSrc, borderRadius }) => ({
  height: typeof height === 'number' ? `${height}px` : height,
  backgroundImage: `url(${imageSrc})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: borderRadius || 'inherit',
  borderBottomLeftRadius: '0',
  borderBottomRightRadius: '0',
  transition: 'all 0.5s ease-in-out',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'scale(1.02)',
    backgroundPosition: 'center 45%',
  },
}));

// Components
export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  radius = 'medium',
  hoverEffect = false,
  onClick,
  padding,
  bgcolor,
  elevation = 1,
  animationDelay = 0,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  return (
    <CardContainer
      className={className}
      variant={variant}
      radius={radius}
      hoverEffect={hoverEffect}
      clickable={!!onClick}
      customPadding={padding}
      customBgColor={bgcolor}
      elevation={elevation}
      isDark={isDark}
      onClick={onClick}
      animationDelay={animationDelay}
    >
      {children}
    </CardContainer>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subheader,
  action,
  avatar,
  className,
}) => {
  return (
    <CardHeaderContainer className={className}>
      {avatar && <HeaderAvatar>{avatar}</HeaderAvatar>}
      <HeaderContent>
        <HeaderTitle>{title}</HeaderTitle>
        {subheader && <HeaderSubheader>{subheader}</HeaderSubheader>}
      </HeaderContent>
      {action && <HeaderAction>{action}</HeaderAction>}
    </CardHeaderContainer>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  noPadding = false,
  sx,
}) => {
  const contentProps = { className, sx };
  return (
    <CardContentContainer noPadding={noPadding} {...contentProps}>
      {children}
    </CardContentContainer>
  );
};

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  className,
  disableSpacing = false,
}) => {
  return (
    <CardActionsContainer className={className} disableSpacing={disableSpacing}>
      {children}
    </CardActionsContainer>
  );
};

export const CardMedia: React.FC<CardMediaProps> = ({
  image,
  height = 200,
  alt,
  className,
  borderRadius,
}) => {
  return (
    <CardMediaContainer
      className={className}
      height={height}
      imageSrc={image}
      role="img"
      aria-label={alt || "Card media"}
      borderRadius={borderRadius}
    />
  );
}; 