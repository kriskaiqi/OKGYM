"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const seedExerciseCategoryJunction_1 = require("../seed/seedExerciseCategoryJunction");
const logger_1 = __importDefault(require("../utils/logger"));
async function fixExerciseCategories() {
    try {
        logger_1.default.info('Starting exercise-category junction table fix...');
        if (!data_source_1.AppDataSource.isInitialized) {
            logger_1.default.info('Initializing database connection...');
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized successfully');
        }
        const { rows: tables } = await data_source_1.AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_category'
      );
    `);
        if (!tables[0].exists) {
            logger_1.default.error('The exercise_category junction table does not exist. Please run the fix-category-table.js script first.');
            process.exit(1);
        }
        await (0, seedExerciseCategoryJunction_1.seedExerciseCategoryJunction)();
        logger_1.default.info('Exercise-category junction table fix completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error fixing exercise-category junction table:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
    }
}
fixExerciseCategories().catch(error => {
    logger_1.default.error('Unhandled error during fix process:', error);
    process.exit(1);
});
//# sourceMappingURL=fix-exercise-categories.js.map