const { Client } = require('pg');
console.log('Script starting...');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function populateCategories() {
  console.log('populateCategories function started');
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // First check if we already have populated data
    const { rows: existingCategories } = await client.query('SELECT COUNT(*) FROM exercise_categories');
    const { rows: existingRelationships } = await client.query('SELECT COUNT(*) FROM exercise_category');
    
    console.log(`Current state: ${existingCategories[0].count} categories and ${existingRelationships[0].count} relationships`);
    
    // If we already have categories and relationships, just exit
    if (existingCategories[0].count > 0 && existingRelationships[0].count > 0) {
      console.log('Database already populated, no need to run population script again.');
      console.log(`You can delete the data first if you want to repopulate: 
        DELETE FROM exercise_category; 
        DELETE FROM exercise_categories;`);
      return;
    }
    
    // Define muscle group categories to insert
    console.log('Defining category data...');
    const muscleGroupCategories = [
      { name: 'Chest', type: 'MUSCLE_GROUP', description: 'Exercises targeting the chest muscles' },
      { name: 'Back', type: 'MUSCLE_GROUP', description: 'Exercises targeting the back muscles' },
      { name: 'Shoulders', type: 'MUSCLE_GROUP', description: 'Exercises targeting the shoulder muscles' },
      { name: 'Biceps', type: 'MUSCLE_GROUP', description: 'Exercises targeting the biceps' },
      { name: 'Triceps', type: 'MUSCLE_GROUP', description: 'Exercises targeting the triceps' },
      { name: 'Legs', type: 'MUSCLE_GROUP', description: 'Exercises targeting the leg muscles' },
      { name: 'Core', type: 'MUSCLE_GROUP', description: 'Exercises targeting the core muscles' },
      { name: 'Glutes', type: 'MUSCLE_GROUP', description: 'Exercises targeting the glute muscles' },
      { name: 'Calves', type: 'MUSCLE_GROUP', description: 'Exercises targeting the calf muscles' },
      { name: 'Full Body', type: 'MUSCLE_GROUP', description: 'Exercises targeting multiple muscle groups' },
      { name: 'Quadriceps', type: 'MUSCLE_GROUP', description: 'Exercises targeting the quadriceps' },
      { name: 'Hamstrings', type: 'MUSCLE_GROUP', description: 'Exercises targeting the hamstrings' },
      { name: 'Abs', type: 'MUSCLE_GROUP', description: 'Exercises targeting the abdominal muscles' },
      { name: 'Lower Back', type: 'MUSCLE_GROUP', description: 'Exercises targeting the lower back muscles' },
      { name: 'Forearms', type: 'MUSCLE_GROUP', description: 'Exercises targeting the forearm muscles' }
    ];
    
    // Define primary exercise categories (these match the frontend enum)
    const primaryCategories = [
      { name: 'STRENGTH', type: 'SPECIAL', description: 'Strength training exercises' },
      { name: 'CARDIO', type: 'SPECIAL', description: 'Cardiovascular exercises' },
      { name: 'FLEXIBILITY', type: 'SPECIAL', description: 'Flexibility and mobility exercises' },
      { name: 'BALANCE', type: 'SPECIAL', description: 'Balance and stability exercises' },
      { name: 'CIRCUIT', type: 'SPECIAL', description: 'Circuit training exercises' }
    ];
    
    // Step 1: Clear existing data (if any)
    console.log('Clearing existing category data...');
    await client.query('DELETE FROM exercise_category');
    await client.query('DELETE FROM exercise_categories');
    console.log('Existing data cleared');
    
    // Step 2: Insert primary categories first
    console.log('\nInserting primary categories...');
    const primaryCategoryInserts = [];
    for (const category of primaryCategories) {
      const result = await client.query(
        `INSERT INTO exercise_categories(name, type, description, "isActive", "displayOrder")
         VALUES($1, $2, $3, true, 0)
         RETURNING id, name`,
        [category.name, category.type, category.description]
      );
      
      console.log(`  Inserted category: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      primaryCategoryInserts.push(result.rows[0]);
    }
    
    // Step 3: Insert muscle group categories
    console.log('\nInserting muscle group categories...');
    const categoryInserts = [];
    for (const category of muscleGroupCategories) {
      const result = await client.query(
        `INSERT INTO exercise_categories(name, type, description, "isActive", "displayOrder")
         VALUES($1, $2, $3, true, 0)
         RETURNING id, name`,
        [category.name, category.type, category.description]
      );
      
      console.log(`  Inserted category: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      categoryInserts.push(result.rows[0]);
    }
    
    // Step 4: Map muscle group names to database IDs
    const muscleGroupMap = {};
    categoryInserts.forEach(cat => {
      muscleGroupMap[cat.name.toUpperCase()] = cat.id;
    });
    
    // Step 5: Map primary category names to database IDs
    const primaryCategoryMap = {};
    primaryCategoryInserts.forEach(cat => {
      primaryCategoryMap[cat.name] = cat.id;
    });
    
    // Step 6: Get all exercises
    console.log('\nFetching exercises...');
    const { rows: exercises } = await client.query(
      `SELECT id, name, "targetMuscleGroups", types
       FROM exercises`
    );
    console.log(`Found ${exercises.length} exercises`);
    
    // Step 7: Create exercise-category relationships for muscle groups
    console.log('\nCreating exercise-category relationships for muscle groups...');
    let muscleGroupRelationshipsCreated = 0;
    
    for (const exercise of exercises) {
      console.log(`\nProcessing exercise: ${exercise.name}`);
      
      // Skip if no target muscle groups
      if (!exercise.targetMuscleGroups || exercise.targetMuscleGroups.length === 0) {
        console.log('  No target muscle groups, skipping');
        continue;
      }
      
      // Convert PostgreSQL array format to JS array if needed
      let muscleGroups = exercise.targetMuscleGroups;
      if (typeof muscleGroups === 'string' && muscleGroups.startsWith('{') && muscleGroups.endsWith('}')) {
        muscleGroups = muscleGroups.slice(1, -1).split(',').map(item => item.replace(/"/g, '').trim());
      }
      
      console.log(`  Target muscle groups: ${JSON.stringify(muscleGroups)}`);
      
      // Create relationships for each muscle group
      for (const muscleGroup of muscleGroups) {
        // Handle different forms of muscle group names
        const normalizedName = muscleGroup.toUpperCase().replace(/^"(.+)"$/, '$1');
        
        // Find matching category
        let categoryId = null;
        
        // Direct match
        if (muscleGroupMap[normalizedName]) {
          categoryId = muscleGroupMap[normalizedName];
        } 
        // Try to find closest match
        else {
          const possibleMatches = Object.keys(muscleGroupMap).filter(key => 
            key.includes(normalizedName) || normalizedName.includes(key)
          );
          
          if (possibleMatches.length > 0) {
            categoryId = muscleGroupMap[possibleMatches[0]];
            console.log(`  Using closest match for "${normalizedName}": "${possibleMatches[0]}"`);
          }
        }
        
        if (categoryId) {
          try {
            await client.query(
              `INSERT INTO exercise_category("exercise_id", "category_id")
               VALUES($1, $2)
               ON CONFLICT DO NOTHING`,
              [exercise.id, categoryId]
            );
            console.log(`  Linked to muscle group category ID: ${categoryId}`);
            muscleGroupRelationshipsCreated++;
          } catch (error) {
            console.error(`  Error linking to category: ${error.message}`);
          }
        } else {
          console.log(`  No matching muscle group category found for "${normalizedName}"`);
        }
      }
      
      // Step 8: Add exercise to primary category based on its 'types' field
      if (exercise.types && exercise.types.length > 0) {
        let types = exercise.types;
        // Convert PostgreSQL array format to JS array if needed
        if (typeof types === 'string' && types.startsWith('{') && types.endsWith('}')) {
          types = types.slice(1, -1).split(',').map(item => item.replace(/"/g, '').trim());
        } else if (Array.isArray(types)) {
          // If it's already an array, just use it
          types = types;
        } else if (typeof types === 'string') {
          // If it's a string but not in array format, treat it as a single type
          types = [types];
        }
        
        console.log(`  Exercise types: ${JSON.stringify(types)}`);
        
        // Link exercise to appropriate primary category based on type
        for (const type of types) {
          // Extract the base type (e.g., STRENGTH_COMPOUND -> STRENGTH)
          const baseType = typeof type === 'string' ? 
            type.split('_')[0].toUpperCase() : 
            String(type).split('_')[0].toUpperCase();
          
          console.log(`  Extracted base type: ${baseType}`);
          
          if (primaryCategoryMap[baseType]) {
            try {
              await client.query(
                `INSERT INTO exercise_category("exercise_id", "category_id")
                 VALUES($1, $2)
                 ON CONFLICT DO NOTHING`,
                [exercise.id, primaryCategoryMap[baseType]]
              );
              console.log(`  Linked to primary category: ${baseType} (ID: ${primaryCategoryMap[baseType]})`);
              muscleGroupRelationshipsCreated++;
            } catch (error) {
              console.error(`  Error linking to primary category: ${error.message}`);
            }
          } else {
            console.log(`  No matching primary category found for "${baseType}", defaulting to STRENGTH`);
            // Default to STRENGTH if no match found
            if (primaryCategoryMap['STRENGTH']) {
              try {
                await client.query(
                  `INSERT INTO exercise_category("exercise_id", "category_id")
                   VALUES($1, $2)
                   ON CONFLICT DO NOTHING`,
                  [exercise.id, primaryCategoryMap['STRENGTH']]
                );
                console.log(`  Linked to default STRENGTH category (ID: ${primaryCategoryMap['STRENGTH']})`);
                muscleGroupRelationshipsCreated++;
              } catch (error) {
                console.error(`  Error linking to default category: ${error.message}`);
              }
            }
          }
        }
      } else {
        console.log('  No exercise types specified, defaulting to STRENGTH');
        
        // Default to STRENGTH if no type is specified
        if (primaryCategoryMap['STRENGTH']) {
          try {
            await client.query(
              `INSERT INTO exercise_category("exercise_id", "category_id")
               VALUES($1, $2)
               ON CONFLICT DO NOTHING`,
              [exercise.id, primaryCategoryMap['STRENGTH']]
            );
            console.log(`  Linked to default STRENGTH category (ID: ${primaryCategoryMap['STRENGTH']})`);
            muscleGroupRelationshipsCreated++;
          } catch (error) {
            console.error(`  Error linking to default category: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\nCreated ${muscleGroupRelationshipsCreated} exercise-category relationships`);
    
    // Verify results
    console.log('\nVerifying results...');
    const { rows: categoryCount } = await client.query('SELECT COUNT(*) FROM exercise_categories');
    const { rows: relationshipCount } = await client.query('SELECT COUNT(*) FROM exercise_category');
    
    console.log(`Categories in database: ${categoryCount[0].count}`);
    console.log(`Relationships in database: ${relationshipCount[0].count}`);
    
    console.log('\nPopulation completed successfully!');
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
populateCategories().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 