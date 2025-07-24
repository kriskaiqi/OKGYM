# Media Integration Guide for OKGYM

## Table of Contents

1. [Introduction](#introduction)
2. [Entity Preparation](#entity-preparation)
3. [Directory Structure](#directory-structure)
4. [Media Entity Model](#media-entity-model)
5. [Media Utilities](#media-utilities)
6. [Media Seeder Template](#media-seeder-template)
7. [Implementation Steps](#implementation-steps)
8. [Express Configuration](#express-configuration)
9. [Fetching Media from the API](#fetching-media-from-the-api)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Introduction

This guide outlines how to effectively integrate media assets (images and videos) with database entities in the OKGYM application. Media assets are essential for providing visual context to exercises, workouts, equipment, and other fitness-related content.

## Entity Preparation

Before integrating media, ensure that your entity model has the necessary relationship with the Media entity:

```typescript
// Example entity with media relationship
@Entity()
export class Exercise {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  // Other columns...

  @OneToMany(() => Media, (media) => media.entity)
  media: Media[];
}
```

## Directory Structure

Maintain a consistent directory structure for media files:

```
/public
  /static
    /exercises
      /images
      /videos
    /workouts
      /images
      /videos
    /equipment
      /images
      /videos
    /users
      /images
    /achievements
      /images
```

## Media Entity Model

The Media entity should track all necessary information about media files:

```typescript
@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: MediaType,
  })
  type: MediaType;

  @Column({
    type: "enum",
    enum: MediaContext,
  })
  context: MediaContext;

  @Column()
  url: string;

  @Column()
  filename: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  size: number;

  @Column({ type: 'json', nullable: true })
  dimensions: { width: number; height: number };

  @Column({ nullable: true })
  duration: number;

  @Column({
    type: "enum",
    enum: MediaQuality,
    default: MediaQuality.MEDIUM,
  })
  quality: MediaQuality;

  @Column({ default: 1 })
  displayOrder: number;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityStringId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Media Utilities

Utilize the shared utility functions in `mediaUtils.ts` for common operations:

```typescript
// Available utilities:
ensureDirectory(dirPath: string): string
createPlaceholderFile(filePath: string, entityName: string, isVideo?: boolean): void
getAbsolutePath(directory: string, entityName: string, extension: string): string
createMediaRecord({ type, context, entityName, directory, entityId, isPrimary, displayOrder }): Media
getNormalizedFilename(name: string, extension: string): string
mediaExistsForEntity(repository: any, entityId: string, type: MediaType): Promise<boolean>
getPublicUrl(directory: string, filename: string): string
updateEntityMedia(mediaRepository, entityRepository, entity, media, fieldName): Promise<void>
```

## Media Seeder Template

Use this template for creating media seeders:

```typescript
import { getRepository } from 'typeorm';
import { Media, MediaType, MediaContext } from '../models/Media';
import { Exercise } from '../models/Exercise';
import * as path from 'path';
import logger from '../utils/logger';
import { 
  ensureDirectory, 
  createPlaceholderFile, 
  createMediaRecord,
  mediaExistsForEntity 
} from '../utils/mediaUtils';

export async function seedExerciseMedia(): Promise<void> {
  logger.info('Seeding exercise media...');
  
  const mediaRepository = getRepository(Media);
  const exerciseRepository = getRepository(Exercise);
  
  // Check if media already exists
  const mediaCount = await mediaRepository.count({
    where: { context: MediaContext.EXERCISE }
  });
  
  if (mediaCount > 0) {
    logger.info(`Exercise media already exists. Count: ${mediaCount}`);
    return;
  }
  
  // Get all exercises
  const exercises = await exerciseRepository.find();
  logger.info(`Found ${exercises.length} exercises to process`);
  
  // Create directories
  const imagesDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'exercises', 'images'));
  const videosDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'exercises', 'videos'));
  
  // Seed media for each exercise
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
      
      // Create physical placeholder file
      const imagePath = path.join(imagesDir, imageMedia.filename);
      createPlaceholderFile(imagePath, exercise.name);
      
      // Create video media (only for certain exercises)
      if (Math.random() > 0.5) { // Add video to 50% of exercises
        const videoMedia = createMediaRecord({
          type: MediaType.VIDEO,
          context: MediaContext.EXERCISE,
          entityName: exercise.name,
          directory: 'exercises/videos',
          entityId: exercise.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create physical placeholder file
        const videoPath = path.join(videosDir, videoMedia.filename);
        createPlaceholderFile(videoPath, exercise.name, true);
        
        // Save video media
        await mediaRepository.save(videoMedia);
      }
      
      // Save image media
      await mediaRepository.save(imageMedia);
      
    } catch (error) {
      logger.error(`Error seeding media for exercise ${exercise.name}:`, error);
    }
  }
  
  logger.info('Exercise media seeding completed');
}
```

## Implementation Steps

1. **Update Entity Models**: Ensure your entity models have the proper relationship with Media.
2. **Create Directory Structure**: Set up the proper folder structure for storing media files.
3. **Create Media Seeders**: Implement a seeder for each entity type that needs media.
4. **Run Media Seeders**: Execute the seeders to populate the database with media records.
5. **Test Media Retrieval**: Verify that media is properly associated with entities and can be retrieved.

## Express Configuration

Configure Express to serve static files:

```typescript
// In app.ts
import * as path from 'path';
import express from 'express';

// ...
app.use('/static', express.static(path.join(process.cwd(), 'public', 'static')));
```

## Fetching Media from the API

Example controller method to fetch media with entities:

```typescript
@Get(':id')
async getExerciseWithMedia(@Param('id') id: string): Promise<Exercise> {
  const exercise = await this.exerciseRepository.findOne({
    where: { id },
    relations: ['media']
  });
  
  if (!exercise) {
    throw new NotFoundException(`Exercise with ID ${id} not found`);
  }
  
  return exercise;
}
```

## Best Practices

1. **Consistent Naming**: Use a consistent naming convention for media files.
2. **Image Optimization**: Compress images before storing them in production.
3. **Video Formats**: Support multiple video formats for better browser compatibility.
4. **Fallback Images**: Always provide fallback images when videos aren't available.
5. **Media Validation**: Validate media files before storing them (size, format, etc.).
6. **Lazy Loading**: Implement lazy loading for media in the frontend.
7. **CDN Integration**: For production, consider using a CDN for media delivery.

## Troubleshooting

### Common Issues

1. **Media Not Displaying**: Check file paths and static file configuration.
2. **Missing Relationships**: Ensure entity-media relationships are properly defined.
3. **Empty Media Arrays**: Verify that relations are correctly specified in queries.
4. **File Access Errors**: Check directory permissions for media storage.

### Debugging

For debugging media issues:

```typescript
// Debugging endpoint example
@Get('debug/:id')
async debugExerciseMedia(@Param('id') id: string): Promise<any> {
  const exercise = await this.exerciseRepository.findOne({
    where: { id }
  });
  
  const media = await this.mediaRepository.find({
    where: { entityStringId: id }
  });
  
  return {
    exercise,
    media,
    mediaCount: media.length,
    fileExists: media.map(m => {
      const filePath = path.join(process.cwd(), 'public', m.url);
      return {
        url: m.url,
        exists: fs.existsSync(filePath)
      };
    })
  };
}
```

---

This guide provides the foundation for integrating media with all entities in the OKGYM application. Following these patterns will ensure consistency and maintainability as the application grows. 