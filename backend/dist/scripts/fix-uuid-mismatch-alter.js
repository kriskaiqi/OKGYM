"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
async function main() {
    try {
        logger_1.default.info('Starting workout_plans UUID migration...');
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const checkUuidColumn = await queryRunner.query(`SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'workout_plans' AND column_name = 'uuid_id'`);
            if (checkUuidColumn.length === 0) {
                logger_1.default.info('Adding uuid_id column to workout_plans table...');
                await queryRunner.query(`ALTER TABLE workout_plans ADD COLUMN uuid_id uuid DEFAULT uuid_generate_v4()`);
            }
            else {
                logger_1.default.info('uuid_id column already exists in workout_plans table');
            }
            const workoutPlans = await queryRunner.query(`SELECT id, uuid_id FROM workout_plans`);
            logger_1.default.info(`Retrieved ${workoutPlans.length} workout plans`);
            const idMapping = new Map();
            for (const plan of workoutPlans) {
                if (!plan.uuid_id) {
                    const newUuid = (0, uuid_1.v4)();
                    await queryRunner.query(`UPDATE workout_plans SET uuid_id = $1 WHERE id = $2`, [newUuid, plan.id]);
                    idMapping.set(plan.id, newUuid);
                }
                else {
                    idMapping.set(plan.id, plan.uuid_id);
                }
            }
            logger_1.default.info('Created ID mapping between integer IDs and UUIDs');
            const referencingTables = [
                { table: 'workout_exercises', column: 'workout_plan_id' },
                { table: 'workout_tag_map', column: 'workout_plan_id' },
                { table: 'workout_muscle_group', column: 'workout_plan_id' },
                { table: 'workout_equipment', column: 'workout_plan_id' },
                { table: 'workout_sessions', column: 'workout_plan_id' },
                { table: 'workout_ratings', column: 'workout_plan_id' },
                { table: 'feedback', column: 'workoutPlanId' },
                { table: 'schedule_items', column: 'workout_plan_id' },
                { table: 'workout_plan_combinations', column: 'workout_plan_id' },
                { table: 'program_workout_plans', column: 'workout_plan_id' },
                { table: 'user_favorite_workouts', column: 'workout_plan_id' },
                { table: 'user_workout_history', column: 'workout_plan_id' },
                { table: 'workout_audio_cues', column: 'workout_plan_id' }
            ];
            for (const ref of referencingTables) {
                try {
                    const checkColumn = await queryRunner.query(`SELECT column_name FROM information_schema.columns 
             WHERE table_name = '${ref.table}' AND column_name = '${ref.column}_uuid'`);
                    if (checkColumn.length === 0) {
                        logger_1.default.info(`Adding ${ref.column}_uuid column to ${ref.table} table...`);
                        await queryRunner.query(`ALTER TABLE ${ref.table} ADD COLUMN ${ref.column}_uuid uuid`);
                    }
                    else {
                        logger_1.default.info(`${ref.column}_uuid column already exists in ${ref.table} table`);
                    }
                    logger_1.default.info(`Updating ${ref.column}_uuid values in ${ref.table}...`);
                    const records = await queryRunner.query(`SELECT id, ${ref.column} FROM ${ref.table} WHERE ${ref.column} IS NOT NULL`);
                    logger_1.default.info(`Found ${records.length} records in ${ref.table} to update`);
                    for (const record of records) {
                        const intId = record[ref.column];
                        const uuid = idMapping.get(intId);
                        if (uuid) {
                            await queryRunner.query(`UPDATE ${ref.table} SET ${ref.column}_uuid = $1 WHERE id = $2`, [uuid, record.id]);
                        }
                        else {
                            logger_1.default.warn(`No UUID mapping found for ${ref.table}.${ref.column} = ${intId}`);
                        }
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error processing ${ref.table}: ${error.message}`);
                    throw error;
                }
            }
            logger_1.default.info('UUID migration completed successfully!');
            logger_1.default.info('Next steps:');
            logger_1.default.info('1. Update the entity models to use UUIDs instead of integers');
            logger_1.default.info('2. Create another migration script to finalize the changes (dropping old columns)');
            await queryRunner.commitTransaction();
        }
        catch (error) {
            logger_1.default.error(`Transaction failed: ${error.message}`);
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
        }
    }
    catch (error) {
        logger_1.default.error(`Migration failed: ${error.message}`);
        logger_1.default.error(error.stack);
        process.exit(1);
    }
}
main().then(() => {
    logger_1.default.info('Script execution completed');
}).catch(err => {
    logger_1.default.error('Script execution failed:', err);
});
//# sourceMappingURL=fix-uuid-mismatch-alter.js.map