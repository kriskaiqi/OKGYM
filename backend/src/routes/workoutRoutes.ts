import { Router } from 'express';
import { WorkoutPlanController } from '../controllers/WorkoutPlanController';
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto, AddExerciseDto, UpdateExerciseDto, ReorderExercisesDto } from '../controllers/WorkoutPlanController';

const router = Router();
const workoutPlanService = new WorkoutPlanService();
const workoutPlanController = new WorkoutPlanController(workoutPlanService);

// Apply authentication middleware to all routes
router.use(authenticate);

// Workout Plan CRUD routes
router.post('/', 
  validateRequest(CreateWorkoutPlanDto),
  workoutPlanController.createWorkoutPlan.bind(workoutPlanController)
);

router.get('/:id', 
  workoutPlanController.getWorkoutPlan.bind(workoutPlanController)
);

router.put('/:id',
  validateRequest(UpdateWorkoutPlanDto),
  workoutPlanController.updateWorkoutPlan.bind(workoutPlanController)
);

router.delete('/:id',
  workoutPlanController.deleteWorkoutPlan.bind(workoutPlanController)
);

router.get('/',
  workoutPlanController.getWorkoutPlans.bind(workoutPlanController)
);

// Exercise management routes
router.post('/:id/exercises',
  validateRequest(AddExerciseDto),
  workoutPlanController.addExercise.bind(workoutPlanController)
);

router.put('/:id/exercises/:exerciseId',
  validateRequest(UpdateExerciseDto),
  workoutPlanController.updateExercise.bind(workoutPlanController)
);

router.delete('/:id/exercises/:exerciseId',
  workoutPlanController.removeExercise.bind(workoutPlanController)
);

router.put('/:id/exercises/reorder',
  validateRequest(ReorderExercisesDto),
  workoutPlanController.reorderExercises.bind(workoutPlanController)
);

export default router; 