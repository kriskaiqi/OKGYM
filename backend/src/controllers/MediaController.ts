import { Request, Response } from '../types/express';
import { AppError, ErrorType } from '../utils/errors';
import { Media, MediaType, MediaContext } from '../models/Media';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ensureDirectory, createMediaRecord } from '../utils/mediaUtils';

// Extend the Request type to include file property from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Controller for media-related operations
 * Handles HTTP requests for media management
 */
export class MediaController {
  private mediaRepository = AppDataSource.getRepository(Media);

  /**
   * Set up multer storage configuration
   */
  configureStorage(storageType: 'local' | 's3' = 'local') {
    if (storageType === 'local') {
      return multer.diskStorage({
        destination: (req, file, cb) => {
          // Determine the destination based on the media type
          let mediaType = MediaType.IMAGE;
          let context = MediaContext.EXERCISE;
          
          // Try to get type and context from request
          if (req.body.type && Object.values(MediaType).includes(req.body.type)) {
            mediaType = req.body.type;
          }
          
          if (req.body.context && Object.values(MediaContext).includes(req.body.context)) {
            context = req.body.context;
          }
          
          // Create storage path
          const baseDir = path.join(process.cwd(), 'public', 'static');
          const contextDir = context.toLowerCase();
          const typeDir = mediaType.toLowerCase() + 's';
          const uploadDir = path.join(baseDir, contextDir, typeDir);
          
          // Ensure directories exist
          ensureDirectory(uploadDir);
          
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          // Generate a unique filename
          const fileExt = path.extname(file.originalname).toLowerCase();
          const fileName = `${uuidv4()}${fileExt}`;
          cb(null, fileName);
        }
      });
    } else {
      // For S3 storage, we use memory storage temporarily
      return multer.memoryStorage();
    }
  }

  /**
   * Middleware to filter acceptable file types
   */
  fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    
    // Determine the media type from request or file mime type
    let mediaType = req.body.type;
    
    if (!mediaType) {
      if (allowedImageTypes.includes(file.mimetype)) {
        mediaType = MediaType.IMAGE;
      } else if (allowedVideoTypes.includes(file.mimetype)) {
        mediaType = MediaType.VIDEO;
      } else if (allowedAudioTypes.includes(file.mimetype)) {
        mediaType = MediaType.AUDIO;
      }
      
      // Set type in request body for later use
      req.body.type = mediaType;
    }
    
    // Check if mime type is allowed based on media type
    if (
      (mediaType === MediaType.IMAGE && allowedImageTypes.includes(file.mimetype)) ||
      (mediaType === MediaType.VIDEO && allowedVideoTypes.includes(file.mimetype)) ||
      (mediaType === MediaType.AUDIO && allowedAudioTypes.includes(file.mimetype))
    ) {
      return cb(null, true);
    }
    
    cb(new Error(`Invalid file type. Expected ${mediaType}, got ${file.mimetype}`));
  };

  /**
   * Upload a new media file
   * @route POST /api/media/upload
   */
  async uploadMedia(req: MulterRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }
      
      // Extract file details
      const file = req.file;
      const { 
        type = MediaType.IMAGE, 
        context = MediaContext.EXERCISE, 
        entityType, 
        entityId,
        isPrimary = true,
        altText,
        caption,
        displayOrder = 1
      } = req.body;
      
      // Create dimensions object for images
      let dimensions;
      if (type === MediaType.IMAGE) {
        // In a real application, you would use an image processing library to get dimensions
        dimensions = { width: 800, height: 600 };
      }
      
      // Create a new media record
      const media = new Media();
      media.type = type;
      media.context = context;
      media.filename = file.filename;
      media.mimeType = file.mimetype;
      media.size = file.size;
      media.url = `/static/${context.toLowerCase()}/${type.toLowerCase()}s/${file.filename}`;
      
      // Set other properties if provided
      if (entityType) media.entityType = entityType;
      if (entityId) media.entityStringId = entityId;
      if (isPrimary) media.isPrimary = JSON.parse(isPrimary);
      if (altText) media.altText = altText;
      if (caption) media.caption = caption;
      if (displayOrder) media.displayOrder = parseInt(displayOrder, 10);
      if (dimensions) media.dimensions = dimensions;
      
      // Save the media record
      const savedMedia = await this.mediaRepository.save(media);
      
      return res.status(201).json({
        success: true,
        data: savedMedia
      });
    } catch (error) {
      logger.error('Failed to upload media', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to upload media'
      });
    }
  }

  /**
   * Get media by ID
   * @route GET /api/media/:id
   */
  async getMediaById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const media = await this.mediaRepository.findOne({ 
        where: { id }
      });
      
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: media
      });
    } catch (error) {
      logger.error('Failed to get media', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve media'
      });
    }
  }

  /**
   * Get media by entity
   * @route GET /api/media/entity/:entityType/:entityId
   */
  async getMediaByEntity(req: Request, res: Response): Promise<Response> {
    try {
      const { entityType, entityId } = req.params;
      const { type } = req.query;
      
      const queryBuilder = this.mediaRepository.createQueryBuilder('media')
        .where('media.entityType = :entityType', { entityType })
        .andWhere('media.entityStringId = :entityId', { entityId })
        .orderBy('media.isPrimary', 'DESC')
        .addOrderBy('media.displayOrder', 'ASC');
      
      // Add type filter if provided
      if (type) {
        queryBuilder.andWhere('media.type = :type', { type });
      }
      
      const media = await queryBuilder.getMany();
      
      return res.status(200).json({
        success: true,
        count: media.length,
        data: media
      });
    } catch (error) {
      logger.error('Failed to get media by entity', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve media'
      });
    }
  }

  /**
   * Update media
   * @route PUT /api/media/:id
   */
  async updateMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { 
        altText, 
        caption, 
        isPrimary, 
        displayOrder,
        entityType,
        entityId
      } = req.body;
      
      const media = await this.mediaRepository.findOne({ 
        where: { id }
      });
      
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found'
        });
      }
      
      // Update properties if provided
      if (altText !== undefined) media.altText = altText;
      if (caption !== undefined) media.caption = caption;
      if (isPrimary !== undefined) media.isPrimary = isPrimary;
      if (displayOrder !== undefined) media.displayOrder = displayOrder;
      if (entityType !== undefined) media.entityType = entityType;
      if (entityId !== undefined) media.entityStringId = entityId;
      
      // Save updated media
      const updatedMedia = await this.mediaRepository.save(media);
      
      return res.status(200).json({
        success: true,
        data: updatedMedia
      });
    } catch (error) {
      logger.error('Failed to update media', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update media'
      });
    }
  }

  /**
   * Delete media
   * @route DELETE /api/media/:id
   */
  async deleteMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const media = await this.mediaRepository.findOne({ 
        where: { id }
      });
      
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found'
        });
      }
      
      // If the file is stored locally, delete it
      if (media.url.startsWith('/static/')) {
        const filePath = path.join(process.cwd(), 'public', media.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete the media record
      await this.mediaRepository.remove(media);
      
      return res.status(200).json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete media', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete media'
      });
    }
  }
} 