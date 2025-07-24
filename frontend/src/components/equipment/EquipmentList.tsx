import React, { useState, useEffect } from 'react';
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
import EquipmentCard from './EquipmentCard';
import { EquipmentTypes } from '../../types';
import { equipmentService } from '../../services';
import { MuscleGroup, ExerciseDifficulty } from '../../types/exercise';

interface EquipmentListProps {
  onSelectEquipment?: (equipment: EquipmentTypes.Equipment) => void;
  selectable?: boolean;
  maxItems?: number;
  initialFilters?: Partial<EquipmentTypes.EquipmentFilterOptions>;
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

export const EquipmentList: React.FC<EquipmentListProps> = ({
  onSelectEquipment,
  selectable = true,
  maxItems,
  initialFilters = {},
  hideFilters = false,
  emptyMessage = "No equipment found matching your filters. Try adjusting your search criteria."
}) => {
  const [equipment, setEquipment] = useState<EquipmentTypes.Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<EquipmentTypes.EquipmentFilterOptions>({
    page: 1,
    limit: maxItems || 12,
    ...initialFilters
  });
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Helper to stringify filters in a consistent way for comparison
  const stringifyFilters = (filterObj: EquipmentTypes.EquipmentFilterOptions) => {
    const ordered: Record<string, any> = {};
    Object.keys(filterObj).sort().forEach(key => {
      ordered[key] = filterObj[key as keyof EquipmentTypes.EquipmentFilterOptions];
    });
    return JSON.stringify(ordered);
  };

  // Track current filters for dependency comparison
  const filtersRef = React.useRef(stringifyFilters(filters));

  const forceUpdate = () => setForceUpdateKey(prev => prev + 1);

  // Force initial fetch when component mounts
  useEffect(() => {
    console.log('INIT: Component mounted, performing initial data fetch');
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentStringified = stringifyFilters(filters);
    console.log('EFFECT: Checking if filters changed');
    console.log('EFFECT: Previous:', filtersRef.current);
    console.log('EFFECT: Current:', currentStringified);
    
    if (currentStringified !== filtersRef.current) {
      console.log('EFFECT: Filters changed, fetching equipment');
      filtersRef.current = currentStringified;
      fetchEquipment();
    } else {
      console.log('EFFECT: Filters unchanged, skipping fetch');
    }
  }, [filters]);

  useEffect(() => {
    // Only update if initialFilters is provided
    if (initialFilters) {
      console.log('INIT_FILTERS: Processing initial filters:', JSON.stringify(initialFilters));
      
      // Check if all filter values are undefined or empty, indicating a filter reset
      const isFilterReset = Object.keys(initialFilters).length === 0 || 
        (initialFilters.page === 1 && 
         !initialFilters.category && 
         !initialFilters.muscleGroup && 
         !initialFilters.difficulty && 
         !initialFilters.search);
      
      if (isFilterReset) {
        // Complete reset of all filters
        console.log('INIT_FILTERS: Resetting all filters');
        const newFilters = {
          page: 1,
          limit: maxItems || 12
        };
        setFilters(newFilters);
        setSearchQuery('');
        setActiveFilters([]);
        
        // Force fetch after reset
        setTimeout(() => {
          console.log('INIT_FILTERS: Triggering fetch after filter reset');
          fetchEquipment();
        }, 0);
      } else {
        // Update with new filter values
        console.log('INIT_FILTERS: Updating with new filter values');
        setFilters(prev => {
          const updated = {
            ...prev,
            ...initialFilters,
            page: initialFilters.page || 1 // Reset page when filters change
          };
          console.log('INIT_FILTERS: Updated filters:', JSON.stringify(updated));
          return updated;
        });
        
        if (initialFilters.search !== undefined) {
          setSearchQuery(initialFilters.search);
        }
        
        // Update active filters display
        updateActiveFilters(initialFilters);
        
        // Force fetch with new filters
        setTimeout(() => {
          console.log('INIT_FILTERS: Triggering fetch after filter update');
          fetchEquipment();
        }, 0);
      }
    }
  }, [maxItems, JSON.stringify(initialFilters)]); // Use JSON.stringify to properly compare object changes

  const updateActiveFilters = (currentFilters: Partial<EquipmentTypes.EquipmentFilterOptions>) => {
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
    
    if (currentFilters.search) {
      newActiveFilters.push(`Search: ${currentFilters.search}`);
    }
    
    setActiveFilters(newActiveFilters);
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      console.log('FETCH: Starting equipment fetch with filters:', JSON.stringify(filters));
      
      // Add a small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Attempt to fetch data
      const response = await equipmentService.getEquipment(filters);
      console.log('FETCH: API response received:', response);
      
      if (response && response.data) {
        // Log API response
        console.log(`FETCH: Successfully received ${response.data.length} equipment items`);
        
        // Update state with new data
        setEquipment(response.data);
        setTotal(response.count || response.data.length || 0);
        
        console.log('FETCH: Equipment state updated');
      } else {
        console.warn('FETCH: Invalid response from equipment service:', response);
        
        // Attempt a direct API call as fallback for debugging
        console.log('FETCH: Attempting direct API call...');
        try {
          const API_URL = 'http://localhost:3001/api/equipment';
          const params = new URLSearchParams();
          
          // Add filter parameters
          if (filters.page) params.append('page', filters.page.toString());
          if (filters.limit) params.append('limit', filters.limit.toString());
          if (filters.search) params.append('search', filters.search);
          if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup.toString());
          if (filters.difficulty) params.append('difficulty', filters.difficulty.toString());
          if (filters.category) params.append('category', filters.category.toString());
          
          // Add cache-busting parameter
          params.append('_t', Date.now().toString());
          
          const url = `${API_URL}?${params.toString()}`;
          console.log('FETCH: Direct API URL:', url);
          
          const directResponse = await fetch(url);
          const data = await directResponse.json();
          console.log('FETCH: Direct API response:', data);
          
          if (data && (data.data || Array.isArray(data))) {
            const items = data.data || data;
            setEquipment(items);
            setTotal(data.count || items.length || 0);
            console.log('FETCH: Equipment state updated from direct API call');
          } else {
            setEquipment([]);
            setTotal(0);
          }
        } catch (directError) {
          console.error('FETCH: Direct API call failed:', directError);
          setEquipment([]);
          setTotal(0);
        }
      }
    } catch (error) {
      console.error('FETCH: Failed to fetch equipment:', error);
      setEquipment([]);
      setTotal(0);
    } finally {
      console.log('FETCH: Finished fetch operation');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log(`Searching for: "${searchQuery}"`);
    
    // Apply search query and reset to page 1
    const newFilters = { ...filters, search: searchQuery, page: 1 };
    
    // Show loading state briefly to indicate search is being applied
    setLoading(true);
    
    // Update the filters state
    setFilters(newFilters);
    
    // Update active filters display
    updateActiveFilters(newFilters);
    
    console.log(`Applied search filter, new filters:`, newFilters);
  };

