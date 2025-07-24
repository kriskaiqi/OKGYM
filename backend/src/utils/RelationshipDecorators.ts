import 'reflect-metadata';

/**
 * Contains metadata keys for storing relationship information on properties
 */
const RELATIONSHIP_METADATA = {
  TYPE: Symbol('relationship:type'),
  TARGET: Symbol('relationship:target'),
  JOIN_TABLE: Symbol('relationship:joinTable'),
  ENTITY_FIELD: Symbol('relationship:entityField'),
  RELATION_FIELD: Symbol('relationship:relationField')
};

/**
 * Type of relationship
 */
export enum RelationshipType {
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE'
}

/**
 * Options for manual relationship decorators
 */
export interface ManualRelationshipOptions {
  joinTable?: string;
  entityField?: string;
  relationField?: string;
}

/**
 * Decorator factory for manually defining relationships on entity properties
 * @param type The type of relationship
 * @param targetEntity The target entity class or string name
 * @param options Join table configuration options
 */
function Relationship(
  type: RelationshipType,
  targetEntity: Function | string,
  options?: ManualRelationshipOptions
) {
  return function(target: any, propertyKey: string) {
    Reflect.defineMetadata(RELATIONSHIP_METADATA.TYPE, type, target, propertyKey);
    Reflect.defineMetadata(RELATIONSHIP_METADATA.TARGET, targetEntity, target, propertyKey);
    
    if (options?.joinTable) {
      Reflect.defineMetadata(RELATIONSHIP_METADATA.JOIN_TABLE, options.joinTable, target, propertyKey);
    }
    
    if (options?.entityField) {
      Reflect.defineMetadata(RELATIONSHIP_METADATA.ENTITY_FIELD, options.entityField, target, propertyKey);
    }
    
    if (options?.relationField) {
      Reflect.defineMetadata(RELATIONSHIP_METADATA.RELATION_FIELD, options.relationField, target, propertyKey);
    }
  };
}

/**
 * Decorator for manually defining a many-to-many relationship
 */
export function ManualManyToMany(
  targetEntity: Function | string,
  options: ManualRelationshipOptions
) {
  return Relationship(RelationshipType.MANY_TO_MANY, targetEntity, options);
}

/**
 * Decorator for manually defining a one-to-many relationship
 */
export function ManualOneToMany(
  targetEntity: Function | string,
  options: ManualRelationshipOptions
) {
  return Relationship(RelationshipType.ONE_TO_MANY, targetEntity, options);
}

/**
 * Decorator for manually defining a many-to-one relationship
 */
export function ManualManyToOne(
  targetEntity: Function | string,
  options: ManualRelationshipOptions
) {
  return Relationship(RelationshipType.MANY_TO_ONE, targetEntity, options);
}

/**
 * Get relationship metadata for a specific property
 */
export function getRelationshipMetadata(entity: any, propertyKey: string): {
  type: RelationshipType | null;
  target: Function | string | null;
  joinTable: string | null;
  entityField: string | null;
  relationField: string | null;
} {
  const prototype = Object.getPrototypeOf(entity);
  
  return {
    type: Reflect.getMetadata(RELATIONSHIP_METADATA.TYPE, prototype, propertyKey) || null,
    target: Reflect.getMetadata(RELATIONSHIP_METADATA.TARGET, prototype, propertyKey) || null,
    joinTable: Reflect.getMetadata(RELATIONSHIP_METADATA.JOIN_TABLE, prototype, propertyKey) || null,
    entityField: Reflect.getMetadata(RELATIONSHIP_METADATA.ENTITY_FIELD, prototype, propertyKey) || null,
    relationField: Reflect.getMetadata(RELATIONSHIP_METADATA.RELATION_FIELD, prototype, propertyKey) || null
  };
} 