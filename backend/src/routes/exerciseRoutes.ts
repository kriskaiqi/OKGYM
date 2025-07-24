import { Router } from 'express';
import { ExerciseController } from '../controllers/ExerciseController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { ExerciseRelation } from '../models/ExerciseRelation';
import { ExerciseService } from '../services/ExerciseService';
import logger from '../utils/logger';

const router = Router();

// Initialize repositories
const exerciseRepository = AppDataSource.getRepository(Exercise);
const categoryRepository = AppDataSource.getRepository(ExerciseCategory);
const equipmentRepository = AppDataSource.getRepository(Equipment);
const mediaRepository = AppDataSource.getRepository(Media);
const relationRepository = AppDataSource.getRepository(ExerciseRelation);

// Get cacheManager using require to match ExerciseController
const { cacheManager } = require('../services/CacheManager');

// Create ExerciseService with all required dependencies
const exerciseService = new ExerciseService(
  exerciseRepository,
  categoryRepository,
  equipmentRepository,
  mediaRepository,
  relationRepository,
  cacheManager,
  AppDataSource
);

// Create controller with the service instance
const exerciseController = new ExerciseController(exerciseService);

logger.info('ExerciseController initialized with ExerciseService in routes');

// ============== Exercise CRUD Routes ==============

// Public routes
// Combined route for both batch and regular exercise fetching
router.get('/exercises', (req, res, next) => {
  // Check if this is a batch request
  if (req.query.batch === 'true' && req.query.ids) {
    return exerciseController.getExercisesByIds(req, res);
  }
  // Otherwise, proceed with getAllExercises
  return exerciseController.getAllExercises(req, res);
});
router.get('/exercises/:id', exerciseController.getExerciseById.bind(exerciseController));

// Protected routes
router.post('/exercises', authenticate, exerciseController.createExercise.bind(exerciseController));
router.put('/exercises/:id', authenticate, exerciseController.updateExercise.bind(exerciseController));
router.delete('/exercises/:id', authenticate, isAdmin, exerciseController.deleteExercise.bind(exerciseController));

// ============== Category Routes ==============

// Public routes
router.get('/exercise-categories', exerciseController.getExerciseCategories.bind(exerciseController));
router.get('/exercise-categories/:id', exerciseController.getCategoryById.bind(exerciseController));
router.get('/exercise-categories/:id/exercises', exerciseController.getExercisesByCategory.bind(exerciseController));

// Protected routes
router.post('/exercise-categories', authenticate, isAdmin, exerciseController.createCategory.bind(exerciseController));
router.put('/exercise-categories/:id', authenticate, isAdmin, exerciseController.updateCategory.bind(exerciseController));
router.delete('/exercise-categories/:id', authenticate, isAdmin, exerciseController.deleteCategory.bind(exerciseController));

// ============== Equipment Routes ==============

// Public routes
router.get('/equipment', exerciseController.getAllEquipment.bind(exerciseController));
router.get('/equipment/:id', exerciseController.getEquipmentById.bind(exerciseController));
router.get('/equipment/:id/exercises', exerciseController.getExercisesByEquipment.bind(exerciseController));

// Protected routes
router.post('/equipment', authenticate, isAdmin, exerciseController.createEquipment.bind(exerciseController));
router.put('/equipment/:id', authenticate, isAdmin, exerciseController.updateEquipment.bind(exerciseController));
router.delete('/equipment/:id', authenticate, isAdmin, exerciseController.deleteEquipment.bind(exerciseController));

// Add endpoint to get equipment for a specific exercise
router.get('/:id/equipment', exerciseController.getExerciseEquipment.bind(exerciseController));

// ============== Search Routes ==============

router.get('/exercises/search', exerciseController.searchExercises.bind(exerciseController));
router.get('/exercises/by-muscle/:muscleGroup', exerciseController.getExercisesByMuscleGroup.bind(exerciseController));
router.get('/exercises/by-difficulty/:difficulty', exerciseController.getExercisesByDifficulty.bind(exerciseController));
router.get('/exercises/by-movement/:movementPattern', exerciseController.getExercisesByMovementPattern.bind(exerciseController));
router.get('/exercises/popular', exerciseController.getPopularExercises.bind(exerciseController));

// ============== Relationship Routes ==============

// Public routes
router.get('/exercises/:id/related', exerciseController.getRelatedExercises.bind(exerciseController));
router.get('/exercises/:id/alternatives', exerciseController.getExerciseAlternatives.bind(exerciseController));
router.get('/exercises/:id/progressions', exerciseController.getExerciseProgressions.bind(exerciseController));

// Protected routes
router.post('/exercises/:id/relations', authenticate, exerciseController.createExerciseRelation.bind(exerciseController));
router.delete('/exercises/relations/:relationId', authenticate, exerciseController.removeExerciseRelation.bind(exerciseController));

export default router; 