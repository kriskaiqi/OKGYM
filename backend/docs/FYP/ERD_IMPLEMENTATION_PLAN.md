# ERD Implementation Plan

## General Guidelines

### Notation Standards
- Use Crow's Foot Notation for relationships
- Primary Keys: PK with key symbol 🔑
- Foreign Keys: FK with link symbol 🔗
- Required Fields: Solid line (─)
- Optional Fields: Dashed line (---)

### Color Scheme
1. Core Entities: #B4D6FF (Light Blue)
2. Junction Tables: #B4FFB4 (Light Green)
3. Lookup Tables: #FFFFB4 (Light Yellow)
4. Tracking Tables: #FFD6B4 (Light Orange)
5. Relationship Lines: #666666 (Dark Gray)

### Common Elements
- Table Name (Bold)
- Primary Key Section
- Essential Fields Section
- Foreign Keys Section
- Timestamps Section
- Indexes (where relevant)

## Diagram Specifications

### 1. Overview ERD
**Purpose**: High-level system view
**Content**: All 21 tables with simplified relationships
**Focus Areas**:
- Entity groupings by function
- Core relationships
- No detailed attributes
- Color coding for quick identification

### 2. User Management ERD
**Tables**:
- users (Core)
- fitness_goals (Tracking)
- body_metrics (Tracking)
- achievement (Tracking)
- user_favourite_workouts (Junction)

**Key Relationships**:
- users → fitness_goals (1:N)
- users → body_metrics (1:N)
- users → achievement (1:N)
- users ↔ workout_plans (M:N via user_favourite_workouts)

### 3. Exercise Management ERD
**Tables**:
- exercises (Core)
- exercise_equipment (Junction)
- exercise_media (Junction)
- equipment_category (Junction)
- audio_cues (Core)

**Key Relationships**:
- exercises ↔ equipment (M:N)
- exercises → exercise_media (1:N)
- exercises → audio_cues (1:N)
- exercises ↔ categories (M:N)

### 4. Workout Management ERD
**Tables**:
- workout_plans (Core)
- workout_exercises (Junction)
- workout_tags (Lookup)
- workout_tag_map (Junction)
- workout_sessions (Tracking)
- workout_equipment (Junction)
- workout_muscle_group (Junction)

**Key Relationships**:
- workout_plans → workout_exercises (1:N)
- workout_plans ↔ workout_tags (M:N)
- workout_plans → workout_sessions (1:N)
- workout_plans ↔ equipment (M:N)

### 5. Media Management ERD
**Tables**:
- media (Core)
- exercise_media (Junction)
- audio_cues (Core)

**Key Relationships**:
- media → exercise_media (1:N)
- media → equipment (1:N)
- media → workout_plans (1:N)

### 6. Progress Tracking ERD
**Tables**:
- workout_sessions (Tracking)
- body_metrics (Tracking)
- fitness_goals (Tracking)
- achievement (Tracking)
- users (Reference)

**Key Relationships**:
- users → workout_sessions (1:N)
- users → body_metrics (1:N)
- users → fitness_goals (1:N)
- workout_sessions → achievement (1:N)

### 7. Equipment and Categories ERD
**Tables**:
- equipment (Core)
- equipment_categories (Lookup)
- equipment_muscle_group (Junction)
- equipment_category (Junction)
- workout_equipment (Junction)

**Key Relationships**:
- equipment → equipment_categories (N:1)
- equipment ↔ muscle_groups (M:N)
- equipment ↔ workout_plans (M:N)

## Implementation Steps

1. **Setup Phase**
   - Create base PlantUML template
   - Define custom styles and colors
   - Create reusable components

2. **Development Phase**
   - Implement diagrams in order of dependency
   - Start with Overview ERD
   - Follow with core entity diagrams
   - Complete with specialized diagrams

3. **Review Phase**
   - Verify all relationships
   - Check attribute completeness
   - Ensure consistent styling
   - Validate against ERD_DETAILS.md

4. **Documentation Phase**
   - Add diagram descriptions
   - Document key relationships
   - Include usage guidelines
   - Add maintenance notes

## Styling Template

```plantuml
@startuml
!define Table(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define primary_key(x) <b>x</b>
!define foreign_key(x) <i>x</i>

skinparam class {
    BackgroundColor<<Core>> #B4D6FF
    BackgroundColor<<Junction>> #B4FFB4
    BackgroundColor<<Lookup>> #FFFFB4
    BackgroundColor<<Tracking>> #FFD6B4
    BorderColor #666666
    ArrowColor #666666
}
@enduml
```

## Verification Checklist

### For Each Diagram
- [ ] All entities present
- [ ] Correct relationships shown
- [ ] Proper cardinality notation
- [ ] Consistent color scheme
- [ ] Key attributes included
- [ ] Proper indexing noted

### Overall Verification
- [ ] All 21 tables covered
- [ ] No missing relationships
- [ ] Consistent notation
- [ ] Clear layout
- [ ] Minimal line crossing
- [ ] Proper documentation

## Next Steps
1. Create base PlantUML template
2. Implement Overview ERD
3. Progress through specialized diagrams
4. Review and refine
5. Document and finalize 