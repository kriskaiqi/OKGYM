# Query Optimization Standards

This document outlines best practices for database query optimization in the OKGYM application, leveraging our standardized entity relationships and database indexes.

## Query Pattern Standards

### 1. Basic Query Patterns

#### Finding Single Records

```typescript
// PREFERRED: Use findOneBy for simple primary key lookups
const user = await repository.findOneBy({ id: userId });

// ACCEPTABLE: Use findOne with a simple where clause
const user = await repository.findOne({ 
  where: { id: userId } 
});

// AVOID: Don't use complex conditions in simple lookups
const user = await repository.find({ 
  where: { id: userId },
  take: 1
})[0];
```

#### Finding Multiple Records 

```typescript
// PREFERRED: Use findBy for simple field matches
const activeUsers = await repository.findBy({ isActive: true });

// ACCEPTABLE: Use find with explicit options for more complex needs
const users = await repository.find({
  where: { isActive: true },
  order: { createdAt: 'DESC' },
  take: 10
});
```

### 2. Optimized Relation Loading

#### Selective Loading

```typescript
// PREFERRED: Only load the relations you need
const workout = await repository.findOne({
  where: { id: workoutId },
  relations: ['exercises', 'targetMuscleGroups']
});

// AVOID: Don't load all relations unnecessarily
const workout = await repository.findOne({
  where: { id: workoutId },
  relations: ['exercises', 'exercises.exercise', 'targetMuscleGroups', 'tags', 'equipmentNeeded', 'creator', 'favoritedBy']
});
```

#### Relation Depth Control

```typescript
// PREFERRED: Control the depth of loaded relations
const workout = await repository.findOne({
  where: { id: workoutId },
  relations: {
    exercises: {
      exercise: true
    },
    targetMuscleGroups: true
  }
});
```

### 3. Efficient Pagination

```typescript
// PREFERRED: Use skip and take for pagination
const [results, total] = await repository.findAndCount({
  where: { workoutCategory: WorkoutCategory.STRENGTH },
  skip: (page - 1) * pageSize,
  take: pageSize,
  order: { createdAt: 'DESC' }
});

// AVOID: Don't fetch all records and paginate in memory
const allResults = await repository.find({
  where: { workoutCategory: WorkoutCategory.STRENGTH }
});
const pagedResults = allResults.slice((page - 1) * pageSize, page * pageSize);
```

### 4. Optimized Filtering

```typescript
// PREFERRED: Use indexed fields for filtering
const workouts = await repository.find({
  where: { 
    difficulty: Difficulty.INTERMEDIATE,
    workoutCategory: WorkoutCategory.STRENGTH
  }
});

// For complex filters, use the new composite indexes
const workouts = await repository.find({
  where: { 
    difficulty: Difficulty.INTERMEDIATE,
    workoutCategory: WorkoutCategory.STRENGTH,
    estimatedDuration: LessThan(60)
  }
});
```

### 5. Query Builder Usage

When simple find methods aren't sufficient, use QueryBuilder with optimized joins and conditions:

```typescript
// PREFERRED: Use aliases and join optimizations
const results = await repository
  .createQueryBuilder('workout')
  .leftJoinAndSelect('workout.exercises', 'exercise')
  .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
  .where('workout.difficulty = :difficulty', { difficulty: Difficulty.INTERMEDIATE })
  .andWhere('workout.estimatedDuration <= :duration', { duration: 60 })
  .orderBy('workout.popularity', 'DESC')
  .take(10)
  .getMany();

// AVOID: Don't use string-based column names or unindexed fields for sorting
const results = await repository
  .createQueryBuilder('workout')
  .orderBy('popularity', 'DESC') // Missing alias
  .getMany();
```

## Leveraging Our New Indexes

The following standardized indexes should be used for the corresponding query patterns:

### WorkoutPlan Indexes

