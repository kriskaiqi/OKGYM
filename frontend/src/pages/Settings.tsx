import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  styled,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Save as SaveIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import api from '../services/api';
import { PageContainer } from '../components/layout';
import { 
  PageTitle, 
  BodyText, 
  SectionTitle,
  SubsectionTitle 
} from '../components/ui/Typography';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(4),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: 'auto',
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

// Define the correct enums that match backend
enum BackendActivityLevel {
  SEDENTARY = "SEDENTARY",
  LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE",
  MODERATELY_ACTIVE = "MODERATELY_ACTIVE",
  VERY_ACTIVE = "VERY_ACTIVE",
  EXTREMELY_ACTIVE = "EXTREMELY_ACTIVE"
}

enum BackendFitnessGoal {
  STRENGTH_GAIN = "STRENGTH_GAIN",
  MUSCLE_BUILDING = "MUSCLE_BUILDING",
  HYPERTROPHY = "HYPERTROPHY",
  FAT_LOSS = "FAT_LOSS",
  WEIGHT_LOSS = "WEIGHT_LOSS",
  ENDURANCE = "ENDURANCE",
  POWER_DEVELOPMENT = "POWER_DEVELOPMENT",
  ATHLETICISM = "ATHLETICISM",
  SPORT_SPECIFIC = "SPORT_SPECIFIC",
  SKILL_DEVELOPMENT = "SKILL_DEVELOPMENT",
  GENERAL_FITNESS = "GENERAL_FITNESS",
  FLEXIBILITY = "FLEXIBILITY",
  MOBILITY = "MOBILITY",
  MAINTENANCE = "MAINTENANCE",
  ACTIVE_RECOVERY = "ACTIVE_RECOVERY",
  REHABILITATION = "REHABILITATION",
  CUSTOM = "CUSTOM"
}

// Enhance fitness goal dropdown options
const fitnessGoalOptions = [
  { value: BackendFitnessGoal.WEIGHT_LOSS, label: 'Lose Weight' },
  { value: BackendFitnessGoal.FAT_LOSS, label: 'Fat Loss' },
  { value: BackendFitnessGoal.MUSCLE_BUILDING, label: 'Gain Muscle' },
  { value: BackendFitnessGoal.HYPERTROPHY, label: 'Hypertrophy' },
  { value: BackendFitnessGoal.STRENGTH_GAIN, label: 'Gain Strength' },
  { value: BackendFitnessGoal.ENDURANCE, label: 'Improve Endurance' },
  { value: BackendFitnessGoal.MAINTENANCE, label: 'Maintain Fitness' },
  { value: BackendFitnessGoal.FLEXIBILITY, label: 'Increase Flexibility' },
  { value: BackendFitnessGoal.GENERAL_FITNESS, label: 'General Fitness' },
  { value: BackendFitnessGoal.POWER_DEVELOPMENT, label: 'Power Development' },
  { value: BackendFitnessGoal.ATHLETICISM, label: 'Athletic Performance' },
  { value: BackendFitnessGoal.MOBILITY, label: 'Improve Mobility' },
  { value: BackendFitnessGoal.ACTIVE_RECOVERY, label: 'Active Recovery' },
];

