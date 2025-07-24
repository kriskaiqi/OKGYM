import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WorkoutPlan, 
  WorkoutPlanFilterOptions, 
  WorkoutDifficulty, 
  WorkoutCategory, 
  WorkoutSortOption 
} from '../../types/workout';
import { workoutService } from '../../services/workoutService';
import userService from '../../services/userService';
import { 
  Grid, 
  Typography, 
  Box, 
  CircularProgress,
  Pagination,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Button,
  Skeleton,
  styled,
  useTheme,
  alpha,
  Fade,
  Grow,
  Stack,
  InputAdornment
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { 
  FilterAlt as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  FitnessCenterOutlined as WorkoutIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import WorkoutCard from './WorkoutCard';
import { StyledWorkoutCard, WorkoutHeader } from './WorkoutCard.styles';
import { slideUp, fadeIn } from '../../styles/animations';

// Styled components
const FiltersContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  borderRadius: 16,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  '&.MuiChip-outlined': {
    borderWidth: 1.5,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1, 2),
  boxShadow: theme.shadows[2],
  fontWeight: 600,
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
}));

interface WorkoutPlanListProps {
  onSelectWorkout?: (workout: WorkoutPlan) => void;
  onStartWorkout?: (workoutId: string | number) => void;
  onCreateWorkout?: () => void;
  isUserWorkouts?: boolean;
  initialFilters?: WorkoutPlanFilterOptions;
  hideControls?: boolean;
  limit?: number;
  title?: string;
  filterOptions?: Partial<WorkoutPlanFilterOptions>;
  showFilters?: boolean;
  emptyMessage?: string;
}

/**
 * Validate a workout plan object has all required properties
 */
const isValidWorkout = (workout: any): boolean => {
  if (!workout) return false;
  
  // Check if it has an id (essential for React keys)
  if (workout.id === undefined) return false;
  
  // Check for other essential properties
  return (
    typeof workout.name === 'string' &&
    typeof workout.description === 'string' &&
    typeof workout.difficulty === 'string'
  );
};

