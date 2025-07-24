import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  styled,
  alpha,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface SelectProps extends Omit<MuiSelectProps, 'displayEmpty'> {
  options: SelectOption[];
  placeholder?: string;
  showEmptyOption?: boolean;
  emptyOptionLabel?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderValue?: (selected: any) => React.ReactNode;
  useChips?: boolean;
}

// Styled Select
const StyledSelect = styled(MuiSelect)(({ theme }) => ({
  '& .MuiOutlinedInput-input': {
    paddingRight: theme.spacing(4),
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: theme.shape.borderRadius * 1.2,
    transition: theme.transitions.create(['box-shadow', 'border-color']),
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.text.primary,
  },
  '& .MuiSelect-icon': {
    transition: theme.transitions.create(['transform']),
  },
  '&.Mui-focused .MuiSelect-icon': {
    transform: 'rotate(180deg)',
  },
}));

// Styled Chips for multiple select
const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.3),
  height: 24,
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(0.8),
    paddingRight: theme.spacing(0.8),
  },
}));

/**
 * Enhanced Select component with better styling and consistent UI
 */
export const Select: React.FC<SelectProps> = ({
  options,
  placeholder = 'Select an option',
  showEmptyOption = false,
  emptyOptionLabel = 'None',
  renderOption,
  renderValue,
  useChips = false,
  multiple,
  ...props
}) => {
  // Default empty value based on whether it's a multiple select
  const emptyValue = multiple ? [] : '';
  
  // Custom rendering of the selected value(s)
  const customRenderValue = (selected: any) => {
    if (renderValue) {
      return renderValue(selected);
    }
    
    if (selected === '' || (Array.isArray(selected) && selected.length === 0)) {
      return <Typography color="text.secondary">{placeholder}</Typography>;
    }
    
    if (multiple && useChips && Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <StyledChip
                key={value}
                label={option?.label || value}
                color={option?.color || 'default'}
                size="small"
              />
            );
          })}
        </Box>
      );
    }
    
    if (multiple && Array.isArray(selected)) {
      const selectedLabels = selected.map(value => {
        const option = options.find(opt => opt.value === value);
        return option?.label || value;
      });
      return selectedLabels.join(', ');
    }
    
    const selectedOption = options.find(opt => opt.value === selected);
    return selectedOption?.label || selected;
  };
  
  // Default rendering of an option
  const defaultRenderOption = (option: SelectOption) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      width: '100%',
    }}>
      {option.icon && (
        <Box sx={{ mr: 1.5, display: 'flex' }}>{option.icon}</Box>
      )}
      <Typography>{option.label}</Typography>
    </Box>
  );
  
  return (
    <StyledSelect
      displayEmpty
      value={props.value || emptyValue}
      IconComponent={ExpandMoreIcon}
      renderValue={customRenderValue}
      multiple={multiple}
      {...props}
    >
      {showEmptyOption && (
        <MenuItem value="" disabled={props.required}>
          <Typography color="text.secondary">{emptyOptionLabel}</Typography>
        </MenuItem>
      )}
      
      {options.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}
          disabled={option.disabled}
        >
          {renderOption ? renderOption(option) : defaultRenderOption(option)}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};

export default Select; 