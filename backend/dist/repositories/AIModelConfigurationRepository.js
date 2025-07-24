"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModelConfigurationRepository = void 0;
const typeorm_1 = require("typeorm");
const AIModelConfiguration_1 = require("../models/AIModelConfiguration");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class AIModelConfigurationRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(AIModelConfiguration_1.AIModelConfiguration);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { createdAt: 'DESC' };
            if (filters.exerciseType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', filters.exerciseType);
            }
            if (filters.exerciseTypes && filters.exerciseTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', (0, typeorm_1.In)(filters.exerciseTypes));
            }
            if (filters.modelType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'modelType', filters.modelType);
            }
            if (filters.modelTypes && filters.modelTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'modelType', (0, typeorm_1.In)(filters.modelTypes));
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', filters.isActive);
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findActiveConfig(exerciseType, modelType) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', exerciseType);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'modelType', modelType);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            return await this.repository.findOne(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.findActiveConfig', { error, exerciseType, modelType });
            throw error;
        }
    }
    async findAllActive() {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.findAllActive', { error });
            throw error;
        }
    }
    async activateConfig(configId) {
        try {
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            await this.repository
                .createQueryBuilder()
                .update()
                .set({ isActive: false })
                .where('exerciseType = :exerciseType', { exerciseType: config.exerciseType })
                .andWhere('modelType = :modelType', { modelType: config.modelType })
                .execute();
            await this.repository.update(configId, { isActive: true });
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.activateConfig', { error, configId });
            throw error;
        }
    }
    async updateParameters(configId, parameters) {
        try {
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            config.modelParameters = Object.assign(Object.assign({}, config.modelParameters), parameters);
            return await this.repository.save(config);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.updateParameters', { error, configId, parameters });
            throw error;
        }
    }
    async updateAnalysisRules(configId, rules) {
        try {
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            config.analysisRules = Object.assign(Object.assign({}, config.analysisRules), rules);
            return await this.repository.save(config);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.updateAnalysisRules', { error, configId, rules });
            throw error;
        }
    }
    async cloneConfig(configId, changes = {}) {
        try {
            const sourceConfig = await this.repository.findOne({
                where: { id: configId }
            });
            if (!sourceConfig) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            const newConfig = new AIModelConfiguration_1.AIModelConfiguration();
            newConfig.exerciseType = sourceConfig.exerciseType;
            newConfig.modelType = sourceConfig.modelType;
            newConfig.modelParameters = Object.assign({}, sourceConfig.modelParameters);
            newConfig.analysisRules = Object.assign({}, sourceConfig.analysisRules);
            newConfig.metadata = sourceConfig.metadata ? Object.assign({}, sourceConfig.metadata) : {};
            newConfig.isActive = false;
            Object.assign(newConfig, changes);
            newConfig.metadata.description =
                `Cloned from ${sourceConfig.id} on ${new Date().toISOString()}`;
            newConfig.metadata.lastUpdated = new Date();
            return await this.repository.save(newConfig);
        }
        catch (error) {
            logger_1.default.error('Error in AIModelConfigurationRepository.cloneConfig', { error, configId, changes });
            throw error;
        }
    }
}
exports.AIModelConfigurationRepository = AIModelConfigurationRepository;
//# sourceMappingURL=AIModelConfigurationRepository.js.map