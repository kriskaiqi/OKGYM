# OKGYM Web Application - Use Case Specifications

This document provides detailed specifications for each use case in the OKGYM Web Application.

## Table of Contents
1. [User Management](#user-management)
   - [Register Account](#register-account)
   - [Login](#login)
   - [Logout](#logout)
   - [Edit Profile](#edit-profile)
   - [Toggle Dark Mode](#toggle-dark-mode)
2. [Workout Management](#workout-management)
3. [Workout Sessions](#workout-sessions)
4. [Exercise Management](#exercise-management)
5. [Real-time Detection](#real-time-detection)
6. [Progress Tracking](#progress-tracking)
7. [Equipment](#equipment)
8. [Admin Functions](#admin-functions)

## User Management

### Register Account

| Use Case Name | Register Account |
|---------------|------------------|
| Actor(s) | Regular User |
| Description | Allows new users to create an account on the OKGYM platform. |
| Priority | High |
| Precondition(s) | User must not have an existing account with the same email. |
| Main Flow | 1. User navigates to the registration page.<br>2. User provides required information (name, email, password, etc.).<br>3. User submits the registration form.<br>4. System validates the information.<br>5. System creates a new user account.<br>6. System sends a verification email to the user (optional).<br>7. System redirects the user to the login page or dashboard. |
| Alternative Flow | 4a. If validation fails, display appropriate error messages:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Email already registered<br>&nbsp;&nbsp;&nbsp;&nbsp;- Password does not meet requirements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Required fields missing<br>4b. User corrects information and resubmits.<br>6a. If email verification is implemented and fails, instruct user to request a new verification email. |
| Postcondition(s) | A new user account is created in the system. |

### Login

| Use Case Name | Login |
|---------------|-------|
| Actor(s) | Regular User, Admin |
| Description | Allows registered users to authenticate and access their account. |
| Priority | High |
| Precondition(s) | User must have a registered account. |
| Main Flow | 1. User navigates to the login page.<br>2. User enters email and password.<br>3. User submits the login form.<br>4. System authenticates the credentials.<br>5. System redirects the user to the dashboard. |
| Alternative Flow | 4a. If authentication fails, display error message:<br>&nbsp;&nbsp;&nbsp;&nbsp;- "Incorrect email or password"<br>4b. User can retry or request password reset.<br>4c. After multiple failed attempts, system may implement temporary lockout. |
| Postcondition(s) | User is authenticated and granted access to their account. Session is created. |

### Logout

| Use Case Name | Logout |
|---------------|--------|
| Actor(s) | Regular User, Admin |
| Description | Allows authenticated users to securely sign out of their account. |
| Priority | Medium |
| Precondition(s) | User must be currently logged in. |
| Main Flow | 1. User clicks the logout button/link.<br>2. System terminates the user's session.<br>3. System redirects the user to the login page or home page. |
| Alternative Flow | 1a. Session expires due to inactivity:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System automatically logs the user out<br>&nbsp;&nbsp;&nbsp;&nbsp;- When user attempts to perform an action, they are redirected to login page<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message informing that the session has expired |
| Postcondition(s) | User's session is terminated. User is logged out of the system. |

### Edit Profile

| Use Case Name | Edit Profile |
|---------------|--------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to update their personal information and account settings. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the profile or settings page.<br>2. System displays the current profile information.<br>3. User modifies desired information (name, email, password, profile picture, etc.).<br>4. User submits the changes.<br>5. System validates the modified information.<br>6. System updates the user's profile.<br>7. System displays a success message. |
| Alternative Flow | 5a. If validation fails, display appropriate error messages:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Email already in use by another account<br>&nbsp;&nbsp;&nbsp;&nbsp;- Password does not meet requirements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Image file too large or invalid format<br>5b. User corrects information and resubmits. |
| Postcondition(s) | User's profile information is updated in the system. |

### Toggle Dark Mode

| Use Case Name | Toggle Dark Mode |
|---------------|------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to switch between light and dark UI themes based on preference. |
| Priority | Low |
| Precondition(s) | User must be using the application (login not strictly required). |
| Main Flow | 1. User locates the dark mode toggle button/switch (typically in header or settings).<br>2. User clicks the toggle button.<br>3. System immediately switches the UI theme.<br>4. System saves the preference for future sessions. |
| Alternative Flow | 3a. System detects user's device preference:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Automatically applies dark/light mode based on system settings<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can still manually override this preference |
| Postcondition(s) | UI theme is changed according to user preference. Preference is saved for future sessions. |

*Note: More use case specifications for other functional areas will be added progressively.*