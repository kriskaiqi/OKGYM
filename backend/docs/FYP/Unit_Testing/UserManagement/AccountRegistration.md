# Unit Testing Documentation

## Component: Account Registration

### Overview
This component handles the registration of new users (regular users and admins) in the OKGYM platform. It validates user input, creates new accounts, and handles error scenarios such as duplicate emails or invalid data.

### Test Cases
## 5.2.1.1 Account Registration
| ID  | Test Procedure                                      | Test Data                        | Expected Result                                      | Actual Result | Status | Notes |
|-----|-----------------------------------------------------|----------------------------------|------------------------------------------------------|---------------|--------------------|-------|
| 1.1 | Select user type (Regular/Admin)                    | Select 'Regular' or 'Admin'      | User type can be selected                            | As Expected   | Pass               |       |
| 1.2 | Fill in valid registration details                  | Name: John, Email: john@mail.com, Password: Abc12345 | Registration successful, redirected to login         | As Expected   | Pass               |       |
| 1.3 | Leave name field blank                              | Name: (empty)                    | Display error: 'Name is required'                    | As Expected   | Pass               |       |
| 1.4 | Enter invalid email                                 | Email: johnmail.com              | Display error: 'Invalid email'                       | As Expected   | Pass               |       |
| 1.5 | Leave email field blank                             | Email: (empty)                   | Display error: 'Email is required'                   | As Expected   | Pass               |       |
| 1.6 | Enter already registered email                      | Email: existing@mail.com         | Display error: 'Email already registered'            | As Expected   | Pass               |       |
| 1.7 | Enter password less than 6 characters               | Password: 12345                  | Display error: 'Password must be at least 6 characters' | As Expected   | Pass               |       |
| 1.8 | Leave password field blank                          | Password: (empty)                | Display error: 'Password is required'                | As Expected   | Pass               |       |
| 1.9 | Enter password with valid length                    | Password: Abc12345               | No error                                            | As Expected   | Pass               |       |
| 1.10| Enter password without required complexity          | Password: abcdefg                | Display error: 'Password must contain numbers/letters'| As Expected   | Pass               |       |
| 1.11| Submit form with all fields blank                   | All fields empty                  | Display all required field errors                    | As Expected   | Pass               |       |
| 1.12| Attempt registration with SQL/script injection      | Name: `<script>`, Email: test@mail.com | Display error: 'Invalid input' or sanitize input     | As Expected   | Pass               |       |
| 1.13| Attempt registration with whitespace-only fields    | Name: '   ', Email: '   '        | Display error: 'Field is required'                   | As Expected   | Pass               |       |

### Edge Cases
- Registration with maximum allowed field lengths
- Registration with special characters in name
- Registration with internationalized email addresses
- Results: All edge cases handled as expected, no system crash or data corruption

### Error Handling
- Duplicate email, invalid email, missing required fields, and invalid password are all handled with clear error messages
- No sensitive information is leaked in error responses

### Performance Testing
- Registration completes within 2 seconds under normal load
- No significant resource spikes observed

### Integration Points
- Integrates with user database for account creation
- Integrates with email service for verification (if applicable)
- Integration tests passed for both components

### Dependencies
- User database
- Email service (for verification, if enabled)
- Mock data for duplicate email and invalid input

### Test Environment
- Node.js v14+
- Jest 29+
- Local PostgreSQL database (test instance)
- Windows 10, 16GB RAM

### Test Results Summary
- Total test cases: 13
- Passed: 13
- Failed: 0
- Success rate: 100%

### Recommendations
- Add more tests for internationalization (e.g., Unicode names)
- Add rate limiting tests for registration endpoint
- Consider CAPTCHA for bot prevention

### Appendix
- Test data: See table above
- Configuration: Default test DB, mock email service
- Additional resources: Jest config, DB schema 
