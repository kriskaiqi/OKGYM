// Connect to database and debug exercise category filtering
const { Client } = require('pg');

// DB Connection
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
});

async function debug() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Check for exercise_category table structure
    const categoryJoinResult = await client.query(
      `SELECT * FROM exercise_category LIMIT 5`
    );
    console.log('Sample exercise_category data:', categoryJoinResult.rows);

    // Check for exercise_categories table structure
    const categoriesResult = await client.query(
      `SELECT * FROM exercise_categories LIMIT 5`
    );
    console.log('Sample exercise_categories data:', categoriesResult.rows);

    // Debug frontend request structure
    console.log('\n========== DEBUGGING CONTROLLER PARAMETER HANDLING ==========');
    console.log('Simulating different request formats from frontend:');

    // Simulate controller's parseFilterOptions behavior
    function mockParseFilterOptions(query) {
      const filterOptions = {};
      
      // Pagination
      if (query.page) filterOptions.page = parseInt(query.page, 10);
      if (query.limit) filterOptions.limit = parseInt(query.limit, 10);
      
      // Category filtering
      if (query.category) {
        filterOptions.category = query.category;
        console.log(`Found 'category' parameter: ${query.category}`);
      }
      
      if (query.categoryId) {
        filterOptions.categoryIds = [parseInt(query.categoryId, 10)];
        console.log(`Found 'categoryId' parameter: ${query.categoryId}`);
      }
      
      if (query.categoryIds) {
        console.log(`Found 'categoryIds' parameter: ${JSON.stringify(query.categoryIds)}`);
        if (Array.isArray(query.categoryIds)) {
          filterOptions.categoryIds = query.categoryIds.map(id => parseInt(id, 10));
          console.log(`Parsed as array: ${JSON.stringify(filterOptions.categoryIds)}`);
        } else if (typeof query.categoryIds === 'string') {
          filterOptions.categoryIds = query.categoryIds.split(',').map(id => parseInt(id.trim(), 10));
          console.log(`Parsed as string: ${JSON.stringify(filterOptions.categoryIds)}`);
        }
      }
      
      console.log('Filter options after parsing:', filterOptions);
      return filterOptions;
    }

    // Simulate repository's findWithFilters behavior for category handling
    function mockRepositoryHandling(filterOptions) {
      console.log('\nRepository would process these filterOptions:');
      
      if (filterOptions.categoryIds?.length) {
        // Convert all IDs to numbers
        const numericCategoryIds = filterOptions.categoryIds.map(id => {
          // Handle string IDs by converting to number
          const result = typeof id === 'string' ? parseInt(id, 10) : id;
          console.log(`Converting ID ${id} to numeric: ${result}`);
          return result;
        }).filter(id => !isNaN(id));
        
        if (numericCategoryIds.length > 0) {
          console.log('Final category IDs for SQL query:', numericCategoryIds);
          console.log(`SQL would be: SELECT e.id FROM exercises e 
                      JOIN exercise_category ecm ON e.id = ecm.exercise_id 
                      WHERE ecm.category_id IN (${numericCategoryIds.join(',')})`);
        } else {
          console.log('No valid category IDs to filter on');
        }
      } else {
        console.log('No categoryIds found in filter options');
      }
    }

    // Test cases
    const testCases = [
      { name: "Request with categoryIds as array of numbers", query: { categoryIds: [117] } },
      { name: "Request with categoryIds as array of strings", query: { categoryIds: ['117'] } },
      { name: "Request with categoryIds as comma string", query: { categoryIds: '117' } },
      { name: "Request with categoryId", query: { categoryId: '117' } },
      { name: "Request with category name", query: { category: 'Cardio' } },
      { name: "Request with no category params", query: { page: 1, limit: 10 } },
    ];

    testCases.forEach(test => {
      console.log(`\n----- Test: ${test.name} -----`);
      console.log('Request query params:', test.query);
      const filterOptions = mockParseFilterOptions(test.query);
      mockRepositoryHandling(filterOptions);
    });

    // Check actual database for a specific category
    console.log('\n========== CHECKING DATABASE FOR CATEGORY 117 ==========');
    const cardioExercises = await client.query(
      `SELECT e.id, e.name 
       FROM exercises e
       JOIN exercise_category ec ON e.id = ec.exercise_id
       WHERE ec.category_id = 117
       LIMIT 5`
    );
    console.log(`Found ${cardioExercises.rows.length} exercises with category 117:`);
    console.log(cardioExercises.rows);

    // Get browser URL and extract parameters
    console.log('\n========== CHECK YOUR BROWSER URL ==========');
    console.log('If your browser URL shows ?categoryIds=117 but no filtering happens,');
    console.log('the parameters might not be properly passed from frontend to backend.');
    console.log('Make sure frontend is sending the parameters in a format the backend expects:');
    console.log('- URL should have ?categoryIds=117 or ?categoryId=117');
    console.log('- Check network tab in browser dev tools to confirm request parameters');
    
    // Check if the service layer is correctly passing parameters to repository
    console.log('\n========== CHECK SERVICE TO REPOSITORY FLOW ==========');
    console.log('Possible issue: Controller parses parameters correctly but service doesn\'t pass them to repository');
    console.log('Solution options:');
    console.log('1. Add console.log statements in ExerciseService.getAllExercises to log filterOptions');
    console.log('2. Add console.log statements in ExerciseRepository.findWithFilters to log received filters');
    console.log('3. Check if any middleware is modifying the request parameters');
    
  } catch (error) {
    console.error('Error debugging category filter:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
    
    // Allow time for logs to be printed before process exits
    setTimeout(() => {
      console.log("Debug complete");
    }, 1000);
  }
}

debug(); 