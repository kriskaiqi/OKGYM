# Data Transfer Objects (DTOs)

This directory contains Data Transfer Objects (DTOs) used for transferring data between layers of the application.

## Purpose

DTOs serve several important purposes in our architecture:

1. **Decoupling**: They decouple the API layer from the domain model
2. **Validation**: They define validation rules for incoming data
3. **Documentation**: They provide clear interfaces for API contracts
4. **Security**: They prevent exposing sensitive internal data

## DTO Types

We use several types of DTOs for different purposes:

### Input DTOs

- **CreateDto**: Used for entity creation operations
- **UpdateDto**: Used for entity update operations (may have optional fields)
- **FilterDto**: Used for filtering in list operations

### Output DTOs

- **ResponseDto**: Used for sending data to clients
- **SummaryDto**: Simplified/abbreviated version of entity for lists
- **DetailDto**: Detailed version of entity including relations

## Naming Convention

DTOs should follow this naming pattern:

- `Entity`CreateDto
- `Entity`UpdateDto
- `Entity`FilterDto
- `Entity`ResponseDto
- `Entity`SummaryDto
- `Entity`DetailDto

For example: `UserCreateDto`, `UserUpdateDto`, etc.

## Implementation Pattern

DTOs should use TypeScript interfaces and class-validator decorators:

```typescript
import { IsEmail, IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
```

## Integration with Controllers

Controllers should validate incoming DTOs using middleware:

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

// Validation middleware
export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoObject);
    
    if (errors.length > 0) {
      // Handle validation errors
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        }
      });
    }
    
    req.body = dtoObject;
    next();
  };
};
```

## Mapping Between DTOs and Entities

Use mapping functions to convert between DTOs and entities:

```typescript
// Convert User entity to UserResponseDto
export const toUserResponseDto = (user: User): UserResponseDto => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as UserResponseDto;
};
``` 