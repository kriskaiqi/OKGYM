const { Client } = require('pg');
console.log('Starting verification script...');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function verifyCategories() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check exercise_categories table
    console.log('\nChecking exercise_categories table...');
    const { rows: categories } = await client.query(`
      SELECT * FROM exercise_categories ORDER BY id
    `);
    
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  ${cat.id}: ${cat.name} (${cat.type})`);
    });
    
    // Check exercise_category join table
    console.log('\nChecking exercise_category join table...');
    const { rows: relationships } = await client.query(`
      SELECT count(*) FROM exercise_category
    `);
    
    console.log(`Found ${relationships[0].count} exercise-category relationships`);
    
    // Get detailed relationship information
    console.log('\nDetailed relationship information:');
    const { rows: detailedRelationships } = await client.query(`
      SELECT 
        e.id AS exercise_id, 
        e.name AS exercise_name, 
        c.id AS category_id, 
        c.name AS category_name,
        c.type AS category_type
      FROM exercise_category ec
      JOIN exercises e ON e.id = ec.exercise_id
      JOIN exercise_categories c ON c.id = ec.category_id
      ORDER BY e.name, c.name
    `);
    
    // Group by exercise
    const exerciseCategories = {};
    detailedRelationships.forEach(rel => {
      if (!exerciseCategories[rel.exercise_name]) {
        exerciseCategories[rel.exercise_name] = {
          muscleGroups: [],
          primaryCategories: []
        };
      }
      
      if (rel.category_type === 'MUSCLE_GROUP') {
        exerciseCategories[rel.exercise_name].muscleGroups.push(rel.category_name);
      } else if (rel.category_type === 'SPECIAL') {
        exerciseCategories[rel.exercise_name].primaryCategories.push(rel.category_name);
      }
    });
    
    // Print exercise categories
    for (const [exercise, cats] of Object.entries(exerciseCategories)) {
      console.log(`\nExercise: ${exercise}`);
      if (cats.muscleGroups.length > 0) {
        console.log(`  Muscle Groups: ${cats.muscleGroups.join(', ')}`);
      }
      if (cats.primaryCategories.length > 0) {
        console.log(`  Categories: ${cats.primaryCategories.join(', ')}`);
      }
    }
    
    // Check primary categories (STRENGTH, CARDIO, etc)
    console.log('\nChecking primary categories:');
    const { rows: primaryCategories } = await client.query(`
      SELECT * FROM exercise_categories 
      WHERE type = 'SPECIAL' 
      ORDER BY name
    `);
    
    console.log(`Found ${primaryCategories.length} primary categories:`);
    for (const cat of primaryCategories) {
      // Count exercises in this category
      const { rows: count } = await client.query(`
        SELECT COUNT(*) FROM exercise_category
        WHERE category_id = $1
      `, [cat.id]);
      
      console.log(`  ${cat.name}: ${count[0].count} exercises`);
    }
    
    // Test filtering by STRENGTH category specifically
    console.log('\nTesting exercises in STRENGTH category:');
    const { rows: strengthCategories } = await client.query(`
      SELECT id FROM exercise_categories 
      WHERE name = 'STRENGTH' AND type = 'SPECIAL'
      LIMIT 1
    `);
    
    if (strengthCategories.length > 0) {
      const strengthId = strengthCategories[0].id;
      
      const { rows: strengthExercises } = await client.query(`
        SELECT e.id, e.name 
        FROM exercises e
        JOIN exercise_category ec ON e.id = ec.exercise_id
        WHERE ec.category_id = $1
      `, [strengthId]);
      
      if (strengthExercises.length > 0) {
        console.log(`Found ${strengthExercises.length} exercises in STRENGTH category:`);
        strengthExercises.forEach(ex => {
          console.log(`  - ${ex.name}`);
        });
      } else {
        console.log(`No exercises found in STRENGTH category`);
      }
    } else {
      console.log('STRENGTH category not found in database');
    }
    
  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
verifyCategories().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 