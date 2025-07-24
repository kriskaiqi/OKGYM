"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const seedExerciseCategoryJunction_1 = require("../seed/seedExerciseCategoryJunction");
const logger_1 = __importDefault(require("../utils/logger"));
async function runCategorySeed() {
    try {
        logger_1.default.info('Starting exercise-category junction seeding verification...');
        if (!data_source_1.AppDataSource.isInitialized) {
            logger_1.default.info('Initializing database connection...');
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized successfully');
        }
        const initialCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
        logger_1.default.info(`Initial count of entries in exercise_category table: ${initialCount[0].count}`);
        logger_1.default.info('Clearing existing entries from exercise_category table to force fresh seeding...');
        await data_source_1.AppDataSource.query(`
      DELETE FROM "exercise_category"
    `);
        const emptyCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
        logger_1.default.info(`Table cleared. Current count: ${emptyCount[0].count}`);
        logger_1.default.info('Running seedExerciseCategoryJunction function...');
        await (0, seedExerciseCategoryJunction_1.seedExerciseCategoryJunction)();
        const finalCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
        logger_1.default.info(`Final count of entries in exercise_category table: ${finalCount[0].count}`);
        const entriesAdded = parseInt(finalCount[0].count);
        if (entriesAdded > 0) {
            logger_1.default.info(`Success! ${entriesAdded} entries were added to the exercise_category table.`);
            const sampleEntries = await data_source_1.AppDataSource.query(`
        SELECT e.name as exercise_name, c.name as category_name, c.type as category_type
        FROM "exercise_category" ec
        JOIN "exercises" e ON ec.exercise_id = e.id
        JOIN "exercise_categories" c ON ec.category_id = c.id
        LIMIT 5
      `);
            logger_1.default.info('Sample of entries (first 5):');
            sampleEntries.forEach((entry, index) => {
                logger_1.default.info(`${index + 1}. Exercise: ${entry.exercise_name}, Category: ${entry.category_name} (${entry.category_type})`);
            });
        }
        else {
            logger_1.default.warn('No entries were added to the exercise_category table. This indicates an issue with the seeding process.');
        }
    }
    catch (error) {
        logger_1.default.error('Error during category seeding process:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
    }
}
runCategorySeed().catch(error => {
    logger_1.default.error('Unhandled error during seeding process:', error);
    process.exit(1);
});
//# sourceMappingURL=run-category-seed.js.map