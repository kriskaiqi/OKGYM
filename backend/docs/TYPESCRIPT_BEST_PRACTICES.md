# TypeScript Best Practices for Express Controllers

## Return Statements in Express Controllers

### Issue: "Not all code paths return a value"

When working with Express controllers in TypeScript, you may encounter the error: "Not all code paths return a value." This is because TypeScript expects all code paths in a function to explicitly return a value (unless the return type is `void`).

### Best Practices

1. **Always add `return` before response methods:**
   ```typescript
   // Good
   return res.status(200).json({ message: 'Success' });
   
   // Avoid
   res.status(200).json({ message: 'Success' });
   ```

2. **Ensure all catch blocks have return statements:**
   ```typescript
   try {
     const result = await service.doSomething();
     return res.status(200).json(result);
   } catch (error) {
     logger.error('Error:', error);
     return res.status(500).json({ message: 'Internal server error' });
   }
   ```

3. **Explicitly type your controller methods:**
   ```typescript
   // Explicitly specify void or Promise<void> return type
   async login(req: Request, res: Response): Promise<void> {
     // ...
   }
   ```

### Benefits

- Prevents "Cannot set headers after they are sent to the client" errors
- Satisfies TypeScript's requirement for all code paths to return a value
- Makes the code more readable and maintainable
- Helps catch potential bugs early in the development process

## Middleware Return Statements

For Express middleware functions, remember to:

1. **Add `return` after the `next()` call:**
   ```typescript
   const middleware = (req: Request, res: Response, next: NextFunction): void => {
     // ... validation logic
     next();
     return; // Prevents TypeScript "Not all code paths return a value" error
   };
   ```

2. **Or explicitly type the function as `void`:**
   ```typescript
   const middleware = (req: Request, res: Response, next: NextFunction): void => {
     // ... validation logic
     next();
   };
   ```

## Recent Fixes in the Codebase

We recently fixed "Not all code paths return a value" errors in:

1. **`validateRequest` middleware** - Added a `return` statement after `next()`
2. **`AuthController.ts`** - Added `return` statements before response method calls in the `login` and `register` methods

These changes ensure that our code is more robust and compliant with TypeScript's type checking. 