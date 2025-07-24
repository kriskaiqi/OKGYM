import { EntityRelationships } from './EntityRelationships';
import { ManualManyToMany } from './RelationshipDecorators';

/**
 * Applies the manual relationship decorators to entity classes based on the EntityRelationships configuration.
 * 
 * Use this function to add metadata to your entity classes without modifying the original files.
 * 
 * @example
 * // In your application startup code:
 * const models = {
 *   Exercise: Exercise,
 *   WorkoutPlan: WorkoutPlan,
 *   // ...other models
 * };
 * applyRelationshipDecorators(models);
 */
export function applyRelationshipDecorators(entityClasses: Record<string, any>) {
  // For each entity type in our config
  Object.entries(EntityRelationships).forEach(([entityName, relations]) => {
    // Skip if we don't have this entity class
    if (!entityClasses[entityName]) {
      console.warn(`Entity class ${entityName} not found, skipping relationship decorators`);
      return;
    }
    
    const EntityClass = entityClasses[entityName];
    
    // For each relationship on this entity
    Object.entries(relations).forEach(([propertyName, config]) => {
      // Get the target entity class or name
      const targetEntity = typeof config.relatedEntity === 'string' 
        ? config.relatedEntity 
        : config.relatedEntity as Function;
      
      // Apply the appropriate decorator based on relationship type
      // For now we only support ManyToMany, but you could expand this
      Object.defineProperty(EntityClass.prototype, propertyName, {
        configurable: true,
        writable: true,
        value: undefined
      });
      
      ManualManyToMany(targetEntity, {
        joinTable: config.joinTable,
        entityField: config.entityIdField,
        relationField: config.relationIdField
      })(EntityClass.prototype, propertyName);
    });
  });
  
  console.log('Applied relationship decorators to entity classes');
}

/**
 * Creates a factory function to dynamically apply all relationship decorators
 * before using an entity in a specific context.
 * 
 * @example
 * // In your entity service
 * const withRelationships = createRelationshipApplier();
 * 
 * // Then when you need an entity with relationship metadata
 * const exercise = withRelationships(await repository.findOne(id));
 */
export function createRelationshipApplier() {
  return function applyRelationships<T>(entity: T): T {
    if (!entity) return entity;
    
    const constructor = entity.constructor;
    const entityName = constructor.name;
    
    // Check if this entity type has relationships defined
    const relationships = EntityRelationships[entityName];
    if (!relationships) return entity;
    
    // Initialize all relationship properties to empty arrays if not set
    Object.keys(relationships).forEach(propertyName => {
      if (entity[propertyName] === undefined) {
        entity[propertyName] = [];
      }
    });
    
    return entity;
  };
} 