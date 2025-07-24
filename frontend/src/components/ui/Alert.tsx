import React from 'react';
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle,
  styled,
  alpha,
  IconButton,
  Box,
  Collapse,
  Fade
} from '@mui/material';
import {
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlined as ErrorIcon,
  InfoOutlined as InfoIcon,
  WarningAmberOutlined as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';

export interface AlertProps extends MuiAlertProps {
  title?: string;
  onClose?: () => void;
  showIcon?: boolean;
  fadeIn?: boolean;
  customIcon?: React.ReactNode;
  animationDuration?: number;
}

// Get icon based on severity
const getAlertIcon = (severity: AlertProps['severity'], customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  switch (severity) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
    default:
      return <InfoIcon />;
  }
};

// Styled Alert with enhanced visuals
const StyledAlert = styled(MuiAlert)(({ theme, severity }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: `0 2px 8px ${alpha(
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    severity === 'success' ? theme.palette.success.main :
    theme.palette.info.main,
    0.15
  )}`,
  '& .MuiAlert-icon': {
    opacity: 0.9,
  },
  '& .MuiAlert-message': {
    padding: theme.spacing(0.5, 0),
  },
  '& .MuiAlert-action': {
    paddingTop: 4,
  },
}));

/**
 * Enhanced Alert component with improved styling and features
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  onClose,
  severity = 'info',
  showIcon = true,
  fadeIn = true,
  customIcon,
  animationDuration = 300,
  variant = 'standard',
  ...props
}) => {
  // Content to render
  const alertContent = (
    <StyledAlert
      severity={severity}
      variant={variant}
      icon={showIcon ? getAlertIcon(severity, customIcon) : false}
      action={
        onClose ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null
      }
      {...props}
    >
      {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
      {children}
    </StyledAlert>
  );

  // Wrap with animation if needed
  if (fadeIn) {
    return (
      <Fade in={true} timeout={animationDuration}>
        <Box>{alertContent}</Box>
      </Fade>
    );
  }

  return alertContent;
};

export default Alert; 