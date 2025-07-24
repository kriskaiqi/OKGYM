"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
async function checkUUIDCompatibility() {
    try {
        logger_1.default.info('Starting UUID compatibility check...');
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Database connection established');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const workoutPlans = await queryRunner.query(`SELECT id FROM workout_plans WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            if (workoutPlans.length === 0) {
                logger_1.default.info('All workout plans have UUID format IDs.');
            }
            else {
                logger_1.default.info(`Found ${workoutPlans.length} workout plans with non-UUID format IDs.`);
                logger_1.default.info(`Example workout plan IDs: ${workoutPlans.slice(0, 5).map(p => p.id).join(', ')}`);
            }
            const workoutExercises = await queryRunner.query(`SELECT id FROM workout_exercises WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            if (workoutExercises.length === 0) {
                logger_1.default.info('All workout exercises have UUID format IDs.');
            }
            else {
                logger_1.default.info(`Found ${workoutExercises.length} workout exercises with non-UUID format IDs.`);
                logger_1.default.info(`Example workout exercise IDs: ${workoutExercises.slice(0, 5).map(e => e.id).join(', ')}`);
            }
            const workoutRelationships = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_exercises WHERE workout_plan_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            logger_1.default.info(`Found ${workoutRelationships[0].count} workout_exercises with non-UUID workout_plan_id references.`);
            const workoutSessions = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_sessions WHERE workout_plan_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            logger_1.default.info(`Found ${workoutSessions[0].count} workout_sessions with non-UUID workout_plan_id references.`);
            const testUuid = (0, uuid_1.v4)();
            logger_1.default.info(`UUID generation is working. Example: ${testUuid}`);
            logger_1.default.info(`
=============================================
UUID COMPATIBILITY REPORT
=============================================
- Workout Plans with non-UUID IDs: ${workoutPlans.length}
- Workout Exercises with non-UUID IDs: ${workoutExercises.length}
- Workout Exercises with non-UUID plan references: ${workoutRelationships[0].count}
- Workout Sessions with non-UUID plan references: ${workoutSessions[0].count}
- UUID generation is functioning correctly

RECOMMENDED ACTIONS:
1. Ensure all entity models use the union type approach (string | number) for IDs
2. Add helper functions for safe ID comparison
3. Update services to handle both ID formats
4. Consider migration strategy for standardizing on UUIDs in the future

Your application needs to support both numeric and UUID IDs.
The compatibility layer implemented in the code will handle
ID conversions without requiring schema changes.
      `);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error('UUID compatibility check failed:', error);
        process.exit(1);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
}
checkUUIDCompatibility();
//# sourceMappingURL=uuid-compatibility-layer.js.map