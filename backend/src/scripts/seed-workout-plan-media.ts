import { Media, MediaType, MediaContext, MediaQuality } from '../models/Media';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ensureDirectory, 
  createPlaceholderFile, 
  createMediaRecord,
  mediaExistsForEntity,
  updateEntityMedia
} from '../utils/mediaUtils';

/**
 * Script to seed media for workout plans
 * Creates thumbnail images and demonstration videos for each workout plan
 */
async function seedWorkoutPlanMedia(): Promise<void> {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const mediaRepository = AppDataSource.getRepository(Media);
    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    
    // Check if workout plan media already exists
    const mediaCount = await mediaRepository.count({
      where: { context: MediaContext.WORKOUT }
    });
    
    if (mediaCount > 0) {
      logger.info(`Workout plan media already exists. Count: ${mediaCount}`);
      return;
    }
    
    // Get all workout plans
    const workoutPlans = await workoutPlanRepository.find();
    logger.info(`Found ${workoutPlans.length} workout plans to process`);
    
    if (workoutPlans.length === 0) {
      logger.warn('No workout plans found. Please seed workout plans first.');
      return;
    }
    
    // Create directories for workout plan media
    const imagesDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'workouts', 'images'));
    const videosDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'workouts', 'videos'));
    
    logger.info(`Media directories prepared at:
      - Images: ${imagesDir}
      - Videos: ${videosDir}`);
    
    // Create media for each workout plan
    for (const workoutPlan of workoutPlans) {
      try {
        // Check if media already exists for this workout plan
        const hasImage = await mediaExistsForEntity(mediaRepository, workoutPlan.id, MediaType.IMAGE);
        const hasVideo = await mediaExistsForEntity(mediaRepository, workoutPlan.id, MediaType.VIDEO);
        
        if (hasImage && hasVideo) {
          logger.info(`Media already exists for workout plan: ${workoutPlan.name}`);
          continue;
        }
        
        // Create thumbnail image media
        const imageMedia = createMediaRecord({
          type: MediaType.IMAGE,
          context: MediaContext.WORKOUT,
          entityName: workoutPlan.name,
          directory: 'workouts/images',
          entityId: workoutPlan.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create demonstration video media
        const videoMedia = createMediaRecord({
          type: MediaType.VIDEO,
          context: MediaContext.WORKOUT,
          entityName: workoutPlan.name,
          directory: 'workouts/videos',
          entityId: workoutPlan.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create physical placeholder files
        const imagePath = path.join(imagesDir, imageMedia.filename);
        createPlaceholderFile(imagePath, workoutPlan.name);
        
        const videoPath = path.join(videosDir, videoMedia.filename);
        createPlaceholderFile(videoPath, workoutPlan.name, true);
        
        // Save media records
        const savedImageMedia = await mediaRepository.save(imageMedia);
        const savedVideoMedia = await mediaRepository.save(videoMedia);
        
        // Update workout plan with media references
        if (!hasImage) {
          workoutPlan.thumbnail_media_id = savedImageMedia.id;
        }
        
        if (!hasVideo) {
          workoutPlan.video_media_id = savedVideoMedia.id;
        }
        
        // Save the updated workout plan
        await workoutPlanRepository.save(workoutPlan);
        
        logger.info(`Added media for workout plan "${workoutPlan.name}":
          - Thumbnail image ID: ${savedImageMedia.id}
          - Demonstration video ID: ${savedVideoMedia.id}`);
        
      } catch (error) {
        logger.error(`Error creating media for workout plan "${workoutPlan.name}":`, error);
        // Continue processing other workout plans even if one fails
      }
    }
    
    // Final count
    const finalMediaCount = await mediaRepository.count({
      where: { context: MediaContext.WORKOUT }
    });
    
    logger.info(`Successfully created ${finalMediaCount} media records for workout plans
      (${workoutPlans.length} thumbnail images and ${workoutPlans.length} videos)`);
    
    logger.info(`
      Place your actual workout plan thumbnails in: ${imagesDir}
      Place your actual workout plan videos in: ${videosDir}
      
      Image files should be named like: beginner-full-body-workout.jpg
      Video files should be named like: beginner-full-body-workout.mp4
    `);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error seeding workout plan media:', error);
    
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
    
    throw error;
  }
}

// Execute the function
seedWorkoutPlanMedia()
  .then(() => {
    console.log('Workout plan media seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed workout plan media:', error);
    process.exit(1);
  }); 