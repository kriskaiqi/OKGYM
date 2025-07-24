# OKGYM Database Seeding Plan

## Overview
This document outlines the comprehensive seeding plan for the OKGYM database consisting of 54 tables. The seeding process is structured to respect table dependencies and ensure data integrity across all relationships. This plan serves as a reference for development and testing teams.

## Goals
- Provide a consistent baseline dataset for development and testing
- Ensure realistic data relationships that mirror production scenarios
- Support all application features and user flows
- Enable reproducible testing environments

## Seeding Order and Quantities

### Phase 1: Foundation Tables (No Foreign Key Dependencies)
These tables must be seeded first as they have no dependencies and other tables rely on them.

#### Exercise Categories (30 records)
- **Primary Muscle Groups (10):**
  - Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves
- **Exercise Types (10):**
  - Strength_Compound, Strength_Isolation, Cardio, Core, Power, Plyometric, Flexibility, Balance, Recovery, Sport_Specific
- **Special Categories (10):**
  - Functional, Rehabilitation, Beginner_Friendly, Advanced, HIIT, Bodyweight, Equipment_Based, Mobility, Endurance, Stability

#### Equipment (25 records)
- **Common Gym Equipment (15):**
  - Dumbbells, Barbells, Weight Plates, Bench, Squat Rack, Lat Pulldown, Cable Machine, Leg Press, Smith Machine, Chest Press, Leg Extension, Leg Curl, Rowing Machine, Treadmill, Exercise Bike
- **Home Workout Equipment (5):**
  - Resistance Bands, Foam Roller, Exercise Ball, Yoga Mat, Adjustable Bench
- **Specialized Equipment (5):**
  - TRX Suspension, Kettlebells, Medicine Ball, Battle Ropes, Plyo Box

#### Media Records (50 records)
- **Exercise Demonstration (30):**
  - High-quality images showing proper form at different phases of exercises
  - Include images for various difficulty levels and equipment variations
- **Equipment Images (15):**
  - Product-style images of fitness equipment
  - Include usage context images
- **Tutorial Thumbnails (5):**
  - Branded thumbnails for video tutorials

#### Workout Tags (15 records)
- Beginner, Intermediate, Advanced, Strength, Hypertrophy, Fat Loss, Cardio, HIIT, Mobility, Recovery, Full Body, Upper Body, Lower Body, Core, Circuit

#### Program Tags (10 records)
- 8-Week Challenge, Bodyweight Master, Strength Foundation, Muscle Builder, Fat Burner, Marathon Ready, Recovery Specialist, Mobility Improvement, Sport Performance, Total Transformation

#### Video Tutorial Categories (8 records)
- Form Technique, Injury Prevention, Equipment Setup, Exercise Variations, Progression Techniques, Warmup Routines, Specialized Training, Common Errors

#### Achievements (20 records)
- **Workout Completion (5):**
  - First Workout, 10 Workouts, 50 Workouts, 100 Workouts, 365 Workouts
- **Streak-based (5):**
  - 3-Day Streak, 7-Day Streak, 14-Day Streak, 30-Day Streak, 90-Day Streak
- **Progress-based (5):**
  - 5% Weight Loss, 10kg Total Volume Increase, First Body Measurement Goal, Perfect Form Master, Personal Best Breaker
- **Special (5):**
  - Early Bird (5 morning workouts), Night Owl (5 evening workouts), Weekend Warrior, Program Completer, All-Rounder (all muscle groups worked)

#### Audio Cues (15 records)
- **General Guidance (5):**
  - "Keep your back straight", "Engage your core", "Breathe steadily", "Control the movement", "Full range of motion"
- **Exercise-specific (5):**
  - "Drive through your heels", "Squeeze at the top", "Elbows at 90 degrees", "Chin tucked", "Explode upward"
- **Motivational (5):**
  - "Push through it", "Last rep best rep", "You've got this", "Almost there", "New personal best!"

#### AI Model Configuration (10 records)
- **Form Detection Models:**
  - Squat Analyzer, Deadlift Form Checker, Push-up Counter, Plank Position Validator
- **Movement Tracking Models:**
  - Rep Counter, Range of Motion Analyzer, Tempo Tracker
- **Specialized Models:**
  - Balance Analyzer, Weight Distribution Checker, Movement Fluidity Scorer

### Phase 2: Primary Entity Tables
These core tables should be seeded next as many junction tables depend on them.

#### Exercises (100 records)
- **Upper Body (25):**
  - 5 chest (bench press, push-up, etc.)
  - 5 back (rows, pull-ups, etc.)
  - 5 shoulders (overhead press, lateral raise, etc.)
  - 5 biceps (curl variations)
  - 5 triceps (extensions, dips, etc.)
