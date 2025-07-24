import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Avatar,
  Divider,
  Skeleton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  styled,
  Button,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  EmojiEvents as AchievementIcon,
  Person as PersonIcon,
  QueryStats as StatsIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Height as HeightIcon,
  MonitorWeight as MonitorWeightIcon,
  Scale as ScaleIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService, UserProfileResponse } from '../services/userService';
import api from '../services/api';
import { PageContainer } from '../components/layout';
import { 
  PageTitle, 
  BodyText, 
  SectionTitle,
  SubsectionTitle 
} from '../components/ui/Typography';
import AchievementCard from '../components/achievements/AchievementCard';
import achievementService, { Achievement } from '../services/achievementService';

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

// Styled components
const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const TabPanel = ({ children, value, index, ...props }: any) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...props}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Settings state variables
  const [saveLoading, setSaveLoading] = useState<{ personal: boolean, fitness: boolean }>({ 
    personal: false, 
    fitness: false 
  });
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Add new state for combined saving
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

  // Add state for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const profileData = await userService.getUserProfile();
      console.log('Full profile data:', profileData);
      // Add detailed logging of stats
      console.log('Stats object:', profileData?.stats);
      // Check specifically for weight data
      console.log('Weight value:', profileData?.stats?.currentWeight);
      
      if (profileData) {
        // We no longer use dashboard data for stats fallback
        setProfile(profileData);
        
        // Set personal info for settings
        setPersonalInfo({
          firstName: profileData.user.firstName || '',
          lastName: profileData.user.lastName || '',
          email: profileData.user.email || ''
        });
        
        // Extract fitness data from user
        // First check preferences JSON, then direct properties
        const userData = profileData.user as any;
        const preferences = userData.preferences || {};
        const stats = profileData.stats || {};
        
        console.log('Setting form data with:', {
          gender: userData.gender,
          preferences,
          stats,
          activityLevel: userData.activityLevel,
          mainGoal: userData.mainGoal
        });
        
        setFitnessProfile({
          gender: userData.gender || preferences.gender || '',
          dateOfBirth: preferences.dateOfBirth ? new Date(preferences.dateOfBirth).toISOString().split('T')[0] : '',
          weight: stats.currentWeight ? stats.currentWeight.toString() : 
                 userData.weight ? userData.weight.toString() : '',
          height: preferences.heightCm ? preferences.heightCm.toString() : 
                  userData.height ? userData.height.toString() : '',
          activityLevel: userData.activityLevel || preferences.activityLevel || '',
          fitnessGoal: userData.mainGoal || preferences.fitnessGoal || ''
        });
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile data - runs once on mount AND when URL changes
  useEffect(() => {
    fetchUserProfile();
  }, [location.key]); // Re-fetch when navigating to this page

  // Add useEffect to fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      setAchievementsLoading(true);
      try {
        const achievementsData = await achievementService.getAchievements();
        setAchievements(achievementsData);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setAchievementsLoading(false);
      }
    };
    
    fetchAchievements();
  }, []);

  // Refresh profile data handler
  const handleRefresh = () => {
    fetchUserProfile();
  };
  
  // Settings handlers
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
          
          // Get current stats from profile data instead of making a separate API call
          const currentStats = profile?.stats || {};
          
          // Check if startingWeight exists
          const hasStartingWeight = 'startingWeight' in currentStats;
          
          // Only include allowed fields for the stats update
          const statsUpdate = {
            currentWeight: weightValue,
            // Only set startingWeight if it doesn't already exist
            ...(!hasStartingWeight && { startingWeight: weightValue }),
            // Add weight entry as an array, not a single object
            weightHistory: [{
              date: new Date(),
              weight: weightValue
            }]
          };
          
          // Update user stats directly
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
      await fetchUserProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertMessage({ type: 'error', message: 'An error occurred while updating profile information' });
    } finally {
      setSavingAll(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" width="250px" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ProfileCard>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
              </ProfileCard>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <ProfileCard>
                <Skeleton variant="text" width="200px" height={32} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[1, 2, 3, 4].map(item => (
                    <Grid item xs={6} sm={3} key={item}>
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              </ProfileCard>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  // Settings tab UI
  const renderSettingsContent = () => (
    <>
      <Box>
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
    </>
  );

  // Error state
  if (error) {
    return (
      <PageContainer>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Profile
          </Typography>
          
          <Alert 
            severity="error" 
            icon={<ErrorIcon fontSize="inherit" />}
            sx={{ mt: 2 }}
          >
            {error}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* User info card */}
        <Grid item xs={12} md={4}>
          <ProfileCard>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {profile?.user.firstName?.[0]}{profile?.user.lastName?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {profile?.user.firstName} {profile?.user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.user.email}
              </Typography>
              {profile?.user.gender && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {profile.user.gender}
                </Typography>
              )}
              {profile?.user.dateOfBirth && (
                <Typography variant="body2" color="text.secondary">
                  {new Date(profile.user.dateOfBirth).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <FitnessCenterIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Fitness Level" 
                  secondary={profile?.user?.fitnessLevel || 
                    profile?.user?.preferences?.fitnessLevel || 
                    "Not set"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <TimelineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Activity Level" 
                  secondary={profile?.user?.activityLevel || 
                    (profile?.user?.preferences?.activityLevel ? 
                    profile?.user?.preferences?.activityLevel.replace('_', ' ') : "Not set")}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AchievementIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Main Goal" 
                  secondary={profile?.user?.mainGoal || "Not set"}
                />
              </ListItem>
              {/* Always show height if available */}
              {profile?.user?.height && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <HeightIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Height" 
                    secondary={`${profile.user.height} cm`}
                  />
                </ListItem>
              )}
              {/* Weight display from stats */}
              <ListItem>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MonitorWeightIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Weight" 
                  secondary={profile?.stats?.currentWeight ? 
                    `${profile.stats.currentWeight} kg` : 
                    profile?.user?.stats?.currentWeight ?
                    `${profile.user.stats.currentWeight} kg` :
                    "Not set"}
                />
              </ListItem>
              {/* BMI calculation */}
              {profile?.user?.height && (profile?.stats?.currentWeight || profile?.user?.stats?.currentWeight) && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ScaleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="BMI" 
                    secondary={(() => {
                      const heightInMeters = profile.user.height / 100;
                      const weight = profile?.stats?.currentWeight || profile?.user?.stats?.currentWeight || 0;
                      const bmi = weight / (heightInMeters * heightInMeters);
                      return `${bmi.toFixed(1)} kg/m²`;
                    })()}
                  />
                </ListItem>
              )}
            </List>
          </ProfileCard>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={8}>
          <ProfileCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ flex: 1, borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab icon={<StatsIcon />} iconPosition="start" label="Stats" />
                <Tab icon={<AchievementIcon />} iconPosition="start" label="Achievements" />
                <Tab icon={<PersonIcon />} iconPosition="start" label="Settings" />
              </Tabs>
              <IconButton 
                onClick={handleRefresh} 
                color="primary"
                disabled={loading}
                sx={{ ml: 2 }}
                aria-label="Refresh data"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
            
            {/* Stats Tab */}
            <TabPanel value={tabValue} index={0}>
              <StatsGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StatCard>
                    <Typography variant="h3" color="primary.main" fontWeight={700}>
                      {profile?.user?.height ? `${profile.user.height} cm` : "Not set"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Height
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatCard>
                    <Typography variant="h3" color="primary.main" fontWeight={700}>
                      {profile?.stats?.currentWeight ? `${profile.stats.currentWeight} kg` : "Not set"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Weight
                    </Typography>
                  </StatCard>
                </Grid>
              </StatsGrid>
              
              {/* Weight Progress */}
              {(profile?.stats?.currentWeight || profile?.stats?.startingWeight) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Weight Progress
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Starting: {profile?.stats?.startingWeight || '?'} kg
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current: {profile?.stats?.currentWeight || '?'} kg
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, profile?.stats?.startingWeight && profile?.stats?.currentWeight
                      ? 100 - ((profile.stats.currentWeight / profile.stats.startingWeight) * 100)
                      : 0)} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              )}
              
              {/* BMI Calculator Display - Always visible */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  BMI Calculator
                </Typography>
                
                {/* BMI Value and Category */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                  {(() => {
                    const heightInMeters = (profile?.user?.height || 171) / 100;
                    const weight = profile?.stats?.currentWeight || 67;
                    const bmi = weight / (heightInMeters * heightInMeters);
                    const bmiValue = parseFloat(bmi.toFixed(1));
                    
                    let category = '';
                    let color = '';
                    
                    if (bmiValue < 18.5) {
                      category = 'Underweight';
                      color = '#5DA8DC'; // blue
                    } else if (bmiValue < 25) {
                      category = 'Normal';
                      color = '#78C275'; // green
                    } else if (bmiValue < 30) {
                      category = 'Overweight';
                      color = '#E39C45'; // orange
                    } else {
                      category = 'Obese';
                      color = '#D75452'; // red
                    }
                    
                    return (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color={color}>
                          {bmiValue}
                        </Typography>
                        <Typography variant="h6" fontWeight="medium" color={color}>
                          {category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          kg/m²
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
                
                {/* BMI Scale */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    height: 30, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    mb: 0.5
                  }}>
                    <Box sx={{ 
                      width: '30%', 
                      bgcolor: '#5DA8DC', // blue - underweight
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8
                    }} />
                    <Box sx={{ 
                      width: '20%', 
                      bgcolor: '#78C275' // green - normal
                    }} />
                    <Box sx={{ 
                      width: '20%', 
                      bgcolor: '#E39C45' // orange - overweight
                    }} />
                    <Box sx={{ 
                      width: '30%', 
                      bgcolor: '#D75452', // red - obese
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8
                    }} />
                  </Box>
                  
                  {/* BMI Value Indicators */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    px: 1,
                    mb: 1
                  }}>
                    <Typography variant="body2">18.5</Typography>
                    <Typography variant="body2">25</Typography>
                    <Typography variant="body2">30</Typography>
                  </Box>
                  
                  {/* BMI Category Labels */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between' 
                  }}>
                    <Box sx={{ 
                      width: '25%', 
                      textAlign: 'center',
                      bgcolor: '#5DA8DC',
                      color: 'white',
                      py: 1,
                      borderRadius: 1
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        Underweight
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '22%', 
                      textAlign: 'center',
                      bgcolor: '#78C275',
                      color: 'white',
                      py: 1,
                      borderRadius: 1,
                      mx: 0.5
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        Normal
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '25%', 
                      textAlign: 'center',
                      bgcolor: '#E39C45',
                      color: 'white',
                      py: 1,
                      borderRadius: 1,
                      mx: 0.5
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        Overweight
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '22%', 
                      textAlign: 'center',
                      bgcolor: '#D75452',
                      color: 'white',
                      py: 1,
                      borderRadius: 1
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        Obese
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* BMI Formula */}
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 2
                }}>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                    <strong>BMI Formula:</strong> weight (kg) / height² (m²)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Your calculation:</strong> {profile?.stats?.currentWeight || 67} kg ÷ ({((profile?.user?.height || 171) / 100).toFixed(2)} m)² = {(() => {
                      const heightInMeters = (profile?.user?.height || 171) / 100;
                      const weight = profile?.stats?.currentWeight || 67;
                      const bmi = weight / (heightInMeters * heightInMeters);
                      return bmi.toFixed(1);
                    })()} kg/m²
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Achievements Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Your Achievements
                </Typography>
                
                <Grid container spacing={2}>
                  {achievementsLoading ? (
                    // Show skeletons when loading
                    Array(4).fill(0).map((_, index) => (
                      <Grid item xs={12} sm={6} key={`skeleton-${index}`}>
                        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                      </Grid>
                    ))
                  ) : achievements.length > 0 ? (
                    // Show achievements in a 2x2 grid
                    achievements.slice(0, 4).map((achievement) => (
                      <Grid item xs={12} sm={6} key={achievement.id}>
                        <AchievementCard achievement={achievement} />
                      </Grid>
                    ))
                  ) : (
                    // No achievements case
                    <Grid item xs={12}>
                      <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                        No achievements found. Start completing workouts to earn achievements!
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                <Box mt={3} display="flex" justifyContent="center">
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate('/achievements')}
                  >
                    View All Achievements
                  </Button>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Settings Tab - Now integrated from Settings.tsx */}
            <TabPanel value={tabValue} index={2}>
              {renderSettingsContent()}
            </TabPanel>
          </ProfileCard>
        </Grid>
      </Grid>
      
      {/* Notification */}
      {alertMessage && (
        <Snackbar 
          open={true}
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

export default Profile; 