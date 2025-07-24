import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Typography,
  Box, 
  Grid, 
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  Rating,
  CircularProgress,
  Paper,
  Alert,
  List,
  ListItem,
  CardMedia
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InfoIcon from '@mui/icons-material/Info';
import FlagIcon from '@mui/icons-material/Flag';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  StyledCard,
  ExerciseImage,
  DifficultyChip,
  StepItem,
  StepNumber,
  RatingContainer,
  MuscleChip,
  EquipmentChip,
  EquipmentContainer,
  StatValue,
  MetadataItem,
  SetupItem,
  KeyPointItem,
  SafetyTipItem,
  BenefitItem,
  fadeInAnimation
} from './ExerciseDetail.styles';
import { exerciseService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types/exercise';
import { CardSkeleton } from '../../components/common/CardSkeleton';
import VideoPlayer from '../video/VideoPlayer';
import RelatedExercises from './RelatedExercises';
import ErrorBoundary from '../common/ErrorBoundary';
import { formatArrayOrString } from '../../utils/formatters';
import { getExerciseImageUrl, getVideoUrl } from '../../utils/imageUtils';
import axios from 'axios';
import { alpha } from '@mui/material/styles';

// Tab panel component for tab content
const TabPanel = (props: { children?: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`exercise-tabpanel-${index}`}
      aria-labelledby={`exercise-tab-${index}`}
      {...other}
      sx={{ py: 3 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

interface ExerciseDetailProps {
  exerciseId?: string;
  onBackClick?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exerciseId,
  onBackClick,
  onLoadingChange,
  onError,
  onAddToWorkout
}) => {
  const { id } = useParams<{ id: string }>();
  const actualId = exerciseId || id;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [equipmentNames, setEquipmentNames] = useState<{[key: string]: string}>({});
  const [videoExpanded, setVideoExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!actualId) return;
      
      // Only prevent refetching if we already have exactly this exercise loaded
      if (exercise && exercise.id === actualId) return;
      
    try {
      setLoading(true);
        if (onLoadingChange) onLoadingChange(true);
        
        // Fetch real exercise data from the API
        const exerciseData = await exerciseService.getExerciseById(actualId);
        
        if (exerciseData) {
          console.log("Successfully loaded exercise:", exerciseData.name);
          console.log("Exercise equipment data:", {
            equipment: exerciseData.equipment,
            equipmentType: exerciseData.equipment ? typeof exerciseData.equipment : 'undefined',
            hasEquipment: !!exerciseData.equipment,
            hasLength: exerciseData.equipment ? exerciseData.equipment.length > 0 : false
          });
          
      setExercise(exerciseData);

          // Fetch equipment details if exercise has equipment IDs
          if (exerciseData.equipment && exerciseData.equipment.length > 0) {
            fetchEquipmentDetails(exerciseData.equipment);
          }
          
          // Skip fetching related exercises since it's causing 500 errors
          setAlternatives([]);
        } else {
          setError("Exercise not found");
        }
        
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
    } catch (error) {
        console.error("Error fetching exercise:", error);
        setError("Failed to load exercise");
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        if (onError) onError("Failed to load exercise");
      }
    };
    
    // Use a ref to prevent duplicate fetches for the same id
    const controller = new AbortController();
    fetchExerciseDetails();
    
    return () => {
      controller.abort(); // Clean up any pending requests
    };
  // Only depend on actualId - the check inside the function prevents redundant fetches
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualId]);

  // Function to fetch equipment details by ID
  const fetchEquipmentDetails = async (equipmentIds: string[] | string | any[] | any) => {
    try {
      // For debugging - log the exact IDs we're trying to fetch
      console.log('Raw equipment data received:', equipmentIds);
      
      // Check if we have valid equipment IDs first
      if (!equipmentIds || (Array.isArray(equipmentIds) && equipmentIds.length === 0)) {
        console.log('No equipment IDs to fetch');
        
        // Try direct query to check the exercise-equipment mapping
        try {
          console.log('Attempting to query exercise-equipment mapping directly');
          // Update the URL to match the new backend API endpoint
          const mappingResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/exercises/${actualId}/equipment`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          console.log('Exercise-equipment mapping response:', mappingResponse.data);
          
          if (mappingResponse.data && mappingResponse.data.data && mappingResponse.data.data.equipment) {
            const equipmentMap: {[key: string]: string} = {};
            
            // Process the equipment data from the direct query
            mappingResponse.data.data.equipment.forEach((item: any) => {
              if (item.id && item.name) {
                equipmentMap[item.id] = item.name;
              }
            });
            
            setEquipmentNames(equipmentMap);
          }
        } catch (mappingError) {
          console.error('Error fetching exercise-equipment mapping:', mappingError);
        }
        
        return;
      }
      
      // Extract IDs properly regardless of input format
      // If array, map through and extract IDs if items are objects
      const extractedIds = Array.isArray(equipmentIds) 
        ? equipmentIds.map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.id; // Extract ID from object
            }
            return item; // Already a string ID
          }).filter(id => id && typeof id === 'string') // Filter out any null/undefined/non-string IDs
        : typeof equipmentIds === 'object' && equipmentIds !== null
          ? equipmentIds.id // Single object, extract ID
          : equipmentIds;   // Already a string ID or something else
      
      console.log('Extracted equipment IDs:', extractedIds);
      
      // Continue with original implementation for when we have equipment IDs
      // Convert to array if it's not already
      const ids = Array.isArray(extractedIds) ? extractedIds : [extractedIds];
      
      // Create a map to store equipment names
      const equipmentMap: {[key: string]: string} = {};
      
      // Fetch equipment details for each ID
      const promises = ids.map(async (id) => {
        try {
          if (!id || typeof id !== 'string') {
            console.warn('Invalid equipment ID, skipping:', id);
            return;
          }
          
          const equipment = await exerciseService.getEquipmentById(id);
          if (equipment) {
            equipmentMap[id] = equipment.name || 'Unknown Equipment';
          }
        } catch (error) {
          console.error(`Error fetching equipment ${id}:`, error);
        }
      });
      
      await Promise.all(promises);
      
      // Remove the fallback that fetches all equipment
      // If we couldn't get any equipment names, we'll just display "No equipment required"
      // instead of showing all possible equipment
      
      setEquipmentNames(equipmentMap);
    } catch (error) {
      console.error("Error fetching equipment details:", error);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log(`Toggle favorite for exercise ${actualId}: ${!isFavorite}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleStartWorkout = () => {
    if (!exercise) return;
    
    if (onAddToWorkout) {
      onAddToWorkout(exercise);
    } else {
      console.log(`Start workout with exercise ${exercise.id}`);
      navigate(`/workout-sessions/new?exerciseId=${exercise.id}`);
    }
  };

  // Format rating distribution data for visual display
  const formatRatingDistribution = (distribution?: Record<string, number>) => {
    if (!distribution) return [];
    
    return Object.entries(distribution)
      .map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: 0 // Will calculate below
      }))
      .sort((a, b) => b.rating - a.rating);
  };
  
  // Toggle video visibility
  const toggleVideo = () => {
    setVideoExpanded(!videoExpanded);
  };
  
  if (loading) {
    return (
      <Box my={4}>
        <CardSkeleton height={600} />
      </Box>
    );
  }
  
  if (error || !exercise) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">{error || 'Exercise not found'}</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Calculate primary muscle group
  const primaryMuscleGroup = exercise.muscleGroups?.[0] || null;
  
  // Process equipment data for display with better normalization
  const processedEquipment = exercise.equipment 
    ? Array.isArray(exercise.equipment) 
      ? exercise.equipment.length > 0
        ? formatArrayOrString(exercise.equipment)
        : []
      : typeof exercise.equipment === 'string'
        ? [exercise.equipment]
        : []
    : [];
  
  // Much more detailed debug logging to diagnose the issue
  console.log('DETAILED EQUIPMENT DEBUG:', {
    rawEquipment: exercise.equipment,
    rawEquipmentJSON: JSON.stringify(exercise.equipment),
    equipmentType: exercise.equipment ? typeof exercise.equipment : 'undefined',
    isArray: Array.isArray(exercise.equipment),
    hasLength: exercise.equipment && Array.isArray(exercise.equipment) ? exercise.equipment.length > 0 : false,
    firstItem: Array.isArray(exercise.equipment) && exercise.equipment.length > 0 ? exercise.equipment[0] : null,
    firstItemType: Array.isArray(exercise.equipment) && exercise.equipment.length > 0 ? typeof exercise.equipment[0] : null,
    equipmentNames,
    equipmentNamesKeys: equipmentNames ? Object.keys(equipmentNames) : [],
    equipmentNamesValues: equipmentNames ? Object.values(equipmentNames) : [],
    processedEquipment,
    hasEquipmentNames: equipmentNames && Object.keys(equipmentNames).length > 0,
    hasProcessedEquipment: processedEquipment && processedEquipment.length > 0,
    formatUtilOutput: exercise.equipment ? formatArrayOrString(exercise.equipment) : []
  });
  
  // Check if we actually have any equipment to display
  const hasAnyEquipment = 
    (equipmentNames && Object.keys(equipmentNames).length > 0) || 
    (Array.isArray(processedEquipment) && processedEquipment.length > 0) ||
    (exercise.equipment && typeof exercise.equipment === 'string' && exercise.equipment.trim() !== '');
  
  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Main exercise card with full width */}
        <StyledCard>
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={0}>
              <Grid item xs={12} sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                  }}
                  image={getExerciseImageUrl(exercise.name, exercise.media, exercise.id?.toString())}
                  title={exercise.name}
                  onError={(e) => {
                    console.error(`Failed to load image for exercise: ${exercise.name}`);
                    const target = e.target as HTMLImageElement;
                    target.src = '/static/images/exercises/placeholder.jpg';
                    // Apply fallback styling
                    Object.assign(target.style, {
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    });
                  }}
                />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0,
                  top: '50%', // Start gradient from middle of image
                  p: 2, 
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                    {formatArrayOrString(exercise.muscleGroups).map((muscle: string, idx: number) => (
                      <MuscleChip 
                        key={idx} 
                        label={muscle} 
                        primary={idx === 0} 
                        size="small"
                      />
                    ))}
                  </Box>
                  <DifficultyChip 
                    label={`${exercise.difficulty} Level`}
                    difficulty={exercise.difficulty?.toLowerCase()}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  p: { xs: 2, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                        {exercise.name}
                      </Typography>
                      {user && (
                        <IconButton 
                          onClick={handleToggleFavorite} 
                          color="primary"
                          sx={{ ml: 1 }}
                        >
                          {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                        </IconButton>
                      )}
                    </Box>
                    
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                      gap: 2,
                      mb: 3,
                      mt: 1
                    }}>
                      <MetadataItem>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                          {exercise.stats?.duration?.avg 
                            ? `${Math.round(exercise.stats.duration.avg / 60)} min avg`
                            : `${exercise.estimatedDuration || '–'} min estimated`}
                        </Typography>
                      </MetadataItem>

                      <MetadataItem>
                        <LocalFireDepartmentIcon fontSize="small" />
                        <Typography variant="body2">
                          {exercise.stats?.calories?.avg 
                            ? `${exercise.stats.calories.avg} cal avg`
                            : `${exercise.calories || '–'} cal estimated`}
                        </Typography>
                      </MetadataItem>
                      
                      {exercise.stats?.rating?.value && (
                        <MetadataItem>
                          <Rating 
                            value={exercise.stats.rating.value} 
                            precision={0.5} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({exercise.stats.rating.count || 0})
                          </Typography>
                        </MetadataItem>
                      )}
                    </Box>
                    
                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                      {exercise.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <EquipmentContainer sx={{ 
                    borderTop: '1px solid', 
                    borderColor: 'divider', 
                    pt: 2,
                    mt: 'auto' 
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1, display: 'flex', alignItems: 'center' }}>
                      <FitnessCenterIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                      Equipment
                    </Typography>
                    {/* Equipment display logic with better fallbacks */}
                    {hasAnyEquipment ? (
                      <>
                        {/* First check resolved equipment names */}
                        {equipmentNames && typeof equipmentNames === 'object' && Object.keys(equipmentNames).length > 0 && (
                          Object.values(equipmentNames).map((item: string, idx: number) => (
                            <EquipmentChip 
                              key={`name-${idx}`} 
                              label={item} 
                              icon={<FitnessCenterIcon fontSize="small" />} 
                              size="small"
                            />
                          ))
                        )}
                        
                        {/* Then check processed array equipment */}
                        {Array.isArray(processedEquipment) && processedEquipment.length > 0 && 
                         !(equipmentNames && Object.keys(equipmentNames).length > 0) && (
                          processedEquipment.map((item: string, idx: number) => (
                            <EquipmentChip 
                              key={`proc-${idx}`} 
                              label={item} 
                              icon={<FitnessCenterIcon fontSize="small" />} 
                              size="small"
                            />
                          ))
                        )}
                        
                        {/* Finally check single string equipment */}
                        {exercise.equipment && !Array.isArray(exercise.equipment) && 
                         typeof exercise.equipment === 'string' && exercise.equipment.trim() !== '' &&
                         !(equipmentNames && Object.keys(equipmentNames).length > 0) &&
                         !(Array.isArray(processedEquipment) && processedEquipment.length > 0) && (
                          <EquipmentChip 
                            key="single-equipment" 
                            label={exercise.equipment} 
                            icon={<FitnessCenterIcon fontSize="small" />} 
                            size="small"
                          />
                        )}
                        
                        {/* Handle case when equipment is an array of objects */}
                        {Array.isArray(exercise.equipment) && exercise.equipment.length > 0 && 
                         exercise.equipment.some(item => typeof item === 'object') &&
                         !(equipmentNames && Object.keys(equipmentNames).length > 0) &&
                         !(Array.isArray(processedEquipment) && processedEquipment.length > 0) && (
                          exercise.equipment.map((item: any, idx) => (
                            <EquipmentChip 
                              key={`obj-${idx}`} 
                              label={typeof item === 'object' && item !== null ? (item.name || JSON.stringify(item)) : String(item)} 
                              icon={<FitnessCenterIcon fontSize="small" />} 
                              size="small"
                            />
                          ))
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No equipment required</Typography>
                    )}
                  </EquipmentContainer>
                  
                  {/* Video component - collapsible version */}
                  {(exercise.videoUrl || exercise.media?.some(m => m.type === 'VIDEO')) && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}>
                        <Typography variant="subtitle2">Tutorial Video</Typography>
                        <Button 
                          onClick={toggleVideo}
                          startIcon={videoExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          size="small"
                          sx={{ minWidth: 'auto' }}
                        >
                          {videoExpanded ? 'Hide' : 'Show'}
                        </Button>
                      </Box>
                      
                      <Box sx={{ 
                        overflow: 'hidden',
                        height: videoExpanded ? 'auto' : 0,
                        opacity: videoExpanded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      }}>
                        <Box sx={{ 
                          position: 'relative', 
                          width: '100%',
                          paddingTop: '56.25%', // 16:9 aspect ratio (9/16 = 0.5625 or 56.25%)
                          overflow: 'hidden',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <video
                            src={getVideoUrl(exercise.media, exercise.id?.toString(), 'exercise', exercise.name) || exercise.videoUrl}
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                            controls
                            muted
                            playsInline
                            poster={getExerciseImageUrl(exercise.name, exercise.media, exercise.id?.toString())}
                            onError={(e) => {
                              console.error('Failed to load video:', exercise.name);
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                              const container = target.parentElement;
                              if (container) {
                                const errorMessage = document.createElement('div');
                                errorMessage.textContent = 'Video unavailable';
                                errorMessage.style.display = 'flex';
                                errorMessage.style.alignItems = 'center';
                                errorMessage.style.justifyContent = 'center';
                                errorMessage.style.height = '100%';
                                errorMessage.style.color = 'rgba(255,255,255,0.5)';
                                errorMessage.style.backgroundColor = '#333';
                                container.appendChild(errorMessage);
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </StyledCard>
        
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Instructions" icon={<InfoIcon />} iconPosition="start" />
              <Tab label="Form & Technique" icon={<FitnessCenterIcon />} iconPosition="start" />
              <Tab label="Statistics" icon={<FlagIcon />} iconPosition="start" />
          </Tabs>
          
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 4,
                animation: `${fadeInAnimation} 0.5s ease-out`,
              }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 3,
                    display: 'flex', 
                    alignItems: 'center',
                    '&::after': {
                      content: '""',
                      ml: 'auto',
                      width: 100,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      opacity: 0.7
                    }
                  }}
                >
                  How to Perform {exercise.name}
                </Typography>
                
                {/* Exercise Classification Info */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '1.1rem' }}>
                        {Array.isArray(exercise.types) 
                          ? exercise.types.join(', ')
                          : typeof exercise.types === 'object'
                            ? JSON.stringify(exercise.types)
                            : exercise.types || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Measurement
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '1.1rem' }}>
                        {typeof exercise.measurementType === 'object'
                          ? JSON.stringify(exercise.measurementType)
                          : exercise.measurementType || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Level
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '1.1rem' }}>
                        {typeof exercise.level === 'object'
                          ? JSON.stringify(exercise.level)
                          : exercise.level || exercise.difficulty || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Movement Pattern
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '1.1rem' }}>
                        {typeof exercise.movementPattern === 'object'
                          ? JSON.stringify(exercise.movementPattern)
                          : exercise.movementPattern || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Muscle Groups */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100px',
                        height: '100px',
                        background: t => `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.15)}, transparent 70%)`,
                        borderRadius: '0 0 100% 0',
                      }
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2.5, 
                          fontWeight: 600,
                          color: 'primary.main'
                        }}
                      >
                        Target Muscle Groups
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formatArrayOrString(exercise.targetMuscleGroups || exercise.muscleGroups).map((muscle: string, idx: number) => (
                          <Chip 
                            key={idx} 
                            label={muscle} 
                            color="primary"
                            size="medium"
                            sx={{ 
                              fontWeight: 600, 
                              px: 1.5, 
                              py: 2.5,
                              transition: 'all 0.2s ease',
                              animation: `${fadeInAnimation} 0.5s ease-out`,
                              animationDelay: `calc(0.1s * ${idx})`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }
                            }}
                          />
                        ))}
                        {formatArrayOrString(exercise.targetMuscleGroups || exercise.muscleGroups).length === 0 && (
                          <Typography variant="body2">No target muscles specified</Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: t => `0 8px 30px ${alpha(t.palette.secondary.main, 0.1)}`,
                        transform: 'translateY(-4px)'
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: t => `radial-gradient(circle, ${alpha(t.palette.secondary.main, 0.15)}, transparent 70%)`,
                        borderRadius: '0 0 0 100%',
                      }
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2.5, 
                          fontWeight: 600,
                          color: 'secondary.main'
                        }}
                      >
                        Synergist Muscle Groups
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formatArrayOrString(exercise.synergistMuscleGroups).map((muscle: string, idx: number) => (
                          <Chip 
                            key={idx} 
                            label={muscle} 
                            color="secondary"
                            size="medium"
                            sx={{ 
                              fontWeight: 600, 
                              px: 1.5, 
                              py: 2.5,
                              transition: 'all 0.2s ease',
                              animation: `${fadeInAnimation} 0.5s ease-out`,
                              animationDelay: `calc(0.1s * ${idx})`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }
                            }}
                          />
                        ))}
                        {formatArrayOrString(exercise.synergistMuscleGroups).length === 0 && (
                          <Typography variant="body2">No synergist muscles specified</Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Exercise Instructions */}
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: t => `0 8px 30px ${alpha(t.palette.info.main, 0.08)}`,
                  },
                  mb: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '150px',
                    height: '150px',
                    background: t => `radial-gradient(circle, ${alpha(t.palette.info.main, 0.08)}, transparent 70%)`,
                    borderRadius: '150px 0 0 0',
                  }
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3.5, 
                      fontWeight: 700,
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'info.dark',
                      '&::after': {
                        content: '""',
                        ml: 'auto',
                        width: 80,
                        height: 3,
                        borderRadius: 1.5,
                        bgcolor: 'info.main',
                        opacity: 0.7
                      }
                    }}
                  >
                    Step-by-Step Instructions
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2.5,
                    position: 'relative',
                    pl: 3,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '20px',
                      top: '10px',
                      bottom: '10px',
                      width: '2px',
                      backgroundImage: t => `linear-gradient(to bottom, 
                        ${alpha(t.palette.info.main, 0)}, 
                        ${alpha(t.palette.info.main, 0.4)} 20%, 
                        ${alpha(t.palette.info.main, 0.4)} 80%, 
                        ${alpha(t.palette.info.main, 0)}
                      )`,
                      zIndex: 0,
                      borderRadius: '1px',
                    }
                  }}>
                    {formatArrayOrString(exercise.instructions).map((step: string, idx: number) => (
                      <StepItem 
                        key={idx} 
                        sx={{ 
                          animation: `${fadeInAnimation} 0.5s ease-out`,
                          animationDelay: `calc(0.15s * ${idx})`,
                          '&:hover': {
                            boxShadow: t => `0 10px 30px ${alpha(t.palette.info.main, 0.15)}`,
                          }
                        }}
                      >
                        <StepNumber>{idx + 1}</StepNumber>
                        <Typography variant="body1" sx={{ fontWeight: 400, fontSize: '1.05rem', lineHeight: 1.6 }}>
                          {step}
                        </Typography>
                      </StepItem>
                    ))}
                    
                    {(!exercise.instructions || exercise.instructions.length === 0) && exercise.form?.execution?.steps && (
                      exercise.form.execution.steps.map((step: string, idx: number) => (
                        <StepItem 
                          key={idx}
                          sx={{ 
                            animation: `${fadeInAnimation} 0.5s ease-out`,
                            animationDelay: `calc(0.15s * ${idx})`,
                            '&:hover': {
                              boxShadow: t => `0 10px 30px ${alpha(t.palette.info.main, 0.15)}`,
                            }
                          }}
                        >
                          <StepNumber>{idx + 1}</StepNumber>
                          <Typography variant="body1" sx={{ fontWeight: 400, fontSize: '1.05rem', lineHeight: 1.6 }}>
                            {step}
                          </Typography>
                        </StepItem>
                      ))
                    )}
                    
                    {(!exercise.instructions || exercise.instructions.length === 0) && 
                     (!exercise.form?.execution?.steps || exercise.form.execution.steps.length === 0) && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        No detailed instructions available for this exercise.
                      </Alert>
                    )}
                  </Box>
                </Paper>
                
                {/* Benefits */}
                {exercise.benefits && exercise.benefits.length > 0 && (
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: t => `0 8px 30px ${alpha(t.palette.success.main, 0.1)}`,
                    },
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '150px',
                      height: '150px',
                      background: t => `radial-gradient(circle, ${alpha(t.palette.success.main, 0.08)}, transparent 70%)`,
                      borderRadius: '150px 0 0 0',
                    }
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 700,
                        color: 'success.dark',
                        display: 'flex', 
                        alignItems: 'center',
                        '&::after': {
                          content: '""',
                          ml: 'auto',
                          width: 80,
                          height: 3,
                          borderRadius: 1.5,
                          bgcolor: 'success.main',
                          opacity: 0.7
                        }
                      }}
                    >
                      Benefits
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {formatArrayOrString(exercise.benefits).map((benefit: string, idx: number) => (
                        <BenefitItem key={idx} style={{ ['--index' as any]: idx }}>
                          <Typography variant="body1">{benefit}</Typography>
                        </BenefitItem>
                      ))}
                    </Box>
                  </Paper>
                )}
                
                {/* Tracking Features */}
                {exercise.trackingFeatures && exercise.trackingFeatures.length > 0 && (
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: t => `0 8px 24px ${alpha(t.palette.primary.main, 0.08)}`,
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2.5, 
                        fontWeight: 600
                      }}
                    >
                      Tracking Features
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme => alpha(theme.palette.background.default, 0.5)
                    }}>
                      {formatArrayOrString(exercise.trackingFeatures).map((feature: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={feature} 
                          variant="outlined"
                          sx={{ 
                            py: 2.5,
                            px: 1,
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            animation: `${fadeInAnimation} 0.5s ease-out`,
                            animationDelay: `calc(0.1s * ${idx})`,
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>
            </TabPanel>
            
            {/* Form & Technique Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 4
              }}>
                {/* Setup */}
                {exercise.form?.execution?.setup && exercise.form.execution.setup.length > 0 && (
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        '&::after': {
                          content: '""',
                          ml: 'auto',
                          width: 80,
                          height: 3,
                          borderRadius: 1.5,
                          bgcolor: 'primary.main',
                          opacity: 0.7
                        }
                      }}
                    >
                      Setup & Starting Position
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2 
                    }}>
                      {exercise.form.execution.setup.map((item: string, idx: number) => (
                        <SetupItem key={idx} style={{ ['--index' as any]: idx }}>
                          <Typography variant="body1">{item}</Typography>
                        </SetupItem>
                      ))}
                    </Box>
                  </Paper>
                )}
                
                <Grid container spacing={3}>
                  {/* Key Points */}
                  {exercise.form?.execution?.keyPoints && exercise.form.execution.keyPoints.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: t => `0 8px 30px ${alpha(t.palette.info.main, 0.1)}`,
                          transform: 'translateY(-4px)'
                        }
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2.5, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'info.dark'
                          }}
                        >
                          Key Form Points
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {exercise.form.execution.keyPoints.map((point: string, idx: number) => (
                            <KeyPointItem key={idx} style={{ ['--index' as any]: idx }}>
                              <Typography variant="body1">{point}</Typography>
                            </KeyPointItem>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  
                  {/* Tempo */}
                  {exercise.form?.execution?.tempo && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.1)}`,
                          transform: 'translateY(-4px)'
                        }
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2.5,
                            display: 'flex', 
                            alignItems: 'center'
                          }}
                        >
                          Tempo/Breathing
                        </Typography>
                        <Box sx={{ 
                          p: 3, 
                          borderRadius: 2, 
                          bgcolor: alpha('#000', 0.03),
                          border: '1px solid',
                          borderColor: 'divider',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontStyle: 'italic',
                              position: 'relative',
                              '&::before': {
                                content: '"\\201C"',
                                position: 'absolute',
                                left: -20,
                                top: -10,
                                fontSize: '2rem',
                                opacity: 0.4,
                                color: 'primary.main'
                              },
                              '&::after': {
                                content: '"\\201D"',
                                position: 'absolute',
                                right: -20,
                                bottom: -30,
                                fontSize: '2rem',
                                opacity: 0.4,
                                color: 'primary.main'
                              }
                            }}
                          >
                            {exercise.form.execution.tempo}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {/* Safety Tips */}
                  {exercise.form?.safety?.tips && exercise.form.safety.tips.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: t => `0 8px 30px ${alpha(t.palette.warning.main, 0.1)}`,
                          transform: 'translateY(-4px)'
                        }
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2.5, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'warning.dark'
                          }}
                        >
                          Safety Tips
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {exercise.form.safety.tips.map((tip: string, idx: number) => (
                            <SafetyTipItem key={idx} style={{ ['--index' as any]: idx }}>
                              <Typography variant="body1">{tip}</Typography>
                            </SafetyTipItem>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  
                  {/* Cautions */}
                  {exercise.form?.safety?.cautions && exercise.form.safety.cautions.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: t => `0 8px 30px ${alpha(t.palette.error.main, 0.15)}`,
                          transform: 'translateY(-4px)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: t => `radial-gradient(circle, ${alpha(t.palette.error.main, 0.15)}, transparent 70%)`,
                          borderRadius: '0 0 0 100%',
                        }
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2.5, 
                            color: 'error.main',
                            display: 'flex', 
                            alignItems: 'center'
                          }}
                        >
                          Cautions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {exercise.form.safety.cautions.map((caution: string, idx: number) => (
                            <Box 
                              key={idx}
                              sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                bgcolor: t => alpha(t.palette.error.main, 0.08),
                                borderLeft: '4px solid',
                                borderColor: 'error.main',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s ease',
                                animation: `${fadeInAnimation} 0.6s ease-out forwards`,
                                animationDelay: `calc(0.15s * ${idx})`,
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  bgcolor: t => alpha(t.palette.error.main, 0.12),
                                }
                              }}
                            >
                              <Typography variant="body1" color="error.dark">{caution}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                {/* Prerequisites */}
                {exercise.form?.safety?.prerequisites && exercise.form.safety.prerequisites.length > 0 && (
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: t => `0 8px 30px ${alpha(t.palette.info.main, 0.1)}`,
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Prerequisites</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      bgcolor: alpha('#000', 0.02),
                      p: 2,
                      borderRadius: 2,
                    }}>
                      {exercise.form.safety.prerequisites.map((prereq: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={prereq} 
                          color="info"
                          size="medium"
                          sx={{ 
                            fontSize: '0.95rem', 
                            py: 2.5,
                            px: 1, 
                            fontWeight: 500,
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            },
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
                
                {/* Joints Involved */}
                {exercise.form?.joints?.primary && exercise.form.joints.primary.length > 0 && (
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: t => `0 8px 30px ${alpha(t.palette.primary.main, 0.08)}`,
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Primary Joints Involved</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      bgcolor: alpha('#000', 0.02),
                      p: 2,
                      borderRadius: 2,
                    }}>
                      {exercise.form.joints.primary.map((joint: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={joint} 
                          variant="outlined"
                          size="medium"
                          sx={{ 
                            fontSize: '0.95rem', 
                            py: 2.5,
                            px: 1, 
                            fontWeight: 500,
                            borderWidth: 2,
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            },
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
                
                {/* When no form data is available */}
                {!exercise.form && (
                  <Alert severity="info">
                    No detailed form information available for this exercise.
                  </Alert>
                )}
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                {exercise.stats ? (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Avg. Duration
                        </Typography>
                        <StatValue>
                          {exercise.stats.duration?.avg 
                            ? `${Math.round(exercise.stats.duration.avg / 60)}m`
                            : '–'}
                        </StatValue>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.stats.duration?.min && exercise.stats.duration?.max 
                            ? `Range: ${Math.round(exercise.stats.duration.min / 60)}m - 
                               ${Math.round(exercise.stats.duration.max / 60)}m`
                            : ''}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Avg. Calories
                        </Typography>
                        <StatValue>
                          {exercise.stats.calories?.avg || '–'}
                        </StatValue>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.stats.calories?.min && exercise.stats.calories?.max 
                            ? `Range: ${exercise.stats.calories.min} - ${exercise.stats.calories.max}`
                            : ''}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Completion Rate
                        </Typography>
                        <StatValue>
                          {exercise.stats.completion?.rate 
                            ? `${Math.round(exercise.stats.completion.rate * 100)}%`
                            : '–'}
                        </StatValue>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.stats.completion?.total 
                            ? `${exercise.stats.completion.successful || 0}/${exercise.stats.completion.total} sessions`
                            : ''}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Popularity Score
                        </Typography>
                        <StatValue>
                          {exercise.stats.popularity?.score
                            ? exercise.stats.popularity.score.toFixed(1)
                            : '–'}
                        </StatValue>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.stats.popularity?.trend || ''}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    {exercise.stats.rating?.distribution && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, mt: 2 }}>
                          <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                            {Object.entries(exercise.stats.rating.distribution).map(([rating, count]) => (
                              <Box key={rating} sx={{ textAlign: 'center', mx: 1, my: 2 }}>
                                <Typography variant="h6">{rating} ★</Typography>
                                <Typography variant="body2">{count} ratings</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No performance statistics available for this exercise yet. Statistics will be generated as users track workouts containing this exercise.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default ExerciseDetail; 