  const handleFilterChange = (key: string, value: any) => {
    console.log(`Filter changing: ${key} = ${value}`);
    
    // Create a completely new filters object to avoid state update issues
    const newFilters = { ...filters };
    
    // Set or delete the property based on value
    if (value === '') {
      console.log(`Removing ${key} filter`);
      delete newFilters[key as keyof EquipmentTypes.EquipmentFilterOptions];
    } else {
      console.log(`Setting ${key} filter to ${value}`);
      newFilters[key as keyof EquipmentTypes.EquipmentFilterOptions] = value;
    }
    
    // Always reset to page 1 when filters change
    newFilters.page = 1;
    
    console.log('Current filters:', JSON.stringify(filters));
    console.log('New filters:', JSON.stringify(newFilters));
    
    // Set the new filters state
    setFilters(newFilters);
    console.log('State updated, filters should now be:', JSON.stringify(newFilters));
    
    // Update active filters display
    updateActiveFilters(newFilters);
  };

  const handleRemoveFilter = (filterType: string) => {
    // Extract the filter type from the active filter string
    const type = filterType.split(':')[0].trim().toLowerCase();
    
    let filterKey: keyof EquipmentTypes.EquipmentFilterOptions | null = null;
    
    // Map the filter type to the corresponding filter key
    if (type === 'category') filterKey = 'category';
    else if (type === 'muscle') filterKey = 'muscleGroup';
    else if (type === 'level') filterKey = 'difficulty';
    else if (type === 'search') {
      filterKey = 'search';
      setSearchQuery('');
    }
    
    if (filterKey) {
      // Create a new filters object without the removed filter
      const newFilters = { ...filters, page: 1 };
      
      // Delete the property from the object instead of setting to undefined
      // This ensures the property is completely removed, not just set to undefined
      delete newFilters[filterKey];
      
      console.log(`Removing filter '${filterKey}', new filters:`, newFilters);
      
      // Update the filters state
      setFilters(newFilters);
      
      // Update the active filters display
      updateActiveFilters(newFilters);
    }
  };

  const handleClearAllFilters = () => {
    // Create a new object with only page and limit, discarding all other filters
    const newFilters: EquipmentTypes.EquipmentFilterOptions = {
      page: 1,
      limit: filters.limit || 12
    };
    
    console.log('Clearing all filters:', newFilters);
    
    // Update filters state (useEffect will trigger API call)
    setFilters(newFilters);
    
    // Clear search query
    setSearchQuery('');
    
    // Clear active filters display
    setActiveFilters([]);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters({ ...filters, page });
  };

