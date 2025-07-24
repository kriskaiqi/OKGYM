# OKGYM Frontend

This is the frontend application for OKGYM, a fitness tracking and workout management platform.

## Directory Structure

```
frontend/
├── src/                      # Source code
━E  ├── components/           # Reusable UI components
━E  ━E  ├── auth/             # Authentication-related components
━E  ━E  ├── common/           # Shared components
━E  ━E  ├── exercise/         # Exercise-related components
━E  ━E  ├── profile/          # User profile components
━E  ━E  ├── ui/               # Basic UI elements
━E  ━E  └── workout/          # Workout-related components
━E  ━E
━E  ├── contexts/             # React contexts for state management
━E  ├── hooks/                # Custom React hooks
━E  ├── layouts/              # Page layout components
━E  ├── pages/                # Page components
━E  ━E  ├── auth/             # Authentication pages
━E  ━E  ├── exercises/        # Exercise pages
━E  ━E  ├── sessions/         # Workout session pages
━E  ━E  └── workouts/         # Workout plan pages
━E  ━E
━E  ├── router/               # Routing configuration
━E  ├── services/             # API service clients
━E  ├── styles/               # Global styles
━E  ├── types/                # TypeScript type definitions
━E  ├── App.tsx               # Main application component
━E  ├── config.ts             # Application configuration
━E  ├── index.tsx             # Application entry point
━E  └── theme.ts              # Material UI theme configuration
━E
├── public/                   # Static assets
├── .env                      # Environment variables (base)
├── .env.development          # Development environment variables
└── package.json              # Project dependencies and scripts
```

## Component Naming Conventions

- **Page Components**: Use PascalCase (e.g., `WorkoutPlansPage.tsx`)
- **Reusable Components**: Use PascalCase (e.g., `WorkoutCard.tsx`)
- **Utility/Helper Files**: Use camelCase (e.g., `workoutUtils.ts`)

## Development Guidelines

1. **Component Organization**:
   - Each component should have a clear, single responsibility
   - Complex components should be broken down into smaller sub-components
   - Shared functionality should be extracted to custom hooks

2. **State Management**:
   - Use React context for global state
   - Use local component state for UI-specific state
   - Consider using React Query for server state

3. **Styling**:
   - Use Material UI styled components for component-specific styling
   - Use the theme for consistent colors, spacing, and typography
   - Follow responsive design principles

4. **Performance**:
   - Memoize expensive calculations and renders
   - Use virtualization for long lists
   - Implement proper loading states and skeleton loaders

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Maintenance Notes

The codebase was cleaned on April 3, 2024 to remove duplicate files and outdated page components and standardize the structure. If you find any issues or inconsistencies, please update this documentation. 

## UI Component System

The OKGYM frontend includes a comprehensive set of reusable UI components that provide a consistent look and feel across the application. All components support both light and dark themes.

### Form Components

- **Button**: Customizable button with multiple variants (contained, outlined, text)
- **TextField**: Text input with validation and error handling
- **FormControl**: Wrapper for form elements with labels and error messages
- **Select**: Dropdown select component with options

### Layout Components

- **Card**: Container for displaying grouped content
- **Skeleton**: Loading placeholder for content
- **Alert**: Notification component for displaying messages
- **Badge**: Small count and status indicator
- **Tabs**: Tabbed interface for organizing content
- **Dialog**: Modal dialog for displaying content that requires user attention
- **Modal**: Simplified dialog with standard actions

### Navigation Components

- **Pagination**: Component for navigating through paginated data

### Data Visualization Components

- **Chart**: Data visualization component with bar, line, and pie chart options
- **Progress**: Linear and circular progress indicators

### Theme Components

- **ThemeToggle**: Switch for toggling between light and dark themes

### Usage Examples

#### Tabs Component

```tsx
<Tabs defaultTab="overview" onChange={setActiveTab} variant="pills">
  <TabList>
    <Tab id="overview">Overview</Tab>
    <Tab id="details">Details</Tab>
  </TabList>
  
  <TabPanel id="overview">
    <p>Overview content goes here</p>
  </TabPanel>
  
  <TabPanel id="details">
    <p>Details content goes here</p>
  </TabPanel>
</Tabs>
```

#### Dialog Component

```tsx
const [open, setOpen] = useState(false);

return (
  <>
    <Button onClick={() => setOpen(true)}>Open Dialog</Button>
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Dialog Title"
      maxWidth="md"
    >
      <p>Dialog content goes here</p>
    </Dialog>
  </>
);
```

#### Progress Component

```tsx
// Linear progress
<Progress 
  value={75} 
  max={100} 
  variant="linear" 
  color="primary"
  showLabel={true}
/>

// Circular progress
<Progress 
  value={75} 
  max={100} 
  variant="circular" 
  color="primary"
  size="large"
  showLabel={true}
  labelPosition="inside"
/>
```

#### Chart Component

```tsx
// Bar chart
<Chart 
  data={[
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 120 }
  ]} 
  type="bar" 
  height={250}
  showLabels={true}
  showValues={true}
/>

// Pie chart
<Chart 
  data={[
    { label: 'Category 1', value: 45 },
    { label: 'Category 2', value: 30 },
    { label: 'Category 3', value: 25 }
  ]} 
  type="pie" 
  height={250}
  showValues={true}
/>
```
