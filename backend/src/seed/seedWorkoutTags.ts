import { WorkoutTag } from '../models/WorkoutTag';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { TagCategory, TagScope, FitnessGoal, WorkoutCategory } from '../models/shared/Enums';

/**
 * Seed the database with workout tags for categorizing workout plans
 */
export async function seedWorkoutTags(): Promise<void> {
  try {
    const tagRepository = AppDataSource.getRepository(WorkoutTag);
    
    // Check if we already have workout tags
    const existingCount = await tagRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} workout tags. Skipping seed.`);
      return;
    }
    
    // Create workout tags data
    const workoutTagsData = [
      {
        name: 'Beginner',
        description: 'Suitable for individuals new to fitness training.',
        category: TagCategory.DIFFICULTY,
        scope: TagScope.SYSTEM,
        color: '#4CAF50', // Green
        icon: 'fitness_center',
        displayOrder: 1,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Novice', 'Entry Level'],
          appliesTo: [WorkoutCategory.STRENGTH, WorkoutCategory.CARDIO, WorkoutCategory.FLEXIBILITY]
        }
      },
      {
        name: 'Intermediate',
        description: 'For those with some fitness experience looking to progress.',
        category: TagCategory.DIFFICULTY,
        scope: TagScope.SYSTEM,
        color: '#FF9800', // Orange
        icon: 'fitness_center',
        displayOrder: 2,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Moderate', 'Mid-Level']
        }
      },
      {
        name: 'Advanced',
        description: 'Challenging workouts for experienced fitness enthusiasts.',
        category: TagCategory.DIFFICULTY,
        scope: TagScope.SYSTEM,
        color: '#F44336', // Red
        icon: 'fitness_center',
        displayOrder: 3,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Expert', 'High Level']
        }
      },
      {
        name: 'Strength',
        description: 'Focused on building muscular strength and power.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#3F51B5', // Indigo
        icon: 'fitness_center',
        displayOrder: 4,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Power', 'Resistance'],
          appliesTo: [WorkoutCategory.STRENGTH],
          relatedTags: [5, 11, 12, 13], // Hypertrophy, Full Body, Upper Body, Lower Body
          autoApplyCriteria: {
            muscleGroups: ['CHEST', 'BACK', 'SHOULDERS', 'LEGS'],
            difficulty: 'INTERMEDIATE'
          }
        }
      },
      {
        name: 'Hypertrophy',
        description: 'Designed for muscle growth and size development.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#673AB7', // Deep Purple
        icon: 'fitness_center',
        displayOrder: 5,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Muscle Building', 'Growth'],
          relatedTags: [4, 11, 12, 13] // Strength, Full Body, Upper Body, Lower Body
        }
      },
      {
        name: 'Fat Loss',
        description: 'Aimed at reducing body fat and improving body composition.',
        category: TagCategory.GOAL,
        scope: TagScope.SYSTEM,
        color: '#E91E63', // Pink
        icon: 'whatshot',
        displayOrder: 6,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Weight Loss', 'Cutting'],
          relatedTags: [7, 8], // Cardio, HIIT
          autoApplyCriteria: {
            muscleGroups: ['FULL_BODY'],
            duration: {
              min: 20,
              max: 60
            }
          }
        }
      },
      {
        name: 'Cardio',
        description: 'Emphasizes cardiovascular endurance and stamina.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#00BCD4', // Cyan
        icon: 'directions_run',
        displayOrder: 7,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Endurance', 'Aerobic'],
          appliesTo: [WorkoutCategory.CARDIO, WorkoutCategory.ENDURANCE]
        }
      },
      {
        name: 'HIIT',
        description: 'High-Intensity Interval Training for efficient fat burning and fitness improvements.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#FF5722', // Deep Orange
        icon: 'flash_on',
        displayOrder: 8,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Interval Training', 'Tabata'],
          appliesTo: [WorkoutCategory.HIIT, WorkoutCategory.CIRCUIT]
        }
      },
      {
        name: 'Mobility',
        description: 'Focuses on joint mobility and range of motion.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#2196F3', // Blue
        icon: 'accessibility',
        displayOrder: 9,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Joint Health', 'Movement'],
          appliesTo: [WorkoutCategory.FLEXIBILITY]
        }
      },
      {
        name: 'Recovery',
        description: 'Low-intensity sessions designed for active recovery and rejuvenation.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#8BC34A', // Light Green
        icon: 'spa',
        displayOrder: 10,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Rest Day', 'Regeneration'],
          appliesTo: [WorkoutCategory.RECOVERY, WorkoutCategory.FLEXIBILITY]
        }
      },
      {
        name: 'Full Body',
        description: 'Targets all major muscle groups in a single session.',
        category: TagCategory.BODY_PART,
        scope: TagScope.SYSTEM,
        color: '#9C27B0', // Purple
        icon: 'person',
        displayOrder: 11,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Total Body', 'Complete Workout'],
          appliesTo: [WorkoutCategory.FULL_BODY]
        }
      },
      {
        name: 'Upper Body',
        description: 'Focuses on chest, back, shoulders, and arms.',
        category: TagCategory.BODY_PART,
        scope: TagScope.SYSTEM,
        color: '#795548', // Brown
        icon: 'accessibility',
        displayOrder: 12,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Upper Split', 'Push Pull'],
          appliesTo: [WorkoutCategory.UPPER_BODY, WorkoutCategory.PUSH, WorkoutCategory.PULL]
        }
      },
      {
        name: 'Lower Body',
        description: 'Targets legs, glutes, and lower body muscles.',
        category: TagCategory.BODY_PART,
        scope: TagScope.SYSTEM,
        color: '#607D8B', // Blue Grey
        icon: 'accessibility',
        displayOrder: 13,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Leg Day', 'Lower Split'],
          appliesTo: [WorkoutCategory.LOWER_BODY, WorkoutCategory.LEGS]
        }
      },
      {
        name: 'Core',
        description: 'Emphasizes abdominal and core muscle development.',
        category: TagCategory.BODY_PART,
        scope: TagScope.SYSTEM,
        color: '#FFC107', // Amber
        icon: 'accessibility',
        displayOrder: 14,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Abs', 'Midsection'],
          appliesTo: [WorkoutCategory.CORE]
        }
      },
      {
        name: 'Circuit',
        description: 'Structured as a series of exercises performed with minimal rest.',
        category: TagCategory.WORKOUT_TYPE,
        scope: TagScope.SYSTEM,
        color: '#009688', // Teal
        icon: 'loop',
        displayOrder: 15,
        isActive: true,
        usageCount: 0,
        metadata: {
          aliases: ['Round-Based', 'Station Training'],
          appliesTo: [WorkoutCategory.CIRCUIT]
        }
      }
    ];
    
    // Save workout tags to the database
    for (const tagData of workoutTagsData) {
      const tag = new WorkoutTag();
      Object.assign(tag, tagData);
      await tagRepository.save(tag);
    }
    
    logger.info(`Successfully seeded ${workoutTagsData.length} workout tags`);
  } catch (error) {
    logger.error('Error seeding workout tags:', error);
    throw error;
  }
} 