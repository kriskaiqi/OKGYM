import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { initializeRelationships } from '../utils/initRelationships';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutTag } from '../models/WorkoutTag';

/**
 * Verification script to test the relationship loader implementation
 */
async function verifyRelationships() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  
  try {
    // Initialize relationship system
    console.log('Initializing relationship system...');
    initializeRelationships();
    
    // Get repositories
    const exerciseRepo = AppDataSource.getRepository(Exercise);
    const categoryRepo = AppDataSource.getRepository(ExerciseCategory);
    const equipmentRepo = AppDataSource.getRepository(Equipment);
    const mediaRepo = AppDataSource.getRepository(Media);
    const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
    const tagRepo = AppDataSource.getRepository(WorkoutTag);
    
    console.log('\n=== EXERCISE RELATIONSHIP TEST ===');
    // Get sample exercises
    const exercises = await exerciseRepo.find({ take: 2 });
    
    if (exercises.length === 0) {
      console.log('No exercises found in database');
      return;
    }
    
    for (const exercise of exercises) {
      console.log(`\nTesting with exercise: ${exercise.id} - ${exercise.name}`);
      
      // Load relationships
      console.log('Loading relationships...');
      const categories = await RelationshipLoader.loadRelationship(
        'Exercise', 'categories', exercise.id, categoryRepo
      );
      
      const equipment = await RelationshipLoader.loadRelationship(
        'Exercise', 'equipmentOptions', exercise.id, equipmentRepo
      );
      
      const media = await RelationshipLoader.loadRelationship(
        'Exercise', 'media', exercise.id, mediaRepo
      );
      
      // Print results
      console.log('Results:');
      console.log(`- Categories: ${categories.length} items`);
      console.log(`- Equipment: ${equipment.length} items`);
      console.log(`- Media: ${media.length} items`);
      
      // Print first item of each if available
      if (categories.length) console.log(`  First category: ${categories[0].name || categories[0].id}`);
      if (equipment.length) console.log(`  First equipment: ${equipment[0].name || equipment[0].id}`);
      if (media.length) console.log(`  First media: ${media[0].id}`);
    }
    
    console.log('\n=== BATCH LOADING TEST ===');
    const exerciseIds = exercises.map(e => e.id);
    console.log(`Testing batch loading for ${exerciseIds.length} exercises...`);
    
    // Test batch loading
    const categoriesMap = await RelationshipLoader.loadRelationshipBatch(
      'Exercise', 'categories', exerciseIds, categoryRepo
    );
    
    console.log('Batch loading results:');
    for (const exercise of exercises) {
      const cats = categoriesMap.get(exercise.id) || [];
      console.log(`- Exercise ${exercise.name}: ${cats.length} categories`);
    }
    
    console.log('\n=== WORKOUT PLAN RELATIONSHIP TEST ===');
    // Get a sample workout plan
    const workoutPlans = await workoutPlanRepo.find({ take: 2 });
    
    if (workoutPlans.length === 0) {
      console.log('No workout plans found in database');
    } else {
      for (const plan of workoutPlans) {
        console.log(`\nTesting with workout plan: ${plan.id} - ${plan.name}`);
        
        // Load relationships
        console.log('Loading relationships...');
        const tags = await RelationshipLoader.loadRelationship(
          'WorkoutPlan', 'tags', plan.id, tagRepo
        );
        
        const targetMuscleGroups = await RelationshipLoader.loadRelationship(
          'WorkoutPlan', 'targetMuscleGroups', plan.id, categoryRepo
        );
        
        const equipmentNeeded = await RelationshipLoader.loadRelationship(
          'WorkoutPlan', 'equipmentNeeded', plan.id, equipmentRepo
        );
        
        // Print results
        console.log('Results:');
        console.log(`- Tags: ${tags.length} items`);
        console.log(`- Target Muscle Groups: ${targetMuscleGroups.length} items`);
        console.log(`- Equipment Needed: ${equipmentNeeded.length} items`);
        
        // Print first item of each if available
        if (tags.length) console.log(`  First tag: ${tags[0].name || tags[0].id}`);
        if (targetMuscleGroups.length) console.log(`  First muscle group: ${targetMuscleGroups[0].name || targetMuscleGroups[0].id}`);
        if (equipmentNeeded.length) console.log(`  First equipment: ${equipmentNeeded[0].name || equipmentNeeded[0].id}`);
      }
    }
    
    console.log('\nVerification completed successfully.');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

// Run verification
verifyRelationships().catch(error => {
  console.error('Verification script failed:', error);
  process.exit(1);
}); 