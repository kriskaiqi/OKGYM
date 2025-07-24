import React, { useState, createContext, useContext } from 'react';
import { styled } from '@mui/system';
import { useThemeContext } from '../../contexts/ThemeContext';

// Types
type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: 'default' | 'pills' | 'underlined';
};

type TabsProps = {
  defaultTab?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underlined';
  onChange?: (tabId: string) => void;
  sx?: React.CSSProperties | any;
};

type TabProps = {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

type TabPanelProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

// Context
const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// Styled Components
const TabsContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'sx'
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
}));

const TabListContainer = styled('div')<{ variant: string }>(({ theme, variant }) => ({
  display: 'flex',
  marginBottom: '1.5rem',
  borderBottom: variant === 'underlined' ? `1px solid ${theme.palette.divider}` : 'none',
  gap: '0.75rem',
  position: 'relative',
  overflowX: 'auto',
  scrollbarWidth: 'none', // Firefox
  '&::-webkit-scrollbar': {
    display: 'none' // Chrome, Safari, Edge
  },
  paddingBottom: '2px', // Add a small padding to avoid clipping shadows
}));

const StyledTab = styled('button')<{ 
  isActive: boolean;
  variant: string;
  isDark: boolean;
}>(({ isActive, variant, isDark, theme }) => ({
  padding: variant === 'pills' ? '0.75rem 1.5rem' : '0.75rem 1.25rem',
  border: 'none',
  cursor: 'pointer',
  borderRadius: variant === 'pills' ? '50px' : variant === 'default' ? '8px' : '0',
  backgroundColor: isActive 
    ? variant === 'pills' 
      ? isDark ? theme.palette.primary.main : theme.palette.primary.main
      : 'transparent' 
    : 'transparent',
  color: isActive 
    ? variant === 'pills' 
      ? '#ffffff'
      : isDark ? theme.palette.primary.main : theme.palette.primary.main
    : isDark ? theme.palette.text.primary : theme.palette.text.secondary,
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.95rem',
  borderBottom: variant === 'underlined' && isActive 
    ? `2px solid ${isDark ? theme.palette.primary.main : theme.palette.primary.main}` 
    : variant === 'underlined' ? `2px solid transparent` : 'none',
  transition: 'all 0.25s ease',
  outline: 'none',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
  boxShadow: isActive && variant === 'pills' ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
  '&:hover': {
    backgroundColor: variant === 'pills' 
      ? isActive 
        ? isDark ? theme.palette.primary.dark : theme.palette.primary.main
        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
      : 'transparent',
    color: variant !== 'pills' || !isActive 
      ? isDark ? theme.palette.primary.light : theme.palette.primary.main
      : '#ffffff',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
  '&::after': variant === 'underlined' && isActive ? {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: '0',
    width: '100%',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease'
  } : {},
}));

const TabPanelContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative',
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(5px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
});

// Components
export const Tabs: React.FC<TabsProps> = ({ 
  defaultTab, 
  children, 
  className,
  variant = 'default',
  onChange,
  sx
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant }}>
      <TabsContainer className={className} style={sx}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === TabList) {
            return React.cloneElement(child as React.ReactElement<any>, { variant });
          }
          return child;
        })}
      </TabsContainer>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: React.ReactNode; className?: string; variant?: string }> = ({ 
  children, 
  className,
  variant = 'default'
}) => {
  return <TabListContainer className={className} variant={variant}>{children}</TabListContainer>;
};

export const Tab: React.FC<TabProps> = ({ 
  id, 
  children, 
  disabled = false,
  className,
  icon
}) => {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  return (
    <StyledTab
      isActive={activeTab === id}
      variant={variant}
      isDark={isDark}
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={className}
    >
      {icon && <span className="tab-icon">{icon}</span>}
      {children}
    </StyledTab>
  );
};

export const TabPanel: React.FC<TabPanelProps> = ({ 
  id, 
  children,
  className
}) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== id) return null;

  return <TabPanelContainer className={className}>{children}</TabPanelContainer>;
}; 