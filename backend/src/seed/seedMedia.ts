import { Media, MediaType, MediaContext } from '../models/Media';
import { AppDataSource } from '../data-source';
import { Equipment } from '../models/Equipment';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure required directories exist for storing media files
 */
function ensureDirectoriesExist() {
  const publicDir = path.join(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');
  const equipmentImagesDir = path.join(imagesDir, 'equipment');
  const videosDir = path.join(publicDir, 'videos');
  const equipmentVideosDir = path.join(videosDir, 'equipment');
  
  // Create directories if they don't exist
  const dirs = [publicDir, imagesDir, equipmentImagesDir, videosDir, equipmentVideosDir];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      logger.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  return { equipmentImagesDir, equipmentVideosDir };
}

/**
 * Create a placeholder text file with a message
 */
function createPlaceholderFile(filePath: string, entityName: string, isVideo: boolean = false) {
  if (!fs.existsSync(filePath)) {
    logger.info(`Creating placeholder file: ${filePath}`);
    const fileType = isVideo ? 'video' : 'image';
    // Write a text file noting this is a placeholder
    fs.writeFileSync(
      filePath,
      `This is a placeholder for equipment ${fileType}: ${entityName}. Replace with a real ${fileType}.`
    );
  }
}

/**
 * Seed simplified media records for equipment (both images and videos)
 */
export async function seedMedia(): Promise<void> {
  try {
    const mediaRepository = AppDataSource.getRepository(Media);
    const equipmentRepository = AppDataSource.getRepository(Equipment);
    
    // Ensure the needed directories exist
    const { equipmentImagesDir, equipmentVideosDir } = ensureDirectoriesExist();
    logger.info(`Media directories prepared at:
      - Images: ${equipmentImagesDir}
      - Videos: ${equipmentVideosDir}`);
    
    // Check if we already have media
    const existingCount = await mediaRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} media records. Skipping seed.`);
      return;
    }
    
    // Get all equipment to associate with media
    const allEquipment = await equipmentRepository.find();
    
    if (allEquipment.length === 0) {
      logger.warn('No equipment found. Please seed equipment first.');
      return;
    }
    
    logger.info(`Creating media for ${allEquipment.length} equipment items (both images and videos)`);
    
    // For each equipment, create image and video entries
    for (const equipment of allEquipment) {
      // Create image files and records
      const imageFilename = `${equipment.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      const imageRelativePath = `/images/equipment/${imageFilename}`;
      const imageAbsolutePath = path.join(equipmentImagesDir, imageFilename);
      
      // Create video files and records
      const videoFilename = `${equipment.name.toLowerCase().replace(/\s+/g, '-')}.mp4`;
      const videoRelativePath = `/videos/equipment/${videoFilename}`;
      const videoAbsolutePath = path.join(equipmentVideosDir, videoFilename);
      
      // Create placeholder files if they don't exist
      createPlaceholderFile(imageAbsolutePath, equipment.name);
      createPlaceholderFile(videoAbsolutePath, equipment.name, true);
      
      // Create an image media record
      const imageMedia = new Media();
      imageMedia.type = MediaType.IMAGE;
      imageMedia.context = MediaContext.EQUIPMENT;
      imageMedia.url = `/static${imageRelativePath}`;
      imageMedia.filename = imageFilename;
      imageMedia.mimeType = 'image/jpeg';
      imageMedia.size = Math.floor(Math.random() * 500000) + 100000; // Random size between 100KB and 600KB
      imageMedia.quality = 'MEDIUM' as any; // Simplified
      imageMedia.displayOrder = 1;
      imageMedia.isPrimary = true;
      imageMedia.entityType = 'equipment';
      imageMedia.entityStringId = equipment.id;
      
      // Create a video media record
      const videoMedia = new Media();
      videoMedia.type = MediaType.VIDEO;
      videoMedia.context = MediaContext.EQUIPMENT;
      videoMedia.url = `/static${videoRelativePath}`;
      videoMedia.filename = videoFilename;
      videoMedia.mimeType = 'video/mp4';
      videoMedia.size = Math.floor(Math.random() * 10000000) + 1000000; // Random size between 1MB and 11MB
      videoMedia.quality = 'MEDIUM' as any; // Simplified
      videoMedia.displayOrder = 1;
      videoMedia.isPrimary = true;
      videoMedia.entityType = 'equipment';
      videoMedia.entityStringId = equipment.id;
      
      // Add dimensions and duration for video
      videoMedia.dimensions = { width: 1280, height: 720 };
      videoMedia.duration = Math.floor(Math.random() * 90) + 30; // Random duration between 30-120 seconds
      
      // Save the media records
      const savedImageMedia = await mediaRepository.save(imageMedia);
      const savedVideoMedia = await mediaRepository.save(videoMedia);
      
      // Update the equipment with the media references
      try {
        // First check if equipment ID is valid
        if (equipment && equipment.id) {
          equipment.image_id = savedImageMedia.id;
          equipment.video_id = savedVideoMedia.id;
          await equipmentRepository.save(equipment);
          
          logger.info(`Updated equipment ${equipment.name} with media references:
            - Image ID: ${savedImageMedia.id}
            - Video ID: ${savedVideoMedia.id}`);
        } else {
          logger.warn(`Skipping media assignment for equipment with invalid ID`);
        }
      } catch (equipmentUpdateError) {
        logger.error(`Error updating equipment with media references:`, {
          error: equipmentUpdateError instanceof Error ? equipmentUpdateError.message : 'Unknown error',
          equipmentId: equipment.id
        });
        // Continue processing other equipment even if one fails
      }
    }
    
    const totalCount = allEquipment.length * 2; // Images and videos
    logger.info(`Successfully created ${totalCount} media records (${allEquipment.length} images and ${allEquipment.length} videos)`);
    logger.info(`
      Place your actual equipment images in: ${equipmentImagesDir}
      Place your actual equipment videos in: ${equipmentVideosDir}
      
      Image files should be named like: treadmill.jpg, dumbbells.jpg, etc.
      Video files should be named like: treadmill.mp4, dumbbells.mp4, etc.
    `);
  } catch (error) {
    logger.error('Error seeding media:', error);
    throw error;
  }
}