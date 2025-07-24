# Caching Strategies for OKGYM Application

## Overview

This document outlines the caching strategies implemented in the OKGYM application to improve performance, reduce database load, and enhance user experience.

## Caching Layers

We implement a multi-layered caching approach:

1. **In-Memory Application Cache**: For frequently accessed, relatively static data
2. **Redis Cache**: For shared data across application instances and complex objects
3. **HTTP Response Cache**: For API responses with appropriate cache headers
4. **Client-Side Cache**: For optimizing frontend performance

## Cache Categories and TTL (Time-To-Live)

| Category | Examples | TTL | Cache Type |
|----------|----------|-----|------------|
| Static Reference Data | Exercise definitions, Equipment types | 24 hours | Redis + In-Memory |
| User-Independent Data | Popular workouts, Featured programs | 1 hour | Redis |
| User-Specific Data | User profiles, Workout history | 5 minutes | Redis |
| Computed Results | Workout recommendations, Exercise statistics | 15 minutes | Redis |
| API Responses | GET /workouts, GET /exercises | Varies | HTTP Cache |

## Implementation Strategy

### 1. Cache Keys

Standard format: `entity:id:subresource`

Examples:
- `exercise:123:full` - Full exercise data with ID 123
- `workout:456:exercises` - Exercises for workout with ID 456
- `user:789:favorites` - Favorite workouts for user with ID 789
- `popular:workouts:strength` - Popular strength workouts

### 2. Cache Invalidation Strategy

1. **Time-Based Invalidation**: Default strategy using TTL
2. **Event-Based Invalidation**: Triggered on data mutations
   - On workout update: `invalidateCache('workout:id:*')`
   - On user preference change: `invalidateCache('user:id:recommendations')`
3. **Bulk Invalidation**: For major data changes
   - On exercise library update: `invalidateCache('exercise:*')`

### 3. Entities to Cache

#### High Priority (Implement First)
- Exercise definitions
- Popular workout plans
- User workout history
- Featured training programs

#### Medium Priority
- Exercise categories 
- User recommendations
- Workout search results

#### Low Priority (Implement Later)
- User activity feeds
- Achievement statistics
- Admin dashboards

## Caching Implementation Details

### Exercise Cache

```typescript
// Get exercise with cache
async function getExercise(id: string): Promise<Exercise> {
  const cacheKey = `exercise:${id}:full`;
  
  // Try to get from cache first
  const cached = await cacheManager.get<Exercise>(cacheKey);
  if (cached) return cached;
  
  // If not in cache, get from database
  const exercise = await exerciseRepository.findOne({
    where: { id },
    relations: ['categories', 'equipmentOptions']
  });
  
  // Store in cache for future requests
  if (exercise) {
    await cacheManager.set(cacheKey, exercise, { ttl: 60 * 60 * 24 }); // 24 hours
  }
  
  return exercise;
}
```

### Workout Plan Cache

```typescript
// Get popular workouts with cache
async function getPopularWorkouts(category?: string, limit: number = 10): Promise<WorkoutPlan[]> {
  const cacheKey = `popular:workouts:${category || 'all'}:${limit}`;
  
  // Try cache first
  const cached = await cacheManager.get<WorkoutPlan[]>(cacheKey);
  if (cached) return cached;
  
  // Query database if not cached
  const workouts = await workoutPlanRepository.findPopular(category, limit);
  
  // Cache results
  await cacheManager.set(cacheKey, workouts, { ttl: 60 * 60 }); // 1 hour
  
  return workouts;
}
```

## Cache Monitoring

We'll implement the following monitoring metrics:

1. Cache hit ratio
2. Cache miss count
3. Time saved from caching
4. Memory usage
5. Cache invalidation frequency

## Phased Implementation

### Phase 1: Core Caching Infrastructure
- Set up Redis connection
- Implement Cache Manager service
- Add caching for Exercise and WorkoutPlan repositories

### Phase 2: API Response Caching
- Add HTTP cache headers
- Implement server-side response caching
- Configure cache-control headers

### Phase 3: Advanced Caching
- Implement prefetching for predictable data needs
- Add cache warming for high-traffic entities
- Optimize cache invalidation patterns

## Conclusion

These caching strategies will significantly reduce database load and improve response times for commonly accessed data. By implementing a multi-layered caching approach, we can optimize both read and write operations while maintaining data consistency. 