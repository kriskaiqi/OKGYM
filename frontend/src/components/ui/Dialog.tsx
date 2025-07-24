import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/system';
import { useThemeContext } from '../../contexts/ThemeContext';
import { createPortal } from 'react-dom';

// Types
type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  fullWidth?: boolean;
  className?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  footer?: React.ReactNode;
};

// Styled Components
const Backdrop = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
}));

const DialogContainer = styled('div')<{ 
  maxWidth: string;
  fullWidth: boolean;
  isDark: boolean;
}>(({ theme, maxWidth, fullWidth, isDark }) => {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'xs': return '444px';
      case 'sm': return '600px';
      case 'md': return '800px';
      case 'lg': return '1000px';
      case 'xl': return '1200px';
      default: return maxWidth;
    }
  };

  return {
    backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
    borderRadius: '8px',
    boxShadow: isDark 
      ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
      : '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: getMaxWidth(),
    width: fullWidth ? '100%' : 'auto',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    margin: '16px',
    animation: 'dialog-fade-in 0.2s ease-out',
    '@keyframes dialog-fade-in': {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' }
    }
  };
});

const DialogHeader = styled('div')(({ theme }) => ({
  padding: '16px 24px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const DialogTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const CloseButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: '50%',
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: theme.palette.text.primary,
  },
  '&:focus': {
    outline: 'none',
  }
}));

const DialogContent = styled('div')(({ theme }) => ({
  padding: '24px',
  overflowY: 'auto',
  flexGrow: 1,
}));

const DialogFooter = styled('div')(({ theme }) => ({
  padding: '16px 24px',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '12px',
}));

// Components
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  title,
  maxWidth = 'sm',
  fullWidth = false,
  className,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  footer,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';
  const dialogRef = useRef<HTMLDivElement>(null);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableEscapeKeyDown) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current && 
        !dialogRef.current.contains(event.target as Node) && 
        !disableBackdropClick
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [open, onClose, disableBackdropClick, disableEscapeKeyDown]);

  // Create portal element on mount
  useEffect(() => {
    let portalRoot = document.getElementById('dialog-root');
    
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'dialog-root';
      document.body.appendChild(portalRoot);
    }
    
    setPortalElement(portalRoot);
    
    return () => {
      if (portalRoot && portalRoot.childNodes.length === 0) {
        document.body.removeChild(portalRoot);
      }
    };
  }, []);

  if (!open || !portalElement) return null;

  return createPortal(
    <Backdrop>
      <DialogContainer
        ref={dialogRef}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        isDark={isDark}
        className={className}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <CloseButton onClick={onClose} aria-label="Close">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M18 6L6 18M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </CloseButton>
          </DialogHeader>
        )}
        <DialogContent>{children}</DialogContent>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContainer>
    </Backdrop>,
    portalElement
  );
}; 