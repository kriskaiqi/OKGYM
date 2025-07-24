# Exercise & Workout Plan UI Implementation Plan

This document provides a detailed implementation plan for the Exercise & Workout Plan UI components in the OKGYM frontend application. This plan focuses on creating reusable, maintainable UI components with a consistent user experience.

## Overview

The Exercise & Workout Plan UI implementation covers two core areas of functionality:

1. **Exercise Management**: Browsing, searching, and viewing exercise details
2. **Workout Plan Management**: Creating, editing, and managing workout plans with exercises

The implementation follows a component-based architecture with TypeScript interfaces for type safety and dedicated API service functions for data fetching.

## Implementation Prerequisites

Before implementing the UI components, we need to establish:

1. **TypeScript Interfaces**: For all entities and API requests/responses
2. **API Service Functions**: For data fetching and state management
3. **Reusable Components**: For common UI elements like filters, pagination, and cards

## Detailed Implementation Plan

### Phase 1: Foundation (Day 1)

#### TypeScript Interfaces

Create a `types` directory in the frontend src folder with the following files:

1. **Exercise Interfaces** (`src/types/exercise.ts`):
   ```typescript
   export interface Exercise {
     id: string;
     name: string;
     description: string;
     measurementType: MeasurementType;
     types: ExerciseType[];
     level: Difficulty;
     movementPattern?: MovementPattern;
     targetMuscleGroups: MuscleGroup[];
     synergistMuscleGroups: MuscleGroup[];
     equipment?: Equipment[];
     media?: Media[];
     categories?: ExerciseCategory[];
     trackingFeatures?: TrackingFeature[];
     form?: ExerciseForm;
     stats?: ExerciseStats;
     createdAt: Date;
     updatedAt: Date;
   }
   
   export interface ExerciseCategory {
     id: number;
     name: string;
     description?: string;
     type: CategoryType;
     isActive: boolean;
     icon?: string;
     color?: string;
   }
   
   export interface Equipment {
     id: string;
     name: string;
     description?: string;
     isCommon: boolean;
     imageUrl?: string;
   }
   
   export interface Media {
     id: string;
     url: string;
     type: MediaType;
     title?: string;
   }
   
   export interface ExerciseFilterOptions {
     categoryIds?: number[];
     equipmentIds?: string[];
     difficulty?: Difficulty;
     muscleGroups?: MuscleGroup[];
     type?: ExerciseType;
     movementPattern?: MovementPattern;
     search?: string;
     page?: number;
     limit?: number;
     sortBy?: string;
     sortOrder?: 'ASC' | 'DESC';
   }
   ```

2. **Workout Plan Interfaces** (`src/types/workout.ts`):
   ```typescript
   export interface WorkoutPlan {
     id: number;
     name: string;
     description: string;
     difficulty: Difficulty;
     estimatedDuration: number;
     isCustom: boolean;
     rating: number;
     ratingCount: number;
     popularity: number;
     workoutCategory: WorkoutCategory;
     estimatedCaloriesBurn: number;
     exercises: WorkoutExercise[];
     createdAt: Date;
     updatedAt: Date;
     creatorId?: string;
   }
   
   export interface WorkoutExercise {
     id: number;
     order: number;
     repetitions: number;
     duration: number;
     restTime: number;
     intensity?: ExerciseIntensity;
     exercise: Exercise;
   }
   
   export interface WorkoutPlanFilterOptions {
     difficulty?: Difficulty;
     categoryIds?: number[];
     duration?: { min?: number; max?: number };
     isCustom?: boolean;
     creatorId?: string;
     search?: string;
     page?: number;
     limit?: number;
     sortBy?: string;
     sortOrder?: 'ASC' | 'DESC';
   }
   
   export interface CreateWorkoutPlanRequest {
     name: string;
     description: string;
     difficulty: Difficulty;
     estimatedDuration: number;
     workoutCategory: WorkoutCategory;
     exercises?: CreateWorkoutExerciseRequest[];
   }
   
   export interface CreateWorkoutExerciseRequest {
     exerciseId: string;
     order: number;
     repetitions: number;
     duration: number;
     restTime: number;
     intensity?: ExerciseIntensity;
   }
   ```

