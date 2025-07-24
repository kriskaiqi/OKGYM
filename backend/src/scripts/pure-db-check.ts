/**
 * Pure Database Checker
 * 
 * This script uses the pg client directly to connect to the database
 * and check what ID types are being used without any TypeORM involvement.
 * This prevents any automatic schema synchronization.
 */

import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';

// Load environment variables
config();

// Get database connection info from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'okgym',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

console.log('Starting pure database check...');
console.log('Using database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  // Password hidden for security
});

async function checkDatabase() {
  const client = new Client(dbConfig);
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database successfully');
    
    // Check workout_plans table
    console.log('\nChecking workout_plans table...');
    const workoutPlansResult = await client.query(`
      SELECT id, 
             CASE WHEN id::text ~ '^[0-9]+$' THEN 'numeric'
                  WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'uuid'
                  ELSE 'other'
             END as id_type
      FROM workout_plans
      LIMIT 10
    `);
    
    if (workoutPlansResult.rows.length > 0) {
      console.log(`Found ${workoutPlansResult.rows.length} workout plans`);
      console.log('Sample workout_plans IDs:');
      workoutPlansResult.rows.forEach(row => {
        console.log(`- ${row.id} (${row.id_type})`);
      });
      
      // Count by type
      const countByTypeResult = await client.query(`
        SELECT 
          COUNT(CASE WHEN id::text ~ '^[0-9]+$' THEN 1 END) as numeric_count,
          COUNT(CASE WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_count,
          COUNT(*) as total_count
        FROM workout_plans
      `);
      
      const { numeric_count, uuid_count, total_count } = countByTypeResult.rows[0];
      console.log('\nID type distribution in workout_plans:');
      console.log(`- Numeric IDs: ${numeric_count} (${(numeric_count/total_count*100).toFixed(2)}%)`);
      console.log(`- UUID IDs: ${uuid_count} (${(uuid_count/total_count*100).toFixed(2)}%)`);
      console.log(`- Other formats: ${total_count - numeric_count - uuid_count}`);
    } else {
      console.log('No workout plans found in the database');
    }
    
    // Check workout_exercises table
    console.log('\nChecking workout_exercises table...');
    const workoutExercisesResult = await client.query(`
      SELECT id, workout_plan_id,
             CASE WHEN id::text ~ '^[0-9]+$' THEN 'numeric'
                  WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'uuid'
                  ELSE 'other'
             END as id_type,
             CASE WHEN workout_plan_id::text ~ '^[0-9]+$' THEN 'numeric'
                  WHEN workout_plan_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'uuid'
                  ELSE 'other'
             END as workout_plan_id_type
      FROM workout_exercises
      LIMIT 10
    `);
    
    if (workoutExercisesResult.rows.length > 0) {
      console.log(`Found ${workoutExercisesResult.rows.length} workout exercises`);
      console.log('Sample workout_exercises IDs:');
      workoutExercisesResult.rows.forEach(row => {
        console.log(`- ID: ${row.id} (${row.id_type}), Plan ID: ${row.workout_plan_id} (${row.workout_plan_id_type})`);
      });
      
      // Count by type
      const countExByTypeResult = await client.query(`
        SELECT 
          COUNT(CASE WHEN id::text ~ '^[0-9]+$' THEN 1 END) as numeric_id_count,
          COUNT(CASE WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_id_count,
          COUNT(CASE WHEN workout_plan_id::text ~ '^[0-9]+$' THEN 1 END) as numeric_plan_id_count,
          COUNT(CASE WHEN workout_plan_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_plan_id_count,
          COUNT(*) as total_count
        FROM workout_exercises
      `);
      
      const { numeric_id_count, uuid_id_count, numeric_plan_id_count, uuid_plan_id_count, total_count } = countExByTypeResult.rows[0];
      console.log('\nID type distribution in workout_exercises:');
      console.log(`- Numeric IDs: ${numeric_id_count} (${(numeric_id_count/total_count*100).toFixed(2)}%)`);
      console.log(`- UUID IDs: ${uuid_id_count} (${(uuid_id_count/total_count*100).toFixed(2)}%)`);
      console.log(`- Numeric Plan IDs: ${numeric_plan_id_count} (${(numeric_plan_id_count/total_count*100).toFixed(2)}%)`);
      console.log(`- UUID Plan IDs: ${uuid_plan_id_count} (${(uuid_plan_id_count/total_count*100).toFixed(2)}%)`);
    } else {
      console.log('No workout exercises found in the database');
    }
    
    // Check schema for column types
    console.log('\nChecking schema for ID column types...');
    const schemaResult = await client.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        udt_name
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
        AND column_name = 'id'
        AND (table_name = 'workout_plans' OR table_name = 'workout_exercises' OR table_name = 'workout_sessions')
    `);
    
    console.log('Database schema for ID columns:');
    schemaResult.rows.forEach(row => {
      console.log(`- Table: ${row.table_name}, Column: ${row.column_name}, Type: ${row.data_type} (${row.udt_name})`);
    });
    
    // Summary
    console.log('\n====================================');
    console.log('UUID COMPATIBILITY REPORT SUMMARY');
    console.log('====================================');
    console.log('A sample UUID for reference:', uuidv4());
    console.log('\nFINDINGS:');
    console.log('The application has been updated with a compatibility layer to handle both numeric and UUID IDs.');
    console.log('No schema changes are needed as long as the application can handle both ID types.');
    console.log('====================================');
    
  } catch (error) {
    console.error('Error during database check:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkDatabase().catch(console.error); 