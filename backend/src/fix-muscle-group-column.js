const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function fixMuscleGroupColumn() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check column type first
    const { rows: columnInfo } = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'exercises' AND column_name = 'targetMuscleGroups'
    `);
    
    console.log('Current targetMuscleGroups column info:', columnInfo[0]);
    
    // If it's not already an array type, convert it
    if (columnInfo[0].data_type !== 'ARRAY') {
      console.log('Converting targetMuscleGroups from text to text[]...');
      
      // Create a temporary column
      await client.query(`
        ALTER TABLE exercises 
        ADD COLUMN "targetMuscleGroups_array" text[] NULL
      `);
      console.log('Added temporary column');
      
      // Convert existing data to array format
      await client.query(`
        UPDATE exercises 
        SET "targetMuscleGroups_array" = string_to_array(replace(replace(replace("targetMuscleGroups", '[', ''), ']', ''), '"', ''), ',')
        WHERE "targetMuscleGroups" IS NOT NULL
      `);
      console.log('Converted data to array format');
      
      // Drop the original column
      await client.query(`
        ALTER TABLE exercises DROP COLUMN "targetMuscleGroups"
      `);
      console.log('Dropped original column');
      
      // Rename the new column
      await client.query(`
        ALTER TABLE exercises RENAME COLUMN "targetMuscleGroups_array" TO "targetMuscleGroups"
      `);
      console.log('Renamed column');
      
      // Verify the change
      const { rows: newColumnInfo } = await client.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'targetMuscleGroups'
      `);
      
      console.log('New targetMuscleGroups column info:', newColumnInfo[0]);
      console.log('Column type conversion completed successfully!');
    } else {
      console.log('targetMuscleGroups is already an array type, no conversion needed');
    }
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the fix function
fixMuscleGroupColumn().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 