# Relationship Loader System

## Problem Summary

Our application has multiple entity models with undecorated relationship properties. These undecorated properties were causing errors when TypeORM tried to use `leftJoinAndSelect` or relation options, resulting in 500 errors.

## Solution Implemented

We've implemented a relationship loader system that allows relationships to be loaded manually without modifying the entity models. The solution consists of:

1. A `RelationshipDecorators.ts` utility for manually adding metadata to entity properties
2. An `EntityRelationships.ts` configuration file defining how entities are related
3. A `RelationshipLoader.ts` utility for loading relationship data
4. An `initRelationships.ts` initialization module for applying decorators at startup

## How to Test

1. Run the relationship test script:

```powershell
cd backend
.\test-relationship-fix.ps1
```

This script uses the full Node.js path from your Miniconda environment: `C:\Users\DELL\miniconda3\envs\kaiqi\node.exe`

2. To run the server manually with the correct Node.js path:

```powershell
cd backend
& "C:\Users\DELL\miniconda3\envs\kaiqi\node.exe" "./node_modules/ts-node/dist/bin.js" src/app.ts
```

3. Try the test endpoints directly once the server is running:

```
GET http://localhost:3001/api/test/relationships
GET http://localhost:3001/api/test/workout-relationships
```

## How It Works

1. At application startup, the `initializeRelationships()` function is called from `app.ts`
2. This attaches relationship metadata to entity classes dynamically
3. When models are loaded, the relationship properties work correctly with manual loading

## API Testing Endpoints

We've added test routes in `testRoutes.ts` to verify the functionality:

- `/api/test/relationships` - Tests exercise category relationships
- `/api/test/workout-relationships` - Tests workout plan equipment and muscle group relationships

## Usage in Code

To load relationships manually in your services:

```typescript
// Load a single relationship
const categories = await RelationshipLoader.loadRelationship(
  'Exercise', 
  'categories', 
  exerciseId, 
  categoryRepo
);

// Assign the loaded relationship
exercise.categories = categories;
```

## Troubleshooting

If relationships aren't loading correctly:

1. Check that the relationship is defined in `EntityRelationships.ts`
2. Verify the join table name and column names are correct
3. Ensure the entity class is included in the `initializeRelationships()` function
4. Check database queries in the server logs for any SQL errors
5. Make sure you're using the correct Node.js executable path (`C:\Users\DELL\miniconda3\envs\kaiqi\node.exe`) 