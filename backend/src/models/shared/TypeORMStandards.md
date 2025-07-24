# TypeORM Relationship and Indexing Standards

This document outlines the standard patterns for defining entity relationships and database indexes in our application. Following these standards ensures consistency, optimizes performance, and prevents common issues.

## Naming Conventions

### Indexes

- **Primary format**: `idx_[entity]_[field(s)]`
  - Examples: `idx_workout_category`, `idx_exercise_equipment`
- **Composite indexes**: `idx_[entity]_[field1]_[field2]`
  - Example: `idx_workout_difficulty_category`
- **Unique indexes**: `unq_[entity]_[field(s)]`
  - Example: `unq_user_email`
- **Foreign key indexes**: `idx_fk_[entity]_[relation]`
  - Example: `idx_fk_workout_exercise_exercise`

### Join Tables

- **Format**: `[owning_entity]_[related_entity]`
  - Example: `workout_exercise` (for WorkoutPlan to Exercise)
- **Many-to-many format**: `[entity1]_[entity2]`
  - Example: `workout_equipment` (for WorkoutPlan to Equipment)

### Column Names

- **Foreign key columns**: `[relation_name]_id`
  - Example: `user_id`, `workout_plan_id`
- **Timestamps**: `created_at`, `updated_at`

## Relationship Standards

### One-to-Many / Many-to-One

```typescript
// PARENT ENTITY (One side)
@OneToMany(() => ChildEntity, childEntity => childEntity.parentEntity)
childEntities: ChildEntity[];

// CHILD ENTITY (Many side)
@ManyToOne(() => ParentEntity, parentEntity => parentEntity.childEntities)
@JoinColumn({ name: "parent_entity_id" })
@Index("idx_fk_child_parent")
parentEntity: ParentEntity;

@Column()
parent_entity_id: number; // Explicitly exposing the FK column
```

### Many-to-Many

```typescript
// OWNING SIDE
@ManyToMany(() => RelatedEntity)
@JoinTable({
    name: "owning_entity_related_entity",
    joinColumn: { name: "owning_entity_id" },
    inverseJoinColumn: { name: "related_entity_id" }
})
@Index("idx_owning_entity_relation")
relatedEntities: RelatedEntity[];

// INVERSE SIDE
@ManyToMany(() => OwningEntity, owningEntity => owningEntity.relatedEntities)
@Index("idx_related_entity_owning")
owningEntities: OwningEntity[];
```

### One-to-One

```typescript
// OWNING SIDE
@OneToOne(() => RelatedEntity)
@JoinColumn({ name: "related_entity_id" })
@Index("idx_fk_owning_related")
relatedEntity: RelatedEntity;

// INVERSE SIDE (optional)
@OneToOne(() => OwningEntity, owningEntity => owningEntity.relatedEntity)
owningEntity: OwningEntity;
```

## Cascading Rules

- **Delete cascades**: Use sparingly, typically for:
  - Child records that can't exist without a parent (e.g., profile details)
  - Composition relationships where the children are an integral part of the parent

```typescript
@OneToMany(() => ChildEntity, childEntity => childEntity.parentEntity, {
    cascade: true,
    onDelete: "CASCADE"
})
```

- **SET NULL**: For optional relationships where related entities should remain if the parent is deleted:

```typescript
@ManyToOne(() => ParentEntity, parentEntity => parentEntity.childEntities, {
    onDelete: "SET NULL"
})
```

## Lazy vs. Eager Loading

- **Default to lazy loading** for most relationships
- **Use eager loading only** for:
  - Essential data always needed with the entity
  - Very small related collections
  - Core reference data

```typescript
// Eager loading example
@ManyToOne(() => User, { eager: true })
```

- **Control eager loading with query builders for specific use cases**

## Indexing Guidelines

1. **Always index**:
   - Primary keys (automatic)
   - Foreign keys (all @ManyToOne and @OneToOne relationship columns)
   - Columns used in sorting/ordering
   - Columns frequently used in WHERE clauses

2. **Consider indexing**:
   - Columns used in GROUP BY
   - Fields frequently used in reports or dashboards

3. **Composite indexes**:
   - Add for fields frequently queried together
   - Order columns from most to least selective

4. **Avoid over-indexing**:
   - Don't index small tables (less than 1000 rows)
   - Don't index columns with low cardinality
   - Don't duplicate indexes (e.g., a composite index (A,B) makes a separate index on A redundant)

## Implementation Examples

### Example: User and Profile

```typescript
// User entity
@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @OneToOne(() => Profile, profile => profile.user, {
        cascade: true
    })
    profile: Profile;
    
    @OneToMany(() => Post, post => post.author)
    posts: Post[];
}

// Profile entity
@Entity("profiles")
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;
    
    @OneToOne(() => User, user => user.profile)
    @JoinColumn({ name: "user_id" })
    @Index("idx_fk_profile_user")
    user: User;
    
    @Column()
    user_id: number;
}

// Post entity
@Entity("posts")
@Index("idx_post_created_at") // Index for sorting by creation date
export class Post {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, user => user.posts, {
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "author_id" })
    @Index("idx_fk_post_author")
    author: User;
    
    @Column({ nullable: true })
    author_id: number;
}
``` 