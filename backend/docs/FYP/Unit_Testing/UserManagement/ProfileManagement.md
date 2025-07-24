# Unit Testing Documentation

## Component: Profile Management

### Overview
This component allows users (regular and admin) to view and edit their profile information, including name, date of birth, fitness goals, and preferences. It also covers error handling for invalid or missing data.

### Test Cases
## 5.2.1.3 Profile Management

| ID  | Test Procedure                                      | Test Data                        | Expected Result                                      | Actual Result | Status |
|-----|-----------------------------------------------------|----------------------------------|------------------------------------------------------|---------------|--------------------|
| 3.1 | View profile with valid data                        | User logged in                   | Profile information displayed correctly              | As Expected   | Pass               |
| 3.2 | Edit profile with valid data                        | Name: Jane, DOB: 1990-01-01, Goals: Lose weight | Profile updated successfully, success message shown  | As Expected   | Pass               |
| 3.3 | Edit profile with missing required field             | Name: (empty)                    | Display error: 'Name is required'                    | As Expected   | Pass               |
| 3.4 | Edit profile with invalid date format                | DOB: 01-01-1990                  | Display error: 'Invalid date format'                 | As Expected   | Pass               |
| 3.5 | Edit profile with invalid fitness goal               | Goals: (empty)                   | Display error: 'Fitness goal is required'            | As Expected   | Pass               |
| 3.6 | Edit profile with special characters in name         | Name: @Jane!                     | Profile updated successfully or sanitized            | As Expected   | Pass               |
| 3.7 | Edit profile with whitespace-only fields             | Name: '   '                      | Display error: 'Field is required'                   | As Expected   | Pass               |
| 3.8 | Attempt SQL/script injection in profile fields       | Name: `<script>`                 | Display error: 'Invalid input' or sanitize input     | As Expected   | Pass               |
| 3.9 | Edit profile with maximum allowed field lengths      | Name: [max length], Goals: [max length] | Profile updated successfully                        | As Expected   | Pass               |
| 3.10| Attempt to edit profile while not logged in          | User not logged in               | Redirected to login page                             | As Expected   | Pass               |

### Edge Cases
- Edit with maximum allowed field lengths
- Edit with special characters and Unicode in name/goals
- Results: All edge cases handled as expected, no system crash or data corruption

### Error Handling
- Missing/invalid fields are handled with clear error messages
- No sensitive information is leaked in error responses

### Performance Testing
- Profile update completes within 1 second under normal load
- No significant resource spikes observed

### Integration Points
- Integrates with user database for profile updates
- Integration tests passed for all profile fields

### Dependencies
- User database
- Mock data for invalid and edge case inputs

### Test Environment
- Node.js v14+
- Jest 29+
- Local PostgreSQL database (test instance)
- Windows 10, 16GB RAM

### Test Results Summary
- Total test cases: 10
- Passed: 10
- Failed: 0
- Success rate: 100%

### Recommendations
- Add more tests for internationalization (e.g., Unicode names)
- Add tests for concurrent profile edits

### Appendix
- Test data: See table above
- Configuration: Default test DB
- Additional resources: Jest config, DB schema 
