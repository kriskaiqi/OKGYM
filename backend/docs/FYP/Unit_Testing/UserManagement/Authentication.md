# Unit Testing Documentation

## Component: Authentication (Login/Logout)

### Overview
This component manages user authentication, including login and logout processes for both regular users and admins. It validates credentials, manages sessions, and handles error scenarios such as incorrect credentials or inactive accounts.

### Test Cases
## 5.2.1.2 Authentication

| ID  | Test Procedure                                      | Test Data                        | Expected Result                                      | Actual Result | Status |
|-----|-----------------------------------------------------|----------------------------------|------------------------------------------------------|---------------|--------------------|
| 2.1 | Login with valid credentials                        | Email: user@mail.com, Password: Abc12345 | Login successful, redirected to dashboard            | As Expected   | Pass               |
| 2.2 | Login with invalid email                            | Email: usermail.com, Password: Abc12345 | Display error: 'Invalid email'                       | As Expected   | Pass               |
| 2.3 | Login with unregistered email                       | Email: notfound@mail.com, Password: Abc12345 | Display error: 'Email not found'                     | As Expected   | Pass               |
| 2.4 | Login with incorrect password                       | Email: user@mail.com, Password: wrongpass | Display error: 'Incorrect password'                  | As Expected   | Pass               |
| 2.5 | Leave email field blank                             | Email: (empty), Password: Abc12345 | Display error: 'Email is required'                   | As Expected   | Pass               |
| 2.6 | Leave password field blank                          | Email: user@mail.com, Password: (empty) | Display error: 'Password is required'                | As Expected   | Pass               |
| 2.7 | Login with both fields blank                        | Email: (empty), Password: (empty) | Display both required field errors                   | As Expected   | Pass               |
| 2.8 | Login with SQL/script injection in email            | Email: `<script>`, Password: Abc12345 | Display error: 'Invalid input' or sanitize input     | As Expected   | Pass               |
| 2.9 | Login with whitespace-only fields                   | Email: '   ', Password: '   '     | Display error: 'Field is required'                   | As Expected   | Pass               |
| 2.10| Login with deactivated account                      | Email: deactivated@mail.com, Password: Abc12345 | Display error: 'Account is deactivated'              | As Expected   | Pass               |
| 2.11| Successful logout                                  | User is logged in                 | Session terminated, redirected to login page         | As Expected   | Pass               |
| 2.12| Logout with expired session                         | Session expired                   | Redirected to login page with session expired message| As Expected   | Pass               |
| 2.13| Attempt login with account locked after failed attempts | Email: locked@mail.com, Password: Abc12345 | Display error: 'Account locked due to failed attempts' | As Expected   | Pass               |

### Edge Cases
- Login with maximum allowed email/password length
- Login with special characters in email/password
- Results: All edge cases handled as expected, no system crash or data leak

### Error Handling
- Incorrect credentials, missing fields, deactivated/locked accounts are all handled with clear error messages
- No sensitive information is leaked in error responses

### Performance Testing
- Login completes within 1 second under normal load
- No significant resource spikes observed

### Integration Points
- Integrates with user database for credential validation
- Integrates with session management system
- Integration tests passed for both components

### Dependencies
- User database
- Session management middleware
- Mock data for invalid, deactivated, and locked accounts

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
- Add more tests for brute-force and timing attacks
- Add multi-factor authentication tests if implemented
- Consider CAPTCHA for repeated failed login attempts

### Appendix
- Test data: See table above
- Configuration: Default test DB, session middleware
- Additional resources: Jest config, DB schema 
