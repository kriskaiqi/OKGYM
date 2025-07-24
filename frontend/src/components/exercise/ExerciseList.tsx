import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseFilterOptions, ExerciseCategory, ExerciseDifficulty, MuscleGroup } from '../../types/exercise';
import { exerciseService } from '../../services';
import { 
  Box, 
  Grid, 
  TextField, 
  InputAdornment, 
  IconButton,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider, 
  Typography, 
  Button, 
  Chip,
  CircularProgress,
  Pagination,
  Fade,
  SelectChangeEvent,
  styled,
  alpha,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  Clear as ClearIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';
import ExerciseCard from './ExerciseCard';

interface ExerciseListProps {
  onSelectExercise?: (exercise: Exercise) => void;
  selectable?: boolean;
  maxItems?: number;
  initialFilters?: Partial<ExerciseFilterOptions>;
  hideFilters?: boolean;
  emptyMessage?: string;
}

// Styled components
const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '& .MuiChip-deleteIcon': {
    color: alpha(theme.palette.primary.main, 0.7),
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderRadius: theme.shape.borderRadius * 1.5,
  marginTop: theme.spacing(2),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(6),
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3, 0),
}));

export const ExerciseList: React.FC<ExerciseListProps> = ({
  onSelectExercise,
  selectable = true,
  maxItems,
  initialFilters = {},
  hideFilters = false,
  emptyMessage = "No exercises found matching your filters. Try adjusting your search criteria."
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ExerciseFilterOptions>({
    page: 1,
    limit: maxItems || 12,
    ...initialFilters
  });
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchExercises();
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    // Only update if initialFilters is provided
    if (initialFilters) {
      // Check if all filter values are undefined or empty, indicating a filter reset
      const isFilterReset = Object.keys(initialFilters).length === 0 || 
        (initialFilters.page === 1 && 
         !initialFilters.category && 
         !initialFilters.muscleGroup && 
         !initialFilters.difficulty && 
         !initialFilters.equipment && 
         !initialFilters.search);
      
      if (isFilterReset) {
        // Complete reset of all filters
        setFilters({
          page: 1,
          limit: maxItems || 12
        });
        setSearchQuery('');
        setActiveFilters([]);
      } else {
        // Update with new filter values
        setFilters(prev => ({
          ...prev,
          ...initialFilters,
          page: initialFilters.page || 1 // Reset page when filters change
        }));
        
        if (initialFilters.search !== undefined) {
          setSearchQuery(initialFilters.search);
        }
        
        // Update active filters display
        updateActiveFilters(initialFilters);
      }
    }
  }, [maxItems, JSON.stringify(initialFilters)]); // Use JSON.stringify to properly compare object changes

  const updateActiveFilters = (currentFilters: Partial<ExerciseFilterOptions>) => {
    const newActiveFilters: string[] = [];
    
    if (currentFilters.category) {
      newActiveFilters.push(`Category: ${currentFilters.category}`);
    }
    
    if (currentFilters.muscleGroup) {
      newActiveFilters.push(`Muscle: ${currentFilters.muscleGroup}`);
    }
    
    if (currentFilters.difficulty) {
      newActiveFilters.push(`Level: ${currentFilters.difficulty}`);
    }
    
    if (currentFilters.equipment) {
      newActiveFilters.push(`Equipment: ${currentFilters.equipment}`);
    }
    
    if (currentFilters.search) {
      newActiveFilters.push(`Search: ${currentFilters.search}`);
    }
    
    setActiveFilters(newActiveFilters);
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      console.log('Fetching exercises with filters:', filters);
      const response = await exerciseService.getExercises(filters);
      
      if (response && response.data) {
        console.log(`Received ${response.data.length} exercises:`, response.data);
        setExercises(response.data);
        setTotal(response.count || response.data.length || 0);
      } else {
        console.warn('Invalid response from exercise service:', response);
        setExercises([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchQuery, page: 1 };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleRemoveFilter = (filterType: string) => {
    // Extract the filter type from the active filter string
    const type = filterType.split(':')[0].trim().toLowerCase();
    
    let filterKey: keyof ExerciseFilterOptions | null = null;
    
    // Map the filter type to the corresponding filter key
    if (type === 'category') filterKey = 'category';
    else if (type === 'muscle') filterKey = 'muscleGroup';
    else if (type === 'level') filterKey = 'difficulty';
    else if (type === 'equipment') filterKey = 'equipment';
    else if (type === 'search') {
      filterKey = 'search';
      setSearchQuery('');
    }
    
    if (filterKey) {
      const newFilters = { ...filters, [filterKey]: undefined, page: 1 };
      setFilters(newFilters);
      updateActiveFilters(newFilters);
    }
  };

  const handleClearAllFilters = () => {
    const newFilters = {
      page: 1,
      limit: filters.limit
    };
    setFilters(newFilters);
    setSearchQuery('');
    setActiveFilters([]);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!hideFilters && (
        <FilterContainer elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FitnessCenterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Exercise Library
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search exercises"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end" 
                        onClick={handleSearch}
                        size="small"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={filters.category || ''}
                  label="Category"
                  onChange={(e: SelectChangeEvent) => 
                    handleFilterChange('category', e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(ExerciseCategory).map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="muscle-group-label">Muscle Group</InputLabel>
                <Select
                  labelId="muscle-group-label"
                  id="muscle-group-select"
                  value={filters.muscleGroup || ''}
                  label="Muscle Group"
                  onChange={(e: SelectChangeEvent) => 
                    handleFilterChange('muscleGroup', e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All Muscles</MenuItem>
                  {Object.values(MuscleGroup).map((muscle) => (
                    <MenuItem key={muscle} value={muscle}>{muscle}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  id="difficulty-select"
                  value={filters.difficulty || ''}
                  label="Difficulty"
                  onChange={(e: SelectChangeEvent) => 
                    handleFilterChange('difficulty', e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {Object.values(ExerciseDifficulty).map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<FilterIcon />}
                  onClick={handleSearch}
                  fullWidth
                  size="medium"
                >
                  Filter
                </Button>
                
                <Button 
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearAllFilters}
                  size="medium"
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {activeFilters.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, mt: 0.5 }}>
                Active filters:
              </Typography>
              {activeFilters.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  onDelete={() => handleRemoveFilter(filter)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          )}
        </FilterContainer>
      )}

      {loading ? (
        <LoadingContainer>
          <CircularProgress size={40} />
        </LoadingContainer>
      ) : exercises.length === 0 ? (
        <NoResultsContainer>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
        </NoResultsContainer>
      ) : (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {exercises.map((exercise) => (
              <Grid item key={exercise.id} xs={12} sm={6} md={4} lg={3}>
                <ExerciseCard 
                  exercise={exercise} 
                  onClick={selectable ? onSelectExercise : undefined} 
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {total > (filters.limit || 0) && (
        <PaginationContainer>
          <Pagination
            count={Math.ceil(total / (filters.limit || 12))}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </PaginationContainer>
      )}
    </Box>
  );
};

export default ExerciseList; 