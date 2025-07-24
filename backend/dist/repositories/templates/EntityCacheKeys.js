"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityCacheKeys = void 0;
class EntityCacheKeys {
    static forFilters(filters) {
        var _a;
        const keyParts = ['entity:filters'];
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if ((_a = filters.includeRelations) === null || _a === void 0 ? void 0 : _a.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        return keyParts.join(':');
    }
    static forEntity(id, relations = []) {
        if (relations.length === 0)
            return `entity:${id}`;
        return `entity:${id}:${relations.sort().join('-')}`;
    }
    static forList(identifier, limit = 20, offset = 0) {
        return `entity:list:${identifier}:${limit}:${offset}`;
    }
}
exports.EntityCacheKeys = EntityCacheKeys;
//# sourceMappingURL=EntityCacheKeys.js.map