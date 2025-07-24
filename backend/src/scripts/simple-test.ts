import { AppDataSource } from '../data-source';
import { EntityRelationships } from '../utils/EntityRelationships';
import { WorkoutPlan } from '../models';

/**
 * Very simple script to test relationships and entity metadata
 */
async function simpleTest() {
  console.log('Starting simple entity metadata test...');
  
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connection established.');
    
    // Check WorkoutPlan metadata
    console.log('\nChecking WorkoutPlan metadata:');
    const workoutPlanMetadata = AppDataSource.getMetadata(WorkoutPlan);
    console.log(`WorkoutPlan metadata exists: ${!!workoutPlanMetadata}`);
    
    if (workoutPlanMetadata) {
      console.log(`Table name: ${workoutPlanMetadata.tableName}`);
      console.log(`Columns: ${workoutPlanMetadata.columns.map(c => c.propertyName).join(', ')}`);
      console.log(`Primary columns: ${workoutPlanMetadata.primaryColumns.map(c => c.propertyName).join(', ')}`);
    }
    
    // Try to execute a simple query for WorkoutPlan
    console.log('\nTrying to query WorkoutPlan:');
    try {
      const workoutPlans = await AppDataSource.getRepository(WorkoutPlan).find({
        take: 3 // limit to 3 results
      });
      console.log(`Found ${workoutPlans.length} workout plans`);
      workoutPlans.forEach(wp => {
        console.log(`- ID: ${wp.id}, Name: ${wp.name}`);
      });
    } catch (queryError) {
      console.error('Error querying WorkoutPlan:', queryError);
    }
    
    // Print relationship config
    console.log('\nRelationship configuration for Exercise.categories:');
    console.log(JSON.stringify(EntityRelationships.Exercise.categories, null, 2));
    
    // Test raw SQL for join table
    console.log('\nTesting direct SQL for exercise categories...');
    
    // Get an exercise ID
    const exercises = await AppDataSource.query('SELECT id, name FROM exercises LIMIT 1');
    
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found in database.');
      return;
    }
    
    const exerciseId = exercises[0].id;
    console.log(`Testing with exercise ID: ${exerciseId}, Name: ${exercises[0].name}`);
    
    // Query join table directly
    const joinConfig = EntityRelationships.Exercise.categories;
    const joinTableQuery = `
      SELECT * FROM ${joinConfig.joinTable}
      WHERE ${joinConfig.entityIdField} = $1
    `;
    
    const joinResults = await AppDataSource.query(joinTableQuery, [exerciseId]);
    console.log(`Found ${joinResults.length} join table entries.`);
    
    // Get the category IDs
    const categoryIds = joinResults.map(r => r[joinConfig.relationIdField]);
    console.log('Category IDs:', categoryIds);
    
    if (categoryIds.length > 0) {
      // Get category details
      const categories = await AppDataSource.query(
        `SELECT id, name FROM exercise_categories WHERE id IN (${categoryIds.map((_, i) => `$${i+1}`).join(',')})`,
        categoryIds
      );
      
      console.log(`\nFound ${categories.length} related categories:`);
      categories.forEach(c => console.log(`- ${c.name} (${c.id})`));
    }
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the test
simpleTest().catch(console.error); 