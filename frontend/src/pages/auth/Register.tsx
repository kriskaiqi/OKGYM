import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  RadioGroup,
  Radio,
  useTheme,
  useMediaQuery,
  Stack,
  styled,
  alpha
} from '@mui/material';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

// Step 1 - Account Info
interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Step 2 - Personal Info (Expanded)
interface PersonalFormData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string; // Full date in YYYY-MM-DD format
  height: number;
  fitnessLevel: string;
}

// Step 3 - Fitness Profile (Expanded)
interface FitnessFormData {
  weight: number;
  startingWeight: number;
  weightUnit: string;
  activityLevel: string;
  mainGoal: string;
  fitnessGoal: string; // Changed from array to single string
}

// Styled components for visual enhancement
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5, 4),
  width: '100%',
  maxWidth: 500,
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 1,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 28,
    backgroundColor: alpha(theme.palette.background.paper, 0.05),
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.5),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    transformOrigin: 'left',
    left: 0
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    paddingTop: 14,
    paddingBottom: 14,
  },
  width: '100%',
  marginBottom: theme.spacing(2.5),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 28,
    backgroundColor: alpha(theme.palette.background.paper, 0.05),
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.5),
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.text.secondary,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '120px',
  height: '48px',
  borderRadius: 24,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: alpha(theme.palette.text.primary, 0.3),
    color: theme.palette.text.secondary,
    '&:hover': {
      borderColor: alpha(theme.palette.text.primary, 0.5),
      backgroundColor: alpha(theme.palette.action.hover, 0.1),
    },
  },
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  '& .MuiStepLabel-root': {
    '& .MuiStepIcon-root': {
      width: 36,
      height: 36,
      '&.Mui-active': {
        color: theme.palette.primary.main,
      },
      '&.Mui-completed': {
        color: theme.palette.success.main,
      }
    }
  }
}));

// Add styled components for the background similar to Login page
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.75)})`,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/assets/images/gym-pattern-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.07,
    zIndex: 0,
  },
  '@keyframes gradientAnimation': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.dark, 0.3)}, 
      ${alpha(theme.palette.primary.main, 0.1)}, 
      ${alpha(theme.palette.secondary.dark, 0.2)})`,
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 15s ease infinite',
    zIndex: 0,
    opacity: 0.6,
  }
}));

// Form validation helpers
const validateAccountForm = (data: AccountFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

const validatePersonalForm = (data: PersonalFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }
  
  if (!data.birthDate) {
    errors.birthDate = 'Birth date is required';
  } else {
    const birthYear = new Date(data.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    
    if (birthYear < 1900 || birthYear > currentYear) {
      errors.birthDate = 'Please enter a valid birth date';
    }
  }
  
  if (!data.height || data.height <= 0) {
    errors.height = 'Valid height is required';
  }
  
  if (!data.fitnessLevel) {
    errors.fitnessLevel = 'Fitness level is required';
  }
  
  return errors;
};

// Add validation for fitness form
const validateFitnessForm = (data: FitnessFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.weight || data.weight <= 0) {
    errors.weight = 'Valid weight is required';
  }
  
  if (!data.startingWeight || data.startingWeight <= 0) {
    errors.startingWeight = 'Valid starting weight is required';
  }
  
  if (!data.weightUnit) {
    errors.weightUnit = 'Weight unit is required';
  }
  
  if (!data.activityLevel) {
    errors.activityLevel = 'Activity level is required';
  }
  
  if (!data.mainGoal) {
    errors.mainGoal = 'Main goal is required';
  }
  
  if (!data.fitnessGoal) {
    errors.fitnessGoal = 'Fitness goal is required';
  }
  
  return errors;
};

