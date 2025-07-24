import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper,
  Grid, 
  Button, 
  Divider, 
  Breadcrumbs,
  Link,
  Tab, 
  Tabs,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';

import { WorkoutPlanList, WorkoutPlanForm } from '../../components/workout';
import { PageContainer } from '../../components/layout';
import { WorkoutPlan, WorkoutDifficulty, WorkoutCategory, WorkoutPlanFilterOptions, CreateWorkoutPlanRequest } from '../../types/workout';
import { workoutService } from '../../services';
import { PageTitle, BodyText } from '../../components/ui/Typography';

// Map workout categories to their respective IDs
const CATEGORY_ID_MAP: Record<WorkoutCategory, number> = {
  [WorkoutCategory.FULL_BODY]: 1,
  [WorkoutCategory.UPPER_BODY]: 2,
  [WorkoutCategory.LOWER_BODY]: 3,
  [WorkoutCategory.PUSH]: 4,
  [WorkoutCategory.PULL]: 5,
  [WorkoutCategory.LEGS]: 6,
  [WorkoutCategory.CORE]: 7,
  [WorkoutCategory.CARDIO]: 8,
  [WorkoutCategory.HIIT]: 9,
  [WorkoutCategory.STRENGTH]: 10,
  [WorkoutCategory.ENDURANCE]: 11,
  [WorkoutCategory.FLEXIBILITY]: 12,
  [WorkoutCategory.RECOVERY]: 13,
  [WorkoutCategory.CUSTOM]: 14
};

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workout-tabpanel-${index}`}
      aria-labelledby={`workout-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const WorkoutPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<WorkoutPlanFilterOptions>({
    page: 1,
    limit: 9,
    isCustom: false,
    categoryIds: [],
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<WorkoutDifficulty | ''>('');

  // Parse URL parameters on load to set the active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'my-workouts') {
      // Redirect to browse when accessing removed my-workouts tab
      navigate('/workout-plans');
    } else if (tab === 'favorites') {
      setTabValue(1);
      setFilters(prev => ({...prev, isCustom: false, isFavorite: true}));
    } else {
      // Default to browse
      setTabValue(0);
      setFilters(prev => ({...prev, isCustom: false, isFavorite: false}));
    }
  }, [location.search, navigate]);

  const handleSelectWorkout = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    navigate(`/workout-plans/${workout.id}`);
  };

  const handleStartWorkout = (workoutId: string | number) => {
    navigate(`/sessions?workoutId=${workoutId}`);
  };

  const handleCreateWorkout = () => {
    setShowForm(true);
  };

  const handleSaveWorkout = async (workout: WorkoutPlan) => {
    try {
      setShowForm(false);
      // Refresh workout list
      // You might want to set the tab to "My Workouts" after creating
      setTabValue(1);
    } catch (error) {
      console.error('Failed to save workout plan:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Update filters with clean, simple approach
    setFilters({
      page: 1,
      limit: filters.limit || 9,
      isCustom: false,
      isFavorite: newValue === 1
    });
    
    // Update URL params
    const tabParam = newValue === 0 ? 'browse' : 'favorites';
    navigate(`/workout-plans?tab=${tabParam}`);
  };

  const handleSearch = () => {
    setFilters({
      ...filters,
      difficulty: selectedDifficulty || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSelectedDifficulty('');
    setFilters({
      ...filters,
      search: undefined,
      categoryIds: [],
      difficulty: undefined,
      page: 1,
    });
  };

  return (
    <PageContainer>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="workout tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab 
            label="Browse Workouts" 
            id="workout-tab-0"
            aria-controls="workout-tabpanel-0"
          />
          <Tab 
            label="Favorite Workouts" 
            id="workout-tab-1"
            aria-controls="workout-tabpanel-1"
          />
        </Tabs>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: 'background.paper', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
              <FormControl fullWidth size="small">
                <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-select-label"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as WorkoutDifficulty | '')}
                  label="Difficulty"
                >
                  <MenuItem value="">Any</MenuItem>
                  {Object.values(WorkoutDifficulty).map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficulty.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2.5}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSearch}
                size="medium"
              >
                Filter
              </Button>
            </Grid>
            <Grid item xs={6} sm={2.5}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleClearFilters}
                size="medium"
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkout}
            >
              Create Workout
            </Button>
          </Box>
          <WorkoutPlanList
            onSelectWorkout={handleSelectWorkout}
            onStartWorkout={handleStartWorkout}
            initialFilters={filters}
            title=""
            hideControls
            showFilters={false}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <WorkoutPlanList
            onSelectWorkout={handleSelectWorkout}
            onStartWorkout={handleStartWorkout}
            initialFilters={{...filters, isFavorite: true}}
            title=""
            hideControls
            showFilters={false}
            emptyMessage="You haven't favorited any workouts yet. Browse workouts and click the heart icon to add them to your favorites."
          />
        </TabPanel>
      </Box>

      <Dialog 
        open={showForm} 
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle>Create Workout Plan</DialogTitle>
          <IconButton 
            onClick={handleCloseForm}
            sx={{ mr: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
        <WorkoutPlanForm
          initialWorkout={selectedWorkout || undefined}
          onSave={handleSaveWorkout}
            onCancel={handleCloseForm}
        />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default WorkoutPlansPage; 