const Settings: React.FC = () => {
  const { user, refreshUserData: authRefresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState<{ personal: boolean, fitness: boolean }>({ 
    personal: false, 
    fitness: false 
  });
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Add new state for combined loading
  const [savingAll, setSavingAll] = useState(false);
  
  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Personal Info Form Validation
  const [personalInfoErrors, setPersonalInfoErrors] = useState({
    firstName: '',
    lastName: '',
  });
  
  // Fitness Profile Form State
  const [fitnessProfile, setFitnessProfile] = useState({
    gender: '',
    dateOfBirth: '',
    weight: '',
    height: '',
    activityLevel: '',
    fitnessGoal: ''
  });
  
  // Fitness Profile Validation
  const [fitnessProfileErrors, setFitnessProfileErrors] = useState({
    weight: '',
    height: '',
    dateOfBirth: '',
  });
  
  // Function to refresh user data from the API
  const refreshUserData = async () => {
    setLoading(true);
    try {
      // Fetch fresh user data from the API
      await authRefresh?.();
      console.log('User data refreshed on settings page visit');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load user data on component mount and refresh it
  useEffect(() => {
    refreshUserData();
  }, []);
  
  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      // Set personal info
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
      
      // Extract fitness data from user
      // First check preferences JSON, then direct properties
      const userData = user as any; // Type assertion to avoid TypeScript errors
      const preferences = userData.preferences || {};
      const stats = userData.stats || {};
      
      console.log('Loaded fresh user data:', {
        gender: user.gender,
        preferences,
        stats,
        activityLevel: user.activityLevel,
        mainGoal: userData.mainGoal
      });
      
      setFitnessProfile({
        gender: user.gender || preferences.gender || '',
        dateOfBirth: preferences.dateOfBirth ? new Date(preferences.dateOfBirth).toISOString().split('T')[0] : '',
        weight: stats.currentWeight ? stats.currentWeight.toString() : 
               user.weight ? user.weight.toString() : '',
        height: preferences.heightCm ? preferences.heightCm.toString() : 
                user.height ? user.height.toString() : '',
        activityLevel: user.activityLevel || preferences.activityLevel || '',
        fitnessGoal: userData.mainGoal || preferences.fitnessGoal || ''
      });
    }
  }, [user]);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
    
    // Validate as user types
    if (name === 'firstName' && !value) {
      setPersonalInfoErrors(prev => ({ ...prev, firstName: 'First name is required' }));
    } else if (name === 'firstName') {
      setPersonalInfoErrors(prev => ({ ...prev, firstName: '' }));
    }
    
    if (name === 'lastName' && !value) {
      setPersonalInfoErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
    } else if (name === 'lastName') {
      setPersonalInfoErrors(prev => ({ ...prev, lastName: '' }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFitnessProfile(prev => ({ ...prev, [name as string]: value }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFitnessProfile(prev => ({ ...prev, [name]: value }));
    
    // Validate as user types
    if (name === 'weight') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setFitnessProfileErrors(prev => ({ ...prev, weight: 'Must be a number' }));
      } else if (numValue < 20 || numValue > 300) {
        setFitnessProfileErrors(prev => ({ ...prev, weight: 'Weight must be between 20-300 kg' }));
      } else {
        setFitnessProfileErrors(prev => ({ ...prev, weight: '' }));
      }
    }
    
    if (name === 'height') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setFitnessProfileErrors(prev => ({ ...prev, height: 'Must be a number' }));
      } else if (numValue < 30 || numValue > 300) {
        setFitnessProfileErrors(prev => ({ ...prev, height: 'Height must be between 30-300 cm' }));
      } else {
        setFitnessProfileErrors(prev => ({ ...prev, height: '' }));
      }
    }
    
    if (name === 'dateOfBirth') {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime())) {
        setFitnessProfileErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date' }));
      } else if (age < 13 || age > 120) {
        setFitnessProfileErrors(prev => ({ ...prev, dateOfBirth: 'Age must be between 13-120 years' }));
      } else {
        setFitnessProfileErrors(prev => ({ ...prev, dateOfBirth: '' }));
      }
    }
  };
  
  const savePersonalInfo = async () => {
    // Validate before saving
    const errors = {
      firstName: !personalInfo.firstName ? 'First name is required' : '',
      lastName: !personalInfo.lastName ? 'Last name is required' : ''
    };
    
    setPersonalInfoErrors(errors);
    
    if (errors.firstName || errors.lastName) {
      setAlertMessage({ type: 'error', message: 'Please fix the errors before saving' });
      return;
    }
    
    setSaveLoading({ ...saveLoading, personal: true });
    try {
      const updateData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName
      };
      
      const updated = await userService.updateProfile(updateData);
      
      if (updated) {
        setAlertMessage({ type: 'success', message: 'Personal information updated successfully' });
        // Refresh data after saving
        await refreshUserData();
      } else {
        setAlertMessage({ type: 'error', message: 'Failed to update personal information' });
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      setAlertMessage({ type: 'error', message: 'An error occurred while updating personal information' });
    } finally {
      setSaveLoading({ ...saveLoading, personal: false });
    }
  };
  
  const saveFitnessProfile = async () => {
    // Validate before saving
    const errors = {
      weight: '',
      height: '',
      dateOfBirth: ''
    };
    
    if (fitnessProfile.weight) {
      const numWeight = Number(fitnessProfile.weight);
      if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
        errors.weight = 'Weight must be between 20-300 kg';
      }
    }
    
    if (fitnessProfile.height) {
      const numHeight = Number(fitnessProfile.height);
      if (isNaN(numHeight) || numHeight < 30 || numHeight > 300) {
        errors.height = 'Height must be between 30-300 cm';
      }
    }
    
    if (fitnessProfile.dateOfBirth) {
      const birthDate = new Date(fitnessProfile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime()) || age < 13 || age > 120) {
        errors.dateOfBirth = 'Age must be between 13-120 years';
      }
    }
    
    setFitnessProfileErrors(errors);
    
    if (errors.weight || errors.height || errors.dateOfBirth) {
      setAlertMessage({ type: 'error', message: 'Please fix the errors before saving' });
      return;
    }
    
    setSaveLoading({ ...saveLoading, fitness: true });
    try {
      // Step 1: Update fitness profile - height, gender, etc.
      const fitnessData: any = {
        heightCm: fitnessProfile.height ? Number(fitnessProfile.height) : undefined,
        fitnessGoals: fitnessProfile.fitnessGoal ? [fitnessProfile.fitnessGoal] : undefined,
        activityLevel: fitnessProfile.activityLevel || undefined,
        gender: fitnessProfile.gender || undefined
      };
      
      // Extract birth year and add it directly
      if (fitnessProfile.dateOfBirth) {
        const birthYear = new Date(fitnessProfile.dateOfBirth).getFullYear();
        console.log('Using birth year:', birthYear);
        fitnessData.birthYear = birthYear;
      }
      
      console.log('Sending fitness profile data:', fitnessData);
      
      // Update fitness profile data
      const response = await api.put('/api/users/profile/fitness', fitnessData);
      let updated = response.data?.data;
      
      // Step 2: If weight is provided, update it in the stats field where it belongs
      if (fitnessProfile.weight) {
        try {
          const weightValue = Number(fitnessProfile.weight);
          // Only include allowed fields for the stats update
          const statsUpdate = {
            currentWeight: weightValue,
            // Don't include startingWeight unless it's a new user
            ...(user?.stats?.startingWeight === undefined && { startingWeight: weightValue }),
            // Add weight entry as an array, not a single object
            weightHistory: [{
              date: new Date(),
              weight: weightValue
            }]
          };
          
          // Update user stats directly
          console.log('Updating weight in stats:', statsUpdate);
          await api.put('/api/users/stats', statsUpdate);
          console.log('Successfully updated weight in stats');
        } catch (error) {
          console.error('Failed to update weight in stats:', error);
          setAlertMessage({ type: 'error', message: 'Failed to update weight information' });
        }
      }
      
      // Step 3: Clean up preferences - remove all redundant fields
      try {
        // Clean up all redundant data from preferences
        await api.post('/api/users/preferences/cleanup', {
          removeFields: ['gender', 'activityLevel', 'fitnessGoals', 'heightCm', 'weightKg', 'birthYear']
        });
        
        // If we have a dateOfBirth, add it DIRECTLY to preferences
        if (fitnessProfile.dateOfBirth) {
          await api.put('/api/users/profile/preferences', {
            dateOfBirth: fitnessProfile.dateOfBirth
          });
          console.log('Saved dateOfBirth in preferences:', fitnessProfile.dateOfBirth);
        }
        
        console.log('Cleaned up preferences successfully');
      } catch (cleanupError) {
        console.warn('Failed to clean up preferences, but profile was updated', cleanupError);
      }
      
      if (updated) {
        setAlertMessage({ type: 'success', message: 'Fitness profile updated successfully' });
        // Refresh data after saving to show the latest values
        await refreshUserData();
      } else {
        setAlertMessage({ type: 'error', message: 'Failed to update some fitness profile information' });
      }
    } catch (error) {
      console.error('Error updating fitness profile:', error);
      setAlertMessage({ type: 'error', message: 'An error occurred while updating fitness profile' });
    } finally {
      setSaveLoading({ ...saveLoading, fitness: false });
    }
  };

  // Add a new combined save function below saveFitnessProfile
  const saveAllProfileData = async () => {
    // Validate both forms
    const personalErrors = {
      firstName: !personalInfo.firstName ? 'First name is required' : '',
      lastName: !personalInfo.lastName ? 'Last name is required' : ''
    };
    
    const fitnessErrors = {
      weight: '',
      height: '',
      dateOfBirth: ''
    };
    
    if (fitnessProfile.weight) {
      const numWeight = Number(fitnessProfile.weight);
      if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
        fitnessErrors.weight = 'Weight must be between 20-300 kg';
      }
    }
    
    if (fitnessProfile.height) {
      const numHeight = Number(fitnessProfile.height);
      if (isNaN(numHeight) || numHeight < 30 || numHeight > 300) {
        fitnessErrors.height = 'Height must be between 30-300 cm';
      }
    }
    
    if (fitnessProfile.dateOfBirth) {
      const birthDate = new Date(fitnessProfile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime()) || age < 13 || age > 120) {
        fitnessErrors.dateOfBirth = 'Age must be between 13-120 years';
      }
    }
    
    setPersonalInfoErrors(personalErrors);
    setFitnessProfileErrors(fitnessErrors);
    
    // Check if any errors exist
    if (personalErrors.firstName || personalErrors.lastName || 
        fitnessErrors.weight || fitnessErrors.height || fitnessErrors.dateOfBirth) {
      setAlertMessage({ type: 'error', message: 'Please fix the errors before saving' });
      return;
    }
    
    // Set loading state
    setSavingAll(true);
    
    try {
      // Step 1: Save personal info
      const personalData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName
      };
      
      const personalUpdated = await userService.updateProfile(personalData);
      
      // Step 2: Save fitness data
      const fitnessData: any = {
        heightCm: fitnessProfile.height ? Number(fitnessProfile.height) : undefined,
        fitnessGoals: fitnessProfile.fitnessGoal ? [fitnessProfile.fitnessGoal] : undefined,
        activityLevel: fitnessProfile.activityLevel || undefined,
        gender: fitnessProfile.gender || undefined
      };
      
      // Extract birth year and add it directly
      if (fitnessProfile.dateOfBirth) {
        const birthYear = new Date(fitnessProfile.dateOfBirth).getFullYear();
        fitnessData.birthYear = birthYear;
      }
      
      // Update fitness profile data
      const response = await api.put('/api/users/profile/fitness', fitnessData);
      
      // Step 3: Update weight in stats if provided
      if (fitnessProfile.weight) {
        try {
          const weightValue = Number(fitnessProfile.weight);
          const statsUpdate = {
            currentWeight: weightValue,
            ...(user?.stats?.startingWeight === undefined && { startingWeight: weightValue }),
            weightHistory: [{
              date: new Date(),
              weight: weightValue
            }]
          };
          
          await api.put('/api/users/stats', statsUpdate);
        } catch (error) {
          console.error('Failed to update weight in stats:', error);
        }
      }
      
      // Step 4: Clean up preferences 
      try {
        await api.post('/api/users/preferences/cleanup', {
          removeFields: ['gender', 'activityLevel', 'fitnessGoals', 'heightCm', 'weightKg', 'birthYear']
        });
        
        if (fitnessProfile.dateOfBirth) {
          await api.put('/api/users/profile/preferences', {
            dateOfBirth: fitnessProfile.dateOfBirth
          });
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up preferences, but profile was updated', cleanupError);
      }
      
      // Success notification
      setAlertMessage({ type: 'success', message: 'Profile updated successfully' });
      
      // Refresh data to show updated values
      await refreshUserData();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertMessage({ type: 'error', message: 'An error occurred while updating profile information' });
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <PageContainer>
      <StyledPaper>
        <Box>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ProfileAvatar>
              {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}
            </ProfileAvatar>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Personal Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange}
                variant="outlined"
                required
                error={!!personalInfoErrors.firstName}
                helperText={personalInfoErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange}
                variant="outlined"
                required
                error={!!personalInfoErrors.lastName}
                helperText={personalInfoErrors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={personalInfo.email}
                variant="outlined"
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Fitness Profile
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={fitnessProfile.gender}
                  onChange={handleSelectChange}
                  label="Gender"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={fitnessProfile.dateOfBirth}
                onChange={handleInputChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!fitnessProfileErrors.dateOfBirth}
                helperText={fitnessProfileErrors.dateOfBirth}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={fitnessProfile.weight}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{ inputProps: { min: 20, max: 300 } }}
                error={!!fitnessProfileErrors.weight}
                helperText={fitnessProfileErrors.weight || "Weight in kilograms"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={fitnessProfile.height}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{ inputProps: { min: 30, max: 300 } }}
                error={!!fitnessProfileErrors.height}
                helperText={fitnessProfileErrors.height || "Height in centimeters"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="activity-level-label">Activity Level</InputLabel>
                <Select
                  labelId="activity-level-label"
                  id="activityLevel"
                  name="activityLevel"
                  value={fitnessProfile.activityLevel}
                  onChange={handleSelectChange}
                  label="Activity Level"
                >
                  <MenuItem value={BackendActivityLevel.SEDENTARY}>Sedentary</MenuItem>
                  <MenuItem value={BackendActivityLevel.LIGHTLY_ACTIVE}>Lightly Active</MenuItem>
                  <MenuItem value={BackendActivityLevel.MODERATELY_ACTIVE}>Moderately Active</MenuItem>
                  <MenuItem value={BackendActivityLevel.VERY_ACTIVE}>Very Active</MenuItem>
                  <MenuItem value={BackendActivityLevel.EXTREMELY_ACTIVE}>Extremely Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="fitness-goal-label">Fitness Goal</InputLabel>
                <Select
                  labelId="fitness-goal-label"
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={fitnessProfile.fitnessGoal}
                  onChange={handleSelectChange}
                  label="Fitness Goal"
                >
                  {fitnessGoalOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  startIcon={savingAll ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={saveAllProfileData}
                  disabled={savingAll || saveLoading.personal || saveLoading.fitness}
                >
                  {savingAll ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>

      {/* Alert Notification */}
      {alertMessage && (
        <Snackbar 
          open={!!alertMessage}
          autoHideDuration={6000} 
          onClose={() => setAlertMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setAlertMessage(null)} 
            severity={alertMessage.type} 
            sx={{ width: '100%' }}
          >
            {alertMessage.message}
          </Alert>
        </Snackbar>
      )}
    </PageContainer>
  );
};

export default Settings; 

