"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idToString = idToString;
exports.idsAreEqual = idsAreEqual;
exports.isUUID = isUUID;
exports.isNumericId = isNumericId;
exports.prepareIdForQuery = prepareIdForQuery;
exports.createIdWhereCondition = createIdWhereCondition;
function idToString(id) {
    return (id === null || id === void 0 ? void 0 : id.toString()) || '';
}
function idsAreEqual(id1, id2) {
    return idToString(id1) === idToString(id2);
}
function isUUID(id) {
    if (id === null || id === undefined)
        return false;
    const str = idToString(id);
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
function isNumericId(id) {
    if (id === null || id === undefined)
        return false;
    if (typeof id === 'number')
        return true;
    return /^\d+$/.test(id);
}
function prepareIdForQuery(id) {
    if (isUUID(id)) {
        return idToString(id);
    }
    if (typeof id === 'string' && isNumericId(id)) {
        return parseInt(id, 10);
    }
    return id;
}
function createIdWhereCondition(id) {
    return { id: prepareIdForQuery(id) };
}
//# sourceMappingURL=idCompatibility.js.map