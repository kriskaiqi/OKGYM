import { Request, Response } from '../types/express';
import { ExerciseService } from '../services/ExerciseService';
import { AppError, ErrorType } from '../utils/errors';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { ExerciseRelation } from '../models/ExerciseRelation';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import logger from '../utils/logger';
import { AppDataSource } from '../data-source';
import { Inject } from '@nestjs/common';

/**
 * Controller for exercise-related operations
 * Handles HTTP requests and delegates business logic to ExerciseService
 */
export class ExerciseController {
  private exerciseService: ExerciseService;

  constructor(exerciseService?: ExerciseService) {
    if (exerciseService) {
      this.exerciseService = exerciseService;
    } else {
      // Initialize the service with required repositories from AppDataSource
      const exerciseRepository = AppDataSource.getRepository(Exercise);
      const categoryRepository = AppDataSource.getRepository(ExerciseCategory);
      const equipmentRepository = AppDataSource.getRepository(Equipment);
      const mediaRepository = AppDataSource.getRepository(Media);
      const relationRepository = AppDataSource.getRepository(ExerciseRelation);
      
      // Import cacheManager from the service
      const { cacheManager } = require('../services/CacheManager');
      
      // Create a new instance of the ExerciseService with all required dependencies
      this.exerciseService = new ExerciseService(
        exerciseRepository,
        categoryRepository,
        equipmentRepository,
        mediaRepository,
        relationRepository,
        cacheManager,
        AppDataSource
      );
      
      logger.info('ExerciseService initialized successfully in ExerciseController');
    }
  }

  /**
   * Create a new exercise
   * @route POST /api/exercises
   */
  async createExercise(req: Request, res: Response): Promise<Response> {
    try {
      const exercise = await this.exerciseService.createExercise(req.body);
      return res.status(201).json({
        success: true,
        data: exercise
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create exercise'
      });
    }
  }

  /**
   * Get an exercise by ID
   * @route GET /api/exercises/:id
   */
  async getExerciseById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const exercise = await this.exerciseService.getExerciseById(id);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: exercise
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercise'
      });
    }
  }

  /**
   * Update an exercise
   * @route PUT /api/exercises/:id
   */
  async updateExercise(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const updatedExercise = await this.exerciseService.updateExercise(id, req.body);
      
      return res.status(200).json({
        success: true,
        data: updatedExercise
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update exercise'
      });
    }
  }

  /**
   * Get equipment for a specific exercise
   * @route GET /api/exercises/:id/equipment
   */
  async getExerciseEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // Get the exercise first
      const exercise = await this.exerciseService.getExerciseById(id);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found'
        });
      }
      
      // Use direct query to get equipment for this exercise
      const equipmentQuery = `
        SELECT e.id, e.name, e.description, e.category 
        FROM equipment e
        JOIN exercise_equipment ee ON e.id = ee.equipment_id
        WHERE ee.exercise_id = $1
      `;
      
      // Execute the raw query using the repository from exercise service
      const equipment = await AppDataSource.getRepository(Equipment).query(equipmentQuery, [id]);
      
      return res.status(200).json({
        success: true,
        data: {
          exerciseId: id,
          equipment: equipment || []
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercise equipment'
      });
    }
  }

  /**
   * Delete an exercise
   * @route DELETE /api/exercises/:id
   */
  async deleteExercise(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.exerciseService.deleteExercise(id);
      
      return res.status(200).json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete exercise'
      });
    }
  }

  /**
   * Get all exercises with optional filtering, pagination, and sorting
   * 
   * @swagger
   * /api/exercises:
   *   get:
   *     summary: Get all exercises
   *     description: Retrieves a list of exercises with optional filtering, pagination, and sorting
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of exercises
   *       500:
   *         description: Server error
   * 
   * @param req Request with query parameters for filtering and pagination
   * @param res Response with exercises
   */
  async getAllExercises(req: Request, res: Response): Promise<Response> {
    try {
      // Check if database connection is initialized
      if (!AppDataSource.isInitialized) {
        logger.error('Database connection not initialized in getAllExercises');
        return res.status(500).json({
          success: false,
          error: 'Database connection not available',
          details: 'The application is still initializing, please try again in a moment'
        });
      }
      
      // Database connection is verified, proceed with the query
      try {
        const [exercises, count] = await this.exerciseService.getAllExercises(req.query);
        
        logger.debug(`Retrieved ${exercises.length} exercises out of ${count} total`);
        
        return res.status(200).json({
          success: true,
          data: exercises,
          count,
          page: parseInt(req.query.page as string) || 1,
          limit: parseInt(req.query.limit as string) || 20
        });
      } catch (serviceError) {
        logger.error('Exercise service error in getAllExercises', { 
          error: serviceError instanceof Error ? {
            message: serviceError.message,
            name: serviceError.name,
            stack: serviceError.stack
          } : serviceError,
          query: req.query
        });
        
        // Handle AppError types with appropriate status codes
        if (serviceError instanceof AppError) {
          return res.status(serviceError.statusCode).json({
            success: false,
            error: serviceError.message,
            details: serviceError.details || {},
            code: serviceError.type
          });
        }
        
        // Generic database or service error
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve exercises',
          details: serviceError instanceof Error ? serviceError.message : 'Unknown service error'
        });
      }
    } catch (error) {
      // Catch-all for unexpected errors
      logger.error('Unhandled error in getAllExercises controller', { 
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });
      
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }

  /**
   * Generates mock exercise data for fallback when database is unavailable
   * ONLY used in development or when database has issues
   */
  private getMockExercises() {
    return [
      {
        id: "mock-1",
        name: "Push-Up",
        description: "A classic bodyweight exercise for upper body strength",
        measurementType: "REPS",
        types: ["STRENGTH"],
        level: "BEGINNER",
        muscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"],
        equipment: [],
        estimatedDuration: 60,
        calories: 8,
        instructions: ["Start in plank position", "Lower body to ground", "Push back up"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "mock-2",
        name: "Squat",
        description: "A fundamental lower body exercise",
        measurementType: "REPS",
        types: ["STRENGTH"],
        level: "BEGINNER",
        muscleGroups: ["QUADS", "GLUTES", "HAMSTRINGS"],
        equipment: [],
        estimatedDuration: 60,
        calories: 8,
        instructions: ["Stand with feet shoulder-width apart", "Lower body as if sitting", "Rise back to standing"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "mock-3",
        name: "Plank",
        description: "Core stabilization exercise",
        measurementType: "TIME",
        types: ["CORE", "ISOMETRIC"],
        level: "BEGINNER",
        muscleGroups: ["CORE", "SHOULDERS"],
        equipment: [],
        estimatedDuration: 30,
        calories: 5,
        instructions: ["Start in push-up position on forearms", "Keep body straight", "Hold position"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // ============== Category Management Endpoints ==============

  /**
   * Get all exercise categories
   * @route GET /api/exercise-categories
   */
  async getExerciseCategories(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      const [categories, total] = await this.exerciseService.getExerciseCategories({ page, limit });
      
      return res.status(200).json({
        success: true,
        count: total,
        data: categories,
        page,
        limit
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve categories'
      });
    }
  }

  /**
   * Get category by ID
   * @route GET /api/exercise-categories/:id
   */
  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await this.exerciseService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve category'
      });
    }
  }

  /**
   * Create a new category
   * @route POST /api/exercise-categories
   */
  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const category = await this.exerciseService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create category'
      });
    }
  }

  /**
   * Update a category
   * @route PUT /api/exercise-categories/:id
   */
  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await this.exerciseService.updateCategory(id, req.body);
      
      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update category'
      });
    }
  }

  /**
   * Delete a category
   * @route DELETE /api/exercise-categories/:id
   */
  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.exerciseService.deleteCategory(id);
      
      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete category'
      });
    }
  }

  /**
   * Get exercises by category
   * @route GET /api/exercise-categories/:id/exercises
   */
  async getExercisesByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.findExercisesByCategory(id, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by category'
      });
    }
  }

  // ============== Equipment Management Endpoints ==============

  /**
   * Get all equipment
   * @route GET /api/equipment
   */
  async getAllEquipment(req: Request, res: Response): Promise<Response> {
    try {
      // Use parseFilterOptions helper to get all filter parameters
      const filterOptions = this.parseFilterOptions(req.query);
      
      // Ensure pagination defaults if not provided
      if (!filterOptions.page) filterOptions.page = 1;
      if (!filterOptions.limit) filterOptions.limit = 20;
      
      console.log('Equipment filter options:', filterOptions);
      
      const [equipment, total] = await this.exerciseService.getAllEquipment(filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: equipment,
        page: filterOptions.page,
        limit: filterOptions.limit
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve equipment'
      });
    }
  }

  /**
   * Get equipment by ID
   * @route GET /api/equipment/:id
   */
  async getEquipmentById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const equipment = await this.exerciseService.getEquipmentById(id);
      
      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Equipment not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve equipment'
      });
    }
  }

  /**
   * Create new equipment
   * @route POST /api/equipment
   */
  async createEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const equipment = await this.exerciseService.createEquipment(req.body);
      return res.status(201).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create equipment'
      });
    }
  }

  /**
   * Update equipment
   * @route PUT /api/equipment/:id
   */
  async updateEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const equipment = await this.exerciseService.updateEquipment(id, req.body);
      
      return res.status(200).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update equipment'
      });
    }
  }

  /**
   * Delete equipment
   * @route DELETE /api/equipment/:id
   */
  async deleteEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.exerciseService.deleteEquipment(id);
      
      return res.status(200).json({
        success: true,
        message: 'Equipment deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete equipment'
      });
    }
  }

  /**
   * Get exercises by equipment
   * @route GET /api/equipment/:id/exercises
   */
  async getExercisesByEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.findExercisesByEquipment(id, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by equipment'
      });
    }
  }

  // ============== Search and Filtering Endpoints ==============

  /**
   * Search exercises by keyword
   * @route GET /api/exercises/search
   */
  async searchExercises(req: Request, res: Response): Promise<Response> {
    try {
      const searchQuery = req.query.q as string;
      if (!searchQuery) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const filterOptions = this.parseFilterOptions(req.query);
      const [exercises, total] = await this.exerciseService.searchExercises(searchQuery, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to search exercises'
      });
    }
  }

  /**
   * Get exercises by muscle group
   * @route GET /api/exercises/by-muscle/:muscleGroup
   */
  async getExercisesByMuscleGroup(req: Request, res: Response): Promise<Response> {
    try {
      const { muscleGroup } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.getExercisesByMuscleGroup(muscleGroup, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by muscle group'
      });
    }
  }

  /**
   * Get exercises by difficulty
   * @route GET /api/exercises/by-difficulty/:difficulty
   */
  async getExercisesByDifficulty(req: Request, res: Response): Promise<Response> {
    try {
      const { difficulty } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.getExercisesByDifficulty(difficulty, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by difficulty'
      });
    }
  }

  /**
   * Get exercises by movement pattern
   * @route GET /api/exercises/by-movement/:movementPattern
   */
  async getExercisesByMovementPattern(req: Request, res: Response): Promise<Response> {
    try {
      const { movementPattern } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.getExercisesByMovementPattern(movementPattern, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by movement pattern'
      });
    }
  }

  /**
   * Get popular exercises
   * @route GET /api/exercises/popular
   */
  async getPopularExercises(req: Request, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      const [exercises, total] = await this.exerciseService.getPopularExercises(limit);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve popular exercises'
      });
    }
  }

  /**
   * Get exercises by IDs
   * @route GET /api/exercises?ids=id1,id2,id3&batch=true
   */
  async getExercisesByIds(req: Request, res: Response): Promise<Response> {
    try {
      const { ids } = req.query;
      
      // Split the comma-separated IDs and filter out empty strings
      const exerciseIds = (ids as string).split(',').filter(id => id.trim() !== '');
      
      if (exerciseIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid exercise IDs provided'
        });
      }
      
      logger.info(`Fetching exercises by IDs: ${exerciseIds.length} exercises requested`);
      
      // Create an array to store the exercises
      const exercises: any[] = [];
      
      // Process each ID and collect exercises
      for (const id of exerciseIds) {
        try {
          const exercise = await this.exerciseService.getExerciseById(id);
          if (exercise) {
            exercises.push(exercise);
          }
        } catch (error) {
          logger.warn(`Failed to fetch exercise with ID ${id}`, {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          // Continue with next ID even if one fails
        }
      }
      
      return res.status(200).json({
        success: true,
        count: exercises.length,
        requestedCount: exerciseIds.length,
        data: exercises
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercises by IDs'
      });
    }
  }

  // ============== Exercise Relationship Endpoints ==============

  /**
   * Get related exercises
   * @route GET /api/exercises/:id/related
   */
  async getRelatedExercises(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [exercises, total] = await this.exerciseService.getRelatedExercises(id, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: exercises,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve related exercises'
      });
    }
  }

  /**
   * Create exercise relation
   * @route POST /api/exercises/:id/relations
   */
  async createExerciseRelation(req: Request, res: Response): Promise<Response> {
    try {
      const { id: sourceExerciseId } = req.params;
      const relationData = {
        sourceExerciseId,
        ...req.body
      };
      
      const relation = await this.exerciseService.createExerciseRelation(relationData);
      
      return res.status(201).json({
        success: true,
        data: relation
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create exercise relation'
      });
    }
  }

  /**
   * Delete exercise relation
   * @route DELETE /api/exercises/relations/:relationId
   */
  async removeExerciseRelation(req: Request, res: Response): Promise<Response> {
    try {
      const { relationId } = req.params;
      await this.exerciseService.removeExerciseRelation(relationId);
      
      return res.status(200).json({
        success: true,
        message: 'Exercise relation deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete exercise relation'
      });
    }
  }

  /**
   * Get exercise alternatives
   * @route GET /api/exercises/:id/alternatives
   */
  async getExerciseAlternatives(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const filterOptions = this.parseFilterOptions(req.query);
      
      const [alternatives, total] = await this.exerciseService.getExerciseAlternatives(id, filterOptions);
      
      return res.status(200).json({
        success: true,
        count: total,
        data: alternatives,
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercise alternatives'
      });
    }
  }

  /**
   * Get exercise progressions
   * @route GET /api/exercises/:id/progressions
   */
  async getExerciseProgressions(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { direction } = req.query;
      const filterOptions = this.parseFilterOptions(req.query);
      
      // Convert direction string to the expected enum values
      const directionValue = direction as "EASIER" | "HARDER" | undefined;
      
      const [progressions, total] = await this.exerciseService.getExerciseProgressions(
        id, 
        directionValue, 
        filterOptions
      );
      
      return res.status(200).json({
        success: true,
        count: total,
        data: progressions,
        direction: direction || 'all',
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 20
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve exercise progressions'
      });
    }
  }
  
  /**
   * Helper method to parse filter options from query parameters
   */
  private parseFilterOptions(query: any): any {
    const filterOptions: any = {};
    
    // Pagination
    if (query.page) filterOptions.page = parseInt(query.page as string, 10);
    if (query.limit) filterOptions.limit = parseInt(query.limit as string, 10);
    
    // Filtering
    if (query.type) filterOptions.type = query.type;
    if (query.difficulty) filterOptions.difficulty = query.difficulty;
    if (query.muscleGroup) filterOptions.muscleGroup = query.muscleGroup;
    if (query.equipment) filterOptions.equipment = query.equipment;
    if (query.search) filterOptions.search = query.search;

        // Category filtering logic
    if (query.category) {
      filterOptions.category = query.category;
    }
    
    if (query.categoryId) {
      filterOptions.categoryIds = [parseInt(query.categoryId as string, 10)];
    }
    
    if (query.categoryIds) {
      if (Array.isArray(query.categoryIds)) {
        filterOptions.categoryIds = query.categoryIds.map((id: string) => parseInt(id, 10));
      } else if (typeof query.categoryIds === 'string') {
        filterOptions.categoryIds = query.categoryIds.split(',').map(id => parseInt(id.trim(), 10));
      }
    }
    
    return filterOptions;
  }
} 