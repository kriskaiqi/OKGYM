import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, ILike } from 'typeorm';
import { Media, MediaType, MediaContext, MediaQuality } from '../models/Media';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying media
 */
export interface MediaFilters {
    type?: MediaType;
    context?: MediaContext;
    quality?: MediaQuality;
    filename?: string;
    mimeType?: string;
    isPrimary?: boolean;
    entityType?: string;
    entityStringId?: string;
    entityNumericId?: number;
    sizeMin?: number;
    sizeMax?: number;
    durationMin?: number;
    durationMax?: number;
    createdMin?: Date;
    createdMax?: Date;
    searchTerm?: string;
    includeExercises?: boolean;
    includeVideoTutorials?: boolean;
    includeEquipment?: boolean;
    includeWorkoutPlans?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for Media entity
 */
export class MediaRepository extends GenericRepository<Media> {
    constructor() {
        super(Media);
    }

    /**
     * Find media with detailed filtering options
     */
    async findWithFilters(filters: MediaFilters): Promise<[Media[], number]> {
        try {
            const queryOptions: FindManyOptions<Media> = createQueryOptions<Media>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeExercises) relations.push('exercises');
            if (filters.includeVideoTutorials) relations.push('videoTutorials', 'tutorialThumbnails');
            if (filters.includeEquipment) relations.push('equipmentImages', 'equipmentVideos');
            if (filters.includeWorkoutPlans) relations.push('workoutVideos', 'workoutThumbnails');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.context) {
                addWhereCondition(queryOptions, 'context', filters.context);
            }

            if (filters.quality) {
                addWhereCondition(queryOptions, 'quality', filters.quality);
            }

            if (filters.isPrimary !== undefined) {
                addWhereCondition(queryOptions, 'isPrimary', filters.isPrimary);
            }

            if (filters.entityType) {
                addWhereCondition(queryOptions, 'entityType', filters.entityType);
            }

            if (filters.entityStringId) {
                addWhereCondition(queryOptions, 'entityStringId', filters.entityStringId);
            }

            if (filters.entityNumericId !== undefined) {
                addWhereCondition(queryOptions, 'entityNumericId', filters.entityNumericId);
            }

            if (filters.filename) {
                addWhereCondition(queryOptions, 'filename', ILike(`%${filters.filename}%`));
            }

            if (filters.mimeType) {
                addWhereCondition(queryOptions, 'mimeType', ILike(`%${filters.mimeType}%`));
            }

            // Size range filters
            if (filters.sizeMin !== undefined && filters.sizeMax !== undefined) {
                addWhereCondition(queryOptions, 'size', Between(filters.sizeMin, filters.sizeMax));
            } else if (filters.sizeMin !== undefined) {
                addWhereCondition(queryOptions, 'size', MoreThan(filters.sizeMin));
            } else if (filters.sizeMax !== undefined) {
                addWhereCondition(queryOptions, 'size', LessThan(filters.sizeMax));
            }

            // Duration range filters
            if (filters.durationMin !== undefined && filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'duration', Between(filters.durationMin, filters.durationMax));
            } else if (filters.durationMin !== undefined) {
                addWhereCondition(queryOptions, 'duration', MoreThan(filters.durationMin));
            } else if (filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'duration', LessThan(filters.durationMax));
            }

            // Created date range filters
            if (filters.createdMin && filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', Between(filters.createdMin, filters.createdMax));
            } else if (filters.createdMin) {
                addWhereCondition(queryOptions, 'createdAt', MoreThan(filters.createdMin));
            } else if (filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', LessThan(filters.createdMax));
            }

            // Search filter
            if (filters.searchTerm) {
                // This is a simplified implementation
                // For a real app, you might want to use full-text search or a more complex query
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                // Add where conditions for filename, altText, caption
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { filename: searchPattern },
                    { altText: searchPattern },
                    { caption: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in MediaRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find media by entity
     */
    async findByEntity(entityType: string, entityId: string | number): Promise<Media[]> {
        try {
            const queryOptions: FindManyOptions<Media> = createQueryOptions<Media>({});

            // Add where conditions
            queryOptions.order = { displayOrder: 'ASC', createdAt: 'DESC' };
            
            if (typeof entityId === 'string') {
                addWhereCondition(queryOptions, 'entityType', entityType);
                addWhereCondition(queryOptions, 'entityStringId', entityId);
            } else {
                addWhereCondition(queryOptions, 'entityType', entityType);
                addWhereCondition(queryOptions, 'entityNumericId', entityId);
            }

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MediaRepository.findByEntity', { error, entityType, entityId });
            throw error;
        }
    }

    /**
     * Find media by type and context
     */
    async findByTypeAndContext(type: MediaType, context: MediaContext): Promise<Media[]> {
        try {
            const queryOptions: FindManyOptions<Media> = createQueryOptions<Media>({});
            
            // Set sorting
            queryOptions.order = { displayOrder: 'ASC', createdAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'type', type);
            addWhereCondition(queryOptions, 'context', context);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in MediaRepository.findByTypeAndContext', { error, type, context });
            throw error;
        }
    }

    /**
     * Delete media file and database record
     */
    async deleteMedia(mediaId: string): Promise<boolean> {
        try {
            const media = await this.repository.findOne({ where: { id: mediaId } });
            if (!media) {
                return false;
            }

            // Call the entity's method to delete the actual file
            if (typeof media.deleteFile === 'function') {
                await media.deleteFile();
            }

            // Delete the database record
            await this.repository.delete(mediaId);
            return true;
        } catch (error) {
            logger.error('Error in MediaRepository.deleteMedia', { error, mediaId });
            throw error;
        }
    }

    /**
     * Find primary media for an entity
     */
    async findPrimaryForEntity(entityType: string, entityId: string | number): Promise<Media | null> {
        try {
            const queryOptions: FindManyOptions<Media> = createQueryOptions<Media>({});
            
            // Add where conditions
            if (typeof entityId === 'string') {
                addWhereCondition(queryOptions, 'entityType', entityType);
                addWhereCondition(queryOptions, 'entityStringId', entityId);
            } else {
                addWhereCondition(queryOptions, 'entityType', entityType);
                addWhereCondition(queryOptions, 'entityNumericId', entityId);
            }
            
            addWhereCondition(queryOptions, 'isPrimary', true);

            return await this.repository.findOne(queryOptions);
        } catch (error) {
            logger.error('Error in MediaRepository.findPrimaryForEntity', { error, entityType, entityId });
            throw error;
        }
    }
} 