"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioCueRepository = void 0;
const typeorm_1 = require("typeorm");
const AudioCue_1 = require("../models/AudioCue");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class AudioCueRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(AudioCue_1.AudioCue);
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
            if (filters.includeWorkoutPlans)
                relations.push('workoutPlans');
            if (filters.includeCreator)
                relations.push('createdBy');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.trigger) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'trigger', filters.trigger);
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', filters.exerciseId);
            }
            if (filters.createdById) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'created_by', filters.createdById);
            }
            if (filters.isEnabled !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isEnabled', filters.isEnabled);
            }
            if (filters.isPremium !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPremium', filters.isPremium);
            }
            if (filters.isSystemDefault !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isSystemDefault', filters.isSystemDefault);
            }
            if (filters.includeVibration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'includeVibration', filters.includeVibration);
            }
            if (filters.language) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'language', filters.language);
            }
            if (filters.voiceType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'voiceType', filters.voiceType);
            }
            if (filters.volumeMin !== undefined && filters.volumeMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'volume', (0, typeorm_1.Between)(filters.volumeMin, filters.volumeMax));
            }
            else if (filters.volumeMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'volume', (0, typeorm_1.MoreThan)(filters.volumeMin));
            }
            else if (filters.volumeMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'volume', (0, typeorm_1.LessThan)(filters.volumeMax));
            }
            if (filters.priorityMin !== undefined && filters.priorityMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'priority', (0, typeorm_1.Between)(filters.priorityMin, filters.priorityMax));
            }
            else if (filters.priorityMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'priority', (0, typeorm_1.MoreThan)(filters.priorityMin));
            }
            else if (filters.priorityMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'priority', (0, typeorm_1.LessThan)(filters.priorityMax));
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
            if (filters.createdMin && filters.createdMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.Between)(filters.createdMin, filters.createdMax));
            }
            else if (filters.createdMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.MoreThan)(filters.createdMin));
            }
            else if (filters.createdMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.LessThan)(filters.createdMax));
            }
            if (filters.workoutPlanId && filters.includeWorkoutPlans) {
                if (!queryOptions.where) {
                    queryOptions.where = {};
                }
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutPlans.id', filters.workoutPlanId);
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ name: searchPattern }, { script: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByExercise(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                priority: 'DESC',
                type: 'ASC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isEnabled', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }
    async findByWorkoutPlan(workoutPlanId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                priority: 'DESC',
                type: 'ASC'
            };
            queryOptions.relations = ['workoutPlans'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutPlans.id', workoutPlanId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isEnabled', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.findByWorkoutPlan', { error, workoutPlanId });
            throw error;
        }
    }
    async findSystemDefaults() {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                type: 'ASC',
                priority: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isSystemDefault', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isEnabled', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.findSystemDefaults', { error });
            throw error;
        }
    }
    async findByType(type) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                priority: 'DESC',
                createdAt: 'DESC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isEnabled', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.findByType', { error, type });
            throw error;
        }
    }
    async addToWorkoutPlan(cueId, workoutPlanId) {
        var _a;
        try {
            const cue = await this.repository.findOne({
                where: { id: cueId },
                relations: ['workoutPlans']
            });
            if (!cue) {
                throw new Error(`Audio cue with ID ${cueId} not found`);
            }
            const planExists = (_a = cue.workoutPlans) === null || _a === void 0 ? void 0 : _a.some(plan => String(plan.id) === workoutPlanId);
            if (planExists) {
                return;
            }
            if (!cue.workoutPlans) {
                cue.workoutPlans = [];
            }
            cue.workoutPlans.push({ id: workoutPlanId });
            await this.repository.save(cue);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.addToWorkoutPlan', { error, cueId, workoutPlanId });
            throw error;
        }
    }
    async removeFromWorkoutPlan(cueId, workoutPlanId) {
        try {
            const cue = await this.repository.findOne({
                where: { id: cueId },
                relations: ['workoutPlans']
            });
            if (!cue || !cue.workoutPlans) {
                return;
            }
            cue.workoutPlans = cue.workoutPlans.filter(plan => String(plan.id) !== workoutPlanId);
            await this.repository.save(cue);
        }
        catch (error) {
            logger_1.default.error('Error in AudioCueRepository.removeFromWorkoutPlan', { error, cueId, workoutPlanId });
            throw error;
        }
    }
}
exports.AudioCueRepository = AudioCueRepository;
//# sourceMappingURL=AudioCueRepository.js.map