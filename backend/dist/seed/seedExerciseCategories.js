"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExerciseCategories = seedExerciseCategories;
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedExerciseCategories() {
    try {
        const categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        const existingCount = await categoryRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} exercise categories. Skipping seed.`);
            return;
        }
        const muscleGroupsData = [
            {
                name: 'Chest',
                description: 'Pectoralis major and minor muscles located in the chest.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 1,
                metadata: {
                    aliases: ['Pecs', 'Pectorals'],
                    anatomicalInfo: 'The chest muscles include the pectoralis major and pectoralis minor.',
                    benefits: ['Improved upper body strength', 'Enhanced pushing power', 'Better posture'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [3, 5],
                    imageUrl: '/assets/muscle-groups/chest.jpg',
                    examples: ['Bench Press', 'Push-up', 'Chest Fly', 'Dips']
                }
            },
            {
                name: 'Back',
                description: 'Multiple muscles of the back including latissimus dorsi, rhomboids, and trapezius.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 2,
                metadata: {
                    aliases: ['Lats', 'Upper back', 'Lower back'],
                    anatomicalInfo: 'The back muscles include the latissimus dorsi, rhomboids, trapezius, and erector spinae.',
                    benefits: ['Improved posture', 'Reduced back pain', 'Enhanced pulling strength'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [3, 4, 6],
                    imageUrl: '/assets/muscle-groups/back.jpg',
                    examples: ['Pull-ups', 'Rows', 'Lat Pulldown', 'Deadlift']
                }
            },
            {
                name: 'Shoulders',
                description: 'Deltoid muscles covering the shoulder joint.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 3,
                metadata: {
                    aliases: ['Delts', 'Deltoids'],
                    anatomicalInfo: 'The shoulder muscles primarily include the anterior, lateral, and posterior deltoids.',
                    benefits: ['Improved shoulder stability', 'Enhanced upper body aesthetics', 'Better overhead strength'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [1, 2, 5],
                    imageUrl: '/assets/muscle-groups/shoulders.jpg',
                    examples: ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press']
                }
            },
            {
                name: 'Biceps',
                description: 'Biceps brachii muscles located on the front of the upper arms.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 4,
                metadata: {
                    aliases: ['Arms', 'Upper arms'],
                    anatomicalInfo: 'The biceps brachii is a two-headed muscle that flexes the elbow and supinates the forearm.',
                    benefits: ['Improved arm strength', 'Enhanced pulling power', 'Better aesthetics'],
                    recommendedFrequency: '2 times per week',
                    relatedCategories: [2, 6],
                    imageUrl: '/assets/muscle-groups/biceps.jpg',
                    examples: ['Bicep Curl', 'Hammer Curl', 'Chin-up', 'Preacher Curl']
                }
            },
            {
                name: 'Triceps',
                description: 'Triceps brachii muscles located on the back of the upper arms.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 5,
                metadata: {
                    aliases: ['Arms', 'Upper arms'],
                    anatomicalInfo: 'The triceps brachii is a three-headed muscle that extends the elbow.',
                    benefits: ['Improved arm strength', 'Enhanced pushing power', 'Better arm definition'],
                    recommendedFrequency: '2 times per week',
                    relatedCategories: [1, 3],
                    imageUrl: '/assets/muscle-groups/triceps.jpg',
                    examples: ['Tricep Extension', 'Diamond Push-up', 'Tricep Dip', 'Skull Crusher']
                }
            },
            {
                name: 'Forearms',
                description: 'Muscles of the forearm that control wrist and finger movements.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 6,
                metadata: {
                    aliases: ['Wrist flexors', 'Wrist extensors'],
                    anatomicalInfo: 'The forearm contains multiple muscles that control wrist and finger movements.',
                    benefits: ['Improved grip strength', 'Enhanced wrist stability', 'Better functional capacity'],
                    recommendedFrequency: '2 times per week',
                    relatedCategories: [4, 2],
                    imageUrl: '/assets/muscle-groups/forearms.jpg',
                    examples: ['Wrist Curl', 'Reverse Wrist Curl', 'Farmer\'s Walk', 'Plate Pinch']
                }
            },
            {
                name: 'Core',
                description: 'Abdominal and deep core muscles that stabilize the spine and pelvis.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 7,
                metadata: {
                    aliases: ['Abs', 'Abdominals', 'Midsection'],
                    anatomicalInfo: 'The core includes the rectus abdominis, transverse abdominis, internal/external obliques, and more.',
                    benefits: ['Improved stability', 'Enhanced athletic performance', 'Better posture'],
                    recommendedFrequency: '3-4 times per week',
                    relatedCategories: [8, 9, 10],
                    imageUrl: '/assets/muscle-groups/core.jpg',
                    examples: ['Plank', 'Crunch', 'Russian Twist', 'Dead Bug']
                }
            },
            {
                name: 'Quadriceps',
                description: 'Four-headed muscle group on the front of the thigh.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 8,
                metadata: {
                    aliases: ['Quads', 'Front thighs'],
                    anatomicalInfo: 'The quadriceps include four muscles: rectus femoris, vastus lateralis, vastus medialis, and vastus intermedius.',
                    benefits: ['Improved lower body strength', 'Enhanced knee stability', 'Better leg definition'],
                    recommendedFrequency: '2 times per week',
                    relatedCategories: [9, 10],
                    imageUrl: '/assets/muscle-groups/quads.jpg',
                    examples: ['Squat', 'Leg Extension', 'Lunge', 'Leg Press']
                }
            },
            {
                name: 'Hamstrings',
                description: 'Muscles on the back of the thigh.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 9,
                metadata: {
                    aliases: ['Back thighs'],
                    anatomicalInfo: 'The hamstrings include three muscles: biceps femoris, semitendinosus, and semimembranosus.',
                    benefits: ['Improved lower body strength', 'Enhanced knee stability', 'Reduced injury risk'],
                    recommendedFrequency: '2 times per week',
                    relatedCategories: [8, 10],
                    imageUrl: '/assets/muscle-groups/hamstrings.jpg',
                    examples: ['Deadlift', 'Leg Curl', 'Romanian Deadlift', 'Good Morning']
                }
            },
            {
                name: 'Glutes',
                description: 'Gluteal muscles that make up the buttocks.',
                type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP,
                displayOrder: 10,
                metadata: {
                    aliases: ['Buttocks', 'Gluteals'],
                    anatomicalInfo: 'The glutes include the gluteus maximus, gluteus medius, and gluteus minimus.',
                    benefits: ['Improved lower body strength', 'Enhanced hip stability', 'Better posture'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [8, 9],
                    imageUrl: '/assets/muscle-groups/glutes.jpg',
                    examples: ['Hip Thrust', 'Glute Bridge', 'Bulgarian Split Squat', 'Step-up']
                }
            }
        ];
        const exerciseTypesData = [
            {
                name: 'Strength_Compound',
                description: 'Multi-joint exercises that work multiple muscle groups simultaneously.',
                type: ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN,
                displayOrder: 11,
                metadata: {
                    aliases: ['Compound Lifts', 'Multi-joint Exercises'],
                    anatomicalInfo: 'Engages multiple muscle groups and joints in a single movement.',
                    benefits: ['Maximum strength development', 'Efficient workouts', 'Functional movement patterns'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [12, 15],
                    imageUrl: '/assets/exercise-types/compound.jpg',
                    examples: ['Squat', 'Deadlift', 'Bench Press', 'Pull-ups']
                }
            },
            {
                name: 'Strength_Isolation',
                description: 'Single-joint exercises that target specific muscle groups.',
                type: ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN,
                displayOrder: 12,
                metadata: {
                    aliases: ['Isolation Exercises', 'Single-joint Movements'],
                    anatomicalInfo: 'Focuses on a single muscle group and typically involves movement at only one joint.',
                    benefits: ['Targeted muscle development', 'Muscular imbalance correction', 'Joint-specific conditioning'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [11, 15],
                    imageUrl: '/assets/exercise-types/isolation.jpg',
                    examples: ['Bicep Curl', 'Leg Extension', 'Lateral Raise', 'Tricep Extension']
                }
            },
            {
                name: 'Cardio',
                description: 'Exercises that elevate heart rate and improve cardiovascular fitness.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 13,
                metadata: {
                    aliases: ['Aerobic Exercise', 'Endurance Training'],
                    anatomicalInfo: 'Primarily challenges the cardiovascular and respiratory systems.',
                    benefits: ['Improved cardiovascular health', 'Enhanced endurance', 'Caloric expenditure'],
                    recommendedFrequency: '3-5 times per week',
                    relatedCategories: [19, 29],
                    imageUrl: '/assets/exercise-types/cardio.jpg',
                    examples: ['Running', 'Cycling', 'Rowing', 'Jumping Rope']
                }
            },
            {
                name: 'Core',
                description: 'Exercises that specifically target the core muscles.',
                type: ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN,
                displayOrder: 14,
                metadata: {
                    aliases: ['Abdominal Training', 'Midsection Work'],
                    anatomicalInfo: 'Engages the abdominal, oblique, and lower back muscles.',
                    benefits: ['Improved core stability', 'Better posture', 'Enhanced functional strength'],
                    recommendedFrequency: '3-4 times per week',
                    relatedCategories: [7, 30],
                    imageUrl: '/assets/exercise-types/core.jpg',
                    examples: ['Plank', 'Crunch', 'Russian Twist', 'Dead Bug']
                }
            },
            {
                name: 'Power',
                description: 'Explosive exercises that develop force production capabilities.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 15,
                metadata: {
                    aliases: ['Explosive Training', 'Force Development'],
                    anatomicalInfo: 'Focuses on fast-twitch muscle fibers and rate of force development.',
                    benefits: ['Increased power output', 'Enhanced athletic performance', 'Fast-twitch muscle development'],
                    recommendedFrequency: '1-2 times per week',
                    relatedCategories: [11, 16],
                    imageUrl: '/assets/exercise-types/power.jpg',
                    examples: ['Power Clean', 'Box Jump', 'Medicine Ball Throw', 'Kettlebell Swing']
                }
            },
            {
                name: 'Plyometric',
                description: 'Jumping and explosive movements that utilize the stretch-shortening cycle.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 16,
                metadata: {
                    aliases: ['Jump Training', 'Reactive Training'],
                    anatomicalInfo: 'Utilizes the elastic energy stored in muscles during eccentric contraction.',
                    benefits: ['Improved explosive power', 'Enhanced athletic performance', 'Increased caloric burn'],
                    recommendedFrequency: '1-2 times per week',
                    relatedCategories: [15, 25],
                    imageUrl: '/assets/exercise-types/plyometric.jpg',
                    examples: ['Box Jumps', 'Burpees', 'Jump Squats', 'Plyo Push-ups']
                }
            },
            {
                name: 'Flexibility',
                description: 'Exercises that improve joint range of motion and muscle elasticity.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 17,
                metadata: {
                    aliases: ['Stretching', 'Mobility Work'],
                    anatomicalInfo: 'Targets muscle fascia, tendons, and joint capsules to improve extensibility.',
                    benefits: ['Increased range of motion', 'Reduced injury risk', 'Enhanced recovery'],
                    recommendedFrequency: '5-7 times per week',
                    relatedCategories: [19, 28],
                    imageUrl: '/assets/exercise-types/flexibility.jpg',
                    examples: ['Static Stretching', 'Dynamic Stretching', 'Yoga Poses', 'PNF Stretching']
                }
            },
            {
                name: 'Balance',
                description: 'Exercises that challenge and improve stability and proprioception.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 18,
                metadata: {
                    aliases: ['Stability Training', 'Proprioceptive Exercise'],
                    anatomicalInfo: 'Engages the vestibular system and stabilizing muscles throughout the body.',
                    benefits: ['Improved balance', 'Enhanced joint stability', 'Better neuromuscular coordination'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [30, 14],
                    imageUrl: '/assets/exercise-types/balance.jpg',
                    examples: ['Single-leg Stance', 'Bosu Ball Exercises', 'Stability Ball Work', 'Balance Board']
                }
            },
            {
                name: 'Recovery',
                description: 'Low-intensity exercises designed to promote recovery and regeneration.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 19,
                metadata: {
                    aliases: ['Active Recovery', 'Regeneration'],
                    anatomicalInfo: 'Promotes blood flow to muscles without causing significant fatigue.',
                    benefits: ['Enhanced recovery', 'Reduced muscle soreness', 'Improved blood flow'],
                    recommendedFrequency: 'As needed, often 1-2 times per week',
                    relatedCategories: [17, 22],
                    imageUrl: '/assets/exercise-types/recovery.jpg',
                    examples: ['Light Swimming', 'Walking', 'Foam Rolling', 'Gentle Yoga']
                }
            },
            {
                name: 'Sport_Specific',
                description: 'Exercises designed to enhance performance in specific sports or activities.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 20,
                metadata: {
                    aliases: ['Sport Conditioning', 'Athletic Training'],
                    anatomicalInfo: 'Targets movement patterns and energy systems specific to a particular sport.',
                    benefits: ['Improved sport performance', 'Sport-specific skill development', 'Targeted conditioning'],
                    recommendedFrequency: 'Varies by sport and season',
                    relatedCategories: [15, 16, 21],
                    imageUrl: '/assets/exercise-types/sport-specific.jpg',
                    examples: ['Agility Drills', 'Sport-specific Movements', 'Skill Practice', 'Game Simulation']
                }
            }
        ];
        const specialCategoriesData = [
            {
                name: 'Functional',
                description: 'Exercises that mimic real-world movements and improve daily activities.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 21,
                metadata: {
                    aliases: ['Functional Training', 'Movement Training'],
                    anatomicalInfo: 'Engages multiple muscles in patterns that reflect everyday movements.',
                    benefits: ['Improved daily movement patterns', 'Enhanced quality of life', 'Reduced injury risk'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [11, 30],
                    imageUrl: '/assets/special/functional.jpg',
                    examples: ['Farmer\'s Carry', 'Suitcase Carry', 'Turkish Get-up', 'Step-ups']
                }
            },
            {
                name: 'Rehabilitation',
                description: 'Exercises designed to help recover from injury or surgery.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 22,
                metadata: {
                    aliases: ['Rehab', 'Injury Recovery'],
                    anatomicalInfo: 'Targets specific tissues that need strengthening or mobility after injury.',
                    benefits: ['Restored function', 'Pain reduction', 'Gradual strength rebuilding'],
                    recommendedFrequency: 'As prescribed, often daily',
                    relatedCategories: [19, 28],
                    imageUrl: '/assets/special/rehabilitation.jpg',
                    examples: ['Isometric Holds', 'Band Exercises', 'ROM Drills', 'Targeted Activation']
                }
            },
            {
                name: 'Beginner_Friendly',
                description: 'Exercises with simple movement patterns suitable for beginners.',
                type: ExerciseCategory_1.CategoryType.EXPERIENCE_LEVEL,
                displayOrder: 23,
                metadata: {
                    aliases: ['Novice Level', 'Introductory Exercises'],
                    anatomicalInfo: 'Focuses on fundamental movement patterns with lower technical demands.',
                    benefits: ['Skill development', 'Confidence building', 'Foundational strength'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [26, 12],
                    imageUrl: '/assets/special/beginner.jpg',
                    examples: ['Machine Exercises', 'Bodyweight Basics', 'Simple Dumbbell Movements', 'Walking']
                }
            },
            {
                name: 'Advanced',
                description: 'Complex exercises requiring significant skill, strength, or experience.',
                type: ExerciseCategory_1.CategoryType.EXPERIENCE_LEVEL,
                displayOrder: 24,
                metadata: {
                    aliases: ['Expert Level', 'Elite Training'],
                    anatomicalInfo: 'Challenges multiple systems simultaneously with advanced movement patterns.',
                    benefits: ['Advanced skill development', 'Plateau breaking', 'Performance optimization'],
                    recommendedFrequency: '2-4 times per week based on recovery capacity',
                    relatedCategories: [15, 20],
                    imageUrl: '/assets/special/advanced.jpg',
                    examples: ['Olympic Lifts', 'Advanced Gymnastics', 'Complex Combined Movements', 'Heavy Lifts']
                }
            },
            {
                name: 'HIIT',
                description: 'High-Intensity Interval Training combining intense work periods with brief rest.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 25,
                metadata: {
                    aliases: ['Interval Training', 'Metabolic Conditioning'],
                    anatomicalInfo: 'Maximizes both aerobic and anaerobic energy systems through varied intensity.',
                    benefits: ['Time efficiency', 'Metabolic boost', 'Cardiovascular and strength improvements'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [13, 16],
                    imageUrl: '/assets/special/hiit.jpg',
                    examples: ['Tabata Intervals', 'EMOM Workouts', 'AMRAP Circuits', 'Sprint Intervals']
                }
            },
            {
                name: 'Bodyweight',
                description: 'Exercises performed using only your bodyweight as resistance.',
                type: ExerciseCategory_1.CategoryType.EQUIPMENT,
                displayOrder: 26,
                metadata: {
                    aliases: ['Calisthenics', 'No-Equipment Training'],
                    anatomicalInfo: 'Uses gravity and body position to create resistance for muscles.',
                    benefits: ['No equipment needed', 'Accessible anywhere', 'Functional strength development'],
                    recommendedFrequency: '3-5 times per week',
                    relatedCategories: [23, 27],
                    imageUrl: '/assets/special/bodyweight.jpg',
                    examples: ['Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Planks']
                }
            },
            {
                name: 'Equipment_Based',
                description: 'Exercises requiring specific equipment to perform effectively.',
                type: ExerciseCategory_1.CategoryType.EQUIPMENT,
                displayOrder: 27,
                metadata: {
                    aliases: ['Machine Work', 'Free Weights'],
                    anatomicalInfo: 'Uses external load or mechanical advantage to create specific resistance patterns.',
                    benefits: ['Progressive overload options', 'Targeted resistance application', 'Specialized training'],
                    recommendedFrequency: '3-4 times per week',
                    relatedCategories: [26, 11],
                    imageUrl: '/assets/special/equipment.jpg',
                    examples: ['Barbell Exercises', 'Machine Work', 'Cable Exercises', 'Specialty Equipment Movements']
                }
            },
            {
                name: 'Mobility',
                description: 'Exercises focused on improving joint mobility and movement quality.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 28,
                metadata: {
                    aliases: ['Joint Mobility', 'Movement Prep'],
                    anatomicalInfo: 'Addresses joint function, tissue quality, and motor control together.',
                    benefits: ['Improved movement patterns', 'Joint health', 'Injury prevention'],
                    recommendedFrequency: '4-7 times per week',
                    relatedCategories: [17, 22],
                    imageUrl: '/assets/special/mobility.jpg',
                    examples: ['Joint Circles', 'Controlled Articular Rotations', 'Mobility Flows', 'Dynamic Stretching']
                }
            },
            {
                name: 'Endurance',
                description: 'Exercises designed to improve muscular or cardiovascular endurance.',
                type: ExerciseCategory_1.CategoryType.GOAL,
                displayOrder: 29,
                metadata: {
                    aliases: ['Stamina Training', 'Long-duration Exercise'],
                    anatomicalInfo: 'Develops slow-twitch muscle fibers and cardiovascular efficiency.',
                    benefits: ['Improved stamina', 'Fatigue resistance', 'Aerobic capacity development'],
                    recommendedFrequency: '3-5 times per week',
                    relatedCategories: [13, 19],
                    imageUrl: '/assets/special/endurance.jpg',
                    examples: ['Long-distance Running', 'High-rep Strength Work', 'Circuit Training', 'Extended Intervals']
                }
            },
            {
                name: 'Stability',
                description: 'Exercises that challenge and improve joint and core stability.',
                type: ExerciseCategory_1.CategoryType.SPECIAL,
                displayOrder: 30,
                metadata: {
                    aliases: ['Stabilization Training', 'Anti-Movement Work'],
                    anatomicalInfo: 'Focuses on muscles that maintain joint position during forces or movements.',
                    benefits: ['Improved proprioception', 'Better movement control', 'Reduced injury risk'],
                    recommendedFrequency: '2-3 times per week',
                    relatedCategories: [14, 18],
                    imageUrl: '/assets/special/stability.jpg',
                    examples: ['Single-leg Exercises', 'Unstable Surface Training', 'Anti-rotation Movements', 'Isometric Holds']
                }
            }
        ];
        const allCategoriesData = [
            ...muscleGroupsData,
            ...exerciseTypesData,
            ...specialCategoriesData
        ];
        for (const categoryData of allCategoriesData) {
            const category = new ExerciseCategory_1.ExerciseCategory();
            Object.assign(category, categoryData);
            await categoryRepository.save(category);
        }
        logger_1.default.info(`Successfully seeded ${allCategoriesData.length} exercise categories (10 muscle groups, 10 exercise types, 10 special categories)`);
    }
    catch (error) {
        logger_1.default.error('Error seeding exercise categories:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExerciseCategories.js.map