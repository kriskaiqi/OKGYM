const { Client } = require('pg');

// Database connection config - matching the configuration in data-source.ts
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',  // Updated to match data-source.ts
  port: 5432,
};

async function fixCategoryTable() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check exercise_categories table structure
    console.log('Checking exercise_categories table structure:');
    const { rows: categoryColumns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'exercise_categories' 
      ORDER BY ordinal_position
    `);
    
    categoryColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if exercise_category table exists and drop it if it does
    console.log('Checking if exercise_category table exists...');
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_category'
      );
    `);
    
    console.log(`Table exists: ${tableExists[0].exists}`);
    
    if (tableExists[0].exists) {
      console.log('Dropping existing exercise_category table...');
      await client.query(`DROP TABLE IF EXISTS "exercise_category"`);
      console.log('Table dropped successfully');
    }
    
    // Get the primary key type of exercise_categories
    const idCol = categoryColumns.find(col => col.column_name === 'id');
    const idType = idCol ? idCol.data_type : 'uuid';
    console.log(`exercise_categories.id type is: ${idType}`);
    
    // Create exercise_category join table with correct types
    console.log('Creating exercise_category table with correct types...');
    await client.query(`
      CREATE TABLE "exercise_category" (
        "exercise_id" uuid NOT NULL,
        "category_id" ${idType} NOT NULL,
        CONSTRAINT "PK_exercise_category" PRIMARY KEY ("exercise_id", "category_id")
      )
    `);
    console.log('Table created successfully');
    
    // Add foreign key for exercise_id
    console.log('Adding foreign key for exercise_id...');
    await client.query(`
      ALTER TABLE "exercise_category"
      ADD CONSTRAINT "FK_exercise_category_exercise_id"
      FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
    `);
    console.log('exercise_id foreign key added');
    
    // Add foreign key for category_id
    console.log('Adding foreign key for category_id...');
    await client.query(`
      ALTER TABLE "exercise_category"
      ADD CONSTRAINT "FK_exercise_category_category_id"
      FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE CASCADE
    `);
    console.log('category_id foreign key added');
    
    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX "IDX_exercise_category_exercise_id" ON "exercise_category" ("exercise_id")
    `);
    console.log('exercise_id index created');
    
    await client.query(`
      CREATE INDEX "IDX_exercise_category_category_id" ON "exercise_category" ("category_id")
    `);
    console.log('category_id index created');
    
    console.log('exercise_category table created successfully!');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    // Close database connection
    console.log('Closing database connection...');
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the fix function
fixCategoryTable().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 