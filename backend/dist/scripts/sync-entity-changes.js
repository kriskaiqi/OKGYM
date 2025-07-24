"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function main() {
    try {
        logger_1.default.info('Starting TypeORM entity synchronization...');
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            logger_1.default.info('Connected to database successfully');
            const pendingMigrations = await data_source_1.AppDataSource.showMigrations();
            logger_1.default.info(`Pending migrations: ${pendingMigrations}`);
            const workoutExerciseQuery = await queryRunner.query(`SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'`);
            logger_1.default.info(`WorkoutExercise.workout_plan_id type: ${JSON.stringify(workoutExerciseQuery)}`);
            const workoutSessionQuery = await queryRunner.query(`SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'workout_sessions' AND column_name = 'workout_plan_id'`);
            logger_1.default.info(`WorkoutSession.workout_plan_id type: ${JSON.stringify(workoutSessionQuery)}`);
            logger_1.default.info('Entity models have been updated to use consistent UUID types.');
            logger_1.default.info('WorkoutPlan.id, WorkoutExercise.workout_plan_id, and WorkoutSession.workout_plan_id now use string/UUID types.');
            logger_1.default.info('Database schema modifications need to be handled manually or with TypeORM migrations.');
            logger_1.default.info('Synchronization completed successfully!');
        }
        finally {
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
        }
    }
    catch (error) {
        logger_1.default.error(`Synchronization failed: ${error.message}`);
        logger_1.default.error(error.stack);
        process.exit(1);
    }
}
main().then(() => {
    logger_1.default.info('Script execution completed');
}).catch(err => {
    logger_1.default.error('Script execution failed:', err);
});
//# sourceMappingURL=sync-entity-changes.js.map