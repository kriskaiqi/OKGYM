"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRepository = void 0;
const data_source_1 = require("../data-source");
class GenericRepository {
    constructor(entityClass) {
        this.repository = data_source_1.AppDataSource.getRepository(entityClass);
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async findByIds(ids) {
        return this.repository.findByIds(ids);
    }
    async find(options) {
        return this.repository.find(options || {});
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
    async count(options) {
        return this.repository.count(options || {});
    }
    async create(data) {
        const entity = this.repository.create(data);
        const result = await this.repository.save(entity);
        return result;
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
    async save(entity) {
        return this.repository.save(entity);
    }
}
exports.GenericRepository = GenericRepository;
//# sourceMappingURL=GenericRepository.js.map