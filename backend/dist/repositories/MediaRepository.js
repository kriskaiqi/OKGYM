"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRepository = void 0;
const typeorm_1 = require("typeorm");
const Media_1 = require("../models/Media");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class MediaRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(Media_1.Media);
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
            if (filters.includeExercises)
                relations.push('exercises');
            if (filters.includeVideoTutorials)
                relations.push('videoTutorials', 'tutorialThumbnails');
            if (filters.includeEquipment)
                relations.push('equipmentImages', 'equipmentVideos');
            if (filters.includeWorkoutPlans)
                relations.push('workoutVideos', 'workoutThumbnails');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.context) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'context', filters.context);
            }
            if (filters.quality) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'quality', filters.quality);
            }
            if (filters.isPrimary !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPrimary', filters.isPrimary);
            }
            if (filters.entityType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', filters.entityType);
            }
            if (filters.entityStringId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityStringId', filters.entityStringId);
            }
            if (filters.entityNumericId !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityNumericId', filters.entityNumericId);
            }
            if (filters.filename) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'filename', (0, typeorm_1.ILike)(`%${filters.filename}%`));
            }
            if (filters.mimeType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'mimeType', (0, typeorm_1.ILike)(`%${filters.mimeType}%`));
            }
            if (filters.sizeMin !== undefined && filters.sizeMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'size', (0, typeorm_1.Between)(filters.sizeMin, filters.sizeMax));
            }
            else if (filters.sizeMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'size', (0, typeorm_1.MoreThan)(filters.sizeMin));
            }
            else if (filters.sizeMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'size', (0, typeorm_1.LessThan)(filters.sizeMax));
            }
            if (filters.durationMin !== undefined && filters.durationMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'duration', (0, typeorm_1.Between)(filters.durationMin, filters.durationMax));
            }
            else if (filters.durationMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'duration', (0, typeorm_1.MoreThan)(filters.durationMin));
            }
            else if (filters.durationMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'duration', (0, typeorm_1.LessThan)(filters.durationMax));
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
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ filename: searchPattern }, { altText: searchPattern }, { caption: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MediaRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByEntity(entityType, entityId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { displayOrder: 'ASC', createdAt: 'DESC' };
            if (typeof entityId === 'string') {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', entityType);
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityStringId', entityId);
            }
            else {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', entityType);
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityNumericId', entityId);
            }
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MediaRepository.findByEntity', { error, entityType, entityId });
            throw error;
        }
    }
    async findByTypeAndContext(type, context) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { displayOrder: 'ASC', createdAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'context', context);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MediaRepository.findByTypeAndContext', { error, type, context });
            throw error;
        }
    }
    async deleteMedia(mediaId) {
        try {
            const media = await this.repository.findOne({ where: { id: mediaId } });
            if (!media) {
                return false;
            }
            if (typeof media.deleteFile === 'function') {
                await media.deleteFile();
            }
            await this.repository.delete(mediaId);
            return true;
        }
        catch (error) {
            logger_1.default.error('Error in MediaRepository.deleteMedia', { error, mediaId });
            throw error;
        }
    }
    async findPrimaryForEntity(entityType, entityId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            if (typeof entityId === 'string') {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', entityType);
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityStringId', entityId);
            }
            else {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', entityType);
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityNumericId', entityId);
            }
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPrimary', true);
            return await this.repository.findOne(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in MediaRepository.findPrimaryForEntity', { error, entityType, entityId });
            throw error;
        }
    }
}
exports.MediaRepository = MediaRepository;
//# sourceMappingURL=MediaRepository.js.map