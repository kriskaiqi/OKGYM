const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function testCategoryFiltering() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Get all primary categories
    const { rows: primaryCategories } = await client.query(`
      SELECT id, name FROM exercise_categories 
      WHERE type = 'SPECIAL'
      ORDER BY name
    `);
    
    console.log(`Found ${primaryCategories.length} primary categories:`);
    for (const cat of primaryCategories) {
      console.log(`- ${cat.name} (ID: ${cat.id})`);
    }
    
    // Check exercise counts for each category
    console.log('\nExercise counts by category:');
    for (const cat of primaryCategories) {
      const { rows: count } = await client.query(`
        SELECT COUNT(*) FROM exercise_category
        WHERE category_id = $1
      `, [cat.id]);
      
      console.log(`- ${cat.name}: ${count[0].count} exercises`);
    }
    
    // Test filtering with STRENGTH category (should have exercises)
    const strengthCategory = primaryCategories.find(c => c.name === 'STRENGTH');
    if (strengthCategory) {
      console.log(`\nTesting STRENGTH category filter (ID: ${strengthCategory.id}):`);
      
      // Get exercises directly from join table
      const { rows: strengthExercises } = await client.query(`
        SELECT e.id, e.name
        FROM exercises e
        JOIN exercise_category ec ON e.id = ec.exercise_id
        WHERE ec.category_id = $1
      `, [strengthCategory.id]);
      
      console.log(`Direct query found ${strengthExercises.length} STRENGTH exercises:`);
      for (const ex of strengthExercises) {
        console.log(`- ${ex.name}`);
      }
      
      // Simulate the API query that might be failing
      // This should match how the repository layer builds its query
      console.log('\nSimulating repository query with category filter:');
      const { rows: repositoryQueryResults } = await client.query(`
        SELECT DISTINCT e.id, e.name
        FROM exercises e
        LEFT JOIN exercise_category ec ON e.id = ec.exercise_id
        LEFT JOIN exercise_categories c ON ec.category_id = c.id
        WHERE c.id = $1
      `, [strengthCategory.id]);
      
      console.log(`Repository-style query found ${repositoryQueryResults.length} exercises`);
      
      // Check another query style that might be used
      console.log('\nSimulating another possible repository query:');
      const { rows: alternativeQueryResults } = await client.query(`
        SELECT e.id, e.name
        FROM exercises e
        WHERE e.id IN (
          SELECT exercise_id FROM exercise_category
          WHERE category_id = $1
        )
      `, [strengthCategory.id]);
      
      console.log(`Alternative query found ${alternativeQueryResults.length} exercises`);
    }
    
    // Now check a category that should have no exercises
    const cardioCategory = primaryCategories.find(c => c.name === 'CARDIO');
    if (cardioCategory) {
      console.log(`\nTesting CARDIO category filter (ID: ${cardioCategory.id}):`);
      
      // Get exercises directly from join table
      const { rows: cardioExercises } = await client.query(`
        SELECT e.id, e.name
        FROM exercises e
        JOIN exercise_category ec ON e.id = ec.exercise_id
        WHERE ec.category_id = $1
      `, [cardioCategory.id]);
      
      console.log(`Direct query found ${cardioExercises.length} CARDIO exercises`);
      
      // If no cardio exercises, add one for testing
      if (cardioExercises.length === 0) {
        console.log('\nAdding a test exercise to CARDIO category...');
        
        // Get the first exercise
        const { rows: exercises } = await client.query(`
          SELECT id, name FROM exercises LIMIT 1
        `);
        
        if (exercises.length > 0) {
          const exercise = exercises[0];
          
          // Add it to the CARDIO category
          await client.query(`
            INSERT INTO exercise_category (exercise_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [exercise.id, cardioCategory.id]);
          
          console.log(`Added "${exercise.name}" to CARDIO category for testing`);
          
          // Verify it was added
          const { rows: verification } = await client.query(`
            SELECT e.name FROM exercises e
            JOIN exercise_category ec ON e.id = ec.exercise_id
            WHERE ec.category_id = $1
          `, [cardioCategory.id]);
          
          console.log(`After adding, found ${verification.length} CARDIO exercises:`);
          verification.forEach(ex => console.log(`- ${ex.name}`));
        }
      }
    }
    
    // Check for any issues with the repository implementation
    console.log('\nExamining exercise_category table structure:');
    const { rows: tableInfo } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'exercise_category'
    `);
    
    console.log('exercise_category columns:');
    tableInfo.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
    
    // Check a few actual rows from the join table
    const { rows: sampleRows } = await client.query(`
      SELECT ec.exercise_id, ec.category_id, 
             e.name as exercise_name, 
             c.name as category_name, c.type as category_type
      FROM exercise_category ec
      JOIN exercises e ON ec.exercise_id = e.id
      JOIN exercise_categories c ON ec.category_id = c.id
      LIMIT 5
    `);
    
    console.log('\nSample rows from exercise_category join table:');
    sampleRows.forEach(row => {
      console.log(`- Exercise: "${row.exercise_name}" -> Category: "${row.category_name}" (${row.category_type})`);
    });
    
  } catch (error) {
    console.error('Error testing category filtering:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the test
testCategoryFiltering().catch(console.error); 