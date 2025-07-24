import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

/**
 * This script migrates the workout_plans table to use UUIDs as primary keys
 * and updates all related tables to maintain referential integrity.
 */
async function migrateToUuidSchema() {
  logger.info('Starting migration to UUID schema');

  // Initialize the data source
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  }

  // Create query runner for transaction management
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    logger.info('Creating temporary mapping table');
    
    // Create a temporary table to store id mappings (old integer id -> new UUID)
    await queryRunner.query(`
      CREATE TEMPORARY TABLE workout_plan_id_mapping (
        old_id INTEGER PRIMARY KEY,
        new_id UUID NOT NULL DEFAULT uuid_generate_v4()
      );
    `);

    // Populate mapping table with existing workout plan IDs
    logger.info('Populating ID mapping table');
    await queryRunner.query(`
      INSERT INTO workout_plan_id_mapping (old_id)
      SELECT id FROM workout_plans;
    `);

    // Add new UUID column to workout_plans
    logger.info('Adding UUID column to workout_plans');
    await queryRunner.query(`
      ALTER TABLE workout_plans 
      ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
    `);

    // Update the new UUID column using the mapping table
    logger.info('Updating new UUID column values');
    await queryRunner.query(`
      UPDATE workout_plans
      SET uuid_id = m.new_id
      FROM workout_plan_id_mapping m
      WHERE workout_plans.id = m.old_id;
    `);

    // Create backup of workout_exercises table
    logger.info('Creating backup of workout_exercises table');
    await queryRunner.query(`
      CREATE TABLE workout_exercises_backup AS
      SELECT * FROM workout_exercises;
    `);

    // Update workout_exercises foreign keys to use new UUIDs
    logger.info('Updating workout_exercises foreign keys');
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

    // Update other tables that reference workout_plans.id
    // Handle workout_tags, workout_equipment, etc.
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
      logger.info(`Backing up and updating ${table} table`);
      
      // Check if table exists
      const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
      
      if (!tableExists[0].exists) {
        logger.info(`Table ${table} does not exist, skipping`);
        continue;
      }

      // Check if table has workout_id column
      const columnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${table}' 
          AND column_name = 'workout_id'
        );
      `);
      
      if (!columnExists[0].exists) {
        logger.info(`Table ${table} does not have workout_id column, skipping`);
        continue;
      }

      // Create backup
      await queryRunner.query(`
        CREATE TABLE ${table}_backup AS
        SELECT * FROM ${table};
      `);

      // Add UUID column
      await queryRunner.query(`
        ALTER TABLE ${table}
        ADD COLUMN workout_uuid UUID;
      `);

      // Update UUID values
      await queryRunner.query(`
        UPDATE ${table}
        SET workout_uuid = m.new_id
        FROM workout_plan_id_mapping m
        WHERE ${table}.workout_id = m.old_id;
      `);
    }

    // Drop primary key and constraints
    logger.info('Dropping primary key and constraints from workout_plans');
    
    // Get all constraints on workout_plans
    const constraints = await queryRunner.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'workout_plans'::regclass;
    `);

    // Drop constraints
    for (const constraint of constraints) {
      await queryRunner.query(`
        ALTER TABLE workout_plans DROP CONSTRAINT IF EXISTS "${constraint.conname}";
      `);
    }

    // Drop old ID column and rename UUID column
    logger.info('Dropping old ID column and renaming UUID column');
    await queryRunner.query(`
      ALTER TABLE workout_plans DROP COLUMN id;
      ALTER TABLE workout_plans RENAME COLUMN uuid_id TO id;
      ALTER TABLE workout_plans ADD PRIMARY KEY (id);
    `);

    // Update workout_exercises to use new UUIDs
    logger.info('Updating workout_exercises to use new UUID foreign keys');
    await queryRunner.query(`
      ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS fk_workout_exercises_plan;
      ALTER TABLE workout_exercises DROP COLUMN workout_plan_id;
      ALTER TABLE workout_exercises RENAME COLUMN workout_plan_uuid TO workout_plan_id;
      ALTER TABLE workout_exercises ADD CONSTRAINT fk_workout_exercises_plan
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE;
    `);

    // Update other relationship tables
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

      logger.info(`Updating ${table} to use UUID foreign keys`);
      
      // Get constraint name
      const constraints = await queryRunner.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = '${table}'::regclass
        AND conname LIKE '%workout_id%';
      `);

      // Drop constraints
      for (const constraint of constraints) {
        await queryRunner.query(`
          ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint.conname}";
        `);
      }

      // Update columns
      await queryRunner.query(`
        ALTER TABLE ${table} DROP COLUMN workout_id;
        ALTER TABLE ${table} RENAME COLUMN workout_uuid TO workout_id;
        ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_workout
          FOREIGN KEY (workout_id) REFERENCES workout_plans(id) ON DELETE CASCADE;
      `);
    }

    // Commit the transaction
    await queryRunner.commitTransaction();
    logger.info('Migration completed successfully');
  } catch (error) {
    // Rollback the transaction in case of error
    await queryRunner.rollbackTransaction();
    logger.error('Error during migration:', error);
    throw error;
  } finally {
    // Release resources
    await queryRunner.release();
    await AppDataSource.destroy();
    logger.info('Connection closed');
  }
}

// Run the migration
migrateToUuidSchema()
  .then(() => {
    console.log('UUID migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 