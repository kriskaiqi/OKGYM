import React from 'react';
import { 
  IconButton, 
  IconButtonProps, 
  Tooltip, 
  Box, 
  styled,
  useTheme
} from '@mui/material';
import { 
  LightMode as LightIcon, 
  DarkMode as DarkIcon,
  Brightness4 as BrightnessIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../contexts/ThemeContext';

// Styled components
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    top: 0,
    left: 0,
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
  '&:active': {
    transform: 'scale(0.95)',
  }
}));

interface ThemeToggleProps extends Omit<IconButtonProps, 'onClick'> {
  showTooltip?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showTooltip = true,
  size = 'medium',
  ...props 
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeContext();
  
  const getIconSize = () => {
    switch (size) {
      case 'small': return 18;
      case 'large': return 26;
      default: return 22;
    }
  };
  
  const handleToggle = () => {
    toggleColorMode();
  };
  
  const iconSize = getIconSize();
  const isDark = mode === 'dark';
  
  const icon = isDark ? 
    <LightIcon fontSize="inherit" /> : 
    <DarkIcon fontSize="inherit" />;
  
  const tooltipText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  
  const iconButton = (
    <StyledIconButton
      onClick={handleToggle}
      color="inherit"
      size={size}
      aria-label={tooltipText}
      {...props}
    >
      <Box sx={{ fontSize: iconSize }}>
        {icon}
      </Box>
    </StyledIconButton>
  );
  
  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} arrow>
        {iconButton}
      </Tooltip>
    );
  }
  
  return iconButton;
};

export default ThemeToggle; 