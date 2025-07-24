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
   - [Browse Workouts](#browse-workouts)
   - [View Workout Details](#view-workout-details)
   - [Save Favorite Workouts](#save-favorite-workouts)
   - [Filter Exercises](#filter-exercises)
3. [Workout Sessions](#workout-sessions)
   - [Start Workout Session](#start-workout-session)
   - [Record Exercise Performance](#record-exercise-performance)
   - [Complete Workout Session](#complete-workout-session)
   - [View Workout History](#view-workout-history)
   - [View Workout Summary](#view-workout-summary)
   - [Provide Workout Feedback](#provide-workout-feedback)
4. [Exercise and Equipment Management](#exercise-and-equipment-management)
   - [Browse Exercises](#browse-exercises)
   - [View Exercise Details](#view-exercise-details)
   - [Filter Exercises](#filter-exercises-1)
   - [Browse Equipment](#browse-equipment)
   - [View Equipment Details](#view-equipment-details)
   - [Filter Equipment](#filter-equipment)
5. [Real-time Detection](#real-time-detection)
   - [Start Exercise Detection Session](#start-exercise-detection-session)
   - [Choose Exercise](#choose-exercise)
   - [Monitor Exercise Form and Performance](#monitor-exercise-form-and-performance)
   - [Choose Detection Method](#choose-detection-method)
   - [Upload Exercise Video](#upload-exercise-video)
   - [Use Live Camera](#use-live-camera)
   - [Change Metrics Layout](#change-metrics-layout)
6. [Progress Tracking](#progress-tracking)
   - [View Progress Dashboard](#view-progress-dashboard)
   - [Set Fitness Goals](#set-fitness-goals)
   - [Track Weight Changes](#track-weight-changes)
   - [Generate Progress Reports](#generate-progress-reports)
   - [Filter Progress by Time](#filter-progress-by-time)
7. [Achievements](#achievements)
   - [View Achievements](#view-achievements)
   - [Filter Achievements by Tier](#filter-achievements-by-tier)
   - [Filter Achievements by Type](#filter-achievements-by-type)
   - [View Completion Rate](#view-completion-rate)
8. [Admin Functions](#admin-functions)
   - [Perform AI Testing](#perform-ai-testing)

## User Management

### Register Account

| Use Case Name | Register Account |
|---------------|------------------|
| Actor(s) | Regular User |
| Description | Allows new users to create an account on the OKGYM platform. |
| Priority | High |
| Precondition(s) | User must not have an existing account with the same email. |
| Main Flow | 1. User navigates to the registration page.<br>2. User provides required information (name, email, password, etc.).<br>3. User submits the registration form.<br>4. System validates the information.<br>5. System creates a new user account.<br>6. System redirects the user to the login page. |
| Alternative Flow | 4a. If validation fails, display appropriate error messages:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Email already registered<br>&nbsp;&nbsp;&nbsp;&nbsp;- Password does not meet requirements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Required fields missing<br>4b. User corrects information and resubmits. |
| Postcondition(s) | A new user account is created in the system. |

### Login

| Use Case Name | Login |
|---------------|-------|
| Actor(s) | Regular User, Admin |
| Description | Allows registered users to authenticate and access their account. |
| Priority | High |
| Precondition(s) | User must have a registered account. |
| Main Flow | 1. User navigates to the login page.<br>2. User enters email and password.<br>3. User submits the login form.<br>4. System authenticates the credentials.<br>5. System redirects the user to the dashboard. |
| Alternative Flow | 4a. If authentication fails, display error message:<br>&nbsp;&nbsp;&nbsp;&nbsp;- "Incorrect email or password"<br>4b. User can retry or request password reset. |
| Postcondition(s) | User is authenticated and granted access to their account. Session is created. |

### Logout

| Use Case Name | Logout |
|---------------|--------|
| Actor(s) | Regular User, Admin |
| Description | Allows authenticated users to securely sign out of their account. |
| Priority | Medium |
| Precondition(s) | User must be currently logged in. |
| Main Flow | 1. User clicks the logout button/link.<br>2. System terminates the user's session.<br>3. System redirects the user to the login page. |
| Alternative Flow | 1a. Session expires due to inactivity:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System automatically logs the user out<br>&nbsp;&nbsp;&nbsp;&nbsp;- When user attempts to perform an action, they are redirected to login page<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message informing that the session has expired |
| Postcondition(s) | User's session is terminated. User is logged out of the system. |

### Edit Profile

| Use Case Name | Edit Profile |
|---------------|--------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to update their personal information and account settings. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the profile or settings page.<br>2. System displays the current profile information.<br>3. User modifies personal information (name, date of birth, fitness goals, preferences, etc.).<br>4. User submits the changes.<br>5. System validates the modified information.<br>6. System updates the user's profile.<br>7. System displays a success message. |
| Alternative Flow | 5a. If validation fails, display appropriate error messages:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Required fields missing<br>&nbsp;&nbsp;&nbsp;&nbsp;- Invalid data format<br>5b. User corrects information and resubmits. |
| Postcondition(s) | User's profile information is updated in the system. Email and password remain unchanged. |

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

## Workout Management

### Browse Workouts

| Use Case Name | Browse Workouts |
|---------------|-----------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view and browse available workout plans with video preview functionality. |
| Priority | High |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the workout plans section.<br>2. System retrieves and displays a list of available workout plans.<br>3. User scrolls through the list of workouts.<br>4. User can hover over workout items to view a video preview.<br>5. System implements pagination to load more workouts when user reaches the end of the current page. |
| Alternative Flow | 2a. If no workouts are available:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating no workouts are available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may suggest creating a workout plan or contacting support<br>2b. If system fails to retrieve workout plans:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry loading workouts<br>4a. If video preview fails to load:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a placeholder image<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry loading the preview |
| Postcondition(s) | User can view a list of available workout plans with video preview functionality. |

### View Workout Details

| Use Case Name | View Workout Details |
|---------------|----------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view detailed information about a specific workout plan. |
| Priority | High |
| Precondition(s) | User must be logged in. User must have selected a workout from the browse workouts view. |
| Main Flow | 1. User selects a workout plan from the list.<br>2. System retrieves detailed information about the selected workout plan.<br>3. System displays the workout details, including name, description, difficulty level, estimated duration, exercises included, and other relevant information.<br>4. User reviews the workout details. |
| Alternative Flow | 2a. If the system fails to retrieve workout details:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to go back to workout list<br>2b. If the selected workout no longer exists:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a notification that the workout is not available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System redirects user back to workout list |
| Postcondition(s) | User views detailed information about the selected workout plan. |

### Save Favorite Workouts

| Use Case Name | Save Favorite Workouts |
|---------------|------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to mark workout plans as favorites for easy access later. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must be viewing either the workout list or a specific workout's details. |
| Main Flow | 1. User clicks on the "Favorite" or "Save" icon/button next to a workout plan.<br>2. System adds the workout to the user's favorites list.<br>3. System provides visual feedback that the workout has been added to favorites (e.g., filled heart icon).<br>4. User can access saved workouts from their favorites section. |
| Alternative Flow | 2a. If the workout is already in the user's favorites:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System removes the workout from favorites<br>&nbsp;&nbsp;&nbsp;&nbsp;- System updates the visual indicator (e.g., unfilled heart icon)<br>2b. If the system fails to update favorites:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry the operation |
| Postcondition(s) | The workout plan is added to or removed from the user's favorites list. |

### Filter Workout Plans

| Use Case Name | Filter Workout Plans |
|---------------|------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter workout plans based on various criteria. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must be on the browse workouts screen. |
| Main Flow | 1. User selects the filter option in the workout browsing interface.<br>2. System displays available filter criteria (e.g., difficulty level, duration, muscle groups, workout type).<br>3. User selects desired filter criteria.<br>4. System applies the filters.<br>5. System displays the filtered list of workouts that match the selected criteria. |
| Alternative Flow | 4a. If no workouts match the filter criteria:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating no matching workouts<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests adjusting filter criteria<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can clear filters or select different criteria<br>5a. If too many filters are applied causing performance issues:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may suggest refining the filter selection<br>&nbsp;&nbsp;&nbsp;&nbsp;- System might limit the maximum number of concurrent filters |
| Postcondition(s) | The list of workout plans is filtered according to the user's criteria. |

## Workout Sessions

### Start Workout Session

| Use Case Name | Start Workout Session |
|---------------|------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to initiate a workout session based on a selected workout plan. |
| Priority | High |
| Precondition(s) | User must be logged in. User must have selected a workout plan. |
| Main Flow | 1. User navigates to a workout plan's details page.<br>2. User clicks the "Start Workout" button.<br>3. System creates a new workout session.<br>4. System displays the first exercise in the workout plan.<br>5. System starts tracking workout time and progress.<br>6. If the current exercise supports real-time detection, system automatically activates the real-time detection interface. |
| Alternative Flow | 3a. If the user has an incomplete workout session for the same plan:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System prompts user to resume previous session or start new one<br>&nbsp;&nbsp;&nbsp;&nbsp;- User selects desired option<br>3b. If the system fails to create a new session:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry<br>6a. If real-time detection is not supported for the current exercise:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays standard exercise interface without detection features |
| Postcondition(s) | A new workout session is created and started. User can proceed with exercises in the workout plan. |

### Record Exercise Performance

| Use Case Name | Record Exercise Performance |
|---------------|----------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to record their performance for each exercise during a workout session, with automatic recording when real-time detection is enabled. |
| Priority | High |
| Precondition(s) | User must be in an active workout session. |
| Main Flow | 1. System displays the current exercise information (name, instructions, sets, reps, etc.).<br>2. If real-time detection is enabled:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System automatically tracks and records repetitions<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides real-time form score and feedback<br>&nbsp;&nbsp;&nbsp;&nbsp;- System automatically saves performance data<br>3. If real-time detection is not enabled:<br>&nbsp;&nbsp;&nbsp;&nbsp;- User performs the exercise<br>&nbsp;&nbsp;&nbsp;&nbsp;- User manually enters performance data (sets completed, reps achieved, weight used, etc.)<br>4. User marks the exercise as completed.<br>5. System saves the performance data.<br>6. System displays a rest timer after logging a set.<br>7. System displays the next exercise in the sequence after rest timer completes or user proceeds. |
| Alternative Flow | 3a. If user selects next or previous exercise:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System navigates to the selected exercise without confirmation<br>&nbsp;&nbsp;&nbsp;&nbsp;- Current progress for the exercise is automatically saved<br>3b. If user pauses workout:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System pauses the workout session and rest timer<br>&nbsp;&nbsp;&nbsp;&nbsp;- No confirmation prompt is displayed<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can resume the workout when ready<br>5a. If system fails to save performance data:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry saving |
| Postcondition(s) | User's exercise performance is recorded in the system. Progress in the workout session is updated. |

### Complete Workout Session

| Use Case Name | Complete Workout Session |
|---------------|--------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to finalize and save a workout session after completing all exercises. |
| Priority | High |
| Precondition(s) | User must be in an active workout session. |
| Main Flow | 1. User completes all exercises in the workout.<br>2. System notifies user that all exercises are complete.<br>3. User clicks the "Complete" button.<br>4. System calculates workout statistics (duration, exercises completed, calories burned estimate, etc.).<br>5. System marks the workout session as completed.<br>6. System saves the workout session to user's history.<br>7. System automatically navigates to the workout summary screen. |
| Alternative Flow | 5a. If system fails to save the workout session:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry saving<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may store session data locally until successful save |
| Postcondition(s) | Workout session is marked as completed. Session data is saved to user's workout history. User is shown the workout summary. |

### View Workout History

| Use Case Name | View Workout History |
|---------------|----------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view their past workout sessions and performance history. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must have completed at least one workout session. |
| Main Flow | 1. User navigates to the workout history section.<br>2. System retrieves user's past workout sessions.<br>3. System displays a list of completed workout sessions, showing only:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Workout plan name<br>&nbsp;&nbsp;&nbsp;&nbsp;- Date<br>&nbsp;&nbsp;&nbsp;&nbsp;- Completed tag<br>&nbsp;&nbsp;&nbsp;&nbsp;- Duration<br>&nbsp;&nbsp;&nbsp;&nbsp;- Calories burned<br>4. User can view the list of workout history (view only, no interaction). |
| Alternative Flow | 2a. If no workout history exists:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating no workout history is available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may suggest starting a workout<br>2b. If system fails to retrieve workout history:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry loading history |
| Postcondition(s) | User can view their workout history in read-only mode. |

### View Workout Summary

| Use Case Name | View Workout Summary |
|---------------|----------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view detailed information about completed workout sessions. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must have completed at least one workout session. |
| Main Flow | 1. System displays the most recent workout summary by default.<br>2. System shows comprehensive workout summary, including:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Date and time<br>&nbsp;&nbsp;&nbsp;&nbsp;- Duration<br>&nbsp;&nbsp;&nbsp;&nbsp;- Calories burned<br>&nbsp;&nbsp;&nbsp;&nbsp;- Muscle groups worked<br>&nbsp;&nbsp;&nbsp;&nbsp;- Focus areas<br>&nbsp;&nbsp;&nbsp;&nbsp;- Performance statistics<br>3. User can navigate between workout summaries using pagination arrows.<br>4. Each summary occupies one full page, with newest summaries displayed first. |
| Alternative Flow | 1a. If system fails to retrieve session details:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry<br>3a. If user reaches the beginning or end of history:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System disables the corresponding pagination arrow |
| Postcondition(s) | User views detailed summary of workout sessions with ability to navigate through history. |

### Provide Workout Feedback

| Use Case Name | Provide Workout Feedback |
|---------------|--------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to provide simple emotional feedback on completed workout sessions. |
| Priority | Low |
| Precondition(s) | User must be logged in. User must have completed a workout session and be viewing the workout summary. |
| Main Flow | 1. While viewing a workout summary, system displays feedback options.<br>2. System presents simple emotional feedback options:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Smile face (positive feedback)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Sad face (negative feedback)<br>3. User selects the appropriate emotional reaction.<br>4. System saves the feedback with the workout session record.<br>5. System confirms successful submission with a visual confirmation. |
| Alternative Flow | 4a. If the user has already provided feedback for this session:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System updates the existing feedback record<br>4b. If system fails to save feedback:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry submission |
| Postcondition(s) | User's emotional feedback is recorded and associated with the workout session. |

## Exercise and Equipment Management

### Browse Exercises

| Use Case Name | Browse Exercises |
|---------------|------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view and browse the library of available exercises with video preview functionality. |
| Priority | High |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the exercises section.<br>2. System retrieves and displays a list of available exercises.<br>3. System organizes exercises by categories (e.g., muscle groups, equipment required, difficulty).<br>4. User scrolls through the exercise library.<br>5. User can hover over exercise items to view a video preview.<br>6. System loads more exercises if the user reaches the end of the initially loaded list. |
| Alternative Flow | 2a. If no exercises are available:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating no exercises are available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may display recommended actions for administrators<br>2b. If system fails to retrieve exercises:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry loading exercises<br>5a. If video preview fails to load:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a placeholder image<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry loading the preview |
| Postcondition(s) | User can view a list of available exercises in the system's library with video preview functionality. |

### View Exercise Details

| Use Case Name | View Exercise Details |
|---------------|------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view detailed information about a specific exercise. |
| Priority | High |
| Precondition(s) | User must be logged in. User must have selected an exercise from the browse exercises view. |
| Main Flow | 1. User selects an exercise from the list.<br>2. System retrieves detailed information about the selected exercise.<br>3. System displays the exercise details, including:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Name and description<br>&nbsp;&nbsp;&nbsp;&nbsp;- Muscle groups targeted<br>&nbsp;&nbsp;&nbsp;&nbsp;- Proper form instructions<br>&nbsp;&nbsp;&nbsp;&nbsp;- Difficulty level<br>&nbsp;&nbsp;&nbsp;&nbsp;- Equipment required (if any)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Demonstration images or videos (if available)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Variations and modifications<br>4. User reviews the exercise details. |
| Alternative Flow | 2a. If the system fails to retrieve exercise details:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to go back to exercise list<br>2b. If the selected exercise no longer exists:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a notification that the exercise is not available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System redirects user back to exercise list |
| Postcondition(s) | User views detailed information about the selected exercise. |

### Filter Exercises

| Use Case Name | Filter Exercises |
|---------------|------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter exercises based on various criteria. |
| Priority | Medium |
| Precondition(s) | User must be logged in and viewing the exercise library. |
| Main Flow | 1. User selects filter options from available criteria:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Exercise type (strength, cardio, flexibility, etc.)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Target muscle groups<br>&nbsp;&nbsp;&nbsp;&nbsp;- Difficulty level<br>&nbsp;&nbsp;&nbsp;&nbsp;- Equipment required<br>&nbsp;&nbsp;&nbsp;&nbsp;- Duration<br>2. System applies selected filters.<br>3. System displays filtered exercise results.<br>4. User can refine or clear filters as needed. |
| Alternative Flow | 3a. If no exercises match the filter criteria:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays "No matching exercises found"<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests adjusting filter criteria<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can clear filters or select different options |
| Postcondition(s) | Exercise library is filtered to show items matching user's criteria. |

### Browse Equipment

| Use Case Name | Browse Equipment |
|---------------|-----------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to browse the equipment database with filtering options. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the Equipment section.<br>2. System displays categorized list of available equipment.<br>3. User can browse equipment by category (cardio, strength, flexibility, etc.).<br>4. User can search for specific equipment using keywords.<br>5. User can hover over equipment items to view a video preview.<br>6. User can click on a specific piece of equipment to view detailed information. |
| Alternative Flow | 4a. If search yields no results:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays "No matching equipment found"<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests related equipment or search terms |
| Postcondition(s) | User can browse and find equipment in the database. |

### View Equipment Details

| Use Case Name | View Equipment Details |
|---------------|------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view detailed information about a specific piece of equipment and find related exercises. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must have selected a specific equipment item. |
| Main Flow | 1. User selects a specific piece of equipment from the list.<br>2. System displays detailed information including:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Equipment name and image/video<br>&nbsp;&nbsp;&nbsp;&nbsp;- Description and specifications<br>&nbsp;&nbsp;&nbsp;&nbsp;- Proper usage instructions with visual guides<br>&nbsp;&nbsp;&nbsp;&nbsp;- Safety considerations<br>&nbsp;&nbsp;&nbsp;&nbsp;- Targeted muscle groups<br>&nbsp;&nbsp;&nbsp;&nbsp;- List of relevant exercises that use this equipment<br>3. User can select related exercises to view their details.<br>4. User can watch demonstration videos showing proper equipment usage. |
| Alternative Flow | 2a. If equipment details are incomplete:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays available information<br>&nbsp;&nbsp;&nbsp;&nbsp;- System indicates which details are pending/unavailable<br>3a. If no related exercises exist:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays message indicating no exercises found<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may suggest adding custom exercises |
| Postcondition(s) | User views comprehensive information about equipment and can access related exercises. |

### Filter Equipment

| Use Case Name | Filter Equipment |
|---------------|-----------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter the equipment database based on various criteria. |
| Priority | Medium |
| Precondition(s) | User must be logged in and viewing the equipment database. |
| Main Flow | 1. User selects filter options from available criteria:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Equipment type (machines, free weights, etc.)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Target muscle groups<br>&nbsp;&nbsp;&nbsp;&nbsp;- Difficulty level<br>&nbsp;&nbsp;&nbsp;&nbsp;- Space requirements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Specialized features<br>2. System applies selected filters.<br>3. System displays filtered equipment results.<br>4. User can refine or clear filters as needed. |
| Alternative Flow | 3a. If no equipment matches the filter criteria:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays "No matching equipment found"<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests adjusting filter criteria<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can clear filters or select different options |
| Postcondition(s) | Equipment database is filtered to show items matching user's criteria. |

## Real-time Detection

### Start Exercise Detection Session

| Use Case Name | Start Exercise Detection Session |
|---------------|----------------------------------|
| Actor(s) | Regular User |
| Description | Allows users to start a real-time exercise detection session using their device camera to monitor form and count repetitions. |
| Priority | High |
| Precondition(s) | User must be logged in. User must grant camera permissions if using live camera method. |
| Main Flow | 1. User navigates to the Exercise Detection feature.<br>2. User selects exercise(s) to detect from a list or search.<br>3. User chooses detection method (live camera or uploaded video).<br>4. If using live camera, user positions themselves in front of the camera following on-screen guidance.<br>5. User initiates the detection session by pressing "Start".<br>6. System activates selected detection method and begins real-time analysis:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Skeletal tracking overlaid on user's video feed<br>&nbsp;&nbsp;&nbsp;&nbsp;- Exercise identification<br>&nbsp;&nbsp;&nbsp;&nbsp;- Repetition counting<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form analysis |
| Alternative Flow | 3a. If camera permissions are denied when choosing live camera:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays instructions for enabling camera permissions<br>&nbsp;&nbsp;&nbsp;&nbsp;- User must grant permissions to proceed<br>4a. If user is not properly positioned:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides positioning feedback<br>&nbsp;&nbsp;&nbsp;&nbsp;- Detection does not start until proper positioning is achieved<br>5a. If device lacks required processing capabilities:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System notifies user of limitations<br>&nbsp;&nbsp;&nbsp;&nbsp;- Offers reduced functionality mode or alternative options |
| Postcondition(s) | Real-time exercise detection session is active and providing feedback to the user. |

### Choose Exercise

| Use Case Name | Choose Exercise |
|---------------|-----------------|
| Actor(s) | Regular User |
| Description | Allows users to select which exercise they want to perform during real-time detection from a predefined list. |
| Priority | High |
| Precondition(s) | User must be logged in and initiating an exercise detection session. |
| Main Flow | 1. System displays a dropdown list of exercises compatible with real-time detection.<br>2. User selects the desired exercise from the dropdown list.<br>3. System loads the selected exercise's form model and detection parameters.<br>4. System updates the interface to show instructions specific to the selected exercise. |
| Alternative Flow | 1a. If no compatible exercises are available:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating no supported exercises<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may suggest updating the application or checking system requirements<br>2a. If user selects an exercise during an active detection session:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System confirms exercise change<br>&nbsp;&nbsp;&nbsp;&nbsp;- System resets counters and metrics<br>&nbsp;&nbsp;&nbsp;&nbsp;- System transitions to the new exercise detection |
| Postcondition(s) | Selected exercise is loaded for real-time detection and analysis. |

### Monitor Exercise Form and Performance

| Use Case Name | Monitor Exercise Form and Performance |
|---------------|--------------------------------------|
| Actor(s) | Regular User |
| Description | Provides comprehensive real-time monitoring and feedback on exercise form and performance metrics during detection sessions, including form analysis, correction feedback, and statistics. |
| Priority | High |
| Precondition(s) | User must be in an active exercise detection session. |
| Main Flow | 1. During detection session, system continuously analyzes user's form and performance.<br>2. System displays real-time metrics including:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Repetition count<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form quality score (0-100)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Current stage of exercise (e.g., setup, execution, completion)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Joint angles and alignment metrics<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form check indicators (✓ or ✗ for each key point)<br>3. System compares user's movement patterns against ideal form models.<br>4. When form issues are detected, system provides immediate feedback:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Visual cues highlighting problematic body positions<br>&nbsp;&nbsp;&nbsp;&nbsp;- Audio guidance for corrections<br>&nbsp;&nbsp;&nbsp;&nbsp;- Text instructions displayed on screen<br>5. System tracks performance metrics and form quality over time.<br>6. User can view real-time statistics and form feedback on the screen.<br>7. After session completion, system automatically saves the analysis to the workout summary. |
| Alternative Flow | 4a. If multiple form issues are detected simultaneously:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System prioritizes most critical safety issues<br>&nbsp;&nbsp;&nbsp;&nbsp;- Presents one correction at a time to avoid overwhelming user<br>4b. If user repeatedly shows same form issue:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides more detailed explanation<br>&nbsp;&nbsp;&nbsp;&nbsp;- Offers alternative exercise variations that might be more suitable<br>6a. If user continues with incorrect form despite feedback:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System increases prominence of feedback<br>&nbsp;&nbsp;&nbsp;&nbsp;- May suggest pausing the exercise for tutorial review<br>7a. If system fails to save analysis:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- Provides option to retry saving or continue without saving |
| Postcondition(s) | User receives real-time feedback on exercise form and performance metrics. Analysis is saved to workout summary for later review. |

### Choose Detection Method

| Use Case Name | Choose Detection Method |
|---------------|-------------------------|
| Actor(s) | Regular User |
| Description | Allows users to select between live camera detection or uploaded video analysis for exercise form detection. |
| Priority | High |
| Precondition(s) | User must be logged in and initiating an exercise detection session. |
| Main Flow | 1. User navigates to the exercise detection feature.<br>2. System presents detection method options:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Live camera (real-time analysis)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Upload video (analyze pre-recorded exercise)<br>3. User selects preferred detection method.<br>4. System configures the detection environment based on the selected method.<br>5. If live camera selected, system activates live camera feature.<br>6. If upload video selected, system activates upload video feature. |
| Alternative Flow | 4a. If selected method is not available due to device limitations:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System notifies user about limitations<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests using alternate detection method |
| Postcondition(s) | The selected detection method (live camera or upload video) is activated for exercise analysis. |

### Upload Exercise Video

| Use Case Name | Upload Exercise Video |
|---------------|----------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to upload videos of themselves performing exercises for form analysis. |
| Priority | Medium |
| Precondition(s) | User must be logged in. User must have selected video as detection method. |
| Main Flow | 1. User selects the exercise they performed from a dropdown list.<br>2. User selects a video file from their device or records directly using the device camera.<br>3. User provides additional information (notes, specific concerns about form, etc.).<br>4. User submits the video for upload.<br>5. System validates the video format and size.<br>6. System uploads the video and associates it with the user and selected exercise.<br>7. System initiates form analysis processing on the uploaded video.<br>8. System displays form feedback and exercise statistics based on analysis. |
| Alternative Flow | 5a. If video validation fails (wrong format, too large, etc.):<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays appropriate error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests how to fix the issue (compress video, use different format, etc.)<br>&nbsp;&nbsp;&nbsp;&nbsp;- User adjusts the video and tries again<br>6a. If upload fails due to network or server issues:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays an error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry the upload<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may save the upload attempt for later retry |
| Postcondition(s) | Exercise video is uploaded, analyzed, and user receives feedback on their form and performance metrics. |

### Use Live Camera

| Use Case Name | Use Live Camera |
|---------------|----------------|
| Actor(s) | Regular User |
| Description | Allows users to use their device camera for real-time exercise form detection and analysis. |
| Priority | High |
| Precondition(s) | User must be logged in. User must have selected live camera as detection method. Camera permissions must be granted. |
| Main Flow | 1. System activates device camera and displays live video feed.<br>2. System guides user on proper positioning and distance from camera.<br>3. User positions themselves following the on-screen guidance.<br>4. System confirms when user is properly positioned.<br>5. User begins performing the selected exercise.<br>6. System performs real-time analysis of user's form and movement.<br>7. System provides immediate feedback and counts repetitions.<br>8. System displays real-time exercise statistics during the session. |
| Alternative Flow | 1a. If camera permissions are denied:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays instructions for enabling camera permissions<br>&nbsp;&nbsp;&nbsp;&nbsp;- User must grant permissions to proceed<br>3a. If user cannot be properly detected:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides troubleshooting tips (better lighting, different position, etc.)<br>&nbsp;&nbsp;&nbsp;&nbsp;- User adjusts environment and positioning<br>5a. If system loses tracking during exercise:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides guidance to regain proper positioning<br>&nbsp;&nbsp;&nbsp;&nbsp;- Detection resumes when user is properly tracked again |
| Postcondition(s) | Live camera detection is active, providing real-time form feedback and exercise statistics. |

### Change Metrics Layout

| Use Case Name | Change Metrics Layout |
|---------------|----------------------|
| Actor(s) | Regular User |
| Description | Allows users to switch between landscape and vertical layouts for exercise metrics to optimize viewing on different devices. |
| Priority | Low |
| Precondition(s) | User must be logged in and in an active exercise detection session. |
| Main Flow | 1. During an exercise detection session, user selects layout toggle option.<br>2. System presents layout options:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Landscape (optimized for web/desktop)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Vertical (optimized for mobile)<br>3. User selects preferred layout.<br>4. System immediately reorganizes the exercise metrics display according to the selected layout.<br>5. System remembers user's layout preference for future sessions. |
| Alternative Flow | 4a. If layout change fails:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System maintains current layout<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can try again or continue with current layout<br>5a. If device orientation changes:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System automatically adapts layout to new orientation<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can override automatic adjustment with manual selection |
| Postcondition(s) | Exercise metrics are displayed in the user's preferred layout format for optimal viewing experience. |

## Progress Tracking

### View Progress Dashboard

| Use Case Name | View Progress Dashboard |
|---------------|-------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view a comprehensive dashboard of their fitness progress over time. |
| Priority | High |
| Precondition(s) | User must be logged in and have workout data recorded. |
| Main Flow | 1. User navigates to the Progress Dashboard section.<br>2. System retrieves user's historical workout and progress data.<br>3. System generates and displays various progress metrics including:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Workout frequency and consistency<br>&nbsp;&nbsp;&nbsp;&nbsp;- Exercise performance trends<br>&nbsp;&nbsp;&nbsp;&nbsp;- Weight/resistance progression<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form improvement metrics<br>&nbsp;&nbsp;&nbsp;&nbsp;- Achievement badges and milestones<br>4. User can interact with charts and graphs to view different time periods and metrics. |
| Alternative Flow | 2a. If user has insufficient data:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a message indicating not enough workout data<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides suggestions for recording more workouts<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may show sample data to demonstrate functionality<br>3a. If certain metrics cannot be calculated:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays available metrics only<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides explanation for missing metrics |
| Postcondition(s) | User views their comprehensive fitness progress data in an interactive dashboard. |

### Set Fitness Goals

| Use Case Name | Set Fitness Goals |
|---------------|-------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to set specific, measurable fitness goals to track their progress against. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the Goals section.<br>2. System displays current goals if any exist.<br>3. User selects "Add New Goal" option.<br>4. System presents different goal types (strength, endurance, form, frequency, etc.).<br>5. User selects goal type and specifies parameters (target value, deadline, etc.).<br>6. System validates the goal for reasonability based on user's history.<br>7. User confirms and saves the goal.<br>8. System adds the goal to user's profile and begins tracking progress. |
| Alternative Flow | 6a. If goal seems unrealistic:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a warning message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests more reasonable parameters based on user history<br>&nbsp;&nbsp;&nbsp;&nbsp;- User can override and proceed or adjust parameters<br>7a. If user wants to edit an existing goal:<br>&nbsp;&nbsp;&nbsp;&nbsp;- User selects the goal from the list<br>&nbsp;&nbsp;&nbsp;&nbsp;- System allows modification of parameters<br>&nbsp;&nbsp;&nbsp;&nbsp;- System validates and saves the updated goal |
| Postcondition(s) | User's fitness goals are set and visible in their profile and progress dashboard. |

### Track Weight Changes

| Use Case Name | Track Weight Changes |
|---------------|---------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to track their weight changes over time to monitor progress toward weight-related goals. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the Body Metrics section.<br>2. System displays current weight data and historical trend.<br>3. User selects "Add Weight Entry" option.<br>4. System displays a form to enter new weight data.<br>5. User enters their current weight and date (defaults to current date).<br>6. User submits the weight entry.<br>7. System validates and saves the entry.<br>8. System updates the weight history chart to show progress over time. |
| Alternative Flow | 4a. If user enters unlikely weight value (extreme change):<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a warning message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System asks for confirmation before proceeding<br>7a. If system fails to save entry:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays error message<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides option to retry saving |
| Postcondition(s) | User's weight data is recorded and displayed on progress charts showing weight loss/gain over time. |

### Generate Progress Reports

| Use Case Name | Generate Progress Reports |
|---------------|---------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to generate detailed reports of their fitness progress over specified time periods. |
| Priority | Low |
| Precondition(s) | User must be logged in and have workout data recorded. |
| Main Flow | 1. User navigates to the Reports section.<br>2. User selects report type (comprehensive, exercise-specific, goal-focused, etc.).<br>3. User specifies time period (last month, custom date range, etc.).<br>4. System generates a detailed report with relevant metrics, charts, and analysis.<br>5. System displays the report with options to print, save as PDF, or share.<br>6. User views the report and can navigate between different sections. |
| Alternative Flow | 2a. If certain report types are unavailable due to insufficient data:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System indicates which reports are available<br>&nbsp;&nbsp;&nbsp;&nbsp;- System explains data requirements for unavailable reports<br>4a. If report generation takes longer than expected:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays a progress indicator<br>&nbsp;&nbsp;&nbsp;&nbsp;- System offers to notify user when report is ready |
| Postcondition(s) | User receives a detailed progress report for the specified time period and type. |

### Filter Progress by Time

| Use Case Name | Filter Progress by Time |
|---------------|-------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter progress data by predefined time periods. |
| Priority | Medium |
| Precondition(s) | User must be logged in and viewing progress data. |
| Main Flow | 1. While viewing progress dashboard, user selects time filter option.<br>2. System presents time filter options:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Last week<br>&nbsp;&nbsp;&nbsp;&nbsp;- Last month<br>&nbsp;&nbsp;&nbsp;&nbsp;- Last year<br>&nbsp;&nbsp;&nbsp;&nbsp;- All time<br>3. User selects desired time period.<br>4. System applies the selected time filter to all progress metrics and charts.<br>5. System updates the progress visualization to show data only for the selected time period. |
| Alternative Flow | 4a. If no data exists for selected time period:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays message indicating no data for selected period<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests selecting a different time range |
| Postcondition(s) | Progress data is filtered to show only information from the selected time period. |

## Achievements

### View Achievements

| Use Case Name | View Achievements |
|---------------|-------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view their earned achievements and progress on gamification quests. |
| Priority | Medium |
| Precondition(s) | User must be logged in. |
| Main Flow | 1. User navigates to the Achievements section.<br>2. System retrieves and displays user's achievements data.<br>3. System shows:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Total number of achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Number of unlocked achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Overall completion rate percentage<br>4. System displays a grid of achievement badges with unlocked achievements highlighted.<br>5. User can click on individual achievements to view details and requirements. |
| Alternative Flow | 2a. If user has no achievements:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays introductory message about achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests activities to earn first achievements<br>5a. If achievement details contain spoilers for future tasks:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System may hide specific requirements for certain achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides hints rather than explicit instructions |
| Postcondition(s) | User views their current achievements and progress toward completion. |

### Filter Achievements by Tier

| Use Case Name | Filter Achievements by Tier |
|---------------|----------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter achievements based on difficulty tiers from Bronze to Master. |
| Priority | Low |
| Precondition(s) | User must be logged in and viewing the Achievements section. |
| Main Flow | 1. While viewing achievements, user selects tier filter option.<br>2. System displays tier filter categories:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Bronze (beginner level)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Silver (intermediate level)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Gold (advanced level)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Platinum (expert level)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Master (highest level)<br>3. User selects one or more tier categories.<br>4. System filters achievement display to show only achievements from selected tiers.<br>5. System displays completion rate for selected tier(s). |
| Alternative Flow | 4a. If no achievements exist in selected tier(s):<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays message indicating no achievements in selected tier(s)<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests selecting different tiers<br>5a. If user wants to clear filters:<br>&nbsp;&nbsp;&nbsp;&nbsp;- User selects "Show All" option<br>&nbsp;&nbsp;&nbsp;&nbsp;- System resets filters and displays all achievements |
| Postcondition(s) | Achievements are filtered to show only those in the selected tier categories. |

### Filter Achievements by Type

| Use Case Name | Filter Achievements by Type |
|---------------|----------------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to filter achievements based on different activity or challenge types. |
| Priority | Low |
| Precondition(s) | User must be logged in and viewing the Achievements section. |
| Main Flow | 1. While viewing achievements, user selects type filter option.<br>2. System displays achievement type categories:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Workout completion achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form mastery achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Consistency achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Milestone achievements<br>&nbsp;&nbsp;&nbsp;&nbsp;- Special event achievements<br>3. User selects one or more type categories.<br>4. System filters achievement display to show only achievements of selected types.<br>5. System displays completion rate for selected type(s). |
| Alternative Flow | 4a. If no achievements exist in selected type(s):<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays message indicating no achievements of selected type(s)<br>&nbsp;&nbsp;&nbsp;&nbsp;- System suggests selecting different types<br>5a. If user wants to clear filters:<br>&nbsp;&nbsp;&nbsp;&nbsp;- User selects "Show All" option<br>&nbsp;&nbsp;&nbsp;&nbsp;- System resets filters and displays all achievements |
| Postcondition(s) | Achievements are filtered to show only those of the selected type categories. |

### View Completion Rate

| Use Case Name | View Completion Rate |
|---------------|----------------------|
| Actor(s) | Regular User, Admin |
| Description | Allows users to view their overall achievement completion rate and specific category completion statistics. |
| Priority | Low |
| Precondition(s) | User must be logged in and viewing the Achievements section. |
| Main Flow | 1. System automatically calculates and displays overall achievement completion rate.<br>2. Completion rate is presented as:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Percentage of total achievements unlocked<br>&nbsp;&nbsp;&nbsp;&nbsp;- Visual progress bar<br>&nbsp;&nbsp;&nbsp;&nbsp;- Numeric representation (e.g., "27/50 Achievements")<br>3. System displays completion rates for each tier and type category.<br>4. User can see their ranking or percentile compared to other users (if enabled). |
| Alternative Flow | 1a. If user has no achievements:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays 0% completion rate<br>&nbsp;&nbsp;&nbsp;&nbsp;- System provides encouraging message to start earning achievements<br>4a. If comparison features are disabled:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System only shows personal completion rate<br>&nbsp;&nbsp;&nbsp;&nbsp;- No comparative statistics are displayed |
| Postcondition(s) | User views their achievement completion rate and progress statistics. |

## Admin Functions

### Perform AI Testing

| Use Case Name | Perform AI Testing |
|---------------|-------------------|
| Actor(s) | Admin |
| Description | Allows administrators to test and debug the AI exercise detection system with enhanced diagnostic capabilities. |
| Priority | High |
| Precondition(s) | User must be logged in with admin privileges. |
| Main Flow | 1. Admin navigates to the AI Testing section.<br>2. System displays testing options:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Live camera testing<br>&nbsp;&nbsp;&nbsp;&nbsp;- Video upload testing<br>&nbsp;&nbsp;&nbsp;&nbsp;- Various exercise selection<br>3. Admin selects desired testing method and exercise.<br>4. System activates enhanced debugging interface showing:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Joint detection confidence scores<br>&nbsp;&nbsp;&nbsp;&nbsp;- Frame-by-frame processing metrics<br>&nbsp;&nbsp;&nbsp;&nbsp;- Form analysis details<br>&nbsp;&nbsp;&nbsp;&nbsp;- Detection accuracy statistics<br>&nbsp;&nbsp;&nbsp;&nbsp;- System resource utilization<br>5. Admin can adjust detection parameters in real-time.<br>6. System displays immediate changes in detection behavior based on parameter adjustments. |
| Alternative Flow | 2a. If testing environment fails to initialize:<br>&nbsp;&nbsp;&nbsp;&nbsp;- System displays detailed error information<br>&nbsp;&nbsp;&nbsp;&nbsp;- System logs diagnostic data for troubleshooting<br>3a. For video upload testing:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Admin selects or uploads test video file<br>&nbsp;&nbsp;&nbsp;&nbsp;- System processes video with debugging overlay<br>&nbsp;&nbsp;&nbsp;&nbsp;- Admin can pause, rewind, or step through frames |
| Postcondition(s) | Admin can thoroughly test AI detection capabilities with enhanced diagnostic information to identify and resolve issues. |

*Note: More use case specifications for other functional areas will be added progressively.* 