// Activity level options
const activityLevels = [
  { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active (light exercise 1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active (moderate exercise 3-5 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very active (hard exercise 6-7 days/week)' },
  { value: 'EXTREMELY_ACTIVE', label: 'Extremely active (hard daily exercise & physical job)' }
];

// Fitness level options
const fitnessLevels = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' }
];

// Gender options
const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

// Measurement unit options
const measurementUnits = [
  { value: 'METRIC', label: 'Metric (kg)' },
  { value: 'IMPERIAL', label: 'Imperial (lb)' }
];

// Main goal options
const mainGoalOptions = [
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'FAT_LOSS', label: 'Fat Loss' },
  { value: 'MUSCLE_BUILDING', label: 'Muscle Building' },
  { value: 'STRENGTH_GAIN', label: 'Strength Gain' },
  { value: 'HYPERTROPHY', label: 'Hypertrophy' },
  { value: 'ENDURANCE', label: 'Endurance' }
];

// Fitness goals options - match backend enums exactly
const fitnessGoalsOptions = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'MUSCLE_BUILDING', label: 'Muscle Building' },
  { value: 'STRENGTH_GAIN', label: 'Strength' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'FLEXIBILITY', label: 'Flexibility' },
  { value: 'GENERAL_FITNESS', label: 'Overall Fitness' }
];

