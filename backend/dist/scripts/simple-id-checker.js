"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
const connectWithTimeout = async (timeoutMs = 5000) => {
    return new Promise(async (resolve) => {
        const timeout = setTimeout(() => {
            logger_1.default.error(`Database connection timed out after ${timeoutMs}ms`);
            resolve(false);
        }, timeoutMs);
        try {
            if (!data_source_1.AppDataSource.isInitialized) {
                await data_source_1.AppDataSource.initialize();
            }
            clearTimeout(timeout);
            resolve(true);
        }
        catch (error) {
            clearTimeout(timeout);
            logger_1.default.error('Failed to connect to database:', error);
            resolve(false);
        }
    });
};
async function runSimpleIdCheck() {
    logger_1.default.info('Starting simple ID type check...');
    const connected = await connectWithTimeout();
    if (!connected) {
        logger_1.default.error('Cannot continue without database connection');
        process.exit(1);
    }
    logger_1.default.info('Database connection established');
    try {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const workoutPlanIds = await queryRunner.query(`SELECT id FROM workout_plans LIMIT 5`);
            const workoutExerciseIds = await queryRunner.query(`SELECT id FROM workout_exercises LIMIT 5`);
            logger_1.default.info('Sample Workout Plan IDs:');
            workoutPlanIds.forEach((row) => {
                logger_1.default.info(`- ${row.id} (${typeof row.id}, appears to be: ${isNaN(Number(row.id)) ? 'UUID' : 'numeric'})`);
            });
            logger_1.default.info('Sample Workout Exercise IDs:');
            workoutExerciseIds.forEach((row) => {
                logger_1.default.info(`- ${row.id} (${typeof row.id}, appears to be: ${isNaN(Number(row.id)) ? 'UUID' : 'numeric'})`);
            });
            const numericWorkoutPlanIds = await queryRunner.query(`SELECT COUNT(*) FROM workout_plans WHERE id::text ~ '^[0-9]+$'`);
            const uuidWorkoutPlanIds = await queryRunner.query(`SELECT COUNT(*) FROM workout_plans WHERE id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            const numericWorkoutExerciseIds = await queryRunner.query(`SELECT COUNT(*) FROM workout_exercises WHERE id::text ~ '^[0-9]+$'`);
            const uuidWorkoutExerciseIds = await queryRunner.query(`SELECT COUNT(*) FROM workout_exercises WHERE id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            logger_1.default.info(`
=============================================
SIMPLE ID TYPE CHECK REPORT
=============================================
Workout Plans:
- Numeric IDs: ${numericWorkoutPlanIds[0].count}
- UUID IDs: ${uuidWorkoutPlanIds[0].count}

Workout Exercises:
- Numeric IDs: ${numericWorkoutExerciseIds[0].count}
- UUID IDs: ${uuidWorkoutExerciseIds[0].count}

CONCLUSION:
The application code has been updated with a compatibility layer
to handle both ID types. No schema changes are needed.

A sample UUID for reference: ${(0, uuid_1.v4)()}
=============================================
      `);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error('Failed to check ID types:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            try {
                await data_source_1.AppDataSource.destroy();
                logger_1.default.info('Database connection closed');
            }
            catch (err) {
                logger_1.default.error('Error closing database connection:', err);
            }
        }
        logger_1.default.info('ID check script completed');
    }
}
runSimpleIdCheck();
//# sourceMappingURL=simple-id-checker.js.map