/**
 * Template for entity filter interfaces
 * Replace EntityName with the actual entity name
 */
export interface EntityFilters {
    // Common filters
    searchTerm?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    includeRelations?: string[];
    
    // Entity-specific filters
    // Example: status?: 'active' | 'inactive';
    // Example: categoryIds?: number[];
    // Example: dateRange?: { start: Date; end: Date };
    
    // Add entity-specific filters here
} 