// Fix the API URL by ensuring it includes the /api prefix
const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return true; // Don't check invalid emails
    }
    
    // Explicitly include the /api prefix in the URL
    const response = await axios.get(`${API_BASE_URL.includes('/api') ? API_BASE_URL : API_BASE_URL + '/api'}/users/check-email`, {
      params: { email }
    });
    
    console.log('Email check response:', response.data);
    
    // Check if response has the expected structure
    if (response.data && response.data.data && response.data.data.hasOwnProperty('available')) {
      return response.data.data.available;
    }
    
    console.error('Unexpected response format from email check API:', response.data);
    return true; // Fallback to avoid blocking registration
  } catch (error) {
    console.error('Error checking email availability:', error);
    
    // Improved error handling with more specific messages
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Server returned ${error.response.status}: ${error.response.statusText}`);
    }
    
    return true; // In case of errors, assume email is available to avoid blocking
  }
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Steps
  const steps = ['Account Information', 'Personal Information', 'Fitness Profile'];
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data
  const [accountForm, setAccountForm] = useState<AccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [personalForm, setPersonalForm] = useState<PersonalFormData>({
    firstName: '',
    lastName: '',
    gender: 'MALE', // Default gender
    birthDate: '2000-01-01', // Default date of birth
    height: 170, // Default height of 170cm
    fitnessLevel: 'BEGINNER', // Default fitness level
  });
  
  const [fitnessForm, setFitnessForm] = useState<FitnessFormData>({
    weight: 70, // Default weight of 70kg
    startingWeight: 70, // Default starting weight of 70kg
    weightUnit: 'METRIC', // Default to metric
    activityLevel: 'MODERATELY_ACTIVE', // Default activity level
    mainGoal: 'MUSCLE_BUILDING', // Default main goal
    fitnessGoal: 'MUSCLE_BUILDING', // Default fitness goal (single value)
  });
  
  // Error states
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Add a debounced email check function
  const debouncedCheckEmail = useCallback(
    async (email: string) => {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailAvailable(null);
        return;
      }

      setEmailCheckLoading(true);
      const available = await checkEmailAvailability(email);
      setEmailAvailable(available);
      setEmailCheckLoading(false);
    },
    []
  );

  // Use effect to check email when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (accountForm.email) {
        debouncedCheckEmail(accountForm.email);
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [accountForm.email, debouncedCheckEmail]);

  // Add a keyPress handler to check email with Enter key
  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && accountForm.email) {
      e.preventDefault();
      debouncedCheckEmail(accountForm.email);
    }
  };

  // Update the email field change handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setAccountForm({...accountForm, email});
    
    // Reset email availability when typing
    if (emailAvailable === false) {
      setEmailAvailable(null);
    }
  };

  // Handle next button
  const handleNext = async () => {
    let isValid = false;
    let formFieldErrors = {};

    if (activeStep === 0) {
      formFieldErrors = validateAccountForm(accountForm);
      
      // If email field has no format errors, check availability
      if (!formFieldErrors.hasOwnProperty('email') && accountForm.email) {
        setEmailCheckLoading(true);
        const available = await checkEmailAvailability(accountForm.email);
        setEmailAvailable(available);
        setEmailCheckLoading(false);
        
        if (!available) {
          formFieldErrors = {
            ...formFieldErrors,
            email: 'This email is already registered'
          };
        }
      }
      
      isValid = Object.keys(formFieldErrors).length === 0;
      setFormErrors({ ...formErrors, accountForm: formFieldErrors });
    } else if (activeStep === 1) {
      formFieldErrors = validatePersonalForm(personalForm);
      isValid = Object.keys(formFieldErrors).length === 0;
      setFormErrors({ ...formErrors, personalForm: formFieldErrors });
    } else if (activeStep === 2) {
      formFieldErrors = validateFitnessForm(fitnessForm);
      isValid = Object.keys(formFieldErrors).length === 0;
      setFormErrors({ ...formErrors, fitnessForm: formFieldErrors });
    }

    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (activeStep === 0) {
      // Navigate to login page if on first step
      navigate('/login');
    } else {
      // Go back to previous step if not on first step
      setActiveStep((prev) => prev - 1);
      setFormErrors({});
    }
  };

  // Automatically set starting weight to match current weight
  const handleWeightChange = (value: string) => {
    // Convert to number only if the value is not empty
    const numericValue = value === '' ? 0 : Number(value);
    
    setFitnessForm({
      ...fitnessForm,
      weight: numericValue,
      startingWeight: numericValue // Auto-update starting weight when weight changes
    });
  };
  
  // Handle fitness goal radio button change
  const handleGoalChange = (goal: string) => {
    setFitnessForm(prev => ({
      ...prev,
      fitnessGoal: goal
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // First validate the fitness form
    const fitnessFormErrors = validateFitnessForm(fitnessForm);
    
    if (Object.keys(fitnessFormErrors).length > 0) {
      setFormErrors({ ...formErrors, fitnessForm: fitnessFormErrors });
      return;
    }

    // Double-check email availability before final submission
    const available = await checkEmailAvailability(accountForm.email);
    if (!available) {
      setActiveStep(0); // Go back to first step
      setFormErrors({
        ...formErrors,
        accountForm: {
          ...formErrors.accountForm,
          email: 'This email is already registered'
        }
      });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      
      // Format date properly
      const birthDate = personalForm.birthDate; // Already in YYYY-MM-DD format
      
      // Create weight history entry with exact timestamp format as in seed
      const now = new Date();
      const weightHistory = [{
        date: now, // Use Date object directly instead of string
        weight: fitnessForm.weight
      }];
      
      // Calculate target values based on goals
      const mainGoalIsLoss = fitnessForm.mainGoal.includes('LOSS') || fitnessForm.mainGoal.includes('FAT_LOSS');
      const mainGoalIsGain = fitnessForm.mainGoal.includes('GAIN') || fitnessForm.mainGoal.includes('STRENGTH') || 
                              fitnessForm.mainGoal.includes('HYPERTROPHY') || fitnessForm.mainGoal.includes('MUSCLE');
      
      // Calculate target value for body metrics
      const targetValue = mainGoalIsLoss ? fitnessForm.weight - 5 : 
                          mainGoalIsGain ? fitnessForm.weight + 5 : 
                          fitnessForm.weight; // Stable for general fitness
      
      // Determine trend direction
      const desiredTrend = mainGoalIsLoss ? 'DECREASING' : 
                           mainGoalIsGain ? 'INCREASING' : 
                           'STABLE';
      
      // Build complete user data object with exact structure as in seed data
      const userData = {
        // Account info
        email: accountForm.email,
        password: accountForm.password,
        
        // Add automatic timezone detection
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        
        // Personal info
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        gender: personalForm.gender,
        birthYear: new Date(personalForm.birthDate).getFullYear(),
        height: personalForm.height,
        fitnessLevel: personalForm.fitnessLevel,
        
        // Fixed user role settings (always register as regular user)
        userRole: 'USER',
        isAdmin: false,
        isPremium: false,
        
        // Fitness profile
        mainGoal: fitnessForm.mainGoal,
        activityLevel: fitnessForm.activityLevel,
        
        // User stats - exactly match the seed data format
        stats: {
          weightUnit: fitnessForm.weightUnit,
          currentWeight: fitnessForm.weight,
          startingWeight: fitnessForm.startingWeight,
          weightHistory: weightHistory
        },
        
        // User preferences
        preferences: {
          dateOfBirth: birthDate // Store full date in YYYY-MM-DD format
        },
        
        // Body metrics data - exactly match the seed data
        bodyMetrics: {
          weight: fitnessForm.weight,
          bodyArea: 'FULL_BODY',
          valueType: 'WEIGHT',
          unit: fitnessForm.weightUnit === 'METRIC' ? 'KILOGRAM' : 'POUND',
          targetValue: targetValue,
          desiredTrend: desiredTrend,
          source: 'manual',
          notes: 'Initial weight record'
        },
        
        // Fitness goals data - exactly match the seed data format but with a single goal
        fitnessGoals: [{
          title: `${fitnessForm.fitnessGoal} Goal`,
          type: getGoalType(fitnessForm.fitnessGoal),
          target: getGoalTarget(fitnessForm.fitnessGoal, fitnessForm.weight),
          current: fitnessForm.weight,
          unit: fitnessForm.weightUnit === 'METRIC' ? 'KILOGRAM' : 'POUND',
          startDate: new Date(),
          deadline: getGoalDeadline(),
          status: 'ACTIVE',
          description: fitnessForm.fitnessGoal === 'GENERAL_FITNESS' ? 
            `Achieve CUSTOM goal in the next 3 months` : 
            `Achieve ${getGoalType(fitnessForm.fitnessGoal)} goal in the next 3 months`,
          checkpoints: null,
          metadata: null
        }]
      };
      
      await register(userData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      // Extract and display meaningful error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        // For client-side errors like network issues
        errorMessage = `Error: ${err.message}`;
      }
      
      // Set specific error message
      setApiError(errorMessage);
      
      // If there's a validation error from the server
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        // Handle server validation errors by mapping them to the form structure
        const mappedErrors: {
          accountForm: Record<string, string>;
          personalForm: Record<string, string>;
          fitnessForm: Record<string, string>;
        } = {
          accountForm: {},
          personalForm: {},
          fitnessForm: {}
        };
        
        // Map server errors to form fields
        Object.keys(serverErrors).forEach(field => {
          // Map to the appropriate form section
          if (['email', 'password'].includes(field)) {
            mappedErrors.accountForm[field] = serverErrors[field];
          } else if (['firstName', 'lastName', 'gender', 'birthDate', 'height', 'fitnessLevel'].includes(field)) {
            mappedErrors.personalForm[field] = serverErrors[field];
          } else {
            mappedErrors.fitnessForm[field] = serverErrors[field];
          }
        });
        
        setFormErrors(mappedErrors);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get the correct goal type for the backend
  const getGoalType = (goal: string): string => {
    switch (goal) {
      case 'WEIGHT_LOSS':
      case 'FAT_LOSS':
        return 'WEIGHT_LOSS';
      case 'MUSCLE_BUILDING':
      case 'HYPERTROPHY':
        return 'MUSCLE_GAIN';
      case 'STRENGTH_GAIN':
        return 'STRENGTH';
      case 'ENDURANCE':
        return 'ENDURANCE';
      case 'FLEXIBILITY':
        return 'FLEXIBILITY';
      case 'GENERAL_FITNESS':
        return 'CUSTOM';
      default:
        return 'CUSTOM';
    }
  };

  // Helper function to get the goal target based on type and current weight
  const getGoalTarget = (goal: string, currentWeight: number): number => {
    if (goal === 'WEIGHT_LOSS' || goal === 'FAT_LOSS') {
      return currentWeight - 5;
    } else if (goal === 'MUSCLE_BUILDING' || goal === 'HYPERTROPHY') {
      return currentWeight + 5;
    } else if (goal === 'STRENGTH_GAIN') {
      return currentWeight + 3;
    } else if (goal === 'GENERAL_FITNESS') {
      return 0;
    }
    return currentWeight;
  };

  // Helper function to get goal deadline (3 months from now)
  const getGoalDeadline = (): Date => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    return deadline;
  };
  
  // Render current step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={0}>
            <StyledTextField
              variant="outlined"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={accountForm.email}
              onChange={handleEmailChange}
              error={!!(formErrors.accountForm && formErrors.accountForm.email) || emailAvailable === false}
              helperText={
                (formErrors.accountForm && formErrors.accountForm.email) ||
                (emailAvailable === false && "This email is already registered") ||
                (emailCheckLoading && "Checking email availability...") ||
                (emailAvailable === true && accountForm.email && "✓ Email is available")
              }
              required
              InputProps={{
                endAdornment: emailCheckLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: theme => theme.palette.text.secondary }}>
                    <span style={{ fontSize: '0.8rem', marginRight: '4px' }}>Checking</span>
                    <span style={{ animation: 'pulse 1.5s infinite', fontSize: '1rem' }}>...</span>
                  </Box>
                ) : emailAvailable === true && accountForm.email ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: theme => theme.palette.success.main, 
                    backgroundColor: theme => alpha(theme.palette.success.main, 0.1),
                    borderRadius: '4px',
                    padding: '2px 8px'
                  }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>✓</span>
                    <span style={{ fontSize: '0.8rem' }}>Available</span>
                  </Box>
                ) : emailAvailable === false ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: theme => theme.palette.error.main, 
                    backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
                    borderRadius: '4px',
                    padding: '2px 8px'
                  }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>✗</span>
                    <span style={{ fontSize: '0.8rem' }}>Taken</span>
                  </Box>
                ) : null
              }}
              onKeyPress={handleEmailKeyPress}
            />
            
            <StyledTextField
              variant="outlined"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={accountForm.password}
              onChange={(e) => setAccountForm({...accountForm, password: e.target.value})}
              error={!!(formErrors.accountForm && formErrors.accountForm.password)}
              helperText={formErrors.accountForm && formErrors.accountForm.password}
              required
            />
            
            <StyledTextField
              variant="outlined"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={accountForm.confirmPassword}
              onChange={(e) => setAccountForm({...accountForm, confirmPassword: e.target.value})}
              error={!!(formErrors.accountForm && formErrors.accountForm.confirmPassword)}
              helperText={formErrors.accountForm && formErrors.accountForm.confirmPassword}
              required
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={0}>
            <Box sx={{ display: 'flex', width: '100%', gap: 2, mb: 2.5 }}>
              <StyledTextField
                variant="outlined"
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={personalForm.firstName}
                onChange={(e) => setPersonalForm({...personalForm, firstName: e.target.value})}
                error={!!(formErrors.personalForm && formErrors.personalForm.firstName)}
                helperText={formErrors.personalForm && formErrors.personalForm.firstName}
                required
              />
              
              <StyledTextField
                variant="outlined"
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={personalForm.lastName}
                onChange={(e) => setPersonalForm({...personalForm, lastName: e.target.value})}
                error={!!(formErrors.personalForm && formErrors.personalForm.lastName)}
                helperText={formErrors.personalForm && formErrors.personalForm.lastName}
                required
              />
            </Box>
            
            <StyledFormControl error={!!(formErrors.personalForm && formErrors.personalForm.gender)} required>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                value={personalForm.gender}
                label="Gender"
                onChange={(e) => setPersonalForm({...personalForm, gender: e.target.value})}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
              {formErrors.personalForm && formErrors.personalForm.gender && <FormHelperText>{formErrors.personalForm.gender}</FormHelperText>}
            </StyledFormControl>
            
            <StyledTextField
              variant="outlined"
              fullWidth
              id="birthDate"
              label="Date of Birth"
              name="birthDate"
              type="date"
              value={personalForm.birthDate}
              onChange={(e) => {
                const birthDate = e.target.value;
                setPersonalForm({...personalForm, birthDate});
              }}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!(formErrors.personalForm && formErrors.personalForm.birthDate)}
              helperText={formErrors.personalForm && formErrors.personalForm.birthDate}
              required
            />
            
            <StyledTextField
              variant="outlined"
              fullWidth
              id="height"
              label="Height (cm)"
              name="height"
              type="number"
              value={personalForm.height}
              onChange={(e) => setPersonalForm({...personalForm, height: Number(e.target.value)})}
              error={!!(formErrors.personalForm && formErrors.personalForm.height)}
              helperText={formErrors.personalForm && formErrors.personalForm.height}
              required
            />
            
            <StyledFormControl error={!!(formErrors.personalForm && formErrors.personalForm.fitnessLevel)} required>
              <InputLabel id="fitnessLevel-label">Fitness Level</InputLabel>
              <Select
                labelId="fitnessLevel-label"
                id="fitnessLevel"
                name="fitnessLevel"
                value={personalForm.fitnessLevel}
                label="Fitness Level"
                onChange={(e) => setPersonalForm({...personalForm, fitnessLevel: e.target.value})}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
              </Select>
              {formErrors.personalForm && formErrors.personalForm.fitnessLevel && <FormHelperText>{formErrors.personalForm.fitnessLevel}</FormHelperText>}
            </StyledFormControl>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={0}>
            <Box sx={{ display: 'flex', width: '100%', gap: 2, mb: 2.5 }}>
              <StyledTextField
                variant="outlined"
                fullWidth
                id="weight"
                label="Current Weight"
                name="weight"
                type="text"
                value={fitnessForm.weight === 0 ? '' : fitnessForm.weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                error={!!(formErrors.fitnessForm && formErrors.fitnessForm.weight)}
                helperText={formErrors.fitnessForm && formErrors.fitnessForm.weight}
                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
                required
              />
              
              <StyledTextField
                variant="outlined"
                fullWidth
                id="startingWeight"
                label="Starting Weight"
                name="startingWeight"
                type="text"
                value={fitnessForm.startingWeight === 0 ? '' : fitnessForm.startingWeight}
                onChange={(e) => setFitnessForm({...fitnessForm, startingWeight: e.target.value === '' ? 0 : Number(e.target.value)})}
                error={!!(formErrors.fitnessForm && formErrors.fitnessForm.startingWeight)}
                helperText={formErrors.fitnessForm && formErrors.fitnessForm.startingWeight}
                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
                required
              />
            </Box>
            
            <StyledFormControl error={!!(formErrors.fitnessForm && formErrors.fitnessForm.weightUnit)} required>
              <InputLabel id="weightUnit-label">Weight Unit</InputLabel>
              <Select
                labelId="weightUnit-label"
                id="weightUnit"
                name="weightUnit"
                value={fitnessForm.weightUnit}
                label="Weight Unit"
                onChange={(e) => setFitnessForm({...fitnessForm, weightUnit: e.target.value})}
              >
                <MenuItem value="METRIC">Kilograms (kg)</MenuItem>
                <MenuItem value="IMPERIAL">Pounds (lb)</MenuItem>
              </Select>
              {formErrors.fitnessForm && formErrors.fitnessForm.weightUnit && <FormHelperText>{formErrors.fitnessForm.weightUnit}</FormHelperText>}
            </StyledFormControl>
            
            <StyledFormControl error={!!(formErrors.fitnessForm && formErrors.fitnessForm.activityLevel)} required>
              <InputLabel id="activityLevel-label">Activity Level</InputLabel>
              <Select
                labelId="activityLevel-label"
                id="activityLevel"
                name="activityLevel"
                value={fitnessForm.activityLevel}
                label="Activity Level"
                onChange={(e) => setFitnessForm({...fitnessForm, activityLevel: e.target.value})}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="SEDENTARY">Sedentary (little or no exercise)</MenuItem>
                <MenuItem value="LIGHTLY_ACTIVE">Lightly active (light exercise/sports 1-3 days/week)</MenuItem>
                <MenuItem value="MODERATELY_ACTIVE">Moderately active (moderate exercise/sports 3-5 days/week)</MenuItem>
                <MenuItem value="VERY_ACTIVE">Very active (hard exercise/sports 6-7 days a week)</MenuItem>
                <MenuItem value="EXTREMELY_ACTIVE">Extra active (very hard exercise & physical job or training twice a day)</MenuItem>
              </Select>
              {formErrors.fitnessForm && formErrors.fitnessForm.activityLevel && <FormHelperText>{formErrors.fitnessForm.activityLevel}</FormHelperText>}
            </StyledFormControl>
            
            <StyledFormControl error={!!(formErrors.fitnessForm && formErrors.fitnessForm.mainGoal)} required>
              <InputLabel id="mainGoal-label">Main Goal</InputLabel>
              <Select
                labelId="mainGoal-label"
                id="mainGoal"
                name="mainGoal"
                value={fitnessForm.mainGoal}
                label="Main Goal"
                onChange={(e) => setFitnessForm({...fitnessForm, mainGoal: e.target.value})}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="GENERAL_FITNESS">General Fitness</MenuItem>
                <MenuItem value="WEIGHT_LOSS">Lose Weight</MenuItem>
                <MenuItem value="FAT_LOSS">Fat Loss</MenuItem>
                <MenuItem value="MUSCLE_BUILDING">Build Muscle</MenuItem>
                <MenuItem value="STRENGTH_GAIN">Increase Strength</MenuItem>
                <MenuItem value="HYPERTROPHY">Hypertrophy</MenuItem>
                <MenuItem value="ENDURANCE">Improve Endurance</MenuItem>
              </Select>
              {formErrors.fitnessForm && formErrors.fitnessForm.mainGoal && <FormHelperText>{formErrors.fitnessForm.mainGoal}</FormHelperText>}
            </StyledFormControl>
            
            <Box sx={{ 
              border: theme => `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
              borderRadius: 4, 
              p: 2.5, 
              mb: 2 
            }}>
              <StyledFormLabel sx={{ mb: 1, display: 'block' }}>Fitness Goal</StyledFormLabel>
              <RadioGroup
                value={fitnessForm.fitnessGoal}
                onChange={(e) => handleGoalChange(e.target.value)}
              >
                {fitnessGoalsOptions.map((goal) => (
                  <FormControlLabel
                    key={goal.value}
                    value={goal.value}
                    control={<StyledRadio />}
                    label={<Typography variant="body2" sx={{ color: theme => theme.palette.text.primary }}>{goal.label}</Typography>}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
              {formErrors.fitnessForm && formErrors.fitnessForm.fitnessGoal && 
                <FormHelperText error>{formErrors.fitnessForm.fitnessGoal}</FormHelperText>}
            </Box>
          </Stack>
        );
      default:
        return 'Unknown step';
    }
  };
  
  // Add a global CSS keyframe animation
  const keyframes = `
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
  `;

  useEffect(() => {
    // Add keyframes to document
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <PageContainer maxWidth={false} disableGutters>
      <Container maxWidth="lg" sx={{ 
        py: 8, 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <Typography variant="h4" component="h1" gutterBottom 
            sx={{ 
              fontWeight: 700, 
              mb: 3, 
              color: theme => theme.palette.common.white,
              textShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
            Create Your Account
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: theme => alpha(theme.palette.common.white, 0.8), textAlign: 'center' }}>
            Join our community and start your fitness journey today
          </Typography>
          
          <StyledPaper>
            {/* Theme Toggle */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <ThemeToggle />
            </Box>

            <StyledStepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </StyledStepper>
            
            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {apiError}
              </Alert>
            )}
            
            {emailAvailable === false && (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  This email is already registered
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Please try a different email
                </Typography>
              </Box>
            )}
            
            {success ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Registration Successful!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Your account has been created. You'll be redirected to login...
                </Typography>
              </Box>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (activeStep === steps.length - 1) {
                  handleSubmit();
                } else {
                  handleNext();
                }
              }}>
                {getStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <StyledButton
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </StyledButton>
                  <StyledButton
                    variant="contained"
                    type="submit"
                    disabled={loading}
                  >
                    {activeStep === steps.length - 1 ? 'Register' : 'Next'}
                  </StyledButton>
                </Box>
                
                {activeStep === 0 && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: theme => theme.palette.text.secondary }}>
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
                        Login
                      </Link>
                    </Typography>
                  </Box>
                )}
              </form>
            )}
          </StyledPaper>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Register; 