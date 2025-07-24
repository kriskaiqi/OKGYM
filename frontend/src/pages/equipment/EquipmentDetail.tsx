import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CategoryOutlined as CategoryIcon,
  AttachMoney as MoneyIcon,
  AspectRatio as SizeIcon,
  Store as StoreIcon,
  InfoOutlined as InfoIcon,
  SettingsOutlined as SpecsIcon,
  MenuBook as ExercisesIcon
} from '@mui/icons-material';

import { equipmentService } from '../../services/equipmentService';
import { exerciseService } from '../../services/exerciseService';
import { EquipmentTypes } from '../../types';
import { Exercise } from '../../types/exercise';
import { ExerciseCard } from '../../components/exercise/ExerciseCard';
import {
  HeaderContainer,
  MainContainer,
  ImageContainer,
  PlaceholderContainer,
  MetadataContainer, 
  ChipsContainer,
  StyledTabs,
  StyledTab,
  DetailSection,
  DetailTitle,
  MuscleChip,
  TabPanelProps
} from './EquipmentDetail.styles';

// TabPanel component to display tab content with the correct styling
const StyledTabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 3,
          backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.1) : theme.palette.background.paper,
          borderRadius: '0 0 8px 8px'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [equipment, setEquipment] = useState<EquipmentTypes.Equipment | null>(null);
  const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedExercisesError, setRelatedExercisesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Format difficulty for display
  const formatDifficulty = (difficulty: string): string => {
    return difficulty
      ? difficulty.replace('_', ' ').toLowerCase()
      : 'beginner';
  };

  // Format cost tier for display
  const formatCostTier = (costTier: string): string => {
    return costTier
      ? costTier.replace('_', ' ').toLowerCase()
      : 'mid range';
  };

  // Format space requirement for display
  const formatSpaceRequired = (space: string): string => {
    return space
      ? space.replace('_', ' ').toLowerCase()
      : 'small';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Return appropriate color based on difficulty
  const getDifficultyColor = (difficulty: string): string => {
    switch(difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'warning';
      case 'ADVANCED':
        return 'error';
      default:
        return 'success';
    }
  };

  // Get equipment details and related exercises
  useEffect(() => {
    const fetchEquipmentDetails = async (retryCount = 0) => {
      if (!id) {
        setError('Equipment ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Attempting to fetch equipment ${id}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
        
        // First try to get the equipment
        const equipmentData = await equipmentService.getEquipmentById(id);
        
        if (!equipmentData) {
          setError('Equipment not found');
          setLoading(false);
          return;
        }
        
        // Successfully got equipment data
        setEquipment(equipmentData);
        
        // Fetch exercises that use this equipment
        try {
          const response = await exerciseService.getExercisesByEquipment(id);
          if (response && response.success && response.data) {
            setRelatedExercises(response.data);
          }
        } catch (exerciseError) {
          // Don't fail the whole page if exercises can't be loaded
          console.error('Error fetching related exercises:', exerciseError);
          setRelatedExercisesError('Could not load related exercises');
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching equipment details:', err);
        
        // Add a marker when we've reached the auto-retry limit
        const isMaxRetries = retryCount >= 2;
        const retryMessage = isMaxRetries ? 
          'Maximum retries reached. ' : 
          `Retrying (${retryCount+1}/2)... `;
        
        // Check for specific error types and provide more helpful messages
        if (err.response && err.response.status === 500) {
          setError(`Server error: The equipment data could not be retrieved. The server might be experiencing issues with this specific equipment. ${retryMessage}Try browsing other equipment instead.`);
          
          // Retry logic for 500 errors (if not at max retries)
          if (!isMaxRetries) {
            console.log(`Will retry fetching equipment in ${(retryCount+1) * 1500}ms...`);
            
            // Wait and retry with exponential backoff
            setTimeout(() => {
              fetchEquipmentDetails(retryCount + 1);
            }, (retryCount + 1) * 1500);
            return;
          }
        } else if (err.code === 'ERR_NETWORK' || (err.message && err.message.includes('Network Error'))) {
          // Handle CORS or network connectivity issues
          setError(`Network error: This could be due to server connectivity issues. Please check that the backend server is running properly. ${retryMessage}`);
          
          // Retry for network errors too
          if (!isMaxRetries) {
            setTimeout(() => {
              fetchEquipmentDetails(retryCount + 1);
            }, (retryCount + 1) * 2000); // Longer delay for network issues
            return;
          }
        } else if (err.code === 'ECONNABORTED') {
          setError(`Connection timeout: The server is taking too long to respond. ${retryMessage}Please try again later.`);
          
          // Retry for timeouts with longer delay
          if (!isMaxRetries) {
            setTimeout(() => {
              fetchEquipmentDetails(retryCount + 1);
            }, (retryCount + 1) * 3000); // Even longer delay for timeouts
            return;
          }
        } else {
          setError(`Failed to load equipment details: ${err.message || 'Unknown error'}`);
        }
        
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [id, exerciseService]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
          Loading equipment details...
        </Typography>
      </Box>
    );
  }

  if (error || !equipment) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        mt: 4
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          {error ? 'Error' : 'Equipment Not Found'}
        </Typography>
        
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: 'rgba(211, 47, 47, 0.05)', 
          width: '100%',
          mb: 3
        }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error || 'The requested equipment could not be found. It may have been removed or the ID might be incorrect.'}
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Button 
            variant="outlined"
            onClick={() => navigate('/equipment')}
            startIcon={<ArrowBackIcon />}
          >
            Browse Equipment
          </Button>
        </Box>
      </Box>
    );
  }

  // Extend equipment type with additional fields if needed
  const extendedEquipment = {
    ...equipment,
    price: equipment.estimatedPrice || 25.00,
    muscleGroups: equipment.muscleGroupsTargeted || ['Core'],
    manufacturer: equipment.manufacturer || 'Manduka, Lululemon, Gaiam'
  };

  // Get the difficulty color for UI display
  const difficultyColor = getDifficultyColor(equipment.difficulty);

  return (
    <MainContainer>
      {/* Header section with back button */}
      <HeaderContainer>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight={600}>
          {equipment.name}
        </Typography>
      </HeaderContainer>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Image and basic info */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              overflow: 'hidden',
              mb: 3,
              borderRadius: 2,
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Equipment image */}
            {equipment.imageUrl ? (
              <ImageContainer imageUrl={equipment.imageUrl} />
            ) : (
              <PlaceholderContainer />
            )}
            
            {/* Equipment metadata */}
            <MetadataContainer>
              <ChipsContainer>
                <Chip 
                  label={equipment.category} 
                  color="primary" 
                  variant="outlined" 
                  icon={<CategoryIcon />}
                />
                <Chip 
                  label={formatDifficulty(equipment.difficulty)} 
                  color={difficultyColor as any}
                />
                <Chip 
                  label={formatCostTier(equipment.costTier)} 
                  icon={<MoneyIcon />}
                />
                <Chip 
                  label={formatSpaceRequired(equipment.spaceRequired)} 
                  icon={<SizeIcon />}
                />
              </ChipsContainer>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {equipment.description}
              </Typography>
              
              {equipment.purchaseUrl && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<StoreIcon />}
                  href={equipment.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 1 }}
                >
                  Purchase Options
                </Button>
              )}
            </MetadataContainer>
          </Paper>
        </Grid>
        
        {/* Right column - Tabs for details, specifications, exercises */}
        <Grid item xs={12} md={7}>
          <Paper 
            sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              overflow: 'hidden',
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.2) : alpha(theme.palette.background.default, 0.9)
            }}
          >
            <StyledTabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="equipment details tabs"
              variant="fullWidth"
            >
              <StyledTab 
                icon={<InfoIcon />} 
                label="Details" 
                iconPosition="start"
              />
              <StyledTab 
                icon={<SpecsIcon />} 
                label="Specifications" 
                iconPosition="start"
              />
              <StyledTab 
                icon={<ExercisesIcon />} 
                label="Exercises" 
                iconPosition="start"
              />
            </StyledTabs>
            
            {/* Details Tab */}
            <StyledTabPanel value={activeTab} index={0}>
              <DetailTitle>Equipment Details</DetailTitle>
              <TableContainer 
                component={Paper} 
                elevation={0} 
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                        Category
                      </TableCell>
                      <TableCell>{equipment.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                        Difficulty
                      </TableCell>
                      <TableCell>{formatDifficulty(equipment.difficulty)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                        Cost Tier
                      </TableCell>
                      <TableCell>{formatCostTier(equipment.costTier)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                        Space Required
                      </TableCell>
                      <TableCell>{formatSpaceRequired(equipment.spaceRequired)}</TableCell>
                    </TableRow>
                      <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                          Estimated Price
                        </TableCell>
                      <TableCell>${extendedEquipment.price}</TableCell>
                      </TableRow>
                      <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                          Manufacturer
                        </TableCell>
                      <TableCell>{extendedEquipment.manufacturer}</TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <DetailSection>
                <DetailTitle>Target Muscle Groups</DetailTitle>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {extendedEquipment.muscleGroups.map((muscle: any, index: number) => (
                    <MuscleChip 
                      key={index} 
                      label={typeof muscle === 'string' ? muscle : muscle.name || 'Unknown'} 
                    />
                  ))}
                </Box>
              </DetailSection>
            </StyledTabPanel>
            
            {/* Specifications Tab */}
            <StyledTabPanel value={activeTab} index={1}>
              <DetailTitle>Technical Specifications</DetailTitle>
              
              {equipment.specifications ? (
                <TableContainer 
                  component={Paper} 
                  elevation={0} 
                  variant="outlined"
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                  }}
                >
                  <Table>
                    <TableBody>
                      {equipment.specifications.material && (
                        <TableRow>
                          <TableCell 
                            component="th" 
                            scope="row" 
                            sx={{ 
                              fontWeight: 'bold', 
                              width: '40%', 
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            }}
                          >
                            Material
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                            {equipment.specifications.material}
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {equipment.specifications.color && (
                        <TableRow>
                          <TableCell 
                            component="th" 
                            scope="row" 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            }}
                          >
                            Color
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                            {equipment.specifications.color}
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {equipment.specifications.adjustable !== undefined && (
                        <TableRow>
                          <TableCell 
                            component="th" 
                            scope="row" 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            }}
                          >
                            Adjustable
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                            {equipment.specifications.adjustable ? 'Yes' : 'No'}
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {equipment.specifications.warranty && (
                        <TableRow>
                          <TableCell 
                            component="th" 
                            scope="row" 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              borderBottom: equipment.specifications.dimensions ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                            }}
                          >
                            Warranty
                          </TableCell>
                          <TableCell sx={{ borderBottom: equipment.specifications.dimensions ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none' }}>
                            {equipment.specifications.warranty}
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {equipment.specifications.dimensions && (
                        <TableRow>
                          <TableCell 
                            component="th" 
                            scope="row" 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            }}
                          >
                            Dimensions
                          </TableCell>
                          <TableCell>
                            {equipment.specifications.dimensions.length} × 
                            {equipment.specifications.dimensions.width} × 
                            {equipment.specifications.dimensions.height} 
                            {equipment.specifications.dimensions.unit}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No specifications available for this equipment.
                </Typography>
              )}
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Features</Typography>
                <Box>
                  {equipment.specifications?.features?.map((feature: any, index: number) => (
                    <Box 
                      key={index} 
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          mt: 0.8,
                          mr: 1.5,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {typeof feature === 'string' ? feature : feature.name || 'Unknown'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {equipment.specifications?.accessories && equipment.specifications.accessories.length > 0 && (
                <Box sx={{ mt: 4, mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Accessories</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {equipment.specifications.accessories.map((accessory: any, index: number) => (
                      <Chip 
                        key={index} 
                        label={typeof accessory === 'string' ? accessory : accessory.name || 'Unknown'} 
                        sx={{
                          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.3) : alpha(theme.palette.background.default, 0.5),
                          color: theme.palette.text.primary,
                          fontWeight: 500,
                          borderRadius: '16px',
                          px: 1.5,
                          py: 2.5,
                          height: 'auto'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {equipment.alternatives && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Alternative Options</Typography>
                  
                  {equipment.alternatives.homeMade && equipment.alternatives.homeMade.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                        DIY Alternatives
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {equipment.alternatives.homeMade.map((item: any, index: number) => (
                          <Chip 
                            key={index} 
                            label={typeof item === 'string' ? item : item.name || 'Unknown'} 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: '16px',
                              py: 0.5,
                              height: 'auto',
                              borderColor: alpha(theme.palette.divider, 0.7),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {equipment.alternatives.budget && equipment.alternatives.budget.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                        Budget Alternatives
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {equipment.alternatives.budget.map((item: any, index: number) => (
                          <Chip 
                            key={index} 
                            label={typeof item === 'string' ? item : item.name || 'Unknown'} 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: '16px',
                              py: 0.5,
                              height: 'auto',
                              borderColor: alpha(theme.palette.divider, 0.7),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {equipment.alternatives.premium && equipment.alternatives.premium.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                        Premium Alternatives
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {equipment.alternatives.premium.map((item: any, index: number) => (
                          <Chip 
                            key={index} 
                            label={typeof item === 'string' ? item : item.name || 'Unknown'} 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: '16px',
                              py: 0.5,
                              height: 'auto',
                              borderColor: alpha(theme.palette.divider, 0.7),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {equipment.alternatives.similar && equipment.alternatives.similar.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                        Similar Equipment
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {equipment.alternatives.similar.map((item: any, index: number) => (
                          <Chip 
                            key={index} 
                            label={typeof item === 'string' ? item : item.name || 'Unknown'} 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: '16px',
                              py: 0.5,
                              height: 'auto',
                              borderColor: alpha(theme.palette.divider, 0.7),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </StyledTabPanel>
            
            {/* Exercises Tab */}
            <StyledTabPanel value={activeTab} index={2}>
              <DetailTitle>Related Exercises</DetailTitle>
              
              {relatedExercises.length > 0 ? (
                <Grid container spacing={2}>
                  {relatedExercises.map((exercise) => (
                    <Grid item xs={12} sm={6} key={exercise.id}>
                      <ExerciseCard 
                        exercise={exercise}
                        onClick={() => navigate(`/exercises/${exercise.id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {relatedExercisesError || 'No exercises found using this equipment.'}
                </Typography>
              )}
            </StyledTabPanel>
          </Paper>
        </Grid>
      </Grid>
    </MainContainer>
  );
};

export default EquipmentDetail;