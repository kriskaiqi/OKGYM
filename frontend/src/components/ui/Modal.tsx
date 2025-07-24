import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { styled } from '@mui/system';

// Types
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  fullWidth?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  disablePrimaryButton?: boolean;
  disableSecondaryButton?: boolean;
  hideButtons?: boolean;
  className?: string;
};

// Styled Components
const ButtonContainer = styled('div')({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
});

// Component
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = false,
  primaryButtonText = 'Confirm',
  secondaryButtonText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  disablePrimaryButton = false,
  disableSecondaryButton = false,
  hideButtons = false,
  className,
}) => {
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  const footer = !hideButtons ? (
    <ButtonContainer>
      <Button 
        variant="text" 
        onClick={handleSecondaryAction}
        disabled={disableSecondaryButton}
      >
        {secondaryButtonText}
      </Button>
      <Button 
        variant="contained" 
        onClick={handlePrimaryAction}
        disabled={disablePrimaryButton}
      >
        {primaryButtonText}
      </Button>
    </ButtonContainer>
  ) : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      footer={footer}
      className={className}
    >
      {children}
    </Dialog>
  );
}; 