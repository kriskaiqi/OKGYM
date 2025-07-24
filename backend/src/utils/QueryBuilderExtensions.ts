import { SelectQueryBuilder, WhereExpressionBuilder, ObjectLiteral } from 'typeorm';
import { EntityRelationships } from './EntityRelationships';

/**
 * Extension methods for TypeORM's SelectQueryBuilder to help with manually defined relationships
 */
export class QueryBuilderExtensions {
  /**
   * Adds a WHERE condition to filter entities that have a specific related entity
   * @example
   * // Find exercises that have a specific category
   * queryBuilderExtensions.whereHasRelation(
   *   queryBuilder, 'Exercise', 'categories', categoryId
   * );
   */
  static whereHasRelation<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    entityName: string,
    relationshipName: string,
    relationId: string | number
  ): SelectQueryBuilder<T> {
    const relationConfig = EntityRelationships[entityName]?.[relationshipName];
    if (!relationConfig) {
      throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
    }

    // Create a unique alias for the join table to avoid conflicts
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

  /**
   * Adds a WHERE condition to filter entities that have any of the specified related entities
   */
  static whereHasAnyRelation<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    entityName: string,
    relationshipName: string,
    relationIds: (string | number)[]
  ): SelectQueryBuilder<T> {
    if (relationIds.length === 0) return builder;
    
    const relationConfig = EntityRelationships[entityName]?.[relationshipName];
    if (!relationConfig) {
      throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
    }

    // Create a unique alias for the join table to avoid conflicts
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

  /**
   * Orders results by the count of related entities
   */
  static orderByRelationCount<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    entityName: string,
    relationshipName: string,
    direction: 'ASC' | 'DESC' = 'DESC'
  ): SelectQueryBuilder<T> {
    const relationConfig = EntityRelationships[entityName]?.[relationshipName];
    if (!relationConfig) {
      throw new Error(`No relation config found for ${entityName}.${relationshipName}`);
    }

    // Create a unique alias for the count
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