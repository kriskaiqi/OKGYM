const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function updateMuscleGroups() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Define updates for each exercise
    const updates = [
      {
        name: 'Push-up',
        targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
        synergistMuscleGroups: ['CORE']
      },
      {
        name: 'Squat',
        targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
        synergistMuscleGroups: ['CORE', 'LOWER_BACK']
      },
      {
        name: 'Plank',
        targetMuscleGroups: ['CORE', 'ABS'],
        synergistMuscleGroups: ['SHOULDERS', 'BACK']
      },
      {
        name: 'Bench Press',
        targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
        synergistMuscleGroups: ['CORE']
      },
      {
        name: 'Deadlift',
        targetMuscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS'],
        synergistMuscleGroups: ['CORE', 'LOWER_BACK', 'FOREARMS']
      }
    ];
    
    // Update each exercise
    for (const update of updates) {
      console.log(`Updating ${update.name}...`);
      
      const result = await client.query(
        `UPDATE exercises 
         SET "targetMuscleGroups" = $1, 
             "synergistMuscleGroups" = $2 
         WHERE name = $3
         RETURNING id, name`,
        [update.targetMuscleGroups, update.synergistMuscleGroups, update.name]
      );
      
      if (result.rows.length > 0) {
        console.log(`  Updated exercise: ${result.rows[0].name} (${result.rows[0].id})`);
      } else {
        console.log(`  No exercise found with name: ${update.name}`);
      }
    }
    
    console.log('\nVerifying updates...');
    const { rows } = await client.query(
      `SELECT id, name, "targetMuscleGroups", "synergistMuscleGroups" 
       FROM exercises
       ORDER BY name`
    );
    
    rows.forEach(row => {
      console.log(`\nExercise: ${row.name} (${row.id})`);
      console.log(`  Primary muscles: ${JSON.stringify(row.targetMuscleGroups)}`);
      console.log(`  Secondary muscles: ${JSON.stringify(row.synergistMuscleGroups)}`);
    });
    
    console.log('\nUpdate completed successfully!');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the update function
updateMuscleGroups().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 