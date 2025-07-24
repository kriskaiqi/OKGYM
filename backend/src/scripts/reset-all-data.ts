import { AppDataSource } from "../data-source";
import logger from "../utils/logger";

/**
 * This script safely truncates all tables in the database, removing all data
 * while maintaining the table structure and relationships.
 * It temporarily disables foreign key constraints to allow clean truncation.
 */
async function resetAllData() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Start transaction
      await queryRunner.startTransaction();
      
      // Disable foreign key constraints temporarily
      logger.info("Disabling foreign key constraints");
      await queryRunner.query(`SET CONSTRAINTS ALL DEFERRED`);
      
      // Get all tables except for migrations table (which should be preserved)
      const tablesResult = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name != 'migrations'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.map((result: any) => result.table_name);
      logger.info(`Found ${tables.length} tables to truncate`);
      
      // Truncate all tables in a single statement
      if (tables.length > 0) {
        const truncateQuery = `TRUNCATE TABLE ${tables.join(', ')} CASCADE`;
        logger.info(`Executing truncate query: ${truncateQuery}`);
        await queryRunner.query(truncateQuery);
        logger.info("All tables truncated successfully");
      }
      
      // Re-enable foreign key constraints
      logger.info("Re-enabling foreign key constraints");
      await queryRunner.query(`SET CONSTRAINTS ALL IMMEDIATE`);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      logger.info("Database reset completed successfully");
      
    } catch (error) {
      // Rollback the transaction if something goes wrong
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("Failed to reset database:", error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in resetAllData:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
resetAllData(); 