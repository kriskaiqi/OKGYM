import { createConnection } from "typeorm";
import path from "path";
import { config } from "dotenv";
import { Achievement } from "../models/Achievement";
import logger from "../utils/logger";

// Load environment variables from .env file
config({ path: path.resolve(__dirname, "../../.env") });

async function fixAchievementTable() {
  logger.info("Starting achievement table fix process...");
  
  // Create a database connection
  const connection = await createConnection({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_DATABASE || "okgym",
    entities: [path.join(__dirname, "../models/**/*.ts")],
    synchronize: false,
    logging: true
  });

  try {
    logger.info("Connected to database");
    
    // Get the table and column information
    const queryRunner = connection.createQueryRunner();
    
    // Check for foreign key constraints on the workout_session_id column
    const foreignKeyQuery = `
      SELECT 
        tc.constraint_name 
      FROM 
        information_schema.table_constraints AS tc 
      JOIN 
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'achievement' 
        AND kcu.column_name = 'workout_session_id'
    `;
    
    const foreignKeys = await queryRunner.query(foreignKeyQuery);
    
    // If there are foreign keys on the column, drop them first
    if (foreignKeys && foreignKeys.length > 0) {
      for (const fk of foreignKeys) {
        logger.info(`Dropping foreign key constraint: ${fk.constraint_name}`);
        await queryRunner.query(`ALTER TABLE achievement DROP CONSTRAINT "${fk.constraint_name}"`);
      }
    }
    
    // Alter the column to make it nullable
    logger.info("Modifying workout_session_id column to be nullable");
    await queryRunner.query(`ALTER TABLE achievement ALTER COLUMN workout_session_id DROP NOT NULL`);
    
    // Check if workout_sessions table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workout_sessions'
      );
    `;
    
    const tableExists = await queryRunner.query(tableExistsQuery);
    
    if (tableExists[0].exists) {
      // Re-add the foreign key constraint with ON DELETE SET NULL
      logger.info("Adding foreign key constraint with ON DELETE SET NULL");
      await queryRunner.query(`
        ALTER TABLE achievement
        ADD CONSTRAINT fk_achievement_workout_session
        FOREIGN KEY (workout_session_id) 
        REFERENCES workout_sessions(id) 
        ON DELETE SET NULL
      `);
    } else {
      logger.warn("Table 'workout_sessions' does not exist. Skipping foreign key creation.");
    }
    
    // Update existing rows with empty string to NULL
    logger.info("Updating existing rows with empty strings to NULL");
    await queryRunner.query(`
      UPDATE achievement 
      SET workout_session_id = NULL 
      WHERE workout_session_id = ''
    `);
    
    logger.info("Achievement table modification completed successfully");
  } catch (error) {
    logger.error("Error modifying achievement table:", error);
    throw error;
  } finally {
    // Close the connection
    await connection.close();
    logger.info("Database connection closed");
  }
}

// Run the script
fixAchievementTable()
  .then(() => {
    logger.info("Script executed successfully");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Script execution failed:", error);
    process.exit(1);
  }); 