"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoTutorialRepository = void 0;
const typeorm_1 = require("typeorm");
const VideoTutorial_1 = require("../models/VideoTutorial");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class VideoTutorialRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(VideoTutorial_1.VideoTutorial);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { createdAt: 'DESC' };
            const relations = [];
            if (filters.includeExercise)
                relations.push('exercise');
            if (filters.includeCategories)
                relations.push('categories');
            if (filters.includeAuthor)
                relations.push('author');
            if (filters.includeMedia)
                relations.push('videoMedia', 'thumbnailMedia');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.difficulty) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'difficulty', filters.difficulty);
            }
            if (filters.quality) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'quality', filters.quality);
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', filters.exerciseId);
            }
            if (filters.authorId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'author_id', filters.authorId);
            }
            if (filters.isPremium !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPremium', filters.isPremium);
            }
            if (filters.isPublished !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublished', filters.isPublished);
            }
            if (filters.isFeatured !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isFeatured', filters.isFeatured);
            }
            if (filters.hasClosedCaptions !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'hasClosedCaptions', filters.hasClosedCaptions);
            }
            if (filters.language) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'language', filters.language);
            }
            if (filters.instructor) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'instructor', (0, typeorm_1.ILike)(`%${filters.instructor}%`));
            }
            if (filters.durationMin !== undefined && filters.durationMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'durationSeconds', (0, typeorm_1.Between)(filters.durationMin, filters.durationMax));
            }
            else if (filters.durationMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'durationSeconds', (0, typeorm_1.MoreThan)(filters.durationMin));
            }
            else if (filters.durationMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'durationSeconds', (0, typeorm_1.LessThan)(filters.durationMax));
            }
            if (filters.ratingMin !== undefined && filters.ratingMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'averageRating', (0, typeorm_1.Between)(filters.ratingMin, filters.ratingMax));
            }
            else if (filters.ratingMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'averageRating', (0, typeorm_1.MoreThan)(filters.ratingMin));
            }
            else if (filters.ratingMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'averageRating', (0, typeorm_1.LessThan)(filters.ratingMax));
            }
            if (filters.viewCountMin !== undefined && filters.viewCountMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'viewCount', (0, typeorm_1.Between)(filters.viewCountMin, filters.viewCountMax));
            }
            else if (filters.viewCountMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'viewCount', (0, typeorm_1.MoreThan)(filters.viewCountMin));
            }
            else if (filters.viewCountMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'viewCount', (0, typeorm_1.LessThan)(filters.viewCountMax));
            }
            if (filters.createdMin && filters.createdMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.Between)(filters.createdMin, filters.createdMax));
            }
            else if (filters.createdMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.MoreThan)(filters.createdMin));
            }
            else if (filters.createdMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.LessThan)(filters.createdMax));
            }
            if (filters.categoryIds && filters.categoryIds.length > 0 && filters.includeCategories) {
                if (!queryOptions.where) {
                    queryOptions.where = {};
                }
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'categories.id', (0, typeorm_1.In)(filters.categoryIds));
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ title: searchPattern }, { description: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByExercise(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                difficulty: 'ASC',
                createdAt: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublished', true);
            queryOptions.relations = ['videoMedia', 'thumbnailMedia'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }
    async findFeatured(limit = 10) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = {
                averageRating: 'DESC',
                viewCount: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isFeatured', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublished', true);
            queryOptions.relations = ['videoMedia', 'thumbnailMedia', 'exercise'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.findFeatured', { error, limit });
            throw error;
        }
    }
    async findByDifficulty(difficulty, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = {
                averageRating: 'DESC',
                createdAt: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'difficulty', difficulty);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublished', true);
            queryOptions.relations = ['videoMedia', 'thumbnailMedia'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.findByDifficulty', { error, difficulty, limit });
            throw error;
        }
    }
    async incrementViewCount(tutorialId) {
        try {
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                viewCount: () => "view_count + 1"
            })
                .where("id = :id", { id: tutorialId })
                .execute();
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.incrementViewCount', { error, tutorialId });
            throw error;
        }
    }
    async addRating(tutorialId, rating) {
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
        }
        catch (error) {
            logger_1.default.error('Error in VideoTutorialRepository.addRating', { error, tutorialId, rating });
            throw error;
        }
    }
}
exports.VideoTutorialRepository = VideoTutorialRepository;
//# sourceMappingURL=VideoTutorialRepository.js.map