  const applyAllFilters = () => {
    console.log('FILTER_BTN: Applying all filters with current state...');
    
    // Create a completely new filters object
    const newFilters = { ...filters };
    
    // Add search query if provided
    if (searchQuery && searchQuery.trim() !== '') {
      console.log(`FILTER_BTN: Setting search to "${searchQuery.trim()}"`);
      newFilters.search = searchQuery.trim();
    } else {
      console.log('FILTER_BTN: No search query, removing search filter');
      delete newFilters.search;
    }
    
    // Always reset to page 1
    newFilters.page = 1;
    
    console.log('FILTER_BTN: Current filters:', JSON.stringify(filters));
    console.log('FILTER_BTN: New filters to apply:', JSON.stringify(newFilters));
    
    // First check if there are actual changes to avoid unnecessary updates
    const hasChanges = JSON.stringify(filters) !== JSON.stringify(newFilters);
    console.log('FILTER_BTN: Has filter changes:', hasChanges);
    
    if (hasChanges) {
      // Update filters state (useEffect will trigger API call)
      setFilters(newFilters);
      console.log('FILTER_BTN: Filter state updated');
      
      // Update active filters display
      updateActiveFilters(newFilters);
    } else {
      console.log('FILTER_BTN: No changes to filters, skipping update');
    }
  };

  return (
    <Box sx={{ width: '100%' }} key={`equipment-list-${forceUpdateKey}`}>
      {!hideFilters && (
        <FilterContainer elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FitnessCenterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Equipment Library
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                key={`search-field-${forceUpdateKey}`}
                fullWidth
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSearchQuery('');
                          handleFilterChange('search', '');
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ''}
                  label="Category"
                  onChange={(e) => {
                    console.log('SELECT: Category changed to:', e.target.value);
                    handleFilterChange('category', e.target.value);
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(EquipmentTypes.EquipmentCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Muscle Group</InputLabel>
                <Select
                  value={filters.muscleGroup || ''}
                  label="Muscle Group"
                  onChange={(e) => {
                    console.log('SELECT: Muscle Group changed to:', e.target.value);
                    handleFilterChange('muscleGroup', e.target.value);
                  }}
                >
                  <MenuItem value="">All Muscle Groups</MenuItem>
                  {Object.values(MuscleGroup).map((muscle) => (
                    <MenuItem key={muscle} value={muscle}>
                      {muscle.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filters.difficulty || ''}
                  label="Difficulty"
                  onChange={(e) => {
                    console.log('SELECT: Difficulty changed to:', e.target.value);
                    handleFilterChange('difficulty', e.target.value);
                  }}
                >
                  <MenuItem value="">All Difficulties</MenuItem>
                  {Object.values(ExerciseDifficulty).map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficulty === ExerciseDifficulty.BEGINNER ? 'Beginner' :
                       difficulty === ExerciseDifficulty.INTERMEDIATE ? 'Intermediate' :
                       difficulty === ExerciseDifficulty.ADVANCED ? 'Advanced' : 
                       String(difficulty).replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={() => {
                  console.log('BUTTON: Filter button clicked - applying filters');
                  console.log('BUTTON: Current searchQuery:', searchQuery);
                  console.log('BUTTON: Current filters:', JSON.stringify(filters));
                  applyAllFilters();
                }}
                data-testid="equipment-filter-button"
              >
                Filter
              </Button>
            </Grid>
          </Grid>
          
          {activeFilters.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {activeFilters.map((filter, index) => (
                  <FilterChip
                    key={index}
                    label={filter}
                    onDelete={() => handleRemoveFilter(filter)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
                <FilterChip
                  label="Clear All"
                  onClick={handleClearAllFilters}
                  size="small"
                  color="secondary"
                />
              </Box>
            </Box>
          )}
        </FilterContainer>
      )}
      
      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : equipment.length > 0 ? (
        <Fade in={!loading}>
          <Box>
            <Grid container spacing={3}>
              {equipment.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <EquipmentCard
                    equipment={item}
                    onClick={selectable ? onSelectEquipment : undefined}
                  />
                </Grid>
              ))}
            </Grid>
            
            {total > filters.limit! && (
              <PaginationContainer>
                <Pagination
                  count={Math.ceil(total / filters.limit!)}
                  page={filters.page || 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </PaginationContainer>
            )}
          </Box>
        </Fade>
      ) : (
        <NoResultsContainer>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Equipment Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </NoResultsContainer>
      )}
    </Box>
  );
};

export default EquipmentList; 