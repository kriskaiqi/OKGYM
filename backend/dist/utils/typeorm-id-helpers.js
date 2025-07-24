"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdCondition = createIdCondition;
exports.createIdsInCondition = createIdsInCondition;
exports.createIdNotCondition = createIdNotCondition;
exports.createRelationIdCondition = createRelationIdCondition;
exports.applyIdCondition = applyIdCondition;
const typeorm_1 = require("typeorm");
const idCompatibility_1 = require("./idCompatibility");
function createIdCondition(id, propertyName = 'id') {
    const condition = {};
    condition[propertyName] = (0, idCompatibility_1.prepareIdForQuery)(id);
    return condition;
}
function createIdsInCondition(ids, propertyName = 'id') {
    const condition = {};
    const preparedIds = ids.map(id => (0, idCompatibility_1.prepareIdForQuery)(id));
    condition[propertyName] = (0, typeorm_1.In)(preparedIds);
    return condition;
}
function createIdNotCondition(id, propertyName = 'id') {
    const condition = {};
    condition[propertyName] = (0, typeorm_1.Not)((0, idCompatibility_1.prepareIdForQuery)(id));
    return condition;
}
function createRelationIdCondition(relationProperty, id) {
    const condition = {};
    condition[`${relationProperty}Id`] = (0, idCompatibility_1.prepareIdForQuery)(id);
    return condition;
}
function applyIdCondition(whereCondition, propertyName, id) {
    return Object.assign(Object.assign({}, whereCondition), { [propertyName]: (0, idCompatibility_1.prepareIdForQuery)(id) });
}
//# sourceMappingURL=typeorm-id-helpers.js.map