- `idx_workout_search`: Use for queries filtering by name, category, and difficulty
- `idx_workout_rating`: Use for sorting by rating and counting
- `idx_workout_popularity`: Use for filtering by popularity and category
- `idx_workout_newest`: Use for sorting by creation date within categories
- `idx_workout_filter`: Use for filtering by difficulty, category, and duration

```typescript
// Example using search index
const popularWorkouts = await repository.find({
  where: { 
    workoutCategory: WorkoutCategory.STRENGTH,
    difficulty: Difficulty.INTERMEDIATE
  },
  order: { popularity: 'DESC' }
});
```

### Exercise Indexes

- `idx_exercise_name_measurement`: Use for queries filtering by name and measurement type
- `idx_exercise_categories`: Use when joining with exercise categories
- `idx_exercise_equipment`: Use when filtering by equipment

```typescript
// Example using equipment index
const barbellExercises = await repository.find({
  where: { 
    equipmentOptions: { 
      category: EquipmentCategory.BARBELLS 
    } 
  }
});
```

### User Indexes

- `idx_user_favorite_workouts`: Use when querying user's favorite workouts
- `idx_user_workout_history`: Use when accessing workout history
- `idx_user_created_workouts`: Use when listing workouts created by a user

```typescript
// Example using created workouts index
const userWorkouts = await workoutPlanRepository.findByCreator(userId);
```

## Performance Optimization Tactics

### 1. Select Only Needed Fields

```typescript
// PREFERRED: Select only necessary fields
const usernames = await repository
  .createQueryBuilder('user')
  .select(['user.id', 'user.username'])
  .getMany();
```

### 2. Count Optimization

```typescript
// PREFERRED: Use countBy for simple counting
const activeCount = await repository.countBy({ isActive: true });

// For complex counts, use optimized query builder
const activeUserCount = await repository
  .createQueryBuilder('user')
  .where('user.isActive = :active', { active: true })
  .getCount();
```

### 3. Batch Processing

For operations on large datasets, use batching:

```typescript
// Process users in batches of 100
let skip = 0;
const batchSize = 100;
let hasMoreRecords = true;

while (hasMoreRecords) {
  const users = await repository.find({
    skip,
    take: batchSize,
    order: { id: 'ASC' }
  });
  
  if (users.length === 0) {
    hasMoreRecords = false;
  } else {
    // Process batch
    for (const user of users) {
      // Process user
    }
    skip += batchSize;
  }
}
```

### 4. Use Raw Queries for Reports

For complex reports and analytics, consider using raw queries:

```typescript
const workoutStats = await repository.query(`
  SELECT 
    workout_category as category,
    AVG(estimated_duration) as avgDuration,
    COUNT(*) as count
  FROM workout_plans
  GROUP BY workout_category
  ORDER BY count DESC
`);
```

## Common Anti-Patterns to Avoid

1. **N+1 Query Problem**: Avoid loops that execute a database query for each item
2. **Eager Loading Everything**: Don't eagerly load all relations when only a few are needed
3. **Inefficient Sorting**: Avoid sorting on non-indexed columns
4. **In-Memory Filtering**: Don't load full datasets to filter in memory
5. **String Manipulation in Queries**: Avoid complex string manipulation in WHERE clauses

## Query Monitoring and Optimization

For critical queries, implement query monitoring:

```typescript
// Add timing to important queries
const start = Date.now();
const result = await complexQueryOperation();
const duration = Date.now() - start;
if (duration > 500) { // Log slow queries over 500ms
  logger.warn(`Slow query detected: ${duration}ms`, { 
    operation: 'findWorkoutsWithFilters',
    filters: JSON.stringify(filters),
    duration
  });
}
```

## Implementing These Standards

When implementing these standards in repositories:

1. Update existing query patterns to use optimized approaches
2. Leverage the standardized indexes we've created
3. For complex queries, review and optimize any QueryBuilder usage
4. Add performance logging for critical operations
5. Review and optimize batch operations 