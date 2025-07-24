"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilderExtensions = void 0;
const EntityRelationships_1 = require("./EntityRelationships");
class QueryBuilderExtensions {
    static whereHasRelation(builder, entityName, relationshipName, relationId) {
        var _a;
        const relationConfig = (_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationshipName];
        if (!relationConfig) {
            throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
        }
        const joinAlias = `${relationshipName}_join_${Math.floor(Math.random() * 1000)}`;
        return builder.andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('1')
                .from(relationConfig.joinTable, joinAlias)
                .where(`${joinAlias}.${relationConfig.entityIdField} = ${builder.alias}.id`)
                .andWhere(`${joinAlias}.${relationConfig.relationIdField} = :relationId`, {
                relationId
            });
            return 'EXISTS ' + subQuery.getQuery();
        });
    }
    static whereHasAnyRelation(builder, entityName, relationshipName, relationIds) {
        var _a;
        if (relationIds.length === 0)
            return builder;
        const relationConfig = (_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationshipName];
        if (!relationConfig) {
            throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
        }
        const joinAlias = `${relationshipName}_join_${Math.floor(Math.random() * 1000)}`;
        return builder.andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('1')
                .from(relationConfig.joinTable, joinAlias)
                .where(`${joinAlias}.${relationConfig.entityIdField} = ${builder.alias}.id`)
                .andWhere(`${joinAlias}.${relationConfig.relationIdField} IN (:...relationIds)`, {
                relationIds
            });
            return 'EXISTS ' + subQuery.getQuery();
        });
    }
    static orderByRelationCount(builder, entityName, relationshipName, direction = 'DESC') {
        var _a;
        const relationConfig = (_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationshipName];
        if (!relationConfig) {
            throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
        }
        const countAlias = `${relationshipName}_count`;
        return builder
            .addSelect(subQuery => {
            return subQuery
                .select(`COUNT(jt.${relationConfig.relationIdField})`)
                .from(relationConfig.joinTable, 'jt')
                .where(`jt.${relationConfig.entityIdField} = ${builder.alias}.id`);
        }, countAlias)
            .orderBy(countAlias, direction);
    }
}
exports.QueryBuilderExtensions = QueryBuilderExtensions;
//# sourceMappingURL=QueryBuilderExtensions.js.map