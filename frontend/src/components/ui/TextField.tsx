import React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  styled,
  alpha,
  InputAdornment,
  Typography,
  Box,
  Fade,
  Theme,
  OutlinedInputProps,
  FilledInputProps,
  InputProps as StandardInputProps
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// Enhanced TextField props - explicitly include MUI props we need
export interface TextFieldProps {
  showValidation?: boolean;
  isValid?: boolean;
  validationMessage?: string;
  validationState?: 'error' | 'success' | 'warning' | 'info' | 'none';
  
  // Standard MUI TextField props we want to support
  variant?: MuiTextFieldProps['variant'];
  label?: React.ReactNode;
  placeholder?: string;
  value?: unknown;
  defaultValue?: unknown;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  helperText?: React.ReactNode;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  size?: 'small' | 'medium';
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  type?: React.InputHTMLAttributes<unknown>['type'];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  InputProps?: Partial<OutlinedInputProps> | Partial<FilledInputProps> | Partial<StandardInputProps>;
  className?: string;
  sx?: MuiTextFieldProps['sx'];
}

// Styled TextField
const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['box-shadow', 'border-color']),
    borderRadius: theme.shape.borderRadius * 1.2,
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&:hover': {
      borderColor: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  }
}));

// Validation message box
const ValidationMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    fontSize: '0.875rem',
    marginRight: theme.spacing(0.5),
  }
}));

const getValidationColor = (
  state: 'error' | 'success' | 'warning' | 'info' | 'none', 
  theme: Theme
) => {
  switch (state) {
    case 'error': return theme.palette.error.main;
    case 'success': return theme.palette.success.main;
    case 'warning': return theme.palette.warning.main;
    case 'info': return theme.palette.info.main;
    default: return 'transparent';
  }
};

/**
 * Enhanced TextField component with improved styling and validation support
 */
export const TextField: React.FC<TextFieldProps> = ({
  showValidation = false,
  isValid,
  validationMessage = '',
  validationState = 'none',
  helperText,
  error,
  InputProps = {},
  ...props
}) => {
  // Use error prop to set validation state if not explicitly provided
  const actualValidationState = error ? 'error' : validationState;
  
  // Determine if we should show the validation message
  const shouldShowValidation = showValidation && (validationMessage || actualValidationState !== 'none');
  
  // End adornment based on validation state
  const getEndAdornment = () => {
    if (!showValidation || actualValidationState === 'none') {
      return InputProps; // Just return the original InputProps if no validation is needed
    }
    
    // Create a properly typed object that extends the original InputProps
    return {
      ...InputProps,
      endAdornment: (
        <>
          {InputProps.endAdornment}
          <InputAdornment position="end">
            {actualValidationState === 'error' ? (
              <ErrorIcon color="error" fontSize="small" />
            ) : actualValidationState === 'success' ? (
              <CheckIcon color="success" fontSize="small" />
            ) : null}
          </InputAdornment>
        </>
      )
    };
  };

  // Compute InputProps only once
  const computedInputProps = getEndAdornment();

  return (
    <Box>
      <StyledTextField
        error={actualValidationState === 'error' || error}
        helperText={helperText}
        InputProps={computedInputProps}
        {...props}
      />
      
      {shouldShowValidation && (
        <Fade in={true}>
          <ValidationMessage
            sx={{ 
              color: (theme) => getValidationColor(actualValidationState, theme)
            }}
          >
            {actualValidationState === 'error' ? (
              <ErrorIcon color="error" fontSize="small" />
            ) : actualValidationState === 'success' ? (
              <CheckIcon color="success" fontSize="small" />
            ) : null}
            {validationMessage}
          </ValidationMessage>
        </Fade>
      )}
    </Box>
  );
};

export default TextField; 