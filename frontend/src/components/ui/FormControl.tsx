import React from 'react';
import {
  Box,
  FormControl as MuiFormControl,
  FormControlProps as MuiFormControlProps,
  FormHelperText,
  styled,
  alpha
} from '@mui/material';

// Enhanced FormControl props
export interface FormControlProps extends MuiFormControlProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  spacing?: number;
  labelProps?: React.HTMLAttributes<HTMLLabelElement>;
}

// Styled components
const StyledFormControl = styled(MuiFormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  width: '100%',
  position: 'relative',
}));

// Use a native HTML element instead of Typography to avoid type issues
const StyledLabel = styled('label')(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(0.75),
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
}));

const RequiredIndicator = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.5),
  lineHeight: 1,
}));

/**
 * Enhanced FormControl component that wraps form elements with consistent styling
 * and provides uniform handling of labels, helper text, and error states.
 */
export const FormControl: React.FC<FormControlProps> = ({
  children,
  label,
  helperText,
  required = false,
  fullWidth = true,
  error = false,
  spacing = 2.5,
  labelProps = {},
  ...props
}) => {
  return (
    <StyledFormControl 
      fullWidth={fullWidth} 
      error={error} 
      required={required}
      sx={{ mb: spacing }}
      {...props}
    >
      {label && (
        <StyledLabel 
          style={{ color: error ? 'var(--mui-palette-error-main)' : undefined }}
          {...labelProps}
        >
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </StyledLabel>
      )}
      
      {children}
      
      {helperText && (
        <FormHelperText 
          error={error}
          sx={{ 
            mt: 0.5,
            ml: 0,
            fontSize: '0.75rem' 
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default FormControl; 