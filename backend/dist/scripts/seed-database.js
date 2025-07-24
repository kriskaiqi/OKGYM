"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seed_1 = require("../seed");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedDatabase() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        await (0, seed_1.runSeeds)();
        await generateSeedingSummary();
        logger_1.default.info('Database seeding completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error seeding database:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
        process.exit(0);
    }
}
async function generateSeedingSummary() {
    try {
        logger_1.default.info('-----------------------------------------------');
        logger_1.default.info('DATABASE SEEDING SUMMARY');
        logger_1.default.info('-----------------------------------------------');
        logger_1.default.info('PHASE 1: FOUNDATION TABLES');
        const categoryCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM exercise_categories`);
        logger_1.default.info(`- Exercise Categories: ${categoryCount[0].count} records`);
        const categoryTypeCount = await data_source_1.AppDataSource.query(`
      SELECT type, COUNT(*) 
      FROM exercise_categories 
      GROUP BY type 
      ORDER BY type
    `);
        categoryTypeCount.forEach((typeCount) => {
            logger_1.default.info(`  - ${typeCount.type}: ${typeCount.count} records`);
        });
        const equipmentCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM equipment`);
        logger_1.default.info(`- Equipment: ${equipmentCount[0].count} records`);
        const workoutTagCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM workout_tags`);
        logger_1.default.info(`- Workout Tags: ${workoutTagCount[0].count} records`);
        const audioCueCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM audio_cues`);
        logger_1.default.info(`- Audio Cues: ${audioCueCount[0].count} records`);
        try {
            const achievementCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM achievement`);
            logger_1.default.info(`- Achievements: ${achievementCount[0].count} records`);
        }
        catch (error) {
            logger_1.default.warn(`- Achievements: Unable to determine table name (tried 'achievement')`);
            const tables = await data_source_1.AppDataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%achievement%'
      `);
            if (tables.length > 0) {
                const achievementTableName = tables[0].table_name;
                const achievementCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM "${achievementTableName}"`);
                logger_1.default.info(`- Achievements (${achievementTableName}): ${achievementCount[0].count} records`);
            }
        }
        logger_1.default.info('\nPHASE 2: MAIN ENTITIES');
        const exerciseCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM exercises`);
        logger_1.default.info(`- Exercises: ${exerciseCount[0].count} records`);
        const mediaCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM media`);
        logger_1.default.info(`- Media: ${mediaCount[0].count} records`);
        const workoutPlanCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM workout_plans`);
        logger_1.default.info(`- Workout Plans: ${workoutPlanCount[0].count} records`);
        const userCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM users`);
        logger_1.default.info(`- Users: ${userCount[0].count} records`);
        logger_1.default.info('\nPHASE 3: RELATIONSHIPS');
        const exerciseCategoryCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM exercise_category`);
        logger_1.default.info(`- Exercise-Category Relationships: ${exerciseCategoryCount[0].count} records`);
        const exerciseEquipmentCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM exercise_equipment`);
        logger_1.default.info(`- Exercise-Equipment Relationships: ${exerciseEquipmentCount[0].count} records`);
        try {
            const workoutExerciseCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM workout_exercises`);
            logger_1.default.info(`- Workout-Exercise Relationships: ${workoutExerciseCount[0].count} records`);
        }
        catch (error) {
            try {
                const workoutExerciseCount = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM workout_exercise`);
                logger_1.default.info(`- Workout-Exercise Relationships: ${workoutExerciseCount[0].count} records`);
            }
            catch (innerError) {
                logger_1.default.warn(`- Workout-Exercise Relationships: Unable to determine table name (tried workout_exercises and workout_exercise)`);
                const tables = await data_source_1.AppDataSource.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name LIKE '%workout%exercise%'
        `);
                if (tables.length > 0) {
                    logger_1.default.info(`  Found similar tables: ${tables.map((t) => t.table_name).join(', ')}`);
                }
            }
        }
        logger_1.default.info('\nADDITIONAL STATISTICS');
        const exercisesWithEquipment = await data_source_1.AppDataSource.query(`
      SELECT COUNT(DISTINCT exercise_id) FROM exercise_equipment
    `);
        const equipmentCoverage = (exercisesWithEquipment[0].count / exerciseCount[0].count * 100).toFixed(2);
        logger_1.default.info(`- Equipment Coverage: ${exercisesWithEquipment[0].count}/${exerciseCount[0].count} exercises (${equipmentCoverage}%)`);
        const exercisesWithCategories = await data_source_1.AppDataSource.query(`
      SELECT COUNT(DISTINCT exercise_id) FROM exercise_category
    `);
        const categoryCoverage = (exercisesWithCategories[0].count / exerciseCount[0].count * 100).toFixed(2);
        logger_1.default.info(`- Category Coverage: ${exercisesWithCategories[0].count}/${exerciseCount[0].count} exercises (${categoryCoverage}%)`);
        logger_1.default.info('\nTOP 5 EQUIPMENT BY USAGE:');
        const topEquipment = await data_source_1.AppDataSource.query(`
      SELECT e.name, COUNT(ee.exercise_id) as exercise_count
      FROM equipment e
      JOIN exercise_equipment ee ON e.id = ee.equipment_id
      GROUP BY e.name
      ORDER BY exercise_count DESC
      LIMIT 5
    `);
        topEquipment.forEach((equipment, index) => {
            logger_1.default.info(`  ${index + 1}. ${equipment.name}: ${equipment.exercise_count} exercises`);
        });
        logger_1.default.info('-----------------------------------------------');
    }
    catch (error) {
        logger_1.default.error('Error generating seeding summary:', error);
    }
}
seedDatabase();
//# sourceMappingURL=seed-database.js.map