3. **API Response Interfaces** (`src/types/api.ts`):
   ```typescript
   export interface PaginatedResponse<T> {
     data: T[];
     count: number;
     page: number;
     limit: number;
   }
   
   export interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
   }
   ```

4. **Enum Types** (`src/types/enums.ts`):
   ```typescript
   export enum Difficulty {
     BEGINNER = "BEGINNER",
     INTERMEDIATE = "INTERMEDIATE",
     ADVANCED = "ADVANCED",
     EXPERT = "EXPERT"
   }
   
   export enum MeasurementType {
     REPS = "REPS",
     DURATION = "DURATION",
     DISTANCE = "DISTANCE",
     WEIGHT = "WEIGHT"
   }
   
   export enum ExerciseType {
     STRENGTH = "STRENGTH",
     CARDIO = "CARDIO",
     FLEXIBILITY = "FLEXIBILITY",
     BALANCE = "BALANCE",
     PLYOMETRIC = "PLYOMETRIC"
   }
   
   export enum MovementPattern {
     PUSH = "PUSH",
     PULL = "PULL",
     SQUAT = "SQUAT",
     HINGE = "HINGE",
     LUNGE = "LUNGE",
     ROTATION = "ROTATION",
     CARRY = "CARRY",
     CORE = "CORE"
   }
   
   export enum WorkoutCategory {
     FULL_BODY = "FULL_BODY",
     UPPER_BODY = "UPPER_BODY",
     LOWER_BODY = "LOWER_BODY",
     PUSH = "PUSH",
     PULL = "PULL",
     LEGS = "LEGS",
     CORE = "CORE",
     CARDIO = "CARDIO",
     HIIT = "HIIT",
     CIRCUIT = "CIRCUIT"
   }
   
   export enum MuscleGroup {
     CHEST = "CHEST",
     BACK = "BACK",
     SHOULDERS = "SHOULDERS",
     BICEPS = "BICEPS",
     TRICEPS = "TRICEPS",
     FOREARMS = "FOREARMS",
     QUADRICEPS = "QUADRICEPS",
     HAMSTRINGS = "HAMSTRINGS",
     GLUTES = "GLUTES",
     CALVES = "CALVES",
     ABS = "ABS",
     OBLIQUES = "OBLIQUES",
     LOWER_BACK = "LOWER_BACK",
     NECK = "NECK",
     TRAPS = "TRAPS"
   }
   
   export enum MediaType {
     IMAGE = "IMAGE",
     VIDEO = "VIDEO",
     GIF = "GIF"
   }
   
   export enum CategoryType {
     MUSCLE_GROUP = "MUSCLE_GROUP",
     MOVEMENT_PATTERN = "MOVEMENT_PATTERN",
     EQUIPMENT = "EQUIPMENT",
     EXPERIENCE_LEVEL = "EXPERIENCE_LEVEL",
     GOAL = "GOAL",
     BODY_PART = "BODY_PART",
     SPECIAL = "SPECIAL"
   }
   ```

#### API Service Functions

Create service files in the `services` directory:

1. **Exercise Service** (`src/services/exerciseService.ts`):
   ```typescript
   import api from './api';
   import { Exercise, ExerciseFilterOptions, ExerciseCategory, Equipment, PaginatedResponse } from '../types';
   
   export const exerciseService = {
     /**
      * Get exercises with optional filtering and pagination
      */
     async getExercises(options?: ExerciseFilterOptions): Promise<PaginatedResponse<Exercise>> {
       const params = options || {};
       const response = await api.get('/exercises', { params });
       return response.data;
     },
   
     /**
      * Get an exercise by ID
      */
     async getExerciseById(id: string): Promise<Exercise> {
       const response = await api.get(`/exercises/${id}`);
       return response.data.data;
     },
   
     /**
      * Get exercise categories
      */
     async getExerciseCategories(): Promise<PaginatedResponse<ExerciseCategory>> {
       const response = await api.get('/exercise-categories');
       return response.data;
     },
   
     /**
      * Get equipment options
      */
     async getEquipment(): Promise<PaginatedResponse<Equipment>> {
       const response = await api.get('/equipment');
       return response.data;
     },
   
     /**
      * Search exercises
      */
     async searchExercises(searchTerm: string): Promise<PaginatedResponse<Exercise>> {
       const response = await api.get('/exercises', { 
         params: { search: searchTerm } 
       });
       return response.data;
     }
   };
   ```

