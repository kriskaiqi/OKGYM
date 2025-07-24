# UserRepository Caching Fix

## Overview

This document explains the caching standards and best practices for the `UserRepository` class. The main considerations are using the correct method signatures for the `CacheManager` and implementing effective cache invalidation patterns.

## Best Practices

1. Use the updated `CacheManager` methods with proper syntax:
   - Use `cacheManager.set(key, value, { ttl: ttlValue })` with options object
   - Use `cacheManager.delete` for removing items (not the deprecated `del`)
   - Use `cacheManager.deleteByPattern` for pattern-based invalidation (not `delPattern`)
   - Implement structured cache key generation for consistency
   - Follow error handling and logging patterns

2. Performance considerations:
   - Add performance monitoring for slow queries
   - Use logging to identify performance bottlenecks
   - Implement proper indexing to support filtering

## Testing for Caching Issues

Use the provided test script to verify that caching works correctly:

```bash
npm run test:caching
```

This script tests:
1. Cache hit/miss behavior
2. Cache invalidation on updates
3. Cache behavior with different filter parameters
4. Performance metrics for cache operations

## Cache Key Structure

Use a consistent structure for cache keys:

- User by ID: `user:{id}`
- User by ID with relations: `user:{id}:{relation1-relation2-...}`
- User by email: `user:email:{email}`
- User by username: `user:username:{username}`
- User filters: `users:filters:{filter1}:{filter2}:...`
- Active users: `users:active:{days}:{limit}`
- User counts: `users:count:status:{status}`

## Performance Monitoring

Add performance monitoring to critical repository methods:
- For simple lookups: Warn if query takes more than 50ms
- For complex queries: Warn if query takes more than 100ms

```typescript
const start = Date.now();
const result = await this.repository.findOne(/* ... */);
const duration = Date.now() - start;
if (duration > 100) {
  logger.warn(`Slow query detected: ${duration}ms`, { method: 'findById', id });
}
```

## Cache Invalidation Strategy

Implement a comprehensive cache invalidation strategy:

1. When a user is created:
   - Invalidate all list caches

2. When a user is updated:
   - Invalidate specific user caches
   - Invalidate list caches
   - Invalidate email/username caches if those fields were updated

3. When a user is deleted:
   - Invalidate specific user caches
   - Invalidate list caches
   - Invalidate email/username caches

## Debugging Cache Issues

If you encounter cache-related issues:

1. Check that all `cacheManager.set` calls use the options object format
2. Verify that cache invalidation patterns are correct and comprehensive
3. Test with caching disabled to isolate performance issues
4. Examine cache hit/miss ratios to optimize caching strategy 