- **Lower Body (25):**
  - 5 quadriceps (squats, leg extensions, etc.)
  - 5 hamstrings (deadlift variations, leg curls, etc.)
  - 5 glutes (hip thrusts, glute bridges, etc.)
  - 5 calves (calf raises, jumps, etc.)
  - 5 full lower body (lunges, step-ups, etc.)
- **Core (20):**
  - 5 abdominal (crunches, leg raises, etc.)
  - 5 oblique (side planks, Russian twists, etc.)
  - 5 lower back (superman, back extensions, etc.)
  - 5 full core (planks, hollow holds, etc.)
- **Cardio (15):**
  - 5 steady-state (running, cycling, etc.)
  - 5 HIIT (burpees, mountain climbers, etc.)
  - 5 mixed cardio (jumping jacks, jump rope, etc.)
- **Flexibility/Mobility (15):**
  - 5 upper body (shoulder dislocates, wall slides, etc.)
  - 5 lower body (hip flexor stretch, hamstring stretch, etc.)
  - 5 full body (yoga poses, dynamic stretches, etc.)

**Each exercise record should include:**
- Name, description, primary/synergist muscle groups
- Measurement type (reps, time, distance)
- Difficulty level
- Movement pattern
- Detailed form instructions (JSON)
- Common errors and corrections
- Equipment options
- AI detection capabilities

#### Video Tutorials (20 records)
- Link to exercises, categories, and media records
- Include titles, descriptions, durations, URLs
- Mix of form guidance, variations, and progressions

#### Users (20 records)
- **Admin (1):**
  - Full access, created at application launch
- **Premium Users (4):**
  - Mix of fitness levels and goals
  - Complete profile information
  - Various membership durations
- **Regular Users (15):**
  - Varied demographics (age, gender, experience)
  - Different fitness goals and preferences
  - Various activity levels
  - Range of completion rates and engagement

**Each user record should include:**
- Authentication details (email, hashed password)
- Profile information (name, birth year, height, gender)
- Fitness profile (main goal, activity level, fitness level)
- Preferences (workout duration, location, equipment access)
- Stats (workouts completed, streaks, join date)
- Settings (notifications, theme, measurement units)

#### Workout Plans (30 records)
- **Beginner (10):**
  - Full-body routines
  - Low complexity
  - Foundational movements
  - 20-40 minute duration
- **Intermediate (10):**
  - Split routines (upper/lower, push/pull)
  - Moderate complexity
  - Progressive overload focus
  - 30-60 minute duration
- **Advanced (10):**
  - Specialized routines
  - Higher complexity
  - Periodization elements
  - 45-90 minute duration

**Each workout plan should include:**
- Name, description, estimated duration
- Target muscle groups and fitness goals
- Difficulty level
- Instructions and notes
- Equipment requirements
- Suitable for location types (home, gym, outdoors)

### Phase 3: Junction Tables and Simple Relationships
These tables connect the primary entities and define their relationships.

#### Exercise Equipment
- Link exercises to appropriate equipment
- Include alternative equipment options
- Ensure coverage for all exercises with equipment needs

#### Exercise Category (200 records)
- Map exercises to all relevant categories
- Include both muscle groups and exercise types
- Average 2-3 categories per exercise

#### Exercise Media
- Connect exercises to demonstration images
- Ensure all exercises have at least one image
- Add multiple angles for complex movements

#### Workout Exercises (300 records)
- 10 exercises per workout on average
- Include sets, reps, duration, and rest times
- Define the exercise order within workouts
- Include notes and technique cues
- Specify intensity parameters

#### Workout Tag Map (60 records)
- Categorize workouts with multiple tags
- Average 2 tags per workout
- Ensure all workouts have at least one tag

#### Workout Muscle Group (90 records)
- Connect workouts to primary muscle groups
- Identify secondary muscle groups
- Ensure balanced distribution across workout plans

#### Workout Equipment (75 records)
- Link workouts to required equipment
- Include minimum equipment requirements
- Specify alternatives where possible

#### Exercise Relations (50 records)
- Define relationships between exercises:
  - Progression variations (easier/harder)
  - Equipment alternatives (with/without equipment)
  - Similar exercises that target the same muscles
  - Complementary exercises for supersets

#### Form Correction Points (60 records)
- Common corrections for exercise form
- Link to specific exercises
- Include detection points for AI validation

### Phase 4: Advanced Entity Tables
These tables build upon the foundation to create more complex entities and relationships.