2. **Workout Plan Service** (`src/services/workoutPlanService.ts`):
   ```typescript
   import api from './api';
   import { 
     WorkoutPlan, 
     WorkoutPlanFilterOptions, 
     CreateWorkoutPlanRequest,
     PaginatedResponse 
   } from '../types';
   
   export const workoutPlanService = {
     /**
      * Get workout plans with optional filtering and pagination
      */
     async getWorkoutPlans(options?: WorkoutPlanFilterOptions): Promise<PaginatedResponse<WorkoutPlan>> {
       const params = options || {};
       const response = await api.get('/workout-plans', { params });
       return response.data;
     },
   
     /**
      * Get a workout plan by ID
      */
     async getWorkoutPlanById(id: number): Promise<WorkoutPlan> {
       const response = await api.get(`/workout-plans/${id}`);
       return response.data.data;
     },
   
     /**
      * Create a new workout plan
      */
     async createWorkoutPlan(workoutPlan: CreateWorkoutPlanRequest): Promise<WorkoutPlan> {
       const response = await api.post('/workout-plans', workoutPlan);
       return response.data.data;
     },
   
     /**
      * Update an existing workout plan
      */
     async updateWorkoutPlan(id: number, workoutPlan: Partial<CreateWorkoutPlanRequest>): Promise<WorkoutPlan> {
       const response = await api.put(`/workout-plans/${id}`, workoutPlan);
       return response.data.data;
     },
   
     /**
      * Delete a workout plan
      */
     async deleteWorkoutPlan(id: number): Promise<void> {
       await api.delete(`/workout-plans/${id}`);
     },
   
     /**
      * Add an exercise to a workout plan
      */
     async addExerciseToWorkoutPlan(workoutPlanId: number, exerciseData: CreateWorkoutExerciseRequest): Promise<WorkoutPlan> {
       const response = await api.post(`/workout-plans/${workoutPlanId}/exercises`, exerciseData);
       return response.data.data;
     },
   
     /**
      * Update an exercise in a workout plan
      */
     async updateExerciseInWorkoutPlan(
       workoutPlanId: number, 
       exerciseId: number, 
       exerciseData: Partial<CreateWorkoutExerciseRequest>
     ): Promise<WorkoutPlan> {
       const response = await api.put(
         `/workout-plans/${workoutPlanId}/exercises/${exerciseId}`, 
         exerciseData
       );
       return response.data.data;
     },
   
     /**
      * Remove an exercise from a workout plan
      */
     async removeExerciseFromWorkoutPlan(workoutPlanId: number, exerciseId: number): Promise<WorkoutPlan> {
       const response = await api.delete(`/workout-plans/${workoutPlanId}/exercises/${exerciseId}`);
       return response.data.data;
     }
   };
   ```

### Phase 2: Reusable Components (Day 1-2)

Create shared components for consistent UI:

1. **FilterPanel Component** (`src/components/common/FilterPanel.tsx`)
   - Reusable filter panel with expandable sections for categories, difficulty, etc.
   - Support for checkboxes, sliders, and search inputs

2. **Pagination Component** (`src/components/common/Pagination.tsx`)
   - Page navigation with customizable page size
   - Display of total results and current page

3. **SearchInput Component** (`src/components/common/SearchInput.tsx`)
   - Debounced search input with clear button
   - Support for search suggestions

4. **LoadingState Component** (`src/components/common/LoadingState.tsx`)
   - Skeleton loading states for different component types
   - Animated loading indicators

5. **ErrorState Component** (`src/components/common/ErrorState.tsx`)
   - Error display with retry functionality
   - Custom error messages based on error type

