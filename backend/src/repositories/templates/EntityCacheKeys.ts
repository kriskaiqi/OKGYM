/**
 * Template for entity cache key generation
 * Replace Entity with the actual entity name
 */
export class EntityCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: any): string {
        const keyParts = ['entity:filters'];
        
        // Add common filter properties
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add entity-specific filter properties
        // Example: if (filters.status) keyParts.push(`status:${filters.status}`);
        
        // Handle array properties
        // Example: if (filters.categoryIds?.length) keyParts.push(`cats:${filters.categoryIds.sort().join(',')}`);
        
        // Handle relation inclusion
        if (filters.includeRelations?.length) {
            keyParts.push(`relations:${filters.includeRelations.sort().join(',')}`);
        }
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single entity
     */
    static forEntity(id: string | number, relations: string[] = []): string {
        if (relations.length === 0) return `entity:${id}`;
        return `entity:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for a list of entities
     */
    static forList(identifier: string, limit: number = 20, offset: number = 0): string {
        return `entity:list:${identifier}:${limit}:${offset}`;
    }
} 