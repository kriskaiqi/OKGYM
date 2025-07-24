"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExerciseCategoryJunction = seedExerciseCategoryJunction;
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedExerciseCategoryJunction() {
    try {
        logger_1.default.info('Starting to seed exercise-category junction table...');
        const existingCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
        if (parseInt(existingCount[0].count) > 0) {
            logger_1.default.info(`Found ${existingCount[0].count} existing entries in exercise_category junction table. Skipping seeding.`);
            return;
        }
        const exercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find();
        const categories = await data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory).find();
        logger_1.default.info(`Found ${exercises.length} exercises and ${categories.length} categories to process.`);
        if (exercises.length === 0 || categories.length === 0) {
            logger_1.default.warn('No exercises or categories found. Make sure those are seeded first.');
            return;
        }
        const junctionEntries = [];
        for (const exercise of exercises) {
            logger_1.default.info(`Processing categories for exercise: ${exercise.name} (${exercise.id})`);
            try {
                const typeMatches = categories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN &&
                    exercise.types.some(t => t.includes(cat.name.toUpperCase()) || cat.name.toUpperCase().includes(String(t))));
                const muscleGroupMatches = categories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.MUSCLE_GROUP &&
                    (exercise.targetMuscleGroups.some(m => cat.name.toUpperCase() === String(m)) ||
                        exercise.synergistMuscleGroups.some(m => cat.name.toUpperCase() === String(m))));
                const equipmentMatches = categories.filter(cat => {
                    var _a;
                    return cat.type === ExerciseCategory_1.CategoryType.EQUIPMENT &&
                        ((_a = exercise.equipmentOptions) === null || _a === void 0 ? void 0 : _a.some(e => cat.name.includes(e.name)));
                });
                const levelMatches = categories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.EXPERIENCE_LEVEL &&
                    (cat.name.toUpperCase().includes(String(exercise.level))));
                const movementMatches = categories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN &&
                    exercise.movementPattern && cat.name.toUpperCase().includes(String(exercise.movementPattern)));
                const allMatches = [
                    ...typeMatches,
                    ...muscleGroupMatches,
                    ...equipmentMatches,
                    ...levelMatches,
                    ...movementMatches
                ];
                const uniqueMatches = allMatches.filter((cat, index, self) => self.findIndex(c => c.id === cat.id) === index);
                logger_1.default.info(`Found ${uniqueMatches.length} matching categories for ${exercise.name}`);
                for (const category of uniqueMatches) {
                    junctionEntries.push({
                        exercise_id: exercise.id,
                        category_id: category.id
                    });
                }
            }
            catch (error) {
                logger_1.default.error(`Error processing categories for exercise ${exercise.name}:`, error);
            }
        }
        if (junctionEntries.length > 0) {
            logger_1.default.info(`Inserting ${junctionEntries.length} entries into exercise_category junction table...`);
            const batchSize = 100;
            for (let i = 0; i < junctionEntries.length; i += batchSize) {
                const batch = junctionEntries.slice(i, i + batchSize);
                const values = batch.map(entry => `('${entry.exercise_id}', ${entry.category_id})`).join(', ');
                await data_source_1.AppDataSource.query(`
          INSERT INTO "exercise_category" ("exercise_id", "category_id")
          VALUES ${values}
          ON CONFLICT ("exercise_id", "category_id") DO NOTHING
        `);
            }
            logger_1.default.info(`Successfully inserted ${junctionEntries.length} entries into exercise_category junction table`);
        }
        else {
            logger_1.default.warn('No matching categories found for any exercises');
        }
    }
    catch (error) {
        logger_1.default.error('Error seeding exercise-category junction table:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExerciseCategoryJunction.js.map