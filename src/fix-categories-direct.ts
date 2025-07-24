import { AppDataSource } from '../backend/src/data-source';

/**
 * This script creates the exercise_category join table
 * with the correct column types, based on the knowledge that
 * exercise_categories.id is an integer
 */
async function createJoinTable() {
  console.log('Starting database connection...');
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected');
    
    // Drop the previously created exercise_category table if it exists
    const tableExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_category'
      );
    `);
    
    if (tableExists[0].exists) {
      console.log('Dropping existing exercise_category table...');
      await AppDataSource.query(`DROP TABLE IF EXISTS "exercise_category"`);
    }
    
    // Create exercise_category join table with integer type for category_id
    console.log('Creating exercise_category table with integer type for category_id...');
    await AppDataSource.query(`
      CREATE TABLE "exercise_category" (
        "exercise_id" uuid NOT NULL,
        "category_id" integer NOT NULL,
        CONSTRAINT "PK_exercise_category" PRIMARY KEY ("exercise_id", "category_id")
      )
    `);
    
    // Add foreign key for exercise_id
    await AppDataSource.query(`
      ALTER TABLE "exercise_category"
      ADD CONSTRAINT "FK_exercise_category_exercise_id"
      FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
    `);
    
    // Add foreign key for category_id
    await AppDataSource.query(`
      ALTER TABLE "exercise_category"
      ADD CONSTRAINT "FK_exercise_category_category_id"
      FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE CASCADE
    `);
    
    // Create indexes
    await AppDataSource.query(`
      CREATE INDEX "IDX_exercise_category_exercise_id" ON "exercise_category" ("exercise_id")
    `);
    
    await AppDataSource.query(`
      CREATE INDEX "IDX_exercise_category_category_id" ON "exercise_category" ("category_id")
    `);
    
    console.log('exercise_category table created successfully!');
    
  } catch (error) {
    console.error('Error creating join table:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the function
createJoinTable().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 