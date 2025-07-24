"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const logger_1 = __importDefault(require("../utils/logger"));
async function resetExercisesTable() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const countBefore = await exerciseRepository.count();
        logger_1.default.info(`Current exercise count: ${countBefore}`);
        await data_source_1.AppDataSource.query('TRUNCATE TABLE "exercises" CASCADE');
        logger_1.default.info(`Successfully deleted all exercises from the database with CASCADE`);
        const countAfter = await exerciseRepository.count();
        logger_1.default.info(`Exercise count after reset: ${countAfter}`);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error resetting exercises table:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed after error');
        }
        throw error;
    }
}
resetExercisesTable()
    .then(() => {
    console.log('Exercise table reset completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to reset exercise table:', error);
    process.exit(1);
});
//# sourceMappingURL=reset-exercises.js.map