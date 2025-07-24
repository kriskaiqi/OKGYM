import { AppDataSource } from '../backend/src/data-source';

/**
 * This script fixes the exercise_category join table by:
 * 1. Checking the structure of the exercise_categories table
 * 2. Creating the exercise_category join table with the correct column types
 */
async function fixCategoryTable() {
  console.log('Starting database connection...');
  let connection = null;
  
  try {
    // Initialize database connection
    //connection = await AppDataSource.initialize();
    console.log('Database connected');
    
    // Check exercise_categories table structure
    console.log('Checking exercise_categories table structure:');
    const categoryColumns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'exercise_categories' 
      ORDER BY ordinal_position
    `);
    
    categoryColumns.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
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
    
    // Get the primary key type of exercise_categories
    const idType = categoryColumns.find((col: any) => col.column_name === 'id')?.data_type || 'uuid';
    console.log(`exercise_categories.id type is: ${idType}`);
    
    // Create exercise_category join table with correct types
    console.log('Creating exercise_category table with correct types...');
    await AppDataSource.query(`
      CREATE TABLE "exercise_category" (
        "exercise_id" uuid NOT NULL,
        "category_id" ${idType} NOT NULL,
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
    console.error('Error fixing database:', error);
  } finally {
    // Close database connection if it was opened
    if (connection) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the fix function
fixCategoryTable().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 