"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRelationshipDecorators = applyRelationshipDecorators;
exports.createRelationshipApplier = createRelationshipApplier;
const EntityRelationships_1 = require("./EntityRelationships");
const RelationshipDecorators_1 = require("./RelationshipDecorators");
function applyRelationshipDecorators(entityClasses) {
    Object.entries(EntityRelationships_1.EntityRelationships).forEach(([entityName, relations]) => {
        if (!entityClasses[entityName]) {
            console.warn(`Entity class ${entityName} not found, skipping relationship decorators`);
            return;
        }
        const EntityClass = entityClasses[entityName];
        Object.entries(relations).forEach(([propertyName, config]) => {
            const targetEntity = typeof config.relatedEntity === 'string'
                ? config.relatedEntity
                : config.relatedEntity;
            Object.defineProperty(EntityClass.prototype, propertyName, {
                configurable: true,
                writable: true,
                value: undefined
            });
            (0, RelationshipDecorators_1.ManualManyToMany)(targetEntity, {
                joinTable: config.joinTable,
                entityField: config.entityIdField,
                relationField: config.relationIdField
            })(EntityClass.prototype, propertyName);
        });
    });
    console.log('Applied relationship decorators to entity classes');
}
function createRelationshipApplier() {
    return function applyRelationships(entity) {
        if (!entity)
            return entity;
        const constructor = entity.constructor;
        const entityName = constructor.name;
        const relationships = EntityRelationships_1.EntityRelationships[entityName];
        if (!relationships)
            return entity;
        Object.keys(relationships).forEach(propertyName => {
            if (entity[propertyName] === undefined) {
                entity[propertyName] = [];
            }
        });
        return entity;
    };
}
//# sourceMappingURL=RelationshipGenerator.js.map