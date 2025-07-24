"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function migrateToUuidSchema() {
    logger_1.default.info('Starting migration to UUID schema');
    if (!data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Database connection established');
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        logger_1.default.info('Creating temporary mapping table');
        await queryRunner.query(`
      CREATE TEMPORARY TABLE workout_plan_id_mapping (
        old_id INTEGER PRIMARY KEY,
        new_id UUID NOT NULL DEFAULT uuid_generate_v4()
      );
    `);
        logger_1.default.info('Populating ID mapping table');
        await queryRunner.query(`
      INSERT INTO workout_plan_id_mapping (old_id)
      SELECT id FROM workout_plans;
    `);
        logger_1.default.info('Adding UUID column to workout_plans');
        await queryRunner.query(`
      ALTER TABLE workout_plans 
      ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
    `);
        logger_1.default.info('Updating new UUID column values');
        await queryRunner.query(`
      UPDATE workout_plans
      SET uuid_id = m.new_id
      FROM workout_plan_id_mapping m
      WHERE workout_plans.id = m.old_id;
    `);
        logger_1.default.info('Creating backup of workout_exercises table');
        await queryRunner.query(`
      CREATE TABLE workout_exercises_backup AS
      SELECT * FROM workout_exercises;
    `);
        logger_1.default.info('Updating workout_exercises foreign keys');
        await queryRunner.query(`
      ALTER TABLE workout_exercises
      ADD COLUMN workout_plan_uuid UUID;
    `);
        await queryRunner.query(`
      UPDATE workout_exercises
      SET workout_plan_uuid = m.new_id
      FROM workout_plan_id_mapping m
      WHERE workout_exercises.workout_plan_id = m.old_id;
    `);
        const relationTables = [
            'workout_muscle_group',
            'workout_tag_map',
            'workout_equipment',
            'workout_plan_combinations',
            'workout_ratings',
            'user_favorite_workouts',
            'user_workout_history'
        ];
        for (const table of relationTables) {
            logger_1.default.info(`Backing up and updating ${table} table`);
            const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
            if (!tableExists[0].exists) {
                logger_1.default.info(`Table ${table} does not exist, skipping`);
                continue;
            }
            const columnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${table}' 
          AND column_name = 'workout_id'
        );
      `);
            if (!columnExists[0].exists) {
                logger_1.default.info(`Table ${table} does not have workout_id column, skipping`);
                continue;
            }
            await queryRunner.query(`
        CREATE TABLE ${table}_backup AS
        SELECT * FROM ${table};
      `);
            await queryRunner.query(`
        ALTER TABLE ${table}
        ADD COLUMN workout_uuid UUID;
      `);
            await queryRunner.query(`
        UPDATE ${table}
        SET workout_uuid = m.new_id
        FROM workout_plan_id_mapping m
        WHERE ${table}.workout_id = m.old_id;
      `);
        }
        logger_1.default.info('Dropping primary key and constraints from workout_plans');
        const constraints = await queryRunner.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'workout_plans'::regclass;
    `);
        for (const constraint of constraints) {
            await queryRunner.query(`
        ALTER TABLE workout_plans DROP CONSTRAINT IF EXISTS "${constraint.conname}";
      `);
        }
        logger_1.default.info('Dropping old ID column and renaming UUID column');
        await queryRunner.query(`
      ALTER TABLE workout_plans DROP COLUMN id;
      ALTER TABLE workout_plans RENAME COLUMN uuid_id TO id;
      ALTER TABLE workout_plans ADD PRIMARY KEY (id);
    `);
        logger_1.default.info('Updating workout_exercises to use new UUID foreign keys');
        await queryRunner.query(`
      ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS fk_workout_exercises_plan;
      ALTER TABLE workout_exercises DROP COLUMN workout_plan_id;
      ALTER TABLE workout_exercises RENAME COLUMN workout_plan_uuid TO workout_plan_id;
      ALTER TABLE workout_exercises ADD CONSTRAINT fk_workout_exercises_plan
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE;
    `);
        for (const table of relationTables) {
            const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
            if (!tableExists[0].exists) {
                continue;
            }
            const columnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${table}' 
          AND column_name = 'workout_id'
        );
      `);
            if (!columnExists[0].exists) {
                continue;
            }
            logger_1.default.info(`Updating ${table} to use UUID foreign keys`);
            const constraints = await queryRunner.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = '${table}'::regclass
        AND conname LIKE '%workout_id%';
      `);
            for (const constraint of constraints) {
                await queryRunner.query(`
          ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint.conname}";
        `);
            }
            await queryRunner.query(`
        ALTER TABLE ${table} DROP COLUMN workout_id;
        ALTER TABLE ${table} RENAME COLUMN workout_uuid TO workout_id;
        ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_workout
          FOREIGN KEY (workout_id) REFERENCES workout_plans(id) ON DELETE CASCADE;
      `);
        }
        await queryRunner.commitTransaction();
        logger_1.default.info('Migration completed successfully');
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        logger_1.default.error('Error during migration:', error);
        throw error;
    }
    finally {
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Connection closed');
    }
}
migrateToUuidSchema()
    .then(() => {
    console.log('UUID migration completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fix-uuid-mismatch.js.map