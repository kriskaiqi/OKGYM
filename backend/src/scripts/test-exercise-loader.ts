import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { initializeRelationships } from '../utils/initRelationships';
import { EntityRelationships } from '../utils/EntityRelationships';

/**
 * Simple script to test loading an exercise with relationships
 * Usage: npm run ts-node src/scripts/test-exercise-loader.ts <exercise-id>
 */
async function testExerciseLoader() {
  const exerciseId = process.argv[2] || '1'; // Default to ID 1 if not provided
  
  console.log(`Testing relationship loader with exercise ID: ${exerciseId}`);
  console.log('Initializing database connection...');
  
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connection established.');
    console.log('Database initialized:', AppDataSource.isInitialized);
    console.log('Database driver:', AppDataSource.driver.options.type);
    
    // Initialize the relationship system
    initializeRelationships();
    console.log('Relationship system initialized.');
    
    // Check relationship configuration
    console.log('\nRelationship Configuration:');
    console.log('Exercise relationship config:', JSON.stringify(EntityRelationships.Exercise, null, 2));
    
    // Get repositories
    const exerciseRepo = AppDataSource.getRepository(Exercise);
    const categoryRepo = AppDataSource.getRepository(ExerciseCategory);
    const equipmentRepo = AppDataSource.getRepository(Equipment);
    const mediaRepo = AppDataSource.getRepository(Media);
    
    console.log('\nRepositories initialized:');
    console.log('Exercise repo exists:', !!exerciseRepo);
    console.log('Category repo exists:', !!categoryRepo);
    console.log('Equipment repo exists:', !!equipmentRepo);
    console.log('Media repo exists:', !!mediaRepo);
    
    // Get exercise
    console.log(`\nFetching exercise with ID: ${exerciseId}`);
    try {
      // First test a raw query to make sure basic DB operations work
      const rawExercise = await AppDataSource.query(`SELECT * FROM exercises WHERE id = $1`, [exerciseId]);
      console.log('Raw query result:', rawExercise && rawExercise.length ? 'Found exercise' : 'No exercise found');
      
      const exercise = await exerciseRepo.findOne({ where: { id: exerciseId } });
      
      if (!exercise) {
        console.error(`Exercise with ID ${exerciseId} not found.`);
        
        // List some exercises to help
        console.log('\nAvailable exercises:');
        const someExercises = await exerciseRepo.find({ take: 5 });
        someExercises.forEach(e => console.log(`- ID: ${e.id}, Name: ${e.name}`));
        
        await AppDataSource.destroy();
        process.exit(1);
      }
      
      console.log(`Found exercise: ${exercise.name}`);
      
      // Load relationships
      console.log('\nLoading categories...');
      const categories = await RelationshipLoader.loadRelationship(
        'Exercise', 'categories', exerciseId, categoryRepo
      );
      console.log(`Loaded ${categories.length} categories.`);
      
      console.log('Loading equipment...');
      const equipment = await RelationshipLoader.loadRelationship(
        'Exercise', 'equipmentOptions', exerciseId, equipmentRepo
      );
      console.log(`Loaded ${equipment.length} equipment items.`);
      
      console.log('Loading media...');
      const media = await RelationshipLoader.loadRelationship(
        'Exercise', 'media', exerciseId, mediaRepo
      );
      console.log(`Loaded ${media.length} media items.`);
      
      // Print summary
      console.log('\nTest Results:');
      console.log(`Exercise: ${exercise.name}`);
      console.log(`Categories: ${categories.length} items`);
      if (categories.length > 0) {
        console.log('Category names:');
        categories.forEach(c => console.log(`- ${c.name || c.id}`));
      }
      
      console.log(`Equipment: ${equipment.length} items`);
      if (equipment.length > 0) {
        console.log('Equipment names:');
        equipment.forEach(e => console.log(`- ${e.name || e.id}`));
      }
      
      console.log(`Media: ${media.length} items`);
      if (media.length > 0) {
        console.log('Media IDs:');
        media.forEach(m => console.log(`- ${m.id}`));
      }
      
      console.log('\nTest completed successfully.');
    } catch (findError) {
      console.error('Error fetching exercise:', findError);
      throw findError;
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the test
testExerciseLoader().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 