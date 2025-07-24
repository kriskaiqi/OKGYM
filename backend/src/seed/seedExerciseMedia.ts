import { Media, MediaType, MediaContext } from '../models/Media';
import { Exercise } from '../models/Exercise';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ensureDirectory, 
  createPlaceholderFile, 
  createMediaRecord,
  mediaExistsForEntity
} from '../utils/mediaUtils';

/**
 * Seeds media for exercises that don't have media yet
 * Creates one image and one video for each exercise that lacks media
 */
export async function seedExerciseMedia(): Promise<void> {
  try {
    logger.info('Starting to seed exercise media...');
    
    const mediaRepository = AppDataSource.getRepository(Media);
    const exerciseRepository = AppDataSource.getRepository(Exercise);
    
    // Get current media count for exercises
    const currentMediaCount = await mediaRepository.count({
      where: { context: MediaContext.EXERCISE }
    });
    logger.info(`Current exercise media count: ${currentMediaCount}`);
    
    // Get all exercises without trying to load media relation directly
    const exercises = await exerciseRepository.find();
    logger.info(`Found ${exercises.length} exercises to process`);
    
    // Create directories for exercise media
    const imagesDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'exercises', 'images'));
    const videosDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'exercises', 'videos'));
    
    logger.info(`Media directories prepared at:
      - Images: ${imagesDir}
      - Videos: ${videosDir}`);
    
    let imagesCreated = 0;
    let videosCreated = 0;
    
    // Process each exercise
    for (const exercise of exercises) {
      try {
        // Check if media already exists for this exercise
        const hasMedia = await mediaExistsForEntity(mediaRepository, exercise.id, MediaType.IMAGE);
        if (hasMedia) {
          logger.info(`Media already exists for exercise: ${exercise.name}`);
          continue;
        }
        
        // Create image media
        const imageMedia = createMediaRecord({
          type: MediaType.IMAGE,
          context: MediaContext.EXERCISE,
          entityName: exercise.name,
          directory: 'exercises/images',
          entityId: exercise.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create video media
        const videoMedia = createMediaRecord({
          type: MediaType.VIDEO,
          context: MediaContext.EXERCISE,
          entityName: exercise.name,
          directory: 'exercises/videos',
          entityId: exercise.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create physical placeholder files
        const imagePath = path.join(imagesDir, imageMedia.filename);
        createPlaceholderFile(imagePath, exercise.name);
        
        const videoPath = path.join(videosDir, videoMedia.filename);
        createPlaceholderFile(videoPath, exercise.name, true);
        
        // Save media records
        const savedImageMedia = await mediaRepository.save(imageMedia);
        const savedVideoMedia = await mediaRepository.save(videoMedia);
        
        // Associate media with exercise through the junction table
        await AppDataSource.createQueryBuilder()
          .insert()
          .into('exercise_media')
          .values([
            { exercise_id: exercise.id, media_id: savedImageMedia.id },
            { exercise_id: exercise.id, media_id: savedVideoMedia.id }
          ])
          .execute();
        
        imagesCreated++;
        videosCreated++;
        
        logger.info(`Added media for exercise "${exercise.name}":
          - Image ID: ${savedImageMedia.id}
          - Video ID: ${savedVideoMedia.id}`);
        
      } catch (error) {
        logger.error(`Error creating media for exercise "${exercise.name}":`, error);
        // Continue processing other exercises even if one fails
      }
    }
    
    // Final count
    const finalMediaCount = await mediaRepository.count({
      where: { context: MediaContext.EXERCISE }
    });
    const mediaCreated = finalMediaCount - currentMediaCount;
    
    logger.info(`Initial exercise media count: ${currentMediaCount}`);
    logger.info(`Final exercise media count: ${finalMediaCount}`);
    logger.info(`Created ${mediaCreated} new media records (${imagesCreated} images and ${videosCreated} videos)`);
    
    logger.info(`
      Place your actual exercise images in: ${imagesDir}
      Place your actual exercise videos in: ${videosDir}
      
      Image files should be named like: bench-press.jpg
      Video files should be named like: bench-press.mp4
    `);
    
  } catch (error) {
    logger.error('Error seeding exercise media:', error);
    throw error;
  }
} 