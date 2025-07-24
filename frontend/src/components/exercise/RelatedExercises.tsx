import React, { useState, useEffect } from 'react';
import { Exercise, RelationType } from '../../types/exercise';
import { exerciseService } from '../../services';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  CardActions,
  Button, 
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  styled,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Shuffle as ShuffleIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import { formatArrayOrString } from '../../utils/formatters';

// Use the ApiResponse interface from the exercise service
interface RelatedExercisesProps {
  exerciseId: string;
  title?: string;
  type?: RelationType;
  limit?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel Component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`related-exercises-tabpanel-${index}`}
      aria-labelledby={`related-exercises-tab-${index}`}
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

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 180,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.secondary,
}));

/**
 * Component for displaying exercises related to the current exercise
 */
const RelatedExercises: React.FC<RelatedExercisesProps> = ({
  exerciseId,
  title = 'Related Exercises',
  type = RelationType.ALTERNATIVE,
  limit = 3
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [relationType, setRelationType] = useState<RelationType>(type);
  
  useEffect(() => {
    const controller = new AbortController();
    fetchRelatedExercises();
    
    return () => {
      controller.abort(); // Clean up pending requests
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, relationType]);

  const fetchRelatedExercises = async () => {
    try {
      setLoading(true);
      
      // To prevent excessive API calls, verify we have a valid exerciseId
      if (!exerciseId) {
        setLoading(false);
        setExercises([]);
        return;
      }
      
      const response = await exerciseService.getRelatedExercises(exerciseId, relationType);
      
      if (response.success && response.data) {
        // Limit the number of exercises to display
        setExercises(response.data.slice(0, limit));
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Error fetching related exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setRelationType(event.target.value as RelationType);
  };

  // If no related exercises and not loading, don't render anything
  if (!loading && exercises.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="relation-type-label">Type</InputLabel>
            <Select
              labelId="relation-type-label"
              value={relationType}
              label="Type"
              onChange={handleTypeChange}
            >
              <MenuItem value={RelationType.ALTERNATIVE}>Alternatives</MenuItem>
              <MenuItem value={RelationType.VARIATION}>Variations</MenuItem>
              <MenuItem value={RelationType.PROGRESSION}>Progressions</MenuItem>
              <MenuItem value={RelationType.REGRESSION}>Regressions</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <List disablePadding>
            {exercises.map((exercise, index) => (
              <React.Fragment key={exercise.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={exercise.imageUrl || '/images/exercise-placeholder.jpg'} 
                      alt={exercise.name}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 1 }}
                    >
                      <FitnessCenterIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={exercise.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {exercise.description?.substring(0, 60)}...
          </Typography>
                        <Box sx={{ mt: 1 }}>
                          {formatArrayOrString(exercise.muscleGroups).slice(0, 2).map((muscle: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={muscle}
              size="small"
                              color="primary"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < exercises.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button 
            variant="outlined" 
            size="small"
            href={`/exercises/search?relatedTo=${exerciseId}&type=${relationType}`}
          >
            View All
          </Button>
      </Box>
      </CardContent>
    </Card>
  );
};

export default RelatedExercises; 