#### Training Programs (15 records)
- **Beginner Programs (5):**
  - 4-6 week programs
  - Full-body focus
  - Technique and habit building
  - Progressive introduction to fitness
- **Intermediate Programs (5):**
  - 6-8 week programs
  - Split routines
  - Progressive overload focus
  - Specialized goals (strength, hypertrophy, etc.)
- **Advanced Programs (5):**
  - 8-12 week programs
  - Periodization models
  - Specialized training methods
  - Performance-oriented goals

**Each program should include:**
- Name, description, duration, difficulty
- Clear goals and expected outcomes
- Required commitment (days per week)
- Equipment needs
- Pre-requisites (if any)

#### Program Workouts (90 records)
- 6 workouts per program on average
- Define workout sequence and frequency
- Include rest days and active recovery
- Specify progression models

#### Program Workout Plans (90 records)
- Link programs to specific workout plans
- Define the execution order
- Include scheduling guidance
- Progression parameters

#### Program Equipment (45 records)
- Required equipment for programs
- Alternatives for limited equipment
- Progressive equipment needs

#### Program Muscle Groups (60 records)
- Target muscle groups for programs
- Ensure balanced development
- Identify primary focus areas

### Phase 5: User-Related Data
These tables personalize the experience for users and track their activities.

#### User Activities (200 records)
- Login/logout events
- Feature usage tracking
- Social interactions
- Settings changes
- Spread across all users with realistic timestamps

#### User Progress (100 records)
- Weight changes
- Strength improvements
- Endurance metrics
- Body composition changes
- Track multiple metrics per user over time

#### User Schedules (40 records)
- Weekly workout schedules
- Different patterns based on availability
- Mix of program and individual workout plans
- Realistic distribution across active users

#### Schedule Items (160 records)
- Specific scheduled workout sessions
- Date/time information
- Completion status
- Recurrence patterns
- Notes and reminders

#### User Equipment (60 records)
- Equipment owned/available to users
- Home gym setups
- Gym access information
- Equipment preferences

#### User Achievements (80 records)
- Completed achievements
- Progress toward next achievements
- Timestamps of completion
- Distributed across users based on activity level

#### User Favorite Workouts (50 records)
- Workouts marked as favorites
- Distribution across different workout types
- Timestamp of when added as favorite

#### Body Metrics (200 records)
- **Weight measurements:**
  - Initial baseline
  - Regular tracking (weekly)
  - Realistic fluctuations
- **Body measurements:**
  - Chest, waist, hips, arms, thighs
  - Monthly tracking
- **Fitness tests:**
  - Strength benchmarks
  - Endurance metrics
  - Flexibility assessments
- 10 records per user with timestamps to show progress

#### Fitness Goals (40 records)
- Weight targets
- Performance goals (strength, endurance)
- Habit formation goals
- Event preparation
- 2 goals per user with target dates and metrics

### Phase 6: Interaction and Usage Data
These tables track user interactions with the system and performance data.

#### Workout Sessions (300 records)
- Completed workout records
- Performance data (weights, reps, duration)
- Effort ratings
- Notes and feedback
- AI form assessment results
- Distributed across users with realistic patterns

#### User Workout History (300 records)
- Detailed history of workout completions
- Date/time information
- Completion metrics
- Progress over time
- Match with workout sessions

#### Workout Ratings (150 records)
- Star ratings (1-5)
- Written feedback
- Difficulty assessments
- Effectiveness ratings
- Distributed across workouts and users

#### Program Enrollments (30 records)
- Users enrolled in training programs
- Start dates and expected completion
- Progress status
- Customization notes
- Spread across different programs and users

#### Feedback (50 records)
- App feature feedback
- Exercise instructions feedback
- Workout suggestion improvements
- General user experience notes
- Bug reports and enhancement requests

#### Notifications (100 records)
- Workout reminders
- Achievement alerts
- Progress updates
- System announcements
- Friend activity notices

#### Exercise Form Analysis (75 records)
- AI-generated form assessment
- Key points and scores
- Improvement suggestions
- Progress tracking
- Exercise-specific metrics

#### Exercise Specific Analysis (60 records)
- Detailed analysis of user performance
- Exercise-specific metrics
- Comparison to benchmarks
- Technique scoring
- Progress over time

#### Metric Tracking (250 records)
- Performance metrics (weight, reps, sets)
- Progression data
- Personal records
- Consistency metrics
- Historical comparisons

#### Workout Audio Cues (45 records)
- Audio guidance linked to specific workouts
- Timing information
- Cue text and audio file references
- Exercise correlation

## Implementation Approach