6. **Card Components** (`src/components/common/CardComponents.tsx`)
   - ExerciseCard: Compact display of exercise info
   - WorkoutPlanCard: Summary view of workout plan

### Phase 3: Exercise Components (Day 2-3)

Implement the exercise-related components:

1. **ExerciseList Component** (`src/components/exercises/ExerciseList.tsx`)
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { Grid, Box, Typography, CircularProgress } from '@mui/material';
   import { exerciseService } from '../../services/exerciseService';
   import { Exercise, ExerciseFilterOptions } from '../../types';
   import ExerciseCard from './ExerciseCard';
   import FilterPanel from '../common/FilterPanel';
   import Pagination from '../common/Pagination';
   import SearchInput from '../common/SearchInput';
   import ErrorState from '../common/ErrorState';
   
   const ExerciseList: React.FC = () => {
     const [exercises, setExercises] = useState<Exercise[]>([]);
     const [totalCount, setTotalCount] = useState(0);
     const [page, setPage] = useState(1);
     const [limit, setLimit] = useState(12);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [filters, setFilters] = useState<ExerciseFilterOptions>({});
     
     const fetchExercises = async () => {
       try {
         setIsLoading(true);
         setError(null);
         const response = await exerciseService.getExercises({
           ...filters,
           page,
           limit
         });
         setExercises(response.data);
         setTotalCount(response.count);
       } catch (err) {
         setError('Failed to fetch exercises');
         console.error(err);
       } finally {
         setIsLoading(false);
       }
     };
     
     useEffect(() => {
       fetchExercises();
     }, [page, limit, filters]);
     
     const handleSearch = (searchTerm: string) => {
       setFilters(prev => ({ ...prev, search: searchTerm }));
       setPage(1);
     };
     
     const handleFilterChange = (newFilters: Partial<ExerciseFilterOptions>) => {
       setFilters(prev => ({ ...prev, ...newFilters }));
       setPage(1);
     };
     
     const handlePageChange = (newPage: number) => {
       setPage(newPage);
     };
     
     if (isLoading && exercises.length === 0) {
       return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
     }
     
     if (error && exercises.length === 0) {
       return <ErrorState error={error} onRetry={fetchExercises} />;
     }
     
     return (
       <Box>
         <Box mb={3}>
           <SearchInput 
             placeholder="Search exercises..." 
             onSearch={handleSearch} 
           />
         </Box>
         
         <Box display="flex">
           <Box width="250px" mr={2}>
             <FilterPanel 
               onFilterChange={handleFilterChange} 
               filterOptions={filters}
             />
           </Box>
           
           <Box flex={1}>
             <Grid container spacing={2}>
               {exercises.map(exercise => (
                 <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                   <ExerciseCard exercise={exercise} />
                 </Grid>
               ))}
             </Grid>
             
             {exercises.length === 0 && !isLoading && (
               <Box textAlign="center" my={4}>
                 <Typography variant="h6">No exercises found</Typography>
                 <Typography variant="body2">
                   Try adjusting your search or filters
                 </Typography>
               </Box>
             )}
             
             <Box mt={3} display="flex" justifyContent="center">
               <Pagination 
                 page={page}
                 count={Math.ceil(totalCount / limit)}
                 onPageChange={handlePageChange}
               />
             </Box>
           </Box>
         </Box>
       </Box>
     );
   };
   
   export default ExerciseList;
   ```

2. **ExerciseCard Component** (`src/components/exercises/ExerciseCard.tsx`)
   - Display exercise name, thumbnail, difficulty, and primary muscle group
   - Click to view details

3. **ExerciseDetails Component** (`src/components/exercises/ExerciseDetails.tsx`)
   - Comprehensive exercise view with all details
   - Tabbed interface for instructions, related exercises, history
   - Media display for images/videos

4. **ExerciseSelector Component** (`src/components/exercises/ExerciseSelector.tsx`)
   - Modal for selecting exercises with search and filtering
   - Quick select interface for adding to workout plans

### Phase 4: Workout Plan Components (Day 3-4)

Implement the workout plan components:

1. **WorkoutPlanList Component** (`src/components/workouts/WorkoutPlanList.tsx`)
   - Grid/list of workout plans with filtering options
   - Toggle between all plans and user's plans

2. **WorkoutPlanCard Component** (`src/components/workouts/WorkoutPlanCard.tsx`)
   - Summary card with name, duration, difficulty, muscle groups
   - Action buttons for edit, delete, start

3. **WorkoutPlanEditor Component** (`src/components/workouts/WorkoutPlanEditor.tsx`)
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { 
     Box, 
     TextField, 
     Button, 
     Typography, 
     FormControl, 
     InputLabel, 
     Select, 
     MenuItem, 
     Paper,
     Divider,
     IconButton,
     List,
     ListItem,
     ListItemText,
     ListItemSecondaryAction
   } from '@mui/material';
   import DeleteIcon from '@mui/icons-material/Delete';
   import AddIcon from '@mui/icons-material/Add';
   import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
   import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
   
   import { 
     WorkoutPlan, 
     CreateWorkoutPlanRequest, 
     WorkoutExercise,
     Difficulty,
     WorkoutCategory,
     CreateWorkoutExerciseRequest
   } from '../../types';
   import { workoutPlanService } from '../../services/workoutPlanService';
   import ExerciseSelector from '../exercises/ExerciseSelector';
   
   interface WorkoutPlanEditorProps {
     workoutPlanId?: number;
     onSave?: (workoutPlan: WorkoutPlan) => void;
     onCancel?: () => void;
   }
   
   const WorkoutPlanEditor: React.FC<WorkoutPlanEditorProps> = ({ 
     workoutPlanId,
     onSave,
     onCancel
   }) => {
     const [workoutPlan, setWorkoutPlan] = useState<CreateWorkoutPlanRequest>({
       name: '',
       description: '',
       difficulty: Difficulty.BEGINNER,
       estimatedDuration: 30,
       workoutCategory: WorkoutCategory.FULL_BODY,
       exercises: []
     });
     
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
     
     useEffect(() => {
       if (workoutPlanId) {
         fetchWorkoutPlan();
       }
     }, [workoutPlanId]);
     
     const fetchWorkoutPlan = async () => {
       try {
         setIsLoading(true);
         const data = await workoutPlanService.getWorkoutPlanById(workoutPlanId!);
         
         // Map to editable format
         setWorkoutPlan({
           name: data.name,
           description: data.description,
           difficulty: data.difficulty,
           estimatedDuration: data.estimatedDuration,
           workoutCategory: data.workoutCategory,
           exercises: data.exercises.map(ex => ({
             exerciseId: ex.exercise.id,
             order: ex.order,
             repetitions: ex.repetitions,
             duration: ex.duration,
             restTime: ex.restTime,
             intensity: ex.intensity
           }))
         });
       } catch (err) {
         setError('Failed to load workout plan');
         console.error(err);
       } finally {
         setIsLoading(false);
       }
     };
     
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
       const { name, value } = e.target;
       setWorkoutPlan(prev => ({
         ...prev,
         [name!]: value
       }));
     };
     
     const handleDragEnd = (result: any) => {
       if (!result.destination) return;
       
       const items = Array.from(workoutPlan.exercises || []);
       const [reorderedItem] = items.splice(result.source.index, 1);
       items.splice(result.destination.index, 0, reorderedItem);
       
       // Update order property for each item
       const updatedItems = items.map((item, index) => ({
         ...item,
         order: index
       }));
       
       setWorkoutPlan(prev => ({
         ...prev,
         exercises: updatedItems
       }));
     };
     
     const handleAddExercise = (exercise: CreateWorkoutExerciseRequest) => {
       setWorkoutPlan(prev => ({
         ...prev,
         exercises: [...(prev.exercises || []), {
           ...exercise,
           order: prev.exercises?.length || 0
         }]
       }));
       setIsExerciseSelectorOpen(false);
     };
     
     const handleRemoveExercise = (index: number) => {
       const updatedExercises = [...(workoutPlan.exercises || [])];
       updatedExercises.splice(index, 1);
       
       // Update order for remaining exercises
       const reorderedExercises = updatedExercises.map((ex, idx) => ({
         ...ex,
         order: idx
       }));
       
       setWorkoutPlan(prev => ({
         ...prev,
         exercises: reorderedExercises
       }));
     };
     
     const handleSave = async () => {
       try {
         setIsLoading(true);
         setError(null);
         
         let savedWorkoutPlan;
         if (workoutPlanId) {
           savedWorkoutPlan = await workoutPlanService.updateWorkoutPlan(workoutPlanId, workoutPlan);
         } else {
           savedWorkoutPlan = await workoutPlanService.createWorkoutPlan(workoutPlan);
         }
         
         if (onSave) {
           onSave(savedWorkoutPlan);
         }
       } catch (err) {
         setError('Failed to save workout plan');
         console.error(err);
       } finally {
         setIsLoading(false);
       }
     };
     
     return (
       <Box>
         <Paper sx={{ p: 3, mb: 3 }}>
           <Typography variant="h5" gutterBottom>
             {workoutPlanId ? 'Edit Workout Plan' : 'Create Workout Plan'}
           </Typography>
           
           <Box component="form" noValidate autoComplete="off">
             <TextField
               label="Workout Name"
               name="name"
               value={workoutPlan.name}
               onChange={handleInputChange}
               fullWidth
               margin="normal"
               required
             />
             
             <TextField
               label="Description"
               name="description"
               value={workoutPlan.description}
               onChange={handleInputChange}
               fullWidth
               margin="normal"
               multiline
               rows={3}
               required
             />
             
             <Box display="flex" gap={2} mt={2}>
               <FormControl fullWidth margin="normal">
                 <InputLabel>Difficulty</InputLabel>
                 <Select
                   name="difficulty"
                   value={workoutPlan.difficulty}
                   onChange={handleInputChange}
                   label="Difficulty"
                 >
                   {Object.values(Difficulty).map(diff => (
                     <MenuItem key={diff} value={diff}>
                       {diff.charAt(0) + diff.slice(1).toLowerCase()}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
               
               <FormControl fullWidth margin="normal">
                 <InputLabel>Category</InputLabel>
                 <Select
                   name="workoutCategory"
                   value={workoutPlan.workoutCategory}
                   onChange={handleInputChange}
                   label="Category"
                 >
                   {Object.values(WorkoutCategory).map(cat => (
                     <MenuItem key={cat} value={cat}>
                       {cat.replace(/_/g, ' ')}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
               
               <TextField
                 label="Duration (minutes)"
                 name="estimatedDuration"
                 type="number"
                 value={workoutPlan.estimatedDuration}
                 onChange={handleInputChange}
                 fullWidth
                 margin="normal"
                 InputProps={{ inputProps: { min: 5, max: 180 } }}
               />
             </Box>
           </Box>
         </Paper>
         
         <Paper sx={{ p: 3 }}>
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6">Exercises</Typography>
             <Button 
               variant="contained" 
               startIcon={<AddIcon />}
               onClick={() => setIsExerciseSelectorOpen(true)}
             >
               Add Exercise
             </Button>
           </Box>
           
           <Divider sx={{ mb: 2 }} />
           
           {workoutPlan.exercises && workoutPlan.exercises.length > 0 ? (
             <DragDropContext onDragEnd={handleDragEnd}>
               <Droppable droppableId="exercises">
                 {(provided) => (
                   <List {...provided.droppableProps} ref={provided.innerRef}>
                     {workoutPlan.exercises.map((exercise, index) => (
                       <Draggable 
                         key={`${exercise.exerciseId}-${index}`} 
                         draggableId={`${exercise.exerciseId}-${index}`} 
                         index={index}
                       >
                         {(provided) => (
                           <ListItem
                             ref={provided.innerRef}
                             {...provided.draggableProps}
                             sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}
                           >
                             <div {...provided.dragHandleProps}>
                               <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                             </div>
                             
                             {/* Exercise details here */}
                             <ListItemText 
                               primary={`Exercise ${index + 1}`} 
                               secondary={`ID: ${exercise.exerciseId} | Reps: ${exercise.repetitions} | Rest: ${exercise.restTime}s`} 
                             />
                             
                             <ListItemSecondaryAction>
                               <IconButton edge="end" onClick={() => handleRemoveExercise(index)}>
                                 <DeleteIcon />
                               </IconButton>
                             </ListItemSecondaryAction>
                           </ListItem>
                         )}
                       </Draggable>
                     ))}
                     {provided.placeholder}
                   </List>
                 )}
               </Droppable>
             </DragDropContext>
           ) : (
             <Box textAlign="center" py={4}>
               <Typography variant="body1" color="text.secondary">
                 No exercises added yet. Click "Add Exercise" to start building your workout.
               </Typography>
             </Box>
           )}
         </Paper>
         
         {error && (
           <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
             <Typography color="error">{error}</Typography>
           </Box>
         )}
         
         <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
           {onCancel && (
             <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
               Cancel
             </Button>
           )}
           <Button 
             variant="contained" 
             onClick={handleSave} 
             disabled={isLoading || !workoutPlan.name || !workoutPlan.description}
           >
             {isLoading ? 'Saving...' : workoutPlanId ? 'Update' : 'Create'}
           </Button>
         </Box>
         
         {isExerciseSelectorOpen && (
           <ExerciseSelector 
             open={isExerciseSelectorOpen}
             onClose={() => setIsExerciseSelectorOpen(false)}
             onSelect={handleAddExercise}
           />
         )}
       </Box>
     );
   };
   
   export default WorkoutPlanEditor;
   ```

