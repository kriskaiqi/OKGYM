import { AppDataSource } from './data-source';
import logger from './utils/logger';

async function checkSchema() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
    
    const result = await AppDataSource.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'workout_plans'
      ORDER BY ordinal_position;
    `);
    
    console.log(JSON.stringify(result, null, 2));
    
    // Also check workout_plans table metadata from TypeORM
    const workoutPlanMetadata = AppDataSource.getMetadata('workout_plans');
    logger.info(`Entity name: ${workoutPlanMetadata.name}`);
    logger.info(`Table name: ${workoutPlanMetadata.tableName}`);
    logger.info('Columns:');
    workoutPlanMetadata.columns.forEach(column => {
      logger.info(`- ${column.propertyName}: ${column.type} (${column.isPrimary ? 'PK' : 'not PK'})`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Error checking schema:', error);
  }
}

checkSchema(); 