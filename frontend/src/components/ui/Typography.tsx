import React from 'react';
import { 
  Typography as MuiTypography, 
  TypographyProps as MuiTypographyProps, 
  styled 
} from '@mui/material';

export interface TypographyProps extends MuiTypographyProps {
  bold?: boolean;
  semibold?: boolean;
  muted?: boolean;
}

/**
 * Styled Typography component that provides consistent text styling throughout the application
 */
const StyledTypography = styled(MuiTypography, {
  shouldForwardProp: (prop) => 
    prop !== 'bold' && prop !== 'semibold' && prop !== 'muted'
})<TypographyProps>(({ theme, bold, semibold, muted }) => ({
  fontFamily: theme.typography.fontFamily,
  ...(bold && { fontWeight: 700 }),
  ...(semibold && { fontWeight: 600 }),
  ...(muted && { color: theme.palette.text.secondary }),
  // Ensure consistent line heights
  lineHeight: '1.5',
  // Variant-specific overrides handled by the theme
}));

/**
 * Typography - Enhanced Typography component with consistent styling
 * 
 * This component ensures consistent typography throughout the application.
 * - Standardizes font weights (normal, semibold, bold)
 * - Applies consistent margins and line heights
 * - Allows for muted text with a single prop
 */
export const Typography: React.FC<TypographyProps> = (props) => {
  return <StyledTypography {...props} />;
};

// Predefined typography components with specific styles
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
  '&.gradient': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
  }
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  position: 'relative',
  display: 'inline-block',
  paddingBottom: theme.spacing(1),
  letterSpacing: '-0.01em',
  color: theme.palette.text.primary,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60px',
    height: '4px',
    borderRadius: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

export const SubsectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
}));

export const BodyText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.6,
}));

export const SmallText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  lineHeight: 1.5,
}));

export const CaptionText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

export default Typography; 