4. **ExerciseConfiguration Component** (`src/components/workouts/ExerciseConfiguration.tsx`)
   - Form for configuring sets, reps, rest time for an exercise
   - Support for different measurement types

### Phase 5: Integration & Pages (Day 4-5)

Update the main page components to use the new components:

1. **ExercisesPage** (`src/pages/exercises/ExercisesPage.tsx`)
   - Route handling for list and detail views
   - Integration with exercise components

2. **WorkoutPlansPage** (`src/pages/workouts/WorkoutPlansPage.tsx`)
   - Route handling for list, create, edit views
   - Integration with workout plan components

### Phase 6: Testing & Refinement (Day 5)

1. **Unit Tests**
   - Test core components with react-testing-library
   - Test API service functions with mocked responses

2. **UI Refinements**
   - Responsive design improvements
   - Accessibility enhancements
   - Loading state optimizations

## Component Dependencies

The components have the following dependencies:

1. **UI Framework**: Material-UI v5
2. **Data Fetching**: React Query (optional, can use useState/useEffect)
3. **Form Handling**: React Hook Form (optional, can use controlled components)
4. **Drag and Drop**: react-beautiful-dnd for exercise reordering

## Implementation Timeline

| Day | Focus | Components |
|-----|-------|------------|
| 1 | Foundation | TypeScript interfaces, API services, basic reusable components |
| 2 | Exercise Components | ExerciseList, ExerciseCard, ExerciseDetails |
| 3 | Exercise Components & Workout Start | ExerciseSelector, WorkoutPlanList, WorkoutPlanCard |
| 4 | Workout Plan Editor | WorkoutPlanEditor, ExerciseConfiguration |
| 5 | Integration & Testing | Page integration, testing, refinements |

## Mobile Considerations

All components should be implemented with mobile responsiveness in mind:

1. **ExerciseList**: Switch to single column on mobile
2. **FilterPanel**: Collapsible or modal on mobile
3. **WorkoutPlanEditor**: Simplified interface with stepped process on mobile
4. **ExerciseSelector**: Full-screen modal on mobile
5. **Touch Interactions**: Larger touch targets for mobile users

## Success Criteria

The implementation will be considered successful when:

1. Users can browse, search, and filter exercises
2. Users can view detailed exercise information
3. Users can create, edit, and manage workout plans
4. Users can add, remove, and reorder exercises in workout plans
5. The UI is responsive and works well on mobile devices
6. Components handle loading and error states gracefully
7. All components use TypeScript with proper type definitions
8. The implementation follows React best practices 