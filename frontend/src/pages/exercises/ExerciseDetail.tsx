import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import CheckIcon from '@mui/icons-material/Check';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ExerciseDifficulty, MuscleGroup } from '../../types/exercise';
import { getExerciseImageUrl, getVideoUrl } from '../../utils/imageUtils';

// Interface for Media
interface Media {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  entityType?: string;
  entityStringId?: string;
}

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
  media?: Media[];
  instructions: string[];
  tags: string[];
  tips?: string[];
  variations?: string[];
  relatedExercises?: number[];
}

// Utility function to convert string difficulty to enum
const getDifficultyEnum = (difficulty: string): ExerciseDifficulty => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return ExerciseDifficulty.BEGINNER;
    case 'intermediate':
      return ExerciseDifficulty.INTERMEDIATE;
    case 'advanced':
      return ExerciseDifficulty.ADVANCED;
    default:
      return ExerciseDifficulty.BEGINNER;
  }
};

// Difficulty color map
const difficultyColorMap: Record<string, string> = {
  'beginner': 'success',
  'intermediate': 'warning',
  'advanced': 'error',
  [ExerciseDifficulty.BEGINNER]: 'success',
  [ExerciseDifficulty.INTERMEDIATE]: 'warning',
  [ExerciseDifficulty.ADVANCED]: 'error'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ExerciseDetail: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch exercise details
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, simulate with setTimeout
        setTimeout(() => {
          // Mock exercise data
          const mockExercise: Exercise = {
            id: Number(exerciseId),
            name: exerciseId === '1' ? 'Bench Press' : 
                  exerciseId === '2' ? 'Pull-Up' : 
                  exerciseId === '3' ? 'Squat' : 'Exercise',
            description: exerciseId === '1' ? 
              'A compound exercise that primarily targets the chest muscles, as well as the shoulders and triceps.' : 
              exerciseId === '2' ? 
              'A bodyweight exercise that targets the muscles of the back, particularly the latissimus dorsi.' : 
              exerciseId === '3' ? 
              'A fundamental compound exercise that targets the quadriceps, hamstrings, and glutes.' : 
              'Exercise description.',
            primaryMuscleGroup: exerciseId === '1' ? 'chest' : 
                               exerciseId === '2' ? 'back' : 
                               exerciseId === '3' ? 'legs' : 'chest',
            secondaryMuscleGroups: exerciseId === '1' ? ['shoulders', 'triceps'] : 
                                   exerciseId === '2' ? ['biceps', 'shoulders'] : 
                                   exerciseId === '3' ? ['glutes', 'calves', 'abs'] : [],
            difficulty: exerciseId === '1' ? 'intermediate' : 
                        exerciseId === '2' ? 'intermediate' : 
                        exerciseId === '3' ? 'intermediate' : 'beginner',
            equipment: exerciseId === '1' ? ['Barbell', 'Bench'] : 
                       exerciseId === '2' ? ['Bodyweight'] : 
                       exerciseId === '3' ? ['Barbell', 'Bodyweight'] : [],
            imageUrl: exerciseId === '1' ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' : 
                     exerciseId === '2' ? 'https://images.unsplash.com/photo-1598971639058-bb4543a32a50' : 
                     exerciseId === '3' ? 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a' : undefined,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            // Add mock media array
            media: [
              {
                id: '1',
                type: 'IMAGE',
                url: exerciseId === '1' ? '/static/images/exercises/bench-press.jpg' : 
                      exerciseId === '2' ? '/static/images/exercises/pull-up.jpg' : 
                      exerciseId === '3' ? '/static/images/exercises/squat.jpg' : 
                      '/static/images/exercises/placeholder.jpg',
                isPrimary: true,
                displayOrder: 1
              },
              {
                id: '2',
                type: 'VIDEO',
                url: 'https://example.com/videos/exercise-demo.mp4',
                thumbnailUrl: 'https://example.com/videos/exercise-thumbnail.jpg',
                isPrimary: true,
                displayOrder: 1
              }
            ],
            instructions: exerciseId === '1' ? [
              'Lie flat on a bench with your feet flat on the floor.',
              'Grip the barbell with hands slightly wider than shoulder-width apart.',
              'Unrack the barbell and lower it to your mid-chest.',
              'Press the barbell back up to the starting position.',
              'Repeat for the desired number of repetitions.'
            ] : exerciseId === '2' ? [
              'Hang from a pull-up bar with hands slightly wider than shoulder-width apart, palms facing away from you.',
              'Pull your body up until your chin is above the bar.',
              'Lower your body back to the starting position under control.',
              'Repeat for the desired number of repetitions.'
            ] : exerciseId === '3' ? [
              'Stand with feet shoulder-width apart, toes slightly pointed out.',
              'Bend at the hips and knees to lower your body as if sitting in a chair.',
              'Lower until thighs are parallel to the ground or slightly below.',
              'Push through your heels to return to the starting position.',
              'Repeat for the desired number of repetitions.'
            ] : ['Step 1', 'Step 2', 'Step 3'],
            tags: exerciseId === '1' ? ['compound', 'push', 'upper body'] : 
                 exerciseId === '2' ? ['compound', 'pull', 'upper body'] : 
                 exerciseId === '3' ? ['compound', 'lower body', 'functional'] : [],
            tips: [
              'Keep your feet flat on the ground throughout the movement.',
              'Maintain a neutral spine position.',
              'Focus on controlled movements rather than lifting heavy weights with poor form.',
              'Breathe out as you exert effort (pushing the weight up) and breathe in as you lower the weight.'
            ],
            variations: [
              'Incline Bench Press',
              'Decline Bench Press',
              'Close-Grip Bench Press',
              'Dumbbell Bench Press'
            ],
            relatedExercises: exerciseId === '1' ? [4, 6, 13] : 
                             exerciseId === '2' ? [5, 12] : 
                             exerciseId === '3' ? [9, 11, 15] : []
          };

          // Mock related exercises
          const mockRelatedExercises: Exercise[] = [
            {
              id: 4,
              name: 'Shoulder Press',
              description: 'A compound exercise targeting the deltoids, as well as the triceps and upper chest.',
              primaryMuscleGroup: 'shoulders',
              secondaryMuscleGroups: ['triceps', 'chest'],
              difficulty: 'intermediate',
              equipment: ['Barbell', 'Dumbbell'],
              imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'push', 'upper body'],
              media: [
                {
                  id: '3',
                  type: 'IMAGE',
                  url: '/static/images/exercises/shoulder-press.jpg',
                  isPrimary: true,
                  displayOrder: 1
                }
              ]
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['isolation', 'upper body', 'arms']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'push', 'upper body', 'bodyweight']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'pull', 'full body']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'pull', 'upper body']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'lower body', 'machine']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['unilateral', 'lower body', 'functional']
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
              instructions: ['Instruction 1', 'Instruction 2'],
              tags: ['compound', 'hinge', 'lower body']
            }
          ];

          setExercise(mockExercise);
          
          // Filter related exercises based on the current exercise
          if (mockExercise.relatedExercises && mockExercise.relatedExercises.length > 0) {
            const filtered = mockRelatedExercises.filter(
              ex => mockExercise.relatedExercises?.includes(ex.id)
            );
            setRelatedExercises(filtered);
          }
          
          setLoading(false);
          
          // Debug info
          console.log('Successfully loaded exercise:', mockExercise.name);
          console.log('Exercise equipment data:', { 
            equipment: mockExercise.equipment, 
            equipmentType: typeof mockExercise.equipment,
            hasEquipment: mockExercise.equipment && mockExercise.equipment.length > 0,
            hasLength: !!(mockExercise.equipment?.length) 
          });
        }, 1000);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exerciseId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle save/bookmark
  const handleToggleSave = () => {
    setSaved(!saved);
    // In a real app, you would save this to user preferences
  };

  // Navigate back to exercises list
  const handleBack = () => {
    navigate('/exercises');
  };

  // Navigate to a related exercise
  const handleRelatedExerciseClick = (id: number) => {
    navigate(`/exercises/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!exercise) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Exercise Not Found</Typography>
          <Typography paragraph>
            Sorry, we couldn't find the exercise you're looking for.
          </Typography>
          <Button variant="contained" onClick={handleBack}>
            Back to Exercises
          </Button>
        </Paper>
      </Container>
    );
  }

  // Convert string difficulty to EnumDifficulty for linter compatibility
  const difficultyEnum = getDifficultyEnum(exercise.difficulty);
  
  // Debug values to see where errors might be occurring
  console.log('DETAILED EQUIPMENT DEBUG:', { 
    rawEquipment: exercise.equipment, 
    rawEquipmentJSON: JSON.stringify(exercise.equipment),
    equipmentType: typeof exercise.equipment,
    isArray: Array.isArray(exercise.equipment),
    hasLength: !!(exercise.equipment?.length)
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>
          Exercises
        </Link>
        <Typography color="text.primary">{exercise.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {exercise.name}
          </Typography>
        </Box>
        <Tooltip title={saved ? "Remove from Saved" : "Save Exercise"}>
          <IconButton onClick={handleToggleSave} color={saved ? "primary" : "default"}>
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Exercise Image/Video */}
          <Card sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            {exercise.videoUrl ? (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={getExerciseImageUrl(exercise.name, exercise.media, exercise.id.toString())}
                  alt={exercise.name}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    console.error(`Failed to load image for exercise: ${exercise.name}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "/static/images/exercises/placeholder.jpg";
                    // Apply fallback styling
                    Object.assign(target.style, {
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    });
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <IconButton
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                    }}
                    size="large"
                    onClick={() => window.open(exercise.videoUrl, '_blank')}
                  >
                    <PlayCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <CardMedia
                component="img"
                height="400"
                image={getExerciseImageUrl(exercise.name, exercise.media, exercise.id.toString())}
                alt={exercise.name}
                sx={{ objectFit: 'cover' }}
                onError={(e) => {
                  console.error(`Failed to load image for exercise: ${exercise.name}`);
                  const target = e.target as HTMLImageElement;
                  target.src = "/static/images/exercises/placeholder.jpg";
                  // Apply fallback styling
                  Object.assign(target.style, {
                    backgroundColor: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  });
                }}
              />
            )}
            <CardContent>
              <Typography variant="body1">{exercise.description}</Typography>
            </CardContent>
          </Card>

          {/* Tabs for Instructions, Tips, and Variations */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="exercise information tabs">
                <Tab label="Instructions" />
                <Tab label="Tips" />
                <Tab label="Variations" />
              </Tabs>
            </Box>
            
            {/* Instructions Tab */}
            <TabPanel value={tabValue} index={0}>
              <List>
                {exercise.instructions.map((instruction, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={instruction} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            
            {/* Tips Tab */}
            <TabPanel value={tabValue} index={1}>
              <List>
                {exercise.tips?.map((tip, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            
            {/* Variations Tab */}
            <TabPanel value={tabValue} index={2}>
              <List>
                {exercise.variations?.map((variation, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <SportsMartialArtsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={variation} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Exercise Details Card */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Exercise Details</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Difficulty
              </Typography>
              <Chip
                label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                color={(difficultyColorMap[difficultyEnum] || 'default') as 'success' | 'warning' | 'error' | 'default'}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Primary Muscle Group
              </Typography>
              <Chip
                label={exercise.primaryMuscleGroup.charAt(0).toUpperCase() + exercise.primaryMuscleGroup.slice(1)}
                color="primary"
                icon={<FitnessCenterIcon />}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Secondary Muscle Groups
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {exercise.secondaryMuscleGroups.map((muscle, index) => (
                  <Chip
                    key={index}
                    label={muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {exercise.secondaryMuscleGroups.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    None
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Equipment
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {exercise.equipment.map((equipment, index) => (
                  <Chip
                    key={index}
                    label={equipment}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {exercise.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Related Exercises */}
          {relatedExercises.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Related Exercises</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {relatedExercises.map((relatedExercise) => {
                  // Convert difficulty string to enum for each related exercise
                  const relatedDifficultyEnum = getDifficultyEnum(relatedExercise.difficulty);
                  
                  return (
                    <React.Fragment key={relatedExercise.id}>
                      <ListItem 
                        button 
                        onClick={() => handleRelatedExerciseClick(relatedExercise.id)}
                        sx={{ 
                          px: 1, 
                          borderRadius: 1,
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={getExerciseImageUrl(relatedExercise.name, relatedExercise.media, relatedExercise.id.toString())}
                          alt={relatedExercise.name}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: 1, 
                            objectFit: 'cover',
                            mr: 2
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/static/images/exercises/placeholder.jpg";
                          }}
                        />
                        <ListItemText 
                          primary={relatedExercise.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <FitnessCenterIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                {relatedExercise.primaryMuscleGroup.charAt(0).toUpperCase() + relatedExercise.primaryMuscleGroup.slice(1)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExerciseDetail; 