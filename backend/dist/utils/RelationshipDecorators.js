"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipType = void 0;
exports.ManualManyToMany = ManualManyToMany;
exports.ManualOneToMany = ManualOneToMany;
exports.ManualManyToOne = ManualManyToOne;
exports.getRelationshipMetadata = getRelationshipMetadata;
require("reflect-metadata");
const RELATIONSHIP_METADATA = {
    TYPE: Symbol('relationship:type'),
    TARGET: Symbol('relationship:target'),
    JOIN_TABLE: Symbol('relationship:joinTable'),
    ENTITY_FIELD: Symbol('relationship:entityField'),
    RELATION_FIELD: Symbol('relationship:relationField')
};
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["ONE_TO_MANY"] = "ONE_TO_MANY";
    RelationshipType["MANY_TO_ONE"] = "MANY_TO_ONE";
    RelationshipType["MANY_TO_MANY"] = "MANY_TO_MANY";
    RelationshipType["ONE_TO_ONE"] = "ONE_TO_ONE";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
function Relationship(type, targetEntity, options) {
    return function (target, propertyKey) {
        Reflect.defineMetadata(RELATIONSHIP_METADATA.TYPE, type, target, propertyKey);
        Reflect.defineMetadata(RELATIONSHIP_METADATA.TARGET, targetEntity, target, propertyKey);
        if (options === null || options === void 0 ? void 0 : options.joinTable) {
            Reflect.defineMetadata(RELATIONSHIP_METADATA.JOIN_TABLE, options.joinTable, target, propertyKey);
        }
        if (options === null || options === void 0 ? void 0 : options.entityField) {
            Reflect.defineMetadata(RELATIONSHIP_METADATA.ENTITY_FIELD, options.entityField, target, propertyKey);
        }
        if (options === null || options === void 0 ? void 0 : options.relationField) {
            Reflect.defineMetadata(RELATIONSHIP_METADATA.RELATION_FIELD, options.relationField, target, propertyKey);
        }
    };
}
function ManualManyToMany(targetEntity, options) {
    return Relationship(RelationshipType.MANY_TO_MANY, targetEntity, options);
}
function ManualOneToMany(targetEntity, options) {
    return Relationship(RelationshipType.ONE_TO_MANY, targetEntity, options);
}
function ManualManyToOne(targetEntity, options) {
    return Relationship(RelationshipType.MANY_TO_ONE, targetEntity, options);
}
function getRelationshipMetadata(entity, propertyKey) {
    const prototype = Object.getPrototypeOf(entity);
    return {
        type: Reflect.getMetadata(RELATIONSHIP_METADATA.TYPE, prototype, propertyKey) || null,
        target: Reflect.getMetadata(RELATIONSHIP_METADATA.TARGET, prototype, propertyKey) || null,
        joinTable: Reflect.getMetadata(RELATIONSHIP_METADATA.JOIN_TABLE, prototype, propertyKey) || null,
        entityField: Reflect.getMetadata(RELATIONSHIP_METADATA.ENTITY_FIELD, prototype, propertyKey) || null,
        relationField: Reflect.getMetadata(RELATIONSHIP_METADATA.RELATION_FIELD, prototype, propertyKey) || null
    };
}
//# sourceMappingURL=RelationshipDecorators.js.map