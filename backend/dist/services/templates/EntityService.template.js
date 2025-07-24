"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNameService = void 0;
const repositories_1 = require("../../repositories");
const errors_1 = require("../../utils/errors");
const logger_1 = __importDefault(require("../../utils/logger"));
const transaction_helper_1 = require("../../utils/transaction-helper");
class EntityNameService {
    async getAll(filters) {
        try {
            return await repositories_1.repositories.entityName.findWithFilters(filters || {});
        }
        catch (error) {
            logger_1.default.error('Failed to fetch entities', { error, filters });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to fetch entities', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getById(id, relations = []) {
        try {
            const entity = await repositories_1.repositories.entityName.findById(id, relations);
            if (!entity) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Entity with ID ${id} not found`, 404);
            }
            return entity;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to fetch entity by ID', { error, id });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to fetch entity', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async create(data) {
        try {
            this.validateEntityData(data);
            const entity = await repositories_1.repositories.entityName.create(data);
            logger_1.default.info('Entity created', {
                entityId: entity.id,
                entityType: 'EntityName'
            });
            return entity;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to create entity', { error, data });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to create entity', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async update(id, data) {
        try {
            await this.getById(id);
            this.validateEntityData(data, true);
            const updated = await repositories_1.repositories.entityName.update(id, data);
            if (!updated) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Entity with ID ${id} not found`, 404);
            }
            logger_1.default.info('Entity updated', {
                entityId: id,
                entityType: 'EntityName',
                fields: Object.keys(data)
            });
            return updated;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to update entity', { error, id, data });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to update entity', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async delete(id) {
        try {
            await this.getById(id);
            await this.canDelete(id);
            const result = await repositories_1.repositories.entityName.delete(id);
            logger_1.default.info('Entity deleted', {
                entityId: id,
                entityType: 'EntityName'
            });
            return result.affected > 0;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to delete entity', { error, id });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to delete entity', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async performComplexOperation(id, operationData) {
        return (0, transaction_helper_1.executeTransaction)(async (queryRunner) => {
            try {
                const entity = await this.getById(id);
                logger_1.default.info('Complex operation completed', {
                    entityId: id,
                    operation: 'performComplexOperation'
                });
                return result;
            }
            catch (error) {
                if (error instanceof errors_1.AppError) {
                    throw error;
                }
                logger_1.default.error('Failed to perform complex operation', { error, id, operationData });
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_FAILED, 'Failed to perform operation', 500, error instanceof Error ? { message: error.message } : undefined);
            }
        });
    }
    validateEntityData(data, isUpdate = false) {
    }
    async canDelete(id) {
        return true;
    }
}
exports.EntityNameService = EntityNameService;
//# sourceMappingURL=EntityService.template.js.map