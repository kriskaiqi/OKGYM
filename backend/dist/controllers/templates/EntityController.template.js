"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNameController = void 0;
const error_handler_1 = require("../../utils/error-handler");
const response_formatter_1 = require("../../utils/response-formatter");
class EntityNameController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const filters = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const paginatedFilters = Object.assign(Object.assign({}, filters), { limit, offset: (page - 1) * limit });
                const [entities, total] = await this.service.getAll(paginatedFilters);
                return (0, response_formatter_1.formatResponse)(res, {
                    data: entities,
                    metadata: {
                        page,
                        pageSize: limit,
                        totalItems: total,
                        totalPages: Math.ceil(total / limit),
                        hasMore: page * limit < total
                    }
                });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.getById = async (req, res, next) => {
            var _a;
            try {
                const id = req.params.id;
                const relations = ((_a = req.query.include) === null || _a === void 0 ? void 0 : _a.toString().split(',')) || [];
                const entity = await this.service.getById(id, relations);
                return (0, response_formatter_1.formatResponse)(res, { data: entity });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const data = req.body;
                const entity = await this.service.create(data);
                return (0, response_formatter_1.formatResponse)(res, {
                    data: entity,
                    message: 'Entity created successfully'
                }, 201);
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = req.params.id;
                const data = req.body;
                const entity = await this.service.update(id, data);
                return (0, response_formatter_1.formatResponse)(res, {
                    data: entity,
                    message: 'Entity updated successfully'
                });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = req.params.id;
                await this.service.delete(id);
                return (0, response_formatter_1.formatResponse)(res, {
                    message: 'Entity deleted successfully'
                });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.performComplexOperation = async (req, res, next) => {
            try {
                const id = req.params.id;
                const operationData = req.body;
                const result = await this.service.performComplexOperation(id, operationData);
                return (0, response_formatter_1.formatResponse)(res, {
                    data: result,
                    message: 'Operation completed successfully'
                });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error, req, res);
            }
        };
        this.service = {};
    }
}
exports.EntityNameController = EntityNameController;
//# sourceMappingURL=EntityController.template.js.map