"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleRefactoredRepository = void 0;
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
class ExampleRefactoredRepository extends GenericRepository_1.GenericRepository {
    async findWithFilters(filters) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            take: filters.limit || 20,
            skip: filters.offset || 0,
        });
        if (filters.category) {
            (0, typeorm_helpers_1.addWhereCondition)(query, 'category', filters.category);
        }
        if (filters.isActive !== undefined) {
            (0, typeorm_helpers_1.addWhereCondition)(query, 'active', filters.isActive);
        }
        if (filters.searchTerm) {
            (0, typeorm_helpers_1.addWhereCondition)(query, 'name', (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} ILIKE :searchTerm`, {
                searchTerm: `%${filters.searchTerm}%`
            }));
        }
        if (filters.sortBy) {
            const validSortFields = ['name', 'category', 'createdAt'];
            const direction = filters.sortDirection || 'ASC';
            if (validSortFields.includes(filters.sortBy)) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, direction);
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, 'name', 'ASC');
            }
        }
        else {
            (0, typeorm_helpers_1.addOrderBy)(query, 'name', 'ASC');
        }
        const result = await this.repository.findAndCount(query);
        return result;
    }
    async findEntityById(id) {
        const entity = await this.repository.findOne({
            where: (0, typeorm_helpers_1.createWhereCondition)({ id })
        });
        return entity;
    }
    async findByCategory(category) {
        const entities = await this.repository.find({
            where: (0, typeorm_helpers_1.createWhereCondition)({ category })
        });
        return entities;
    }
}
exports.ExampleRefactoredRepository = ExampleRefactoredRepository;
//# sourceMappingURL=ExampleRefactoredRepository.js.map