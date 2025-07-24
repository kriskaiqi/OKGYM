"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
async function checkIdFormats() {
    var _a, _b;
    try {
        logger_1.default.info('Starting ID format check...');
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        logger_1.default.info('Database connection established');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const tables = ['workout_plans', 'workout_exercises', 'workout_sessions'];
            const tableInfo = {};
            for (const table of tables) {
                const columnInfo = await queryRunner.query(`SELECT column_name, data_type, udt_name 
           FROM information_schema.columns 
           WHERE table_name = $1 AND column_name = 'id'`, [table]);
                tableInfo[table] = columnInfo[0];
                logger_1.default.info(`Table ${table} ID column type: ${(_a = columnInfo[0]) === null || _a === void 0 ? void 0 : _a.data_type} (${(_b = columnInfo[0]) === null || _b === void 0 ? void 0 : _b.udt_name})`);
            }
            const workoutPlansNumericIds = await queryRunner.query(`SELECT id FROM workout_plans WHERE id ~ '^[0-9]+$'`);
            const workoutPlansUuidIds = await queryRunner.query(`SELECT id FROM workout_plans WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            logger_1.default.info(`Workout Plans with numeric IDs: ${workoutPlansNumericIds.length}`);
            logger_1.default.info(`Workout Plans with UUID format IDs: ${workoutPlansUuidIds.length}`);
            if (workoutPlansNumericIds.length > 0) {
                logger_1.default.info(`Sample numeric IDs: ${workoutPlansNumericIds.slice(0, 5).map(p => p.id).join(', ')}`);
            }
            const workoutExercisesNumericIds = await queryRunner.query(`SELECT id FROM workout_exercises WHERE id ~ '^[0-9]+$'`);
            const workoutExercisesUuidIds = await queryRunner.query(`SELECT id FROM workout_exercises WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
            logger_1.default.info(`Workout Exercises with numeric IDs: ${workoutExercisesNumericIds.length}`);
            logger_1.default.info(`Workout Exercises with UUID format IDs: ${workoutExercisesUuidIds.length}`);
            const exercisesToWorkoutPlan = await queryRunner.query(`SELECT we.id, we.workout_plan_id, wp.id as plan_id
         FROM workout_exercises we
         JOIN workout_plans wp ON we.workout_plan_id::text = wp.id::text
         LIMIT 5`);
            logger_1.default.info(`Checked workout_exercises join to workout_plans. Found ${exercisesToWorkoutPlan.length} valid joins.`);
            const sessionsToWorkoutPlan = await queryRunner.query(`SELECT ws.id, ws.workout_plan_id, wp.id as plan_id
         FROM workout_sessions ws
         JOIN workout_plans wp ON ws.workout_plan_id::text = wp.id::text
         LIMIT 5`);
            logger_1.default.info(`Checked workout_sessions join to workout_plans. Found ${sessionsToWorkoutPlan.length} valid joins.`);
            const totalWorkoutPlans = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_plans`);
            const totalWorkoutExercises = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_exercises`);
            const totalWorkoutSessions = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_sessions`);
            logger_1.default.info(`
=============================================
ID FORMAT COMPATIBILITY REPORT
=============================================
- Workout Plans total: ${totalWorkoutPlans[0].count}
  - Numeric IDs: ${workoutPlansNumericIds.length}
  - UUID format IDs: ${workoutPlansUuidIds.length}
  - Other formats: ${totalWorkoutPlans[0].count - workoutPlansNumericIds.length - workoutPlansUuidIds.length}

- Workout Exercises total: ${totalWorkoutExercises[0].count}
  - Numeric IDs: ${workoutExercisesNumericIds.length}
  - UUID format IDs: ${workoutExercisesUuidIds.length}
  - Other formats: ${totalWorkoutExercises[0].count - workoutExercisesNumericIds.length - workoutExercisesUuidIds.length}

- Workout Sessions total: ${totalWorkoutSessions[0].count}

COMPATIBILITY STATUS:
The application code has been updated to support both numeric IDs and UUID IDs
through a type compatibility layer. No schema changes are required; instead,
the code handles the conversion as needed.

To properly handle both ID formats:
1. Use WorkoutPlanId and WorkoutExerciseId union types (string | number)
2. Convert IDs to string when comparing them
3. Handle both formats in repository queries

UUID SAMPLE: ${(0, uuid_1.v4)()} (for reference)
=============================================
      `);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error('ID format check failed:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(0);
    }
}
checkIdFormats();
//# sourceMappingURL=uuid-id-checker.js.map