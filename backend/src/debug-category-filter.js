// Debug script to identify category filtering issues
const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

// Mock HTTP request with different category selection methods
const mockRequests = [
  { 
    name: 'STRING_NAME', 
    query: { category: 'CARDIO' } 
  },
  { 
    name: 'NUMBER_ID', 
    query: { categoryId: 117 } // CARDIO ID
  },
  { 
    name: 'STRING_ID', 
    query: { categoryId: '117' } // CARDIO ID as string
  },
  { 
    name: 'ARRAY_IDS', 
    query: { categoryIds: [117] } // CARDIO ID in array
  },
  { 
    name: 'ARRAY_STRING_IDS', 
    query: { categoryIds: ['117'] } // CARDIO ID as string in array
  },
  { 
    name: 'COMMA_STRING', 
    query: { categoryIds: '117' } // CARDIO ID as comma string
  }
];

/**
 * Debug function to trace the entire category filtering flow
 */
async function debugCategoryFiltering() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // 1. Get actual category data
    console.log('\n--- CATEGORY DATA ---');
    const { rows: categories } = await client.query(`
      SELECT id, name, type 
      FROM exercise_categories 
      WHERE type = 'SPECIAL'
      ORDER BY name
    `);
    
    // Format category data more clearly
    console.log('Categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id}, Type: ${cat.type})`);
    });
    
    // Get CARDIO category specifically
    let cardioCategory = categories.find(c => c.name === 'CARDIO');
    if (cardioCategory) {
      console.log(`\nFound CARDIO category: ID=${cardioCategory.id}, Type=${cardioCategory.type}`);
    } else {
      console.log('\nCARDIO category not found! Using TEST ID=117');
      cardioCategory = { id: 117, name: 'CARDIO' };
    }
    
    // 2. Check what exercises are ACTUALLY linked to CARDIO
    console.log('\n--- ACTUAL DATABASE RELATIONSHIPS ---');
    const { rows: linkedExercises } = await client.query(`
      SELECT e.id, e.name 
      FROM exercises e
      JOIN exercise_category ec ON e.id = ec.exercise_id
      WHERE ec.category_id = $1
    `, [cardioCategory.id]);
    
    console.log(`Exercises linked to CARDIO (${linkedExercises.length}):`);
    if (linkedExercises.length > 0) {
      linkedExercises.forEach(ex => console.log(`- ${ex.name} (ID: ${ex.id})`));
    } else {
      console.log('  No exercises found linked to CARDIO category');
    }
    
    // 3. Simulate repository queries for each mock request
    console.log('\n--- SIMULATING REPOSITORY QUERIES ---');
    
    for (const mockRequest of mockRequests) {
      console.log(`\nRequest type: ${mockRequest.name}`);
      console.log(`Query params: ${JSON.stringify(mockRequest.query)}`);
      
      // Extract potential category parameters
      let categoryParams = [];
      
      if (mockRequest.query.category) {
        // Option 1: category is directly the name
        const matchingCategory = categories.find(c => c.name === mockRequest.query.category);
        if (matchingCategory) {
          categoryParams = [matchingCategory.id];
          console.log(`Resolved category name '${mockRequest.query.category}' to ID: ${matchingCategory.id}`);
        }
      } else if (mockRequest.query.categoryId) {
        // Option 2: categoryId is provided directly
        categoryParams = [mockRequest.query.categoryId];
        console.log(`Using provided categoryId: ${mockRequest.query.categoryId}`);
      } else if (mockRequest.query.categoryIds) {
        // Option 3: categoryIds is an array or comma string
        if (Array.isArray(mockRequest.query.categoryIds)) {
          categoryParams = mockRequest.query.categoryIds;
          console.log(`Using provided categoryIds array: ${JSON.stringify(mockRequest.query.categoryIds)}`);
        } else if (typeof mockRequest.query.categoryIds === 'string') {
          categoryParams = mockRequest.query.categoryIds.split(',').map(id => id.trim());
          console.log(`Parsed categoryIds string to array: ${JSON.stringify(categoryParams)}`);
        }
      }
      
      if (categoryParams.length === 0) {
        console.log('No category parameters extracted from request!');
        continue;
      }
      
      // Test different query structures
      try {
        console.log(`Query params being used: ${JSON.stringify(categoryParams)}`);
        
        // Direct join query
        const { rows: directResults } = await client.query(`
          SELECT e.id, e.name
          FROM exercises e
          JOIN exercise_category ec ON e.id = ec.exercise_id
          WHERE ec.category_id IN (${categoryParams.map((_, i) => `$${i+1}`).join(',')})
        `, categoryParams);
        
        console.log(`Direct JOIN query results (${directResults.length}):`);
        if (directResults.length > 0) {
          directResults.forEach(ex => console.log(`- ${ex.name}`));
        } else {
          console.log('  No results found');
        }
        
        // Subquery structure (similar to what's in repository)
        const { rows: subqueryResults } = await client.query(`
          SELECT e.id, e.name
          FROM exercises e
          WHERE e.id IN (
            SELECT ec.exercise_id
            FROM exercise_category ec
            WHERE ec.category_id IN (${categoryParams.map((_, i) => `$${i+1}`).join(',')})
          )
        `, categoryParams);
        
        console.log(`Subquery results (${subqueryResults.length}):`);
        if (subqueryResults.length > 0) {
          subqueryResults.forEach(ex => console.log(`- ${ex.name}`));
        } else {
          console.log('  No results found');
        }
        
        // Check if numeric vs string IDs matter
        const numericParams = categoryParams.map(p => Number(p));
        const { rows: numericResults } = await client.query(`
          SELECT e.id, e.name
          FROM exercises e
          JOIN exercise_category ec ON e.id = ec.exercise_id
          WHERE ec.category_id IN (${numericParams.map((_, i) => `$${i+1}`).join(',')})
        `, numericParams);
        
        console.log(`Numeric parameter results (${numericResults.length}):`);
        if (numericResults.length > 0) {
          numericResults.forEach(ex => console.log(`- ${ex.name}`));
        } else {
          console.log('  No results found');
        }
      } catch (error) {
        console.error(`Error running query for ${mockRequest.name}:`, error.message);
      }
    }
    
    // 4. Check the table structure to ensure there are no type mismatches
    console.log('\n--- TABLE STRUCTURE ---');
    const { rows: exerciseCategoryColumns } = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'exercise_category'
    `);
    
    console.log('exercise_category columns:');
    exerciseCategoryColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.udt_name})`);
    });
    
    // 5. Check frontend API endpoints to see how category params are expected
    console.log('\n--- CHECKING FRONTEND/BACKEND PARAMETER HANDLING ---');
    
    // Try checking for categoryIds param in controller/service layers
    const frontendSample = {
      category: 'CARDIO',
      categoryId: 117,
      categoryIds: [117]
    };
    
    console.log('Typical frontend parameters that might be sent:');
    console.log(JSON.stringify(frontendSample, null, 2));
    
    const apiParamStructure = {
      exercise_categories: {
        paramName: 'categoryIds',
        paramType: 'array of numbers',
        exampleValue: [117, 118]
      },
      type: 'enum param',
      difficulty: 'enum param'
    };
    
    console.log('\nExpected API parameter structure:');
    console.log(JSON.stringify(apiParamStructure, null, 2));
    
    // 6. Check HTTP query parameters in repository files
    console.log('\n--- REPOSITORY FILTERING LOGIC ANALYSIS ---');
    
    console.log('Potential issues:');
    console.log('1. Category ID type mismatch (string vs number)');
    console.log('2. Parameter name mismatch (categoryId vs categoryIds vs category)');
    console.log('3. Query structure (direct join vs. subquery)');
    console.log('4. Table name (exercise_categories vs exercise_category)');
    
    console.log('\nRecommendations:');
    console.log('1. Add robust param handling to accept multiple formats (name → ID lookup)');
    console.log('2. Support both category, categoryId, and categoryIds parameters');
    console.log('3. Convert string IDs to numbers since the DB column is integer');
    console.log('4. Verify the join table column type matches parameter type');
    
  } catch (error) {
    console.error('Error in debug script:', error);
  } finally {
    // Use setTimeout to ensure all console.log messages are flushed before closing
    setTimeout(async () => {
      await client.end();
      console.log('\nDatabase connection closed');
    }, 1000);
  }
}

// Run the debug process
debugCategoryFiltering().catch(err => {
  console.error('Unhandled error:', err);
  // Keep process alive a bit longer to ensure output is visible
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}); 