const WorkoutPlanList: React.FC<WorkoutPlanListProps> = ({ 
  onSelectWorkout, 
  onStartWorkout,
  onCreateWorkout,
  isUserWorkouts = false,
  initialFilters = {},
  hideControls = false,
  limit = 9,
  title = "Workout Plans",
  filterOptions = {},
  showFilters = true,
  emptyMessage = "No workout plans available. Try a different filter or check back later."
}) => {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<WorkoutPlanFilterOptions>({
    page: 1,
    limit,
    sortBy: WorkoutSortOption.POPULARITY,
    sortOrder: 'DESC',
    isCustom: isUserWorkouts,
    ...filterOptions
  });
  const [error, setError] = useState<string | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [favoriteWorkoutIds, setFavoriteWorkoutIds] = useState<Set<string | number>>(new Set());
  const [processingFavorites, setProcessingFavorites] = useState<Set<string | number>>(new Set());
  const [animatingWorkouts, setAnimatingWorkouts] = useState<Record<string | number, { type: 'adding' | 'removing', timestamp: number }>>({});

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.difficulty) count++;
    if (filters.categoryIds?.length) count++;
    if (filters.sortBy && filters.sortBy !== WorkoutSortOption.POPULARITY) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Effect for initialFilters changes from parent component
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
        page: initialFilters.page || prev.page,
        isCustom: isUserWorkouts
      }));
      
      if (initialFilters.search) {
        setSearchValue(initialFilters.search);
      }
    }
  }, [initialFilters, isUserWorkouts]);

  // Simplified single effect to handle all filter changes including isFavorite
  // Helper function to load data (extracted from useEffect)
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Always get the latest favorites first for consistent state
      const favorites = await userService.getFavoriteWorkouts();
      const favoriteIds = new Set(favorites.map(workout => workout.id));
      setFavoriteWorkoutIds(favoriteIds);
      
      let response;
      
      // If we're on the favorites tab, use the favorites directly
      if (filters.isFavorite) {
        let filteredWorkouts = [...favorites];
        
        // Apply filters if specified
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredWorkouts = filteredWorkouts.filter(workout => 
            workout.name?.toLowerCase().includes(searchTerm) || 
            workout.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.categoryIds && filters.categoryIds.length > 0) {
          filteredWorkouts = filteredWorkouts.filter(workout => 
            filters.categoryIds?.includes(Number(workout.workoutCategory))
          );
        }
        
        if (filters.difficulty) {
          filteredWorkouts = filteredWorkouts.filter(workout => 
            workout.difficulty === filters.difficulty
          );
        }
        
        // Apply pagination
        const currentPage = filters.page || 1;
        const startIndex = (currentPage - 1) * (filters.limit || 9);
        const endIndex = startIndex + (filters.limit || 9);
        const paginatedWorkouts = filteredWorkouts.slice(startIndex, endIndex);
        
        // Set workouts with favorite status always true
        setWorkouts(paginatedWorkouts.map(workout => ({
          ...workout,
          isFavorite: true
        })));
        setTotal(filteredWorkouts.length);
        setTotalPages(Math.ceil(filteredWorkouts.length / (filters.limit || 9)));
      } else {
        // For non-favorite tabs, use the standard API
        response = await workoutService.getWorkoutPlans(filters);
        
        if (response.data) {
          const validWorkouts = response.data.filter(isValidWorkout);
          const updatedWorkouts = validWorkouts.map(workout => ({
            ...workout,
            isFavorite: favoriteIds.has(workout.id)
          }));
          
          setWorkouts(updatedWorkouts);
          setTotal(response.total);
          setTotalPages(Math.ceil(response.total / (filters.limit || 9)));
        }
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
      setError('Failed to load workout plans. Please try again later.');
      setWorkouts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, initialFilters?.isFavorite]);

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
    }, 500),
    []
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleDifficultyChange = (e: SelectChangeEvent<string>) => {
    setFilters(prev => ({ 
      ...prev, 
      difficulty: e.target.value as WorkoutDifficulty || undefined,
      page: 1
    }));
  };
  
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setFilters(prev => ({ 
      ...prev, 
      categoryIds: e.target.value ? [parseInt(e.target.value, 10)] : undefined,
      page: 1
    }));
  };
  
  const handleSortChange = (e: SelectChangeEvent<string>) => {
    const parts = (e.target.value || '').split('-');
    const sortBy = parts[0] as WorkoutSortOption | undefined;
    const sortOrder = parts[1] as 'ASC' | 'DESC' | undefined;
    
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      page: 1
    }));
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    // Force the page to be a number
    const newPage = parseInt(String(value), 10);
    
    // Create a completely new filters object
    const newFilters = {
      ...filters,
      page: newPage
    };
    
    // Update the filters state
    setFilters(newFilters);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setFilters({
      page: 1,
      limit,
      sortBy: WorkoutSortOption.POPULARITY,
      sortOrder: 'DESC',
      isCustom: isUserWorkouts,
      ...filterOptions
    });
  };

  const handleToggleFilters = () => {
    setExpandedFilters(!expandedFilters);
  };

  // Get color for difficulty level
  const getDifficultyColor = (difficulty: WorkoutDifficulty) => {
    switch (difficulty) {
      case WorkoutDifficulty.BEGINNER:
        return 'success';
      case WorkoutDifficulty.INTERMEDIATE:
        return 'warning';
      case WorkoutDifficulty.ADVANCED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Get the active filters as chips for display
  const renderActiveFilterChips = () => {
    const activeFilters = [];
    
    if (filters.difficulty) {
      activeFilters.push(
        <FilterChip 
          key="difficulty"
          label={filters.difficulty.toLowerCase().replace('_', ' ')}
          color={getDifficultyColor(filters.difficulty) as any}
          onDelete={() => setFilters(prev => ({ ...prev, difficulty: undefined, page: 1 }))}
        />
      );
    }
    
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // Get category name from the ID
      const categoryId = filters.categoryIds[0];
      const categoryName = Object.values(WorkoutCategory).find(cat => Number(cat) === categoryId) || '';
      
      activeFilters.push(
        <FilterChip 
          key="category"
          label={formatCategoryName(categoryName)}
          color="primary"
          variant="outlined"
          onDelete={() => setFilters(prev => ({ ...prev, categoryIds: undefined, page: 1 }))}
        />
      );
    }
    
    if (filters.search) {
      activeFilters.push(
        <FilterChip 
          key="search"
          label={`"${filters.search}"`}
          icon={<SearchIcon fontSize="small" />}
          onDelete={() => {
            setSearchValue('');
            setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
          }}
        />
      );
    }
    
    return activeFilters;
  };

  const renderSkeletonLoaders = () => {
    return Array.from(new Array(limit)).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Skeleton 
          variant="rectangular" 
          height={320} 
          sx={{ 
            borderRadius: theme.shape.borderRadius * 1.5,
            transform: 'scale(1, 1)' // Fixes the wave animation size
          }} 
        />
      </Grid>
    ));
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (workoutId: string | number, isFavorite: boolean) => {
    // Prevent duplicate requests
    if (processingFavorites.has(workoutId)) return;
    
    try {
      // Update UI immediately for responsive feel
      const newProcessingSet = new Set(processingFavorites);
      newProcessingSet.add(workoutId);
      setProcessingFavorites(newProcessingSet);
      
      // Track animation state
      setAnimatingWorkouts(prev => ({
        ...prev,
        [workoutId]: { 
          type: (isFavorite ? 'adding' : 'removing') as 'adding' | 'removing', 
          timestamp: Date.now() 
        }
      }));
      
      // Update local state
      const newFavoriteIds = new Set(favoriteWorkoutIds);
      if (isFavorite) {
        newFavoriteIds.add(workoutId);
      } else {
        newFavoriteIds.delete(workoutId);
      }
      setFavoriteWorkoutIds(newFavoriteIds);

      // Special handling for removing from favorites tab
      if (!isFavorite && filters.isFavorite) {
        // Immediately remove from display when unfavoriting in the Favorites tab
        // Wait for animation to complete before removing from UI
        setTimeout(() => {
          setWorkouts(workouts.filter(w => w.id !== workoutId));
          setTotal(prev => Math.max(0, prev - 1));
          setTotalPages(Math.ceil((total - 1) / filters.limit!));
        }, 500); // Match the animation duration in WorkoutCard
      } else {
        // Normal update for other tabs
        const updatedWorkouts = workouts.map(workout => 
          workout.id === workoutId 
            ? { ...workout, isFavorite }
            : workout
        );
        setWorkouts(updatedWorkouts);
      }
      
      // Call API
      const success = await userService.toggleFavoriteWorkout(workoutId, isFavorite);
      
      if (success) {
        // Reload favorite IDs to ensure consistency across tabs
        const favorites = await userService.getFavoriteWorkouts();
        const favoriteIds = new Set(favorites.map(workout => workout.id));
        setFavoriteWorkoutIds(favoriteIds);
      } else {
        // Revert changes if API call fails
        const revertedFavoriteIds = new Set(favoriteWorkoutIds);
        if (isFavorite) {
          revertedFavoriteIds.delete(workoutId);
        } else {
          revertedFavoriteIds.add(workoutId);
        }
        setFavoriteWorkoutIds(revertedFavoriteIds);
        
        // Revert UI changes
        if (!isFavorite && filters.isFavorite) {
          // Need to re-add the workout to the display
          loadData(); // Reload the entire list
        } else {
          // Just update the isFavorite flag
          const revertedWorkouts = workouts.map(workout => 
            workout.id === workoutId 
              ? { ...workout, isFavorite: !isFavorite }
              : workout
          );
          setWorkouts(revertedWorkouts);
        }
        
        console.error(`Failed to ${isFavorite ? 'favorite' : 'unfavorite'} workout ${workoutId}`);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      // Remove from processing set after a delay to match animation
      setTimeout(() => {
        const finalProcessingSet = new Set(processingFavorites);
        finalProcessingSet.delete(workoutId);
        setProcessingFavorites(finalProcessingSet);
        
        // Clear animation state after delay
        setAnimatingWorkouts(prev => {
          const updated = { ...prev };
          delete updated[workoutId];
          return updated;
        });
      }, isFavorite ? 800 : 500); // Match animation durations from WorkoutCard
    }
  };

  return (
    <Box>
      {title && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight={600}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <WorkoutIcon color="primary" />
            {title}
            {!loading && (
              <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({total} {total === 1 ? 'plan' : 'plans'})
              </Typography>
            )}
          </Typography>
          
          {onCreateWorkout && (
            <ActionButton
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateWorkout}
            >
              Create Workout
            </ActionButton>
          )}
        </Box>
      )}
      
      {showFilters && (
        <FiltersContainer elevation={0}>
          <Box sx={{ mb: 2 }}>
            <SearchField
              fullWidth
              placeholder="Search workouts..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: searchValue ? (
                  <IconButton size="small" onClick={() => {
                    setSearchValue('');
                    setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
                  }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {activeFiltersCount > 0 && (
                <Stack direction="row" flexWrap="wrap" sx={{ my: 0.5 }}>
                  {renderActiveFilterChips()}
                  
                  {activeFiltersCount > 1 && (
                    <FilterChip 
                      label="Clear All"
                      onClick={handleClearFilters}
                      color="error"
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Stack>
              )}
            </Box>
            
            <Button 
              size="small"
              color="primary"
              onClick={handleToggleFilters}
              endIcon={expandedFilters ? <CollapseIcon /> : <ExpandIcon />}
            >
              {expandedFilters ? 'Less Filters' : 'More Filters'}
            </Button>
          </Box>
          
          <Collapse in={expandedFilters}>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-select-label"
                    label="Difficulty"
                    value={filters.difficulty || ''}
                    onChange={handleDifficultyChange}
                    startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value={WorkoutDifficulty.BEGINNER}>Beginner</MenuItem>
                    <MenuItem value={WorkoutDifficulty.INTERMEDIATE}>Intermediate</MenuItem>
                    <MenuItem value={WorkoutDifficulty.ADVANCED}>Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    label="Category"
                    value={filters.categoryIds?.[0]?.toString() || ''}
                    onChange={handleCategoryChange}
                    startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {Object.values(WorkoutCategory).map(category => (
                      <MenuItem key={category} value={category}>
                        {formatCategoryName(category)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-select-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    label="Sort By"
                    value={`${filters.sortBy || 'popularity'}-${filters.sortOrder || 'DESC'}`}
                    onChange={handleSortChange}
                    startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                  >
                    <MenuItem value="popularity-DESC">Most Popular</MenuItem>
                    <MenuItem value="rating-DESC">Highest Rated</MenuItem>
                    <MenuItem value="createdAt-DESC">Newest</MenuItem>
                    <MenuItem value="createdAt-ASC">Oldest</MenuItem>
                    <MenuItem value="estimatedDuration-ASC">Shortest</MenuItem>
                    <MenuItem value="estimatedDuration-DESC">Longest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </FiltersContainer>
      )}
      
      {loading ? (
        <Grid container spacing={3}>
          {renderSkeletonLoaders()}
        </Grid>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: theme.shape.borderRadius * 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {error}
        </Alert>
      ) : workouts.length === 0 ? (
        <Fade in={true} timeout={500}>
          <EmptyStateContainer>
            <WorkoutIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Workouts Found
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              {emptyMessage}
            </Typography>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
            {onCreateWorkout && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onCreateWorkout}
                sx={{ ml: activeFiltersCount > 0 ? 2 : 0 }}
              >
                Create Your Own
              </Button>
            )}
          </EmptyStateContainer>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {workouts.map((workout, index) => (
            <Grid item xs={12} sm={6} md={hideControls ? 4 : 6} lg={4} key={workout.id || index}>
              <Grow in={true} timeout={300 + index * 100} style={{ transformOrigin: '0 0 0' }}>
                <Box 
                  sx={{
                    // Apply additional transform when animating in favorites tab
                    ...(filters.isFavorite && 
                      animatingWorkouts[workout.id] && 
                      animatingWorkouts[workout.id].type === 'removing' && {
                        animation: `${slideUp} 0.5s ease-out`,
                        opacity: 0,
                        transform: 'translateY(20px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease'
                      })
                  }}
                >
                  <WorkoutCard 
                    workout={workout} 
                    onStartWorkout={onStartWorkout}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Keep the original pagination component at the bottom */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={totalPages} 
            page={parseInt(String(filters.page), 10)} 
            onChange={handlePageChange} 
            color="primary" 
            shape="rounded"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 500,
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default WorkoutPlanList; 