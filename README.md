# OKGYM Project ??

![OKGYM Banner (Placeholder)](https://img.youtube.com/vi/UqYxnq5Bpk0/0.jpg)

A comprehensive fitness tracking and workout management platform, integrating a robust backend, a user-friendly frontend, and an intelligent machine learning model for exercise pose detection.

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Demo Video](#demo-video)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
- [Backend APIs](#backend-apis)
- [Machine Learning Model](#machine-learning-model)
    - [Error Detection Methodology](#error-detection-methodology)
    - [Model Training](#model-training)
    - [Evaluation Results](#evaluation-results)
- [Frontend UI Component System](#frontend-ui-component-system)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Maintenance Notes](#maintenance-notes)
- [License](#license)
- [Contact](#contact)

---

## About the Project
The OKGYM project aims to simplify fitness tracking and motivate users towards their goals by providing a full-stack solution for workout management. It includes user authentication, personalized workout plans, exercise tracking, progress visualization, and leverages a machine learning model for real-time exercise pose detection and error feedback.

## Features
- **User Management**: Registration, login, logout, and user profile management.
- **Workout Planning**: Create, view, update, and delete workout logs and customizable workout plans.
- **Exercise Tracking**: Comprehensive exercise logging with detailed statistics.
- **Progress Visualization**: Track progress with interactive charts and reports.
- **Exercise Pose Detection**: Utilizes a machine learning model to detect exercise pose and identify common errors.
- **API Endpoints**: Robust RESTful APIs for exercises, categories, equipment, and user data.
- **Responsive Design**: User-friendly interface accessible on both mobile and desktop.
- **Theming**: Supports both light and dark themes.

## Demo Video
[![Watch the demo video](https://img.youtube.com/vi/UqYxnq5Bpk0/0.jpg)](https://www.youtube.com/watch?v=UqYxnq5Bpk0)

## Getting Started

To get a local copy of OKGYM up and running, follow these simple steps.

### Prerequisites
Make sure you have the following installed on your system:
* Node.js (LTS version recommended)
* npm (comes with Node.js) or Yarn
* Git

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/kriskaiqi/OKGYM.git](https://github.com/kriskaiqi/OKGYM.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd OKGYM
    ```
3.  **Set up Backend:**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Set up environment variables:
        ```bash
        cp .env.example .env
        ```
        Then edit `.env` file with your database and other configurations.
    * Initialize database (e.g., seed users):
        ```bash
        npm run db:seed-users
        ```
    * Go back to the root directory:
        ```bash
        cd ..
        ```
4.  **Set up Frontend:**
    * Navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    * Install dependencies:
        ```bash
        npm install # or yarn install
        ```
    * Go back to the root directory:
        ```bash
        cd ..
        ```

### Running the Application
To run the OKGYM application, you will need to start both the backend and frontend servers.

1.  **Start the Backend Server** (in one terminal):
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Run the server:
        ```bash
        npm run start
        ```
    The backend should be listening on `http://localhost:5000` (or as configured in your `.env` file).

2.  **Start the Frontend Development Server** (in a *separate* terminal):
    * Navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    * Run the development server:
        ```bash
        npm start # or yarn start
        ```
    The frontend application should now be running on `http://localhost:3000` (or as configured).

## Backend APIs
The backend service provides comprehensive APIs for various functionalities.

### Main Endpoints
-   **Users**: For user management (e.g., authentication, profiles, filtering).
-   **Exercises**: For managing exercises, including listing, creating, updating, and deleting.
-   **Categories**: For managing exercise categories.
-   **Equipment**: For managing exercise equipment.
-   **Search and Filtering**: Advanced search and filtering options for exercises.
-   **Exercise Relationships**: For managing related and alternative exercises, and progressions.

For full API documentation, please refer to the Swagger documentation at `/api-docs` when the backend server is running.

### Updating Exercise Stats
To update exercise statistics with realistic data:
```bash
cd backend
npm run update:exercise-stats
```

This command generates and updates realistic stats (rating, calories, duration, completion, popularity) for all exercises in the database.

## Machine Learning Model
This section provides a brief overview of the methodology for building models for exercise pose detection.

### Error Detection Methodology
For some simple errors (for example, the feet placement error in squat), the detection method is either measuring the distance/angle between different joints during the exercise with the coordinate outputs from MediaPipe Pose.
-   **Distance Calculation**: `distance= ��((x1-x2)^2 +(y1-y2) ^2 )`
-   **Angle Calculation**: `angle_in_radian =arctan2?(y3-y2,x3-y2) -arctan2(y1-y2,x1-y2)`

### Model Training
Important landmarks are picked for each exercise using MediaPipe to extract body part positions. There are 2 methods used for model training, with the best model chosen for each exercise:
1.  **Classification with Scikit-learn**: Using Decision Tree/Random Forest (RF), K-Nearest Neighbors (KNN), C-Support Vector (SVC), Logistic Regression classifier (LR), and Stochastic Gradient Descent classifier (SGDC).
2.  **Neural Network for classification with Keras**.

### Evaluation Results
Evaluation results are available for specific errors in different exercises:
1.  Bicep Curl - *lean back error*
2.  Plank - *all errors*
3.  Basic Squat - *stage*
4.  Lunge - *knee over toe error*

For in-depth details on each exercise's model, refer to their respective READMEs:
-   [Bicep Curl](./core_ml_model/bicep_model/README.md)
-   [Plank](./core_ml_model/plank_model/README.md)
-   [Basic Squat](./core_ml_model/squat_model/README.md)
-   [Lunge](./core_ml_model/lunge_model/README.md)

## Frontend UI Component System
The OKGYM frontend includes a comprehensive set of reusable UI components that provide a consistent look and feel across the application. All components support both light and dark themes.

### Component Categories
-   **Form Components**: Button, TextField, FormControl, Select.
-   **Layout Components**: Card, Skeleton, Alert, Badge, Tabs, Dialog, Modal.
-   **Navigation Components**: Pagination.
-   **Data Visualization Components**: Chart (bar, line, pie), Progress (linear, circular).
-   **Theme Components**: ThemeToggle.

## Development Guidelines
-   **Component Organization**: Each component should have a clear, single responsibility; complex components should be broken down into smaller sub-components; shared functionality should be extracted to custom hooks.
-   **State Management**: Use React context for global state; use local component state for UI-specific state; consider using React Query for server state.
-   **Styling**: Use Material UI styled components for component-specific styling; use the theme for consistent colors, spacing, and typography; follow responsive design principles.
-   **Performance**: Memoize expensive calculations and renders; use virtualization for long lists; implement proper loading states and skeleton loaders.

## Testing
The backend includes various testing scripts:
-   **User API Testing**: The `testUserApi.ts` script tests the HTTP API endpoints for user filtering, including basic filters (role, status, search term), pagination, sorting, demographic filters (gender, activity level, fitness level), preference filters (location, exercise preferences, body areas), and combined filters. To run: `npm run test:user-api`.
-   **Repository Testing**: The `testUserFilters.ts` script tests the repository layer directly to validate database queries handle all filter criteria correctly. To run: `npm run test:user-filters`.
-   **Dry Run Testing**: For quick testing without a database connection. To run: `npm run test:dry-run`.
-   **Caching Testing**: Tests the caching functionality in the UserRepository, verifying cache hit/miss behavior, cache invalidation patterns, and filter-based caching. To run: `npm run test:caching`.
    * If you encounter any caching issues, you can run: `npm run fix:caching`.
    * More details on caching best practices can be found in the [caching documentation](src/repositories/README_CACHING_FIX.md).


## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
Kris Kaiqi - [leesweekee030507@gmail.com]
Project Link: [https://github.com/kriskaiqi/OKGYM](https://github.com/kriskaiqi/OKGYM)