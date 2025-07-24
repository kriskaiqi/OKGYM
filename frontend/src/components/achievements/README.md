# Achievement System Components

This directory contains components for displaying user achievements in the application.

## Components

### AchievementList

The main component for displaying a list of achievements. It supports filtering, sorting, and displaying in different modes (compact vs. full).

Props:
- `compact`: Boolean - Display in compact mode (fewer filters, smaller cards)
- `showHeader`: Boolean - Show the header with title and stats
- `maxItems`: Number - Limit the number of achievements displayed
- `showViewAllButton`: Boolean - Show a button to navigate to the full achievements page

Usage:
```jsx
// Full mode for the achievements page
<AchievementList showHeader={true} compact={false} />

// Compact mode for dashboard widget
<AchievementList 
  compact={true} 
  showHeader={false} 
  maxItems={4}
  showViewAllButton={true}
/>
```

### AchievementCard

Displays a single achievement with visual indicators for tier, progress, and unlock status.

Props:
- `achievement`: Achievement - The achievement data to display
- `newlyUnlocked`: Boolean - Whether the achievement was recently unlocked (triggers animation)

## Services

The achievement system is backed by `achievementService.ts` which provides:

- Data fetching from the backend
- Progress calculation
- Visual helpers (tier colors, icons, etc.)

## Features

- **Visual Tiers**: Bronze, Silver, Gold, Platinum, Diamond, Master
- **Categories**: Milestone, Consistency, Performance, Improvement, Explorer, Challenge, Social, Special
- **Animations**: Cards, progress indicators, and newly unlocked achievements
- **Responsive Design**: Adapts to different screen sizes and contexts
- **Filtering & Sorting**: By category, tier, progress, name, etc.

## Implementation Details

The achievement system uses an on-demand evaluation approach where:

1. Frontend requests all achievements from backend
2. Backend calculates current progress and unlock status
3. Frontend displays with appropriate visualizations
4. Newly unlocked achievements show special animation

## Usage Examples

### Dashboard Tab
```jsx
<AchievementList 
  compact={false} 
  showHeader={true}
  maxItems={6}
  showViewAllButton={true}
/>
```

### Profile Page
```jsx
<AchievementList 
  compact={true} 
  showHeader={false} 
  maxItems={4}
  showViewAllButton={true}
/>
```

### Standalone Page
```jsx
<AchievementList showHeader={true} compact={false} />
``` 