### Technical Setup
1. Create a master seeding script that calls individual seed modules in the correct order
2. Implement each seed module to handle a specific table or related set of tables
3. Use TypeORM entities and repositories for all database operations
4. Implement idempotent seeding (check if data exists before adding)
5. Add transaction support to ensure atomicity within each phase

### Seeding Configuration
1. Use environment variables to control seeding behavior:
   - `SEED_ALL`: Seed all tables
   - `SEED_PHASE_{N}`: Seed specific phase
   - `SEED_RESET`: Clear existing data before seeding
   - `SEED_COUNT_MULTIPLIER`: Scale the number of records

2. Logging and reporting:
   - Log each seeding operation
   - Report counts of records added
   - Track timing of seed operations
   - Identify any failures

### Data Generation Strategies
1. Use realistic data rather than lorem ipsum
2. Generate consistent relationships (user to workouts, exercises to equipment)
3. Create plausible timestamps with proper chronology
4. Ensure statistical distribution matches expected user patterns
5. Use predefined sets of values for enum fields

### Testing and Validation
1. Verify referential integrity after seeding
2. Confirm all required relationships are established
3. Test application functionality with seeded data
4. Ensure balanced data distribution
5. Validate edge cases (users with no workouts, workouts with many exercises)

## Data Variation Specifications

### User Profile Distribution
- **Age range:**
  - 18-25: 20%
  - 26-35: 40%
  - 36-45: 25%
  - 46-65: 15%
- **Gender distribution:**
  - Female: 40%
  - Male: 40%
  - Other/unspecified: 20%
- **Fitness levels:**
  - Beginner: 40%
  - Intermediate: 40%
  - Advanced: 20%
- **Goals:**
  - Weight loss: 30%
  - Muscle gain: 30%
  - General fitness: 20%
  - Specialized (strength, endurance, etc.): 20%
- **Activity patterns:**
  - Morning exercisers: 30%
  - Evening exercisers: 40%
  - Variable schedule: 30%
  - Weekday focus: 60%
  - Weekend warriors: 40%

### Exercise Attributes
- **Difficulty distribution:**
  - Beginner: 30%
  - Intermediate: 50%
  - Advanced: 20%
- **Measurement types:**
  - Repetitions: 60%
  - Duration (time): 30%
  - Distance: 10%
- **Equipment requirements:**
  - No equipment: 30%
  - Basic equipment: 40%
  - Specialized equipment: 30%
- **Exercise categories:**
  - Strength training: 50%
  - Cardio/endurance: 20%
  - Flexibility/mobility: 15%
  - Balance/stability: 10%
  - Sport-specific: 5%

### Workout Plan Parameters
- **Duration range:**
  - Short (15-30 minutes): 30%
  - Medium (31-60 minutes): 50%
  - Long (61-90 minutes): 20%
- **Exercise count per workout:**
  - 3-5 exercises: 30%
  - 6-8 exercises: 50%
  - 9-12 exercises: 20%
- **Target areas:**
  - Full body: 30%
  - Split routines: 50%
  - Specialized focus: 20%
- **Intensity distribution:**
  - Low intensity: 20%
  - Moderate intensity: 50%
  - High intensity: 30%

## Development Guidelines

### Coding Standards
- Follow TypeScript best practices
- Use descriptive names for seed functions
- Include comments explaining data generation logic
- Handle errors gracefully with appropriate logging
- Use async/await for all database operations

### Maintainability
- Create separate seed modules for each table group
- Document any external dependencies or prerequisites
- Add seed function reference to README
- Include version control of seed data structures
- Ensure backward compatibility with existing data

### Performance
- Use batch inserts where possible
- Implement caching for frequently accessed reference data
- Monitor memory usage during large seed operations
- Add timing diagnostics for optimization

## Execution Instructions

1. Run the master seed script:
   ```bash
   npm run seed:data
   ```

2. Seed specific phases:
   ```bash
   npm run seed:phase1
   npm run seed:phase2
   # etc.
   ```

3. Reset database and seed:
   ```bash
   npm run db:refresh
   ```

4. Generate test data for development:
   ```bash
   npm run seed:dev
   ```

## Maintenance and Updates

1. **Adding new seed data:**
   - Add to the appropriate seed module
   - Maintain consistent patterns and distributions
   - Update documentation with new data types

2. **Schema changes:**
   - Update seed modules when database schema changes
   - Version seed data structures alongside schema
   - Test backward compatibility

3. **Refreshing test environments:**
   - Regular refresh schedule for test environments
   - Document process for QA team
   - Include data cleanup procedures

---

This database seeding plan provides a comprehensive approach to creating realistic and useful test data for the OKGYM application. By following this structured approach, we ensure data integrity, comprehensive test coverage, and a consistent development environment. 