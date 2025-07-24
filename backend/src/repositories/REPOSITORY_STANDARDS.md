# Repository Layer Standards

This document outlines the standards and best practices for implementing repositories in our application.

## Repository Structure

Each entity repository should follow this structure:

```
repositories/
├── BaseRepository.ts       # Base interface for all repositories
├── GenericRepository.ts    # Generic implementation of base interface
├── templates/              # Template files for new repositories
├── interfaces/             # Filter and other interfaces
├── [Entity]Repository.ts   # Entity-specific repositories
└── index.ts                # Exports all repositories
```

## Repository Implementation Levels

### Level 1: Basic Repository
- Extends GenericRepository
- Implements basic CRUD operations
- Has proper error handling
- Includes basic logging

### Level 2: Enhanced Repository
- Adds caching layer
- Implements advanced filtering
- Includes performance monitoring
- Has proper TypeScript types

### Level 3: Optimized Repository
- Implements query optimization
- Uses proper indexes
- Has comprehensive caching strategy
- Includes batch operations
- Has proper transaction handling

## Implementation Checklist

For each repository, ensure:

### Basic Setup
- [ ] Extends GenericRepository
- [ ] Implements proper constructor
- [ ] Has proper TypeScript types

### Filtering
- [ ] Has Filter interface
- [ ] Implements findWithFilters method
- [ ] Has proper sorting options

### Caching
- [ ] Implements CacheKeys class
- [ ] Has proper TTL configuration
- [ ] Implements cache invalidation

### Performance
- [ ] Uses proper indexes
- [ ] Implements pagination
- [ ] Has performance monitoring
- [ ] Logs slow queries

### Error Handling
- [ ] Proper error types
- [ ] Error logging
- [ ] Transaction handling

## Coding Standards

### Naming Conventions
- Interface files: `[Entity]Filters.ts`
- Repository files: `[Entity]Repository.ts`
- Cache key classes: `[Entity]CacheKeys`

### Method Organization
- Public methods first
- Private helper methods last
- Cache-related methods grouped together

### Performance Standards
- Cache frequently accessed data
- Use appropriate indexes
- Log slow queries (>200ms)
- Implement pagination for list operations

## Required Methods

Each repository should implement:

1. **Base Methods** (inherited from GenericRepository)
   - `findById`
   - `findByIds`
   - `find`
   - `findOne`
   - `count`
   - `create`
   - `update`
   - `delete`
   - `save`

2. **Enhanced Methods**
   - `findWithFilters` - Enhanced find with filtering, pagination, and sorting
   - Entity-specific methods as needed

3. **Cache Management**
   - Cache invalidation methods
   - Cache key generation 