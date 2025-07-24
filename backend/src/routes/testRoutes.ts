import express from 'express';
import { ExerciseService } from '../services/ExerciseService';
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutTag } from '../models/WorkoutTag';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import logger from '../utils/logger';
import { getRelationshipMetadata } from '../utils/RelationshipDecorators';

const router = express.Router();

// Get exercise with loaded relationships using direct queries
router.get('/test/exercise/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the exercise using raw query
    const exercises = await AppDataSource.query(
      'SELECT * FROM exercises WHERE id = $1', 
      [id]
    );
    
    if (!exercises || exercises.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Exercise not found' 
      });
    }
    
    const exercise = exercises[0];
    
    // Load relationships with direct queries
    const categoriesQuery = `
      SELECT c.* 
      FROM exercise_category ec
      JOIN exercise_categories c ON ec.category_id = c.id
      WHERE ec.exercise_id = $1
    `;
    
    const equipmentQuery = `
      SELECT e.* 
      FROM exercise_equipment ee
      JOIN equipment e ON ee.equipment_id = e.id
      WHERE ee.exercise_id = $1
    `;
    
    const mediaQuery = `
      SELECT m.* 
      FROM exercise_media em
      JOIN media m ON em.media_id = m.id
      WHERE em.exercise_id = $1
    `;
    
    const [categories, equipment, media] = await Promise.all([
      AppDataSource.query(categoriesQuery, [id]),
      AppDataSource.query(equipmentQuery, [id]),
      AppDataSource.query(mediaQuery, [id])
    ]);
    
    // Return complete result
    return res.json({
      success: true,
      exercise,
      relationshipCounts: {
        categories: categories.length,
        equipment: equipment.length,
        media: media.length
      },
      categories,
      equipment,
      media
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error loading exercise',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get workout plan with loaded relationships using direct queries
router.get('/test/workout/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Get workout plan using direct query
    const workoutPlans = await AppDataSource.query(
      'SELECT * FROM workout_plans WHERE id = $1',
      [numericId]
    );
    
    if (!workoutPlans || workoutPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    const workoutPlan = workoutPlans[0];
    
    // Get relationships using direct queries
    const tagsQuery = `
      SELECT t.* 
      FROM workout_tag_map wtm
      JOIN workout_tags t ON wtm.tag_id = t.id
      WHERE wtm.workout_id = $1
    `;
    
    const muscleGroupsQuery = `
      SELECT c.* 
      FROM workout_muscle_group wmg
      JOIN exercise_categories c ON wmg.category_id = c.id
      WHERE wmg.workout_id = $1
    `;
    
    const equipmentQuery = `
      SELECT e.* 
      FROM workout_equipment we
      JOIN equipment e ON we.equipment_id = e.id
      WHERE we.workout_id = $1
    `;
    
    const [tags, muscleGroups, equipment] = await Promise.all([
      AppDataSource.query(tagsQuery, [numericId]),
      AppDataSource.query(muscleGroupsQuery, [numericId]),
      AppDataSource.query(equipmentQuery, [numericId])
    ]);
    
    // Return with relationship counts
    return res.json({
      success: true,
      workoutPlan,
      relationshipCounts: {
        tags: tags.length,
        muscleGroups: muscleGroups.length,
        equipment: equipment.length
      },
      tags,
      muscleGroups,
      equipment
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error loading workout plan',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Simple test route for manual relationship testing
router.get('/test/relationships', async (req, res) => {
  try {
    // Find an exercise to display
    const exercise = await AppDataSource.getRepository(Exercise).findOne({
      where: {},
      select: ['id', 'name', 'description', 'measurementType', 'types', 'level', 'movementPattern', 'targetMuscleGroups', 'stats']
    });

    if (!exercise) {
      return res.status(404).json({ error: 'No exercises found' });
    }

    // Get relations from the exercise_relations table
    const relations = await AppDataSource.query(`
      SELECT er.*, related.name as related_exercise_name
      FROM exercise_relations er
      JOIN exercises related ON er.related_exercise_id = related.id
      WHERE er.base_exercise_id = $1
      LIMIT 10
    `, [exercise.id]);
    
    // Get all categories
    const dbCategories = await AppDataSource.getRepository(ExerciseCategory).find({
      take: 10
    });
    
    // Create sample data for demonstration
    const sampleCategories = [
      {
        id: 1,
        name: 'Chest',
        description: 'Exercises targeting chest muscles',
        type: 'MUSCLE_GROUP'
      },
      {
        id: 2,
        name: 'Pushing Exercises',
        description: 'Exercises that involve pushing resistance away from the body',
        type: 'MOVEMENT_PATTERN'
      },
      {
        id: 3,
        name: 'Bodyweight',
        description: 'Exercises that use body weight as resistance',
        type: 'EQUIPMENT'
      }
    ];

    // Create sample relation data
    const sampleRelations = [
      {
        id: '12345',
        base_exercise_id: exercise.id,
        related_exercise_id: 'a1b2c3d4',
        relationType: 'VARIATION',
        related_exercise_name: 'Incline Push-up'
      },
      {
        id: '67890',
        base_exercise_id: exercise.id,
        related_exercise_id: 'e5f6g7h8',
        relationType: 'ALTERNATIVE',
        related_exercise_name: 'Bench Press'
      }
    ];

    return res.json({
      success: true,
      exercise,
      // Real data
      relationsCount: relations.length,
      relations,
      categoriesCount: dbCategories.length,
      categories: dbCategories,
      // Sample data for demonstration
      sampleRelations,
      sampleCategories,
      message: 'Displaying both real data and sample demonstration data'
    });
  } catch (error) {
    console.error('Error testing relationships:', error);
    return res.status(500).json({ error: 'Failed to test relationships', message: error.message });
  }
});

// Simple test route for workout plan relationship testing
router.get('/test/workout-relationships', async (req, res) => {
  try {
    // Get a workout plan using raw SQL
    const workoutPlans = await AppDataSource.query(`
      SELECT * FROM workout_plans LIMIT 1
    `);
    
    if (!workoutPlans || workoutPlans.length === 0) {
      return res.status(404).json({ message: 'No workout plans found' });
    }
    
    const workoutPlan = workoutPlans[0];
    
    // Get equipment manually
    const equipmentQuery = `
      SELECT e.* 
      FROM workout_equipment we
      JOIN equipment e ON we.equipment_id = e.id
      WHERE we.workout_id = $1
    `;
    
    const equipment = await AppDataSource.query(equipmentQuery, [workoutPlan.id]);
    
    // Get muscle groups manually
    const muscleGroupsQuery = `
      SELECT c.* 
      FROM workout_muscle_group wmg
      JOIN exercise_categories c ON wmg.category_id = c.id
      WHERE wmg.workout_id = $1
    `;
    
    const muscleGroups = await AppDataSource.query(muscleGroupsQuery, [workoutPlan.id]);
    
    return res.json({
      success: true,
      workoutPlan,
      equipment,
      muscleGroups,
    });
  } catch (error) {
    logger.error('Error testing workout relationships', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      error: 'Failed to test workout relationships',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const testRoutes = router; 