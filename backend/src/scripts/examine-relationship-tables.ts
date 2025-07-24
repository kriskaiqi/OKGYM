import { AppDataSource } from "../data-source";
import logger from "../utils/logger";

/**
 * This script examines the relationship tables between exercises, equipment, and categories
 * to better understand their structure and identify the correct tables and columns.
 */
async function examineRelationshipTables() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // List of tables we want to examine
      const relatedTables = [
        'exercises',
        'equipment',
        'equipment_muscle_groups',
        'exercise_equipment',
        'exercise_category',
        'exercise_categories'
      ];
      
      // Examine each table
      for (const tableName of relatedTables) {
        try {
          // Check if table exists by attempting to select from it
          const checkTable = await queryRunner.query(
            `SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            )`,
            [tableName]
          );
          
          if (checkTable[0].exists) {
            logger.info(`----- Table ${tableName} exists -----`);
            
            // Get table columns
            const columns = await queryRunner.query(
              `SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = $1`,
              [tableName]
            );
            
            logger.info(`Columns in ${tableName}:`);
            columns.forEach((col: any) => {
              logger.info(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
            });
            
            // Sample data (first 5 rows)
            const sampleData = await queryRunner.query(
              `SELECT * FROM ${tableName} LIMIT 5`
            );
            
            if (sampleData.length > 0) {
              logger.info(`Sample data from ${tableName} (first ${sampleData.length} rows):`);
              sampleData.forEach((row: any, index: number) => {
                logger.info(`  Row ${index + 1}: ${JSON.stringify(row)}`);
              });
            } else {
              logger.info(`No data found in ${tableName}`);
            }
          } else {
            logger.info(`Table ${tableName} does not exist`);
          }
        } catch (error) {
          logger.warn(`Error examining table ${tableName}:`, error);
        }
        
        logger.info(''); // Add empty line for separation
      }
      
    } catch (error) {
      logger.error("Error examining relationship tables:", error);
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in examineRelationshipTables:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
examineRelationshipTables(); 