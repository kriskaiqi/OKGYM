"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryOptions = createQueryOptions;
exports.addWhereCondition = addWhereCondition;
exports.createRawQuery = createRawQuery;
exports.addOrderBy = addOrderBy;
exports.createWhereCondition = createWhereCondition;
const typeorm_1 = require("typeorm");
function createQueryOptions(options = {}) {
    return Object.assign({ where: {}, relations: options.relations || [], take: options.take, skip: options.skip, order: {} }, options);
}
function addWhereCondition(query, key, value) {
    query.where = Object.assign(Object.assign({}, query.where), { [key]: value });
}
function createRawQuery(queryFn, params) {
    return (0, typeorm_1.Raw)(queryFn, params || {});
}
function addOrderBy(query, key, direction) {
    query.order = Object.assign(Object.assign({}, query.order), { [key]: direction });
}
function createWhereCondition(conditions) {
    return conditions;
}
//# sourceMappingURL=typeorm-helpers.js.map