# OKGYM System Architecture

This document outlines the high-level architecture of the OKGYM fitness application, including the system design, component interactions, and data flow.

## System Overview

OKGYM is a fitness tracking application that helps users manage workouts, track progress, and receive AI-based feedback on exercise form. The system consists of:

1. **Frontend**: React-based web application
2. **Backend**: Node.js API server with TypeScript
3. **Database**: Database for storing user data, workouts, exercises, etc.
4. **AI Services**: Machine learning services for exercise form analysis

## Architecture Diagram

```
┌─────────────────┐        ┌─────────────────────────────────────────┐
│                 │        │                                         │
│    Frontend     │◄───────┤              Backend API                │
│    (React)      │        │             (Node.js/TS)                │
│                 │───────►│                                         │
└─────────────────┘        └───────────────┬─────────────────────────┘
                                          │
                                          │
                           ┌──────────────▼──────────────┐
                           │                             │
                           │         Database            │
                           │                             │
                           └─────────────┬───────────────┘
                                         │
                                         │
                           ┌─────────────▼───────────────┐
                           │                             │
                           │       AI/ML Services        │
                           │                             │
                           └─────────────────────────────┘
```

## Architectural Patterns

OKGYM follows these main architectural patterns:

1. **Model-View-Controller (MVC)** pattern in the backend
   - Models: TypeORM entities 
   - Controllers: Express route handlers
   - Views: API responses (JSON)

2. **Repository Pattern** for data access
   - Repository classes abstract database operations
   - Provides clean separation between business logic and data access

3. **Service Layer** for business logic
   - Service classes encapsulate business logic
   - Controllers delegate to services for processing requests

4. **Component-Based Architecture** in the frontend
   - Reusable UI components with specific responsibilities
   - Page components assemble smaller components

## Component Interactions

### Frontend to Backend Flow

1. User interacts with the React frontend
2. Frontend service makes API calls to the backend
3. Backend controller receives the request
4. Controller delegates to an appropriate service
5. Service performs business logic, using repositories for data access
6. Repository interacts with the database
7. Response flows back through the layers to the frontend

### Authentication Flow

```
┌─────────┐     ┌─────────────┐    ┌───────────────┐    ┌─────────────┐
│         │     │             │    │               │    │             │
│  User   │────►│  Auth UI    │───►│ AuthController│───►│ Auth Service│
│         │     │ (Frontend)  │    │  (Backend)    │    │  (Backend)  │
│         │     │             │    │               │    │             │
└─────────┘     └─────────────┘    └───────────────┘    └──────┬──────┘
                                                               │
                                                               │
                      ┌─────────────┐            ┌─────────────▼──────────┐
                      │             │            │                        │
                      │   User UI   │◄───────────┤  User Repository       │
                      │ (Frontend)  │            │      (Backend)         │
                      │             │            │                        │
                      └─────────────┘            └────────────────────────┘
```

### Workout Session Flow

```
┌─────────┐     ┌─────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│         │     │             │    │                      │    │                      │
│  User   │────►│ Session UI  │───►│ WorkoutSessionCtrl   │───►│ WorkoutSessionService│
│         │     │ (Frontend)  │    │     (Backend)        │    │      (Backend)       │
│         │     │             │    │                      │    │                      │
└─────────┘     └─────────────┘    └──────────────────────┘    └──────────┬───────────┘
                                                                          │
                                                                          │
                      ┌─────────────┐            ┌──────────────────────────────────┐
                      │             │            │                                  │
                      │ Feedback UI │◄───────────┤  WorkoutSession Repository       │
                      │ (Frontend)  │            │         (Backend)                │
                      │             │            │                                  │
                      └─────────────┘            └──────────────────────────────────┘
```

### AI Exercise Form Analysis Flow

```
┌─────────┐     ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐
│         │     │             │    │                  │    │                    │
│  User   │────►│ Video UI    │───►│ Analysis Ctrl    │───►│ ExerciseAnalyzer   │
│         │     │ (Frontend)  │    │   (Backend)      │    │    (Backend)       │
│         │     │             │    │                  │    │                    │
└─────────┘     └─────────────┘    └──────────────────┘    └────────┬───────────┘
                                                                    │
                                                                    │
                     ┌──────────────┐           ┌───────────────────▼──────────────┐
                     │              │           │                                  │
                     │ Feedback UI  │◄──────────┤        Python Service            │
                     │ (Frontend)   │           │          (Backend)               │
                     │              │           │                                  │
                     └──────────────┘           └──────────────────────────────────┘
```

## Data Flow

### Authentication Data Flow

1. User enters login credentials in the frontend
2. Frontend sends credentials to `/auth/login` endpoint
3. AuthController validates credentials
4. AuthService authenticates the user and generates JWT token
5. Token is returned to frontend and stored in local storage
6. Frontend includes token in subsequent API requests
7. Backend middleware validates token for protected routes

### Workout Session Data Flow

1. User starts a workout session in the frontend
2. Frontend sends workout plan ID to `/workout-sessions/start` endpoint
3. Backend creates a new workout session record
4. As user completes exercises, frontend sends updates to `/workout-sessions/{id}` endpoint
5. Backend updates the session record
6. When session is complete, frontend sends final data to `/workout-sessions/{id}/complete`
7. Backend processes the session data, calculates metrics, and updates user progress

### Exercise Form Analysis Data Flow

1. User starts exercise with camera enabled
2. Frontend captures video frames and sends to `/exercise-analysis/{exercise}` endpoint
3. Backend routes to specific exercise analyzer controller
4. Exercise analyzer processes frames using Python service
5. Python service performs pose detection and form analysis
6. Analysis results are returned to frontend
7. Frontend displays real-time feedback to user
8. Analysis data is saved to database for future reference

## Database Design

The database uses entities with relationships as defined in the models. Key relationships include:

- User to WorkoutSession (one-to-many)
- User to UserEquipment (one-to-many)
- WorkoutPlan to WorkoutExercise (one-to-many)
- Exercise to ExerciseCategory (many-to-many)
- User to Achievement (many-to-many)
- Exercise to Equipment (many-to-many)

See the entity models in `backend/src/models/` for detailed relationship definitions.

## Security Architecture

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on both frontend and backend
- **HTTPS**: Secure communication between client and server
- **Password Hashing**: Secure password storage with bcrypt

## Caching Strategy

- **HTTP Caching**: ETag and Cache-Control headers
- **Application Caching**: In-memory caching for frequently accessed data
- **Repository Caching**: Result caching at the repository level

## Error Handling

- **Frontend**: React error boundaries for UI error containment
- **Backend**: Centralized error handling middleware
- **Logging**: Structured logging for debugging and monitoring

## Scaling Considerations

- **Horizontal Scaling**: Backend API can be deployed across multiple nodes
- **Database Scaling**: Connection pooling and query optimization
- **Caching Layer**: Introducing Redis for distributed caching
- **Load Balancing**: Traffic distribution across backend instances 