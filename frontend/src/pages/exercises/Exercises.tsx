import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  CardActionArea,
  CircularProgress,
  Pagination,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  SelectChangeEvent,
  Paper,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { PageContainer } from '../../components/layout';
import { 
  PageTitle, 
  BodyText, 
  SmallText,
  SectionTitle,
  SubsectionTitle
} from '../../components/ui/Typography';
import { getExerciseImageUrl } from '../../utils/imageUtils';

// Interface for Exercise
interface Exercise {
  id: number;
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  imageUrl?: string;
  videoUrl?: string;
  instructions: string[];
  tags: string[];
}

// Muscle group options
const muscleGroups = [
  { value: 'all', label: 'All Muscle Groups' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'abs', label: 'Abs' },
  { value: 'legs', label: 'Legs' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' }
];

// Equipment options
const equipmentOptions = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Resistance Band',
  'Bench',
  'Stability Ball',
  'Medicine Ball',
  'Foam Roller',
  'TRX'
];

// Difficulty color map
const difficultyColorMap = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error'
};

const Exercises: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from an API
        // For now, simulate API call with mock data
        setTimeout(() => {
          const mockExercises: Exercise[] = [
            {
              id: 1,
              name: 'Bench Press',
              description: 'A compound exercise that primarily targets the chest muscles, as well as the shoulders and triceps.',
              primaryMuscleGroup: 'chest',
              secondaryMuscleGroups: ['shoulders', 'triceps'],
              difficulty: 'intermediate',
              equipment: ['Barbell', 'Bench'],
              imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
              instructions: [
                'Lie flat on a bench with your feet flat on the floor.',
                'Grip the barbell with hands slightly wider than shoulder-width apart.',
                'Unrack the barbell and lower it to your mid-chest.',
                'Press the barbell back up to the starting position.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'push', 'upper body']
            },
            {
              id: 2,
              name: 'Pull-Up',
              description: 'A bodyweight exercise that targets the muscles of the back, particularly the latissimus dorsi.',
              primaryMuscleGroup: 'back',
              secondaryMuscleGroups: ['biceps', 'shoulders'],
              difficulty: 'intermediate',
              equipment: ['Bodyweight'],
              imageUrl: 'https://images.unsplash.com/photo-1598971639058-bb4543a32a50',
              instructions: [
                'Hang from a pull-up bar with hands slightly wider than shoulder-width apart, palms facing away from you.',
                'Pull your body up until your chin is above the bar.',
                'Lower your body back to the starting position under control.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'pull', 'upper body']
            },
            {
              id: 3,
              name: 'Squat',
              description: 'A fundamental compound exercise that targets the quadriceps, hamstrings, and glutes.',
              primaryMuscleGroup: 'legs',
              secondaryMuscleGroups: ['glutes', 'calves', 'abs'],
              difficulty: 'intermediate',
              equipment: ['Barbell', 'Bodyweight'],
              imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
              instructions: [
                'Stand with feet shoulder-width apart, toes slightly pointed out.',
                'Bend at the hips and knees to lower your body as if sitting in a chair.',
                'Lower until thighs are parallel to the ground or slightly below.',
                'Push through your heels to return to the starting position.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'lower body', 'functional']
            },
            {
              id: 4,
              name: 'Shoulder Press',
              description: 'A compound exercise targeting the deltoids, as well as the triceps and upper chest.',
              primaryMuscleGroup: 'shoulders',
              secondaryMuscleGroups: ['triceps', 'chest'],
              difficulty: 'intermediate',
              equipment: ['Barbell', 'Dumbbell'],
              imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
              instructions: [
                'Sit on a bench with back support, holding dumbbells at shoulder height with palms facing forward.',
                'Press the weights up above your head until your arms are fully extended.',
                'Lower the weights back to shoulder height under control.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'push', 'upper body']
            },
            {
              id: 5,
              name: 'Deadlift',
              description: 'A compound exercise that targets multiple muscle groups including the back, legs, and core.',
              primaryMuscleGroup: 'back',
              secondaryMuscleGroups: ['legs', 'glutes', 'forearms'],
              difficulty: 'advanced',
              equipment: ['Barbell'],
              imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2',
              instructions: [
                'Stand with feet hip-width apart, barbell over midfoot.',
                'Bend at hips and knees to grip the bar with hands shoulder-width apart.',
                'Keep back flat and chest up as you lift the bar by extending hips and knees.',
                'Stand up straight with the bar against your thighs.',
                'Return the bar to the ground under control.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'pull', 'full body']
            },
            {
              id: 6,
              name: 'Bicep Curl',
              description: 'An isolation exercise targeting the biceps muscles.',
              primaryMuscleGroup: 'biceps',
              secondaryMuscleGroups: ['forearms'],
              difficulty: 'beginner',
              equipment: ['Dumbbell', 'Barbell'],
              imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
              instructions: [
                'Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing forward.',
                'Keeping elbows close to your sides, curl the weights up toward your shoulders.',
                'Squeeze your biceps at the top of the movement.',
                'Lower the weights back to the starting position under control.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['isolation', 'upper body', 'arms']
            },
            {
              id: 7,
              name: 'Plank',
              description: 'An isometric core exercise that promotes stability and strength.',
              primaryMuscleGroup: 'abs',
              secondaryMuscleGroups: ['shoulders', 'back'],
              difficulty: 'beginner',
              equipment: ['Bodyweight'],
              imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6',
              instructions: [
                'Start in a push-up position, then bend your elbows and rest your weight on your forearms.',
                'Keep your body in a straight line from head to heels.',
                'Engage your core and hold the position.',
                'Hold for the desired amount of time.'
              ],
              tags: ['core', 'isometric', 'bodyweight']
            },
            {
              id: 8,
              name: 'Lateral Raise',
              description: 'An isolation exercise targeting the lateral (side) deltoids.',
              primaryMuscleGroup: 'shoulders',
              secondaryMuscleGroups: [],
              difficulty: 'beginner',
              equipment: ['Dumbbell', 'Cable'],
              imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
              instructions: [
                'Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing in.',
                'Keeping a slight bend in your elbows, raise the weights out to the sides until arms are parallel to the floor.',
                'Pause briefly at the top.',
                'Lower the weights back to the starting position under control.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['isolation', 'upper body', 'shoulders']
            },
            {
              id: 9,
              name: 'Leg Press',
              description: 'A compound exercise targeting the quadriceps, with secondary emphasis on the hamstrings and glutes.',
              primaryMuscleGroup: 'legs',
              secondaryMuscleGroups: ['glutes'],
              difficulty: 'beginner',
              equipment: ['Machine'],
              imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
              instructions: [
                'Sit in the leg press machine with your back against the pad and feet on the platform shoulder-width apart.',
                'Release the safety catches and lower the platform by bending your knees until they form a 90-degree angle.',
                'Push through your heels to extend your legs back to the starting position.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'lower body', 'machine']
            },
            {
              id: 10,
              name: 'Tricep Dip',
              description: 'A bodyweight exercise targeting the triceps, with secondary emphasis on the chest and shoulders.',
              primaryMuscleGroup: 'triceps',
              secondaryMuscleGroups: ['chest', 'shoulders'],
              difficulty: 'intermediate',
              equipment: ['Bodyweight', 'Bench'],
              imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
              instructions: [
                'Sit on the edge of a bench or between parallel bars with hands gripping the edge beside your hips.',
                'Slide your butt off the bench and support your weight with your arms.',
                'Lower your body by bending your elbows until they form a 90-degree angle.',
                'Push back up to the starting position by extending your arms.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['bodyweight', 'upper body', 'arms']
            },
            {
              id: 11,
              name: 'Lunge',
              description: 'A unilateral exercise targeting the quadriceps, hamstrings, and glutes.',
              primaryMuscleGroup: 'legs',
              secondaryMuscleGroups: ['glutes', 'calves'],
              difficulty: 'beginner',
              equipment: ['Bodyweight', 'Dumbbell', 'Barbell'],
              imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
              instructions: [
                'Stand with feet hip-width apart.',
                'Take a step forward with one leg and lower your body until both knees form 90-degree angles.',
                'Push through the heel of your front foot to return to the starting position.',
                'Repeat with the other leg.',
                'Alternate legs for the desired number of repetitions.'
              ],
              tags: ['unilateral', 'lower body', 'functional']
            },
            {
              id: 12,
              name: 'Cable Row',
              description: 'A compound pulling exercise targeting the muscles of the back and arms.',
              primaryMuscleGroup: 'back',
              secondaryMuscleGroups: ['biceps', 'shoulders'],
              difficulty: 'beginner',
              equipment: ['Cable'],
              imageUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2',
              instructions: [
                'Sit at a cable row machine with feet on the platform and knees slightly bent.',
                'Grasp the handle with an overhand grip.',
                'Pull the handle toward your lower abdomen, keeping your back straight and elbows close to your body.',
                'Slowly extend your arms to return to the starting position.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'pull', 'upper body']
            },
            {
              id: 13,
              name: 'Push-Up',
              description: 'A compound bodyweight exercise targeting the chest, shoulders, and triceps.',
              primaryMuscleGroup: 'chest',
              secondaryMuscleGroups: ['shoulders', 'triceps', 'abs'],
              difficulty: 'beginner',
              equipment: ['Bodyweight'],
              imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
              instructions: [
                'Start in a plank position with hands slightly wider than shoulder-width apart.',
                'Keep your body in a straight line from head to heels.',
                'Lower your body by bending your elbows until your chest nearly touches the ground.',
                'Push back up to the starting position by extending your arms.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'push', 'upper body', 'bodyweight']
            },
            {
              id: 14,
              name: 'Russian Twist',
              description: 'A rotational exercise targeting the obliques and core muscles.',
              primaryMuscleGroup: 'abs',
              secondaryMuscleGroups: [],
              difficulty: 'beginner',
              equipment: ['Bodyweight', 'Medicine Ball'],
              imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
              instructions: [
                'Sit on the floor with knees bent and feet flat on the ground.',
                'Lean back slightly to engage your core, lifting your feet off the ground for more challenge (optional).',
                'Hold your hands together in front of you or hold a weight.',
                'Rotate your torso to the right, then to the left, touching the ground beside you with your hands each time.',
                'Each right and left touch counts as one complete repetition.'
              ],
              tags: ['core', 'rotational', 'bodyweight']
            },
            {
              id: 15,
              name: 'Romanian Deadlift',
              description: 'A hip-hinge exercise targeting the hamstrings, glutes, and lower back.',
              primaryMuscleGroup: 'legs',
              secondaryMuscleGroups: ['glutes', 'back'],
              difficulty: 'intermediate',
              equipment: ['Barbell', 'Dumbbell'],
              imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2',
              instructions: [
                'Stand with feet hip-width apart, holding a barbell in front of your thighs with an overhand grip.',
                'Keep your back straight and knees slightly bent.',
                'Hinge at the hips to lower the barbell toward the floor, keeping it close to your legs.',
                'Lower until you feel a stretch in your hamstrings (typically just below the knees).',
                'Return to the starting position by driving your hips forward.',
                'Repeat for the desired number of repetitions.'
              ],
              tags: ['compound', 'hinge', 'lower body']
            }
          ];
          
          setExercises(mockExercises);
          setFilteredExercises(mockExercises);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Apply filters when criteria change
  useEffect(() => {
    if (!exercises.length) return;

    let filtered = [...exercises];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(term) || 
        exercise.description.toLowerCase().includes(term) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply muscle group filter
    if (muscleGroupFilter !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.primaryMuscleGroup === muscleGroupFilter || 
        exercise.secondaryMuscleGroups.includes(muscleGroupFilter)
      );
    }

    // Apply equipment filter
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(exercise => 
        selectedEquipment.some(equip => exercise.equipment.includes(equip))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === difficultyFilter);
    }

    // Tab filters (0 = All, 1 = Strength, 2 = Bodyweight)
    if (tabValue === 1) {
      filtered = filtered.filter(exercise => 
        !exercise.equipment.includes('Bodyweight') || exercise.equipment.length > 1
      );
    } else if (tabValue === 2) {
      filtered = filtered.filter(exercise => 
        exercise.equipment.includes('Bodyweight') && exercise.equipment.length === 1
      );
    }

    setFilteredExercises(filtered);
    setPage(1); // Reset to first page on filter change
  }, [exercises, searchTerm, muscleGroupFilter, selectedEquipment, difficultyFilter, tabValue]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle muscle group filter change
  const handleMuscleGroupChange = (event: SelectChangeEvent) => {
    setMuscleGroupFilter(event.target.value);
  };

  // Handle equipment filter change
  const handleEquipmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    
    setSelectedEquipment(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle difficulty filter change
  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficultyFilter(event.target.value);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Navigate to exercise detail page
  const handleExerciseClick = (id: number) => {
    navigate(`/exercises/${id}`);
  };

  // Get paginated exercises
  const getPaginatedExercises = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredExercises.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredExercises.length / pageSize);

  return (
    <PageContainer>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="exercise type tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="All Exercises" />
          <Tab label="Strength Exercises" />
          <Tab label="Bodyweight Exercises" />
        </Tabs>

        {/* Search and Filters */}
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
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={handleSearchChange}
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
                  value={muscleGroupFilter}
                  label="Muscle Group"
                  onChange={handleMuscleGroupChange}
                >
                  {muscleGroups.map(group => (
                    <MenuItem key={group.value} value={group.value}>
                      {group.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  value={difficultyFilter}
                  label="Difficulty"
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value="all">All Difficulties</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => {
                  // Apply all filters at once
                  // Already handled by useEffect
                }}
                size="medium"
              >
                Filter
              </Button>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => {
                  setSearchTerm('');
                  setMuscleGroupFilter('all');
                  setSelectedEquipment([]);
                  setDifficultyFilter('all');
                }}
                size="medium"
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Equipment checkboxes */}
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
          <SectionTitle variant="subtitle1" gutterBottom>
            Equipment
          </SectionTitle>
          <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {equipmentOptions.map(equipment => (
              <FormControlLabel
                key={equipment}
                control={
                  <Checkbox 
                    checked={selectedEquipment.includes(equipment)} 
                    onChange={handleEquipmentChange}
                    name={equipment}
                  />
                }
                label={equipment}
                sx={{ width: { xs: '50%', sm: '33.33%', md: '25%' } }}
              />
            ))}
          </FormGroup>
        </Paper>

        {/* Exercise Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredExercises.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SectionTitle color="text.secondary" gutterBottom>
              No exercises found
            </SectionTitle>
            <BodyText color="text.secondary">
              Try adjusting your search or filters to find exercises.
            </BodyText>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <SmallText color="text.secondary">
                {filteredExercises.length} exercises found
              </SmallText>
            </Box>
            
            <Grid container spacing={3}>
              {getPaginatedExercises().map(exercise => (
                <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                  <Card 
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea onClick={() => handleExerciseClick(exercise.id)}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={getExerciseImageUrl(exercise.imageUrl)}
                        alt={exercise.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <SubsectionTitle component="h2" gutterBottom>
                          {exercise.name}
                        </SubsectionTitle>
                        
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            size="small"
                            label={exercise.primaryMuscleGroup.charAt(0).toUpperCase() + exercise.primaryMuscleGroup.slice(1)}
                            color="primary"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                          <Chip
                            size="small"
                            label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                            color={difficultyColorMap[exercise.difficulty] as 'success' | 'warning' | 'error'}
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        </Box>
                        
                        <SmallText color="text.secondary" sx={{ mb: 1.5, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {exercise.description.length > 80
                            ? `${exercise.description.substring(0, 80)}...`
                            : exercise.description}
                        </SmallText>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {exercise.equipment.map((equip, index) => (
                            <Chip
                              key={index}
                              label={equip}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default Exercises; 