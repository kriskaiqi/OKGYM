/**
 * ID Compatibility Layer
 * 
 * This file contains type definitions and helper functions
 * to support compatibility between numeric IDs and UUID strings.
 */

/**
 * Union type for workout plan IDs (supports both number and UUID string)
 */
export type WorkoutPlanId = string | number;

/**
 * Union type for workout exercise IDs (supports both number and UUID string)
 */
export type WorkoutExerciseId = string | number;

/**
 * Union type for workout session IDs (supports both number and UUID string)
 */
export type WorkoutSessionId = string | number;

/**
 * Safely converts an ID (either number or string) to a string
 * for comparison operations
 * 
 * @param id The ID to convert (can be string or number)
 * @returns The string representation of the ID, or empty string if null/undefined
 */
export function idToString(id: string | number | null | undefined): string {
  return id?.toString() || '';
}

/**
 * Checks if two IDs are equal by converting both to strings
 * 
 * @param id1 First ID (string or number)
 * @param id2 Second ID (string or number)
 * @returns True if the IDs are equal when converted to strings
 */
export function idsAreEqual(id1: string | number | null | undefined, id2: string | number | null | undefined): boolean {
  return idToString(id1) === idToString(id2);
}

/**
 * Determines if an ID appears to be a UUID
 * 
 * @param id The ID to check
 * @returns True if the ID matches UUID format
 */
export function isUUID(id: string | number | null | undefined): boolean {
  if (id === null || id === undefined) return false;
  
  const str = idToString(id);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Determines if an ID is a numeric ID
 * 
 * @param id The ID to check
 * @returns True if the ID is a number or a string containing only digits
 */
export function isNumericId(id: string | number | null | undefined): boolean {
  if (id === null || id === undefined) return false;
  
  if (typeof id === 'number') return true;
  
  return /^\d+$/.test(id);
}

/**
 * Helper for TypeORM repository operations to handle both ID types
 * 
 * @param id The ID to convert to appropriate type for database query
 * @returns The ID converted to appropriate type (string for UUIDs, number for numeric IDs)
 */
export function prepareIdForQuery(id: string | number): string | number {
  if (isUUID(id)) {
    return idToString(id);
  }
  
  // If it's a numeric ID and passed as string, convert to number
  if (typeof id === 'string' && isNumericId(id)) {
    return parseInt(id, 10);
  }
  
  // Otherwise return as is
  return id;
}

/**
 * Creates a TypeORM-compatible where condition for an ID field
 * This handles the type casting to ensure proper TypeORM compatibility
 * 
 * @param id The ID to use in the where condition (string or number)
 * @returns A where condition object with proper type casting for TypeORM
 */
export function createIdWhereCondition<T>(id: string | number): Record<string, any> {
  return { id: prepareIdForQuery(id) as any };
} 