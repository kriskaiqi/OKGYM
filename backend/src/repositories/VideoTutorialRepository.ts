import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, ILike, In } from 'typeorm';
import { VideoTutorial } from '../models/VideoTutorial';
import { TutorialDifficulty, VideoQuality, TutorialType } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying video tutorials
 */
export interface VideoTutorialFilters {
    type?: TutorialType;
    difficulty?: TutorialDifficulty;
    quality?: VideoQuality;
    exerciseId?: string;
    authorId?: string;
    isPremium?: boolean;
    isPublished?: boolean;
    isFeatured?: boolean;
    hasClosedCaptions?: boolean;
    language?: string;
    instructor?: string;
    searchTerm?: string;
    durationMin?: number;
    durationMax?: number;
    ratingMin?: number;
    ratingMax?: number;
    viewCountMin?: number;
    viewCountMax?: number;
    createdMin?: Date;
    createdMax?: Date;
    includeExercise?: boolean;
    includeCategories?: boolean;
    includeAuthor?: boolean;
    includeMedia?: boolean;
    categoryIds?: string[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for VideoTutorial entity
 */
export class VideoTutorialRepository extends GenericRepository<VideoTutorial> {
    constructor() {
        super(VideoTutorial);
    }

    /**
     * Find video tutorials with detailed filtering options
     */
    async findWithFilters(filters: VideoTutorialFilters): Promise<[VideoTutorial[], number]> {
        try {
            const queryOptions: FindManyOptions<VideoTutorial> = createQueryOptions<VideoTutorial>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeCategories) relations.push('categories');
            if (filters.includeAuthor) relations.push('author');
            if (filters.includeMedia) relations.push('videoMedia', 'thumbnailMedia');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.difficulty) {
                addWhereCondition(queryOptions, 'difficulty', filters.difficulty);
            }

            if (filters.quality) {
                addWhereCondition(queryOptions, 'quality', filters.quality);
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', filters.exerciseId);
            }

            if (filters.authorId) {
                addWhereCondition(queryOptions, 'author_id', filters.authorId);
            }

            if (filters.isPremium !== undefined) {
                addWhereCondition(queryOptions, 'isPremium', filters.isPremium);
            }

            if (filters.isPublished !== undefined) {
                addWhereCondition(queryOptions, 'isPublished', filters.isPublished);
            }

            if (filters.isFeatured !== undefined) {
                addWhereCondition(queryOptions, 'isFeatured', filters.isFeatured);
            }

            if (filters.hasClosedCaptions !== undefined) {
                addWhereCondition(queryOptions, 'hasClosedCaptions', filters.hasClosedCaptions);
            }

            if (filters.language) {
                addWhereCondition(queryOptions, 'language', filters.language);
            }

            if (filters.instructor) {
                addWhereCondition(queryOptions, 'instructor', ILike(`%${filters.instructor}%`));
            }

            // Duration range filters
            if (filters.durationMin !== undefined && filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', Between(filters.durationMin, filters.durationMax));
            } else if (filters.durationMin !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', MoreThan(filters.durationMin));
            } else if (filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', LessThan(filters.durationMax));
            }

            // Rating range filters
            if (filters.ratingMin !== undefined && filters.ratingMax !== undefined) {
                addWhereCondition(queryOptions, 'averageRating', Between(filters.ratingMin, filters.ratingMax));
            } else if (filters.ratingMin !== undefined) {
                addWhereCondition(queryOptions, 'averageRating', MoreThan(filters.ratingMin));
            } else if (filters.ratingMax !== undefined) {
                addWhereCondition(queryOptions, 'averageRating', LessThan(filters.ratingMax));
            }

            // View count range filters
            if (filters.viewCountMin !== undefined && filters.viewCountMax !== undefined) {
                addWhereCondition(queryOptions, 'viewCount', Between(filters.viewCountMin, filters.viewCountMax));
            } else if (filters.viewCountMin !== undefined) {
                addWhereCondition(queryOptions, 'viewCount', MoreThan(filters.viewCountMin));
            } else if (filters.viewCountMax !== undefined) {
                addWhereCondition(queryOptions, 'viewCount', LessThan(filters.viewCountMax));
            }

            // Created date range filters
            if (filters.createdMin && filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', Between(filters.createdMin, filters.createdMax));
            } else if (filters.createdMin) {
                addWhereCondition(queryOptions, 'createdAt', MoreThan(filters.createdMin));
            } else if (filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', LessThan(filters.createdMax));
            }

            // Category filters
            if (filters.categoryIds && filters.categoryIds.length > 0 && filters.includeCategories) {
                // This is a simplified approach and might need further improvement based on your ORM setup
                if (!queryOptions.where) {
                    queryOptions.where = {};
                }
                
                // We add a complex where condition to match at least one of the categories
                // Note: This approach varies based on your database and might require adjustment
                addWhereCondition(queryOptions, 'categories.id', In(filters.categoryIds));
            }

            // Search filter
            if (filters.searchTerm) {
                // This is a simplified implementation
                // For a real app, you might want to use full-text search or a more complex query
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                // Add where conditions for title and description
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { title: searchPattern },
                    { description: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find tutorials for specific exercise
     */
    async findByExercise(exerciseId: string): Promise<VideoTutorial[]> {
        try {
            const queryOptions: FindManyOptions<VideoTutorial> = createQueryOptions<VideoTutorial>({});
            
            // Set sorting
            queryOptions.order = { 
                difficulty: 'ASC',
                createdAt: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise_id', exerciseId);
            addWhereCondition(queryOptions, 'isPublished', true);

            // Include relations
            queryOptions.relations = ['videoMedia', 'thumbnailMedia'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find featured tutorials
     */
    async findFeatured(limit: number = 10): Promise<VideoTutorial[]> {
        try {
            const queryOptions: FindManyOptions<VideoTutorial> = createQueryOptions<VideoTutorial>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { 
                averageRating: 'DESC',
                viewCount: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'isFeatured', true);
            addWhereCondition(queryOptions, 'isPublished', true);

            // Include relations
            queryOptions.relations = ['videoMedia', 'thumbnailMedia', 'exercise'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.findFeatured', { error, limit });
            throw error;
        }
    }

    /**
     * Find tutorials by difficulty
     */
    async findByDifficulty(difficulty: TutorialDifficulty, limit: number = 20): Promise<VideoTutorial[]> {
        try {
            const queryOptions: FindManyOptions<VideoTutorial> = createQueryOptions<VideoTutorial>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { 
                averageRating: 'DESC',
                createdAt: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'difficulty', difficulty);
            addWhereCondition(queryOptions, 'isPublished', true);

            // Include relations
            queryOptions.relations = ['videoMedia', 'thumbnailMedia'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.findByDifficulty', { error, difficulty, limit });
            throw error;
        }
    }

    /**
     * Increment view count
     */
    async incrementViewCount(tutorialId: string): Promise<void> {
        try {
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                    viewCount: () => "view_count + 1"
                })
                .where("id = :id", { id: tutorialId })
                .execute();
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.incrementViewCount', { error, tutorialId });
            throw error;
        }
    }

    /**
     * Add rating to tutorial
     */
    async addRating(tutorialId: string, rating: number): Promise<void> {
        try {
            const tutorial = await this.repository.findOne({ where: { id: tutorialId } });
            if (!tutorial) {
                throw new Error(`Tutorial with ID ${tutorialId} not found`);
            }

            const newRatingCount = tutorial.ratingCount + 1;
            const newRating = ((tutorial.averageRating * tutorial.ratingCount) + rating) / newRatingCount;

            await this.repository.update(tutorialId, {
                averageRating: newRating,
                ratingCount: newRatingCount
            });
        } catch (error) {
            logger.error('Error in VideoTutorialRepository.addRating', { error, tutorialId, rating });
            throw error;
        }
    }
} 