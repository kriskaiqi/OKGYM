import { FindManyOptions, FindOptionsWhere, Raw, FindOptionsOrder } from 'typeorm';

/**
 * Helper functions for dealing with TypeORM type issues
 */

/**
 * Creates a properly typed FindManyOptions object with type assertions to avoid TypeScript errors
 * @param entity Entity class
 * @returns A properly typed FindManyOptions object
 */
export function createQueryOptions<T>(options: Partial<FindManyOptions<T>> = {}): FindManyOptions<T> {
  return {
    where: {} as any,
    relations: options.relations || [],
    take: options.take,
    skip: options.skip,
    order: {} as any,
    ...options
  };
}

/**
 * Helper function to safely add a condition to the where clause
 * @param query The query object to modify
 * @param key The property name
 * @param value The value to set
 */
export function addWhereCondition<T>(query: FindManyOptions<T>, key: string, value: any): void {
  (query.where as any) = {
    ...(query.where as any),
    [key]: value
  };
}

/**
 * Helper function to safely create a Raw query
 * @param queryFn The raw query function
 * @returns The Raw query with proper type assertion
 */
export function createRawQuery(queryFn: (alias: string) => string, params?: Record<string, any>) {
  return Raw(queryFn, params || {}) as any;
}

/**
 * Helper function to safely set an order clause
 * @param query The query object to modify
 * @param key The property to sort by
 * @param direction The sort direction
 */
export function addOrderBy<T>(query: FindManyOptions<T>, key: string, direction: 'ASC' | 'DESC'): void {
  (query.order as any) = {
    ...(query.order as any),
    [key]: direction
  };
}

/**
 * Helper function to safely create a where condition for findOne, findOneBy, etc.
 * @param conditions The conditions to set
 * @returns The properly typed where conditions
 */
export function createWhereCondition<T>(conditions: Record<string, any>): FindOptionsWhere<T> {
  return conditions as any;
} 