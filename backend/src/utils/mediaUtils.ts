import * as fs from 'fs';
import * as path from 'path';
import { Media, MediaType, MediaContext } from '../models/Media';
import logger from './logger';

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDirectory(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    logger.info(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Create a placeholder file with descriptive text
 */
export function createPlaceholderFile(
  filePath: string, 
  entityName: string, 
  isVideo: boolean = false
): void {
  if (!fs.existsSync(filePath)) {
    logger.info(`Creating placeholder file: ${filePath}`);
    const fileType = isVideo ? 'video' : 'image';
    fs.writeFileSync(
      filePath,
      `This is a placeholder for ${fileType}: ${entityName}. Replace with a real ${fileType}.`
    );
  }
}

/**
 * Get absolute path for a media file
 */
export function getAbsolutePath(
  directory: string, 
  entityName: string, 
  extension: string
): string {
  const filename = getNormalizedFilename(entityName, extension);
  return path.join(directory, filename);
}

/**
 * Create a media record with standard properties
 */
export function createMediaRecord({
  type,
  context,
  entityName,
  directory,
  entityId,
  isPrimary = true,
  displayOrder = 1
}: {
  type: MediaType;
  context: MediaContext;
  entityName: string;
  directory: string;
  entityId?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}): Media {
  const media = new Media();
  const extension = type === MediaType.IMAGE ? 'jpg' : 'mp4';
  const filename = getNormalizedFilename(entityName, extension);
  
  media.type = type;
  media.context = context;
  media.url = `/static/${directory}/${filename}`;
  media.filename = filename;
  media.mimeType = type === MediaType.IMAGE ? 'image/jpeg' : 'video/mp4';
  media.size = type === MediaType.IMAGE ? 
    Math.floor(Math.random() * 500000) + 100000 : 
    Math.floor(Math.random() * 10000000) + 1000000;
  media.quality = 'MEDIUM' as any;
  media.displayOrder = displayOrder;
  media.isPrimary = isPrimary;
  media.entityType = context.toString().toLowerCase();
  
  if (entityId) {
    media.entityStringId = entityId;
  }
  
  // Add appropriate dimensions based on media type
  if (type === MediaType.IMAGE) {
    media.dimensions = { width: 800, height: 600 };
  } else if (type === MediaType.VIDEO) {
    media.dimensions = { width: 1280, height: 720 };
    media.duration = Math.floor(Math.random() * 90) + 30; // 30-120 seconds
  }
  
  return media;
}

/**
 * Returns a normalized filename for a media file
 */
export function getNormalizedFilename(name: string, extension: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
}

/**
 * Checks if media already exists for an entity
 */
export async function mediaExistsForEntity(
  repository: any,
  entityId: string, 
  type: MediaType
): Promise<boolean> {
  const count = await repository.count({
    where: {
      entityStringId: entityId,
      type
    }
  });
  return count > 0;
}

/**
 * Gets the public URL for a media file
 */
export function getPublicUrl(directory: string, filename: string): string {
  return `/static/${directory}/${filename}`;
}

/**
 * Handles updating an entity with a media reference
 */
export async function updateEntityMedia(
  mediaRepository: any,
  entityRepository: any, 
  entity: any,
  media: Media,
  fieldName: string
): Promise<void> {
  const savedMedia = await mediaRepository.save(media);
  entity[fieldName] = savedMedia.id;
  await entityRepository.save(entity);
} 