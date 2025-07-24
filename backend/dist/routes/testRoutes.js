"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRoutes = void 0;
const express_1 = __importDefault(require("express"));
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
router.get('/test/exercise/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const exercises = await data_source_1.AppDataSource.query('SELECT * FROM exercises WHERE id = $1', [id]);
        if (!exercises || exercises.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }
        const exercise = exercises[0];
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
            data_source_1.AppDataSource.query(categoriesQuery, [id]),
            data_source_1.AppDataSource.query(equipmentQuery, [id]),
            data_source_1.AppDataSource.query(mediaQuery, [id])
        ]);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error loading exercise',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
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
        const workoutPlans = await data_source_1.AppDataSource.query('SELECT * FROM workout_plans WHERE id = $1', [numericId]);
        if (!workoutPlans || workoutPlans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Workout plan not found'
            });
        }
        const workoutPlan = workoutPlans[0];
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
            data_source_1.AppDataSource.query(tagsQuery, [numericId]),
            data_source_1.AppDataSource.query(muscleGroupsQuery, [numericId]),
            data_source_1.AppDataSource.query(equipmentQuery, [numericId])
        ]);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error loading workout plan',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
router.get('/test/relationships', async (req, res) => {
    try {
        const exercise = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).findOne({
            where: {},
            select: ['id', 'name', 'description', 'measurementType', 'types', 'level', 'movementPattern', 'targetMuscleGroups', 'stats']
        });
        if (!exercise) {
            return res.status(404).json({ error: 'No exercises found' });
        }
        const relations = await data_source_1.AppDataSource.query(`
      SELECT er.*, related.name as related_exercise_name
      FROM exercise_relations er
      JOIN exercises related ON er.related_exercise_id = related.id
      WHERE er.base_exercise_id = $1
      LIMIT 10
    `, [exercise.id]);
        const dbCategories = await data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory).find({
            take: 10
        });
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
            relationsCount: relations.length,
            relations,
            categoriesCount: dbCategories.length,
            categories: dbCategories,
            sampleRelations,
            sampleCategories,
            message: 'Displaying both real data and sample demonstration data'
        });
    }
    catch (error) {
        console.error('Error testing relationships:', error);
        return res.status(500).json({ error: 'Failed to test relationships', message: error.message });
    }
});
router.get('/test/workout-relationships', async (req, res) => {
    try {
        const workoutPlans = await data_source_1.AppDataSource.query(`
      SELECT * FROM workout_plans LIMIT 1
    `);
        if (!workoutPlans || workoutPlans.length === 0) {
            return res.status(404).json({ message: 'No workout plans found' });
        }
        const workoutPlan = workoutPlans[0];
        const equipmentQuery = `
      SELECT e.* 
      FROM workout_equipment we
      JOIN equipment e ON we.equipment_id = e.id
      WHERE we.workout_id = $1
    `;
        const equipment = await data_source_1.AppDataSource.query(equipmentQuery, [workoutPlan.id]);
        const muscleGroupsQuery = `
      SELECT c.* 
      FROM workout_muscle_group wmg
      JOIN exercise_categories c ON wmg.category_id = c.id
      WHERE wmg.workout_id = $1
    `;
        const muscleGroups = await data_source_1.AppDataSource.query(muscleGroupsQuery, [workoutPlan.id]);
        return res.json({
            success: true,
            workoutPlan,
            equipment,
            muscleGroups,
        });
    }
    catch (error) {
        logger_1.default.error('Error testing workout relationships', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            error: 'Failed to test workout relationships',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.testRoutes = router;
//# sourceMappingURL=testRoutes.js.map