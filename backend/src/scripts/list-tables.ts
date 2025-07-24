import { AppDataSource } from "../data-source";
import logger from "../utils/logger";

/**
 * This script lists all tables in the database
 */
async function listTables() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Get all tables in the database
      const tables = await queryRunner.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
      
      logger.info(`Found ${tables.length} tables in the database:`);
      tables.forEach((table: { table_name: string }) => {
        logger.info(`- ${table.table_name}`);
      });
      
    } catch (error) {
      logger.error("Error listing tables:", error);
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in listTables:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
listTables(); 