import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * This script migrates the workout_plans table from integer IDs to UUIDs.
 * Instead of dropping and recreating constraints (which failed), it uses a multi-step approach:
 * 1. Adds a UUID column to workout_plans
 * 2. Populates the UUID column with values
 * 3. Creates new UUID columns in all referencing tables
 * 4. Establishes the mapping between old integer IDs and new UUIDs
 * 5. Updates foreign key columns in all referencing tables
 * 
 * This approach avoids dropping constraints that are actively being used.
 */
async function main() {
  try {
    logger.info('Starting workout_plans UUID migration...');
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if the uuid_id column already exists in the workout_plans table
      const checkUuidColumn = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'workout_plans' AND column_name = 'uuid_id'`
      );

      if (checkUuidColumn.length === 0) {
        logger.info('Adding uuid_id column to workout_plans table...');
        await queryRunner.query(
          `ALTER TABLE workout_plans ADD COLUMN uuid_id uuid DEFAULT uuid_generate_v4()`
        );
      } else {
        logger.info('uuid_id column already exists in workout_plans table');
      }

      // Get all workout plans with their ids
      const workoutPlans = await queryRunner.query(
        `SELECT id, uuid_id FROM workout_plans`
      );
      
      logger.info(`Retrieved ${workoutPlans.length} workout plans`);

      // Create mapping from integer IDs to UUIDs
      const idMapping = new Map();
      for (const plan of workoutPlans) {
        // If uuid_id is null, generate a new UUID
        if (!plan.uuid_id) {
          const newUuid = uuidv4();
          await queryRunner.query(
            `UPDATE workout_plans SET uuid_id = $1 WHERE id = $2`,
            [newUuid, plan.id]
          );
          idMapping.set(plan.id, newUuid);
        } else {
          idMapping.set(plan.id, plan.uuid_id);
        }
      }

      logger.info('Created ID mapping between integer IDs and UUIDs');

      // List of tables with foreign keys to workout_plans.id
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

      // Process each referencing table
      for (const ref of referencingTables) {
        try {
          // Check if the uuid column already exists
          const checkColumn = await queryRunner.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = '${ref.table}' AND column_name = '${ref.column}_uuid'`
          );

          // Add UUID column to the table if it doesn't exist
          if (checkColumn.length === 0) {
            logger.info(`Adding ${ref.column}_uuid column to ${ref.table} table...`);
            await queryRunner.query(
              `ALTER TABLE ${ref.table} ADD COLUMN ${ref.column}_uuid uuid`
            );
          } else {
            logger.info(`${ref.column}_uuid column already exists in ${ref.table} table`);
          }

          // Update UUID values based on the integer foreign keys
          logger.info(`Updating ${ref.column}_uuid values in ${ref.table}...`);
          
          // Get all records with their foreign keys
          const records = await queryRunner.query(
            `SELECT id, ${ref.column} FROM ${ref.table} WHERE ${ref.column} IS NOT NULL`
          );
          
          logger.info(`Found ${records.length} records in ${ref.table} to update`);
          
          // Update each record with the corresponding UUID
          for (const record of records) {
            const intId = record[ref.column];
            const uuid = idMapping.get(intId);
            
            if (uuid) {
              await queryRunner.query(
                `UPDATE ${ref.table} SET ${ref.column}_uuid = $1 WHERE id = $2`,
                [uuid, record.id]
              );
            } else {
              logger.warn(`No UUID mapping found for ${ref.table}.${ref.column} = ${intId}`);
            }
          }
        } catch (error) {
          logger.error(`Error processing ${ref.table}: ${error.message}`);
          throw error;
        }
      }

      logger.info('UUID migration completed successfully!');
      logger.info('Next steps:');
      logger.info('1. Update the entity models to use UUIDs instead of integers');
      logger.info('2. Create another migration script to finalize the changes (dropping old columns)');
      
      await queryRunner.commitTransaction();
    } catch (error) {
      logger.error(`Transaction failed: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      await AppDataSource.destroy();
    }
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

main().then(() => {
  logger.info('Script execution completed');
}).catch(err => {
  logger.error('Script execution failed:', err);
}); 