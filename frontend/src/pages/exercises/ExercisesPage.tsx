import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card, 
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Breadcrumbs,
  Link,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TuneIcon from '@mui/icons-material/Tune';
import HomeIcon from '@mui/icons-material/Home';

import { ExerciseList } from '../../components/exercise';
import { EquipmentList } from '../../components/equipment';
import { PageContainer } from '../../components/layout';
import { ExerciseCategory, ExerciseDifficulty, MuscleGroup, Equipment, ExerciseFilterOptions } from '../../types/exercise';
import { EquipmentTypes } from '../../types';

// TabPanel component for tab content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exercise-tabpanel-${index}`}
      aria-labelledby={`exercise-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEquipmentTab, setIsEquipmentTab] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('');
  const [filters, setFilters] = useState<ExerciseFilterOptions>({});
  const [equipmentFilters, setEquipmentFilters] = useState<EquipmentTypes.EquipmentFilterOptions>({});

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setIsEquipmentTab(newValue === 1);
    // Reset appropriate filters when switching tabs
    if (newValue === 0) {
      setFilters({ page: 1 });
    } else {
      setEquipmentFilters({ page: 1 });
    }
  };

  // Update filters when filter values change
  useEffect(() => {
    if (!isEquipmentTab) {
      const newFilters: ExerciseFilterOptions = {};
      
      if (searchQuery) newFilters.search = searchQuery;
      if (muscleGroup) newFilters.muscleGroup = muscleGroup as MuscleGroup;
      if (difficulty) newFilters.difficulty = difficulty as ExerciseDifficulty;
      if (equipment) newFilters.equipment = equipment;
      
      setFilters(newFilters);
    } else {
      const newFilters: EquipmentTypes.EquipmentFilterOptions = {};
      
      if (searchQuery) newFilters.search = searchQuery;
      if (muscleGroup) newFilters.muscleGroup = muscleGroup as MuscleGroup;
      if (difficulty) newFilters.difficulty = difficulty as ExerciseDifficulty;
      
      setEquipmentFilters(newFilters);
    }
  }, [searchQuery, muscleGroup, difficulty, equipment, isEquipmentTab]);

  const handleSearch = () => {
    if (!isEquipmentTab) {
      // Exercise tab filters
      const newFilters: ExerciseFilterOptions = { page: 1 };
      
      if (searchQuery) newFilters.search = searchQuery;
      if (muscleGroup) newFilters.muscleGroup = muscleGroup as MuscleGroup;
      if (difficulty) newFilters.difficulty = difficulty as ExerciseDifficulty;
      if (equipment) newFilters.equipment = equipment;
      
      console.log('Applying exercise filters:', newFilters);
      setFilters(newFilters);
    } else {
      // Equipment tab filters
      const newFilters: EquipmentTypes.EquipmentFilterOptions = { page: 1 };
      
      if (searchQuery) newFilters.search = searchQuery;
      if (muscleGroup) newFilters.muscleGroup = muscleGroup as MuscleGroup;
      if (difficulty) newFilters.difficulty = difficulty as ExerciseDifficulty;
      
      console.log('Applying equipment filters:', newFilters);
      setEquipmentFilters(newFilters);
      
      // Force the component to update by triggering a re-render
      setTimeout(() => {
        console.log('Current equipment filters after update:', newFilters);
      }, 0);
    }
  };

  const handleMuscleGroupChange = (event: SelectChangeEvent) => {
    setMuscleGroup(event.target.value);
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value);
  };

  const handleEquipmentChange = (event: SelectChangeEvent) => {
    setEquipment(event.target.value);
  };

  const handleClearFilters = () => {
    // Clear all filter inputs
    setMuscleGroup('');
    setDifficulty('');
    setEquipment('');
    setSearchQuery('');
    
    if (!isEquipmentTab) {
      // Reset exercise filters
      console.log('Clearing exercise filters');
      setFilters({ page: 1 });
      // Use setTimeout to ensure the state update has processed
      setTimeout(() => { 
        setFilters({}); 
        console.log('Exercise filters cleared');
      }, 50);
    } else {
      // Reset equipment filters
      console.log('Clearing equipment filters');
      setEquipmentFilters({ page: 1 });
      // Use setTimeout to ensure the state update has processed
      setTimeout(() => { 
        setEquipmentFilters({}); 
        console.log('Equipment filters cleared');
      }, 50);
    }
  };

  const handleExerciseSelect = (exercise: any) => {
    navigate(`/exercises/${exercise.id}`);
  };

  const handleEquipmentSelect = (equipment: any) => {
    navigate(`/equipment/${equipment.id}`);
  };

  const handleCreateExercise = () => {
    navigate('/exercises/create');
  };

  const mapFiltersForEquipment = () => {
    const mappedFilters: Partial<EquipmentTypes.EquipmentFilterOptions> = {
      search: equipmentFilters.search || searchQuery,
      muscleGroup: equipmentFilters.muscleGroup || (muscleGroup as MuscleGroup),
      difficulty: equipmentFilters.difficulty || (difficulty as ExerciseDifficulty),
      page: equipmentFilters.page || 1,
      limit: equipmentFilters.limit || 12
    };
    
    // Clean up undefined values
    Object.keys(mappedFilters).forEach(key => {
      if (mappedFilters[key as keyof EquipmentTypes.EquipmentFilterOptions] === undefined || 
          mappedFilters[key as keyof EquipmentTypes.EquipmentFilterOptions] === '') {
        delete mappedFilters[key as keyof EquipmentTypes.EquipmentFilterOptions];
      }
    });
    
    console.log('Mapped equipment filters:', mappedFilters);
    return mappedFilters;
  };

  return (
    <PageContainer>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="exercise tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab 
            label="Browse Exercises" 
            id="exercise-tab-0"
            aria-controls="exercise-tabpanel-0"
          />
          <Tab 
            label="Browse Equipment" 
            id="exercise-tab-1"
            aria-controls="exercise-tabpanel-1"
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder={tabValue === 0 ? "Search exercises..." : "Search equipment..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="muscle-group-label">Muscle Group</InputLabel>
                <Select
                  labelId="muscle-group-label"
                  id="muscle-group-select"
                  value={muscleGroup}
                  onChange={handleMuscleGroupChange}
                  label="Muscle Group"
                >
                  <MenuItem value="">All Muscles</MenuItem>
                  {Object.values(MuscleGroup).map((muscle) => (
                    <MenuItem key={muscle} value={muscle}>{muscle}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  id="difficulty-select"
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  label="Difficulty"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {Object.values(ExerciseDifficulty).map((diff) => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSearch}
                size="medium"
              >
                Filter
              </Button>
            </Grid>
            <Grid item xs={6} sm={1}>
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
          <ExerciseList 
            onSelectExercise={handleExerciseSelect}
            selectable={true}
            initialFilters={filters}
            hideFilters={true}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <EquipmentList
            key={`equipment-tab-${JSON.stringify(equipmentFilters)}`}
            onSelectEquipment={handleEquipmentSelect}
            selectable={true}
            initialFilters={mapFiltersForEquipment()}
            hideFilters={true}
            emptyMessage="No equipment found matching your filters. Try adjusting your search criteria."
          />
        </TabPanel>
      </Box>
    </PageContainer>
  );
};

export default ExercisesPage; 