# Service Layer Implementation Standards

This document outlines the standards and best practices for implementing services in the OKGYM application.

## Service Structure

Each service should follow this consistent structure:

```typescript
import { repositories } from '../repositories';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { executeTransaction } from '../utils/transaction-helper';
import { BaseService } from './interfaces/BaseService';

export class SomeEntityService implements BaseService<SomeEntity, CreateDto, UpdateDto, FilterDto> {
  // Implementation
}
```

## Implementation Levels

### Level 1: Basic Service
- Implements BaseService interface
- Uses repositories through `repositories` object
- Includes basic error handling with AppError
- Implements logging with the logger utility

### Level 2: Enhanced Service
- Adds transaction handling with executeTransaction
- Implements proper validation
- Handles cross-entity operations
- Manages cache invalidation

### Level 3: Domain-Specific Service
- Implements business logic specific to the domain
- Handles complex workflows
- Includes performance optimization
- Implements thorough error handling with domain-specific errors

## Implementation Checklist

For each service method, ensure:

### Error Handling
- [ ] Uses AppError with appropriate ErrorType
- [ ] Includes meaningful error messages
- [ ] Adds context details for debugging
- [ ] Logs errors with appropriate level

### Transaction Management
- [ ] Uses executeTransaction for operations affecting multiple entities
- [ ] Implements proper rollback on failure
- [ ] Manages related entity operations atomically

### Validation
- [ ] Validates input data before processing
- [ ] Checks for entity existence when needed
- [ ] Validates business rules and constraints
- [ ] Returns clear validation error messages

### Performance
- [ ] Optimizes queries with proper filtering
- [ ] Manages caching appropriately
- [ ] Paginates large result sets
- [ ] Uses appropriate relations loading

## Method Organization

Organize service methods in this order:

1. Core CRUD methods (from BaseService)
   - getAll, getById, create, update, delete

2. Query methods
   - getByX, findX, searchX

3. Business operation methods
   - processX, calculateX, executeX

4. Helper methods (private)
   - validateX, checkX, formatX

## Error Handling Patterns

### Entity Not Found
```typescript
const entity = await repositories.entity.findById(id);
if (!entity) {
  throw new AppError(ErrorType.NOT_FOUND, 'Entity not found');
}
```

### Validation Error
```typescript
if (!isValid(data)) {
  throw new AppError(
    ErrorType.VALIDATION_ERROR,
    'Invalid data',
    400,
    { details: 'Specific validation details' }
  );
}
```

### Business Rule Violation
```typescript
if (violatesBusinessRule(entity, data)) {
  throw new AppError(
    ErrorType.BUSINESS_RULE_VIOLATION,
    'Operation violates business rule',
    422,
    { rule: 'Description of the rule that was violated' }
  );
}
```

## Transaction Pattern

```typescript
return executeTransaction(async (queryRunner) => {
  // Perform multiple operations
  const result1 = await operation1(queryRunner);
  const result2 = await operation2(queryRunner);
  
  return finalResult;
});
```

## Logging Patterns

### Info Logging
```typescript
logger.info('Operation completed', { 
  entityId: entity.id,
  operation: 'update',
  changes: Object.keys(data)
});
```

### Error Logging
```typescript
logger.error('Failed to process entity', {
  entityId: id,
  operation: 'process',
  error: error.message,
  stack: error.stack
});
```

## Documentation

Each service and method should be documented with JSDoc:

```typescript
/**
 * Service for managing SomeEntity
 */
export class SomeEntityService {
  /**
   * Create a new entity
   * 
   * @param data Entity creation data
   * @returns The created entity
   * @throws {AppError} If validation fails or creation fails
   */
  async create(data: CreateDto): Promise<SomeEntity> {
    // Implementation
  }
}
``` 