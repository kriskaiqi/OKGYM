/**
 * TypeORM ID Compatibility Helpers
 * 
 * This file contains additional utility functions to help TypeORM repositories
 * work with both numeric and UUID IDs.
 */

import { FindOperator, FindOptionsWhere, In, Not } from 'typeorm';
import { 
  WorkoutPlanId, 
  WorkoutExerciseId, 
  prepareIdForQuery 
} from './idCompatibility';

/**
 * Creates a where condition object for a specific ID property
 * Handles conversion between numeric and UUID formats based on ID type
 * 
 * @param propertyName The entity property name (defaults to 'id')
 * @param id The ID value (string or number)
 * @returns A where condition object for TypeORM
 */
export function createIdCondition<T>(id: string | number, propertyName: string = 'id'): FindOptionsWhere<T> {
  const condition: FindOptionsWhere<T> = {};
  condition[propertyName] = prepareIdForQuery(id) as any;
  return condition;
}

/**
 * Creates a where condition for multiple IDs (In operator)
 * Handles conversion between numeric and UUID formats for each ID
 * 
 * @param ids Array of IDs (strings or numbers)
 * @param propertyName The entity property name (defaults to 'id')
 * @returns A where condition object with In operator for TypeORM
 */
export function createIdsInCondition<T>(ids: (string | number)[], propertyName: string = 'id'): FindOptionsWhere<T> {
  const condition: FindOptionsWhere<T> = {};
  
  // Convert each ID to the appropriate type
  const preparedIds = ids.map(id => prepareIdForQuery(id));
  
  condition[propertyName] = In(preparedIds) as any;
  return condition;
}

/**
 * Creates a where condition that excludes a specific ID
 * Handles conversion between numeric and UUID formats
 * 
 * @param id The ID to exclude (string or number)
 * @param propertyName The entity property name (defaults to 'id')
 * @returns A where condition object with Not operator for TypeORM
 */
export function createIdNotCondition<T>(id: string | number, propertyName: string = 'id'): FindOptionsWhere<T> {
  const condition: FindOptionsWhere<T> = {};
  condition[propertyName] = Not(prepareIdForQuery(id)) as any;
  return condition;
}

/**
 * Creates a where condition for a relationship ID
 * Useful for finding entities by a related entity's ID
 * 
 * @param relationProperty The name of the relation property
 * @param id The ID of the related entity
 * @returns A where condition object for TypeORM
 */
export function createRelationIdCondition<T>(relationProperty: string, id: string | number): FindOptionsWhere<T> {
  const condition: FindOptionsWhere<T> = {};
  condition[`${relationProperty}Id`] = prepareIdForQuery(id) as any;
  return condition;
}

/**
 * Applies an ID condition to an existing where condition object
 * Allows building complex conditions that include ID checks
 * 
 * @param whereCondition The existing where condition object
 * @param propertyName The property name for the ID
 * @param id The ID value
 * @returns The updated where condition object
 */
export function applyIdCondition<T>(
  whereCondition: FindOptionsWhere<T>,
  propertyName: string,
  id: string | number
): FindOptionsWhere<T> {
  return {
    ...whereCondition,
    [propertyName]: prepareIdForQuery(id) as any
  };
} 