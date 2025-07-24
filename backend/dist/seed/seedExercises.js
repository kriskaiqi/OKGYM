"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExercises = seedExercises;
exports.updateExerciseStats = updateExerciseStats;
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const data_source_1 = require("../data-source");
const Enums_1 = require("../models/shared/Enums");
const Equipment_1 = require("../models/Equipment");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
const generateExerciseStats = () => {
    const ratingCount = Math.floor(Math.random() * 200) + 50;
    const ratingValue = parseFloat((Math.random() * 2 + 3).toFixed(1));
    const star5 = Math.floor(ratingCount * (0.4 + Math.random() * 0.3));
    const star4 = Math.floor(ratingCount * (0.2 + Math.random() * 0.2));
    const star3 = Math.floor(ratingCount * (0.05 + Math.random() * 0.15));
    const star2 = Math.floor(ratingCount * (0.02 + Math.random() * 0.08));
    let star1 = ratingCount - (star5 + star4 + star3 + star2);
    star1 = Math.max(0, star1);
    const caloriesAvg = Math.floor(Math.random() * 150) + 50;
    const caloriesMin = Math.floor(caloriesAvg * (0.5 + Math.random() * 0.3));
    const caloriesMax = Math.floor(caloriesAvg * (1.2 + Math.random() * 0.8));
    const durationAvg = Math.floor(Math.random() * 300) + 120;
    const durationMin = Math.floor(durationAvg * (0.5 + Math.random() * 0.3));
    const durationMax = Math.floor(durationAvg * (1.2 + Math.random() * 0.8));
    const completionRate = parseFloat((Math.random() * 0.3 + 0.65).toFixed(2));
    const completionTotal = Math.floor(Math.random() * 1000) + 200;
    const completionSuccessful = Math.floor(completionTotal * completionRate);
    const popularityScore = Math.floor(Math.random() * 80) + 20;
    const trends = ['up', 'stable', 'down'];
    const popularityTrend = trends[Math.floor(Math.random() * trends.length)];
    return {
        rating: {
            count: ratingCount,
            value: ratingValue,
            distribution: {
                '1': star1,
                '2': star2,
                '3': star3,
                '4': star4,
                '5': star5
            }
        },
        calories: {
            avg: caloriesAvg,
            min: caloriesMin,
            max: caloriesMax
        },
        duration: {
            avg: durationAvg,
            min: durationMin,
            max: durationMax
        },
        completion: {
            rate: completionRate,
            total: completionTotal,
            successful: completionSuccessful
        },
        popularity: {
            score: popularityScore,
            trend: popularityTrend,
            lastUpdated: new Date()
        }
    };
};
async function seedExercises() {
    try {
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const existingCount = await exerciseRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} exercises. Checking for duplicates.`);
        }
        const muscleGroupCategories = await categoryRepository.find({
            where: { type: ExerciseCategory_1.CategoryType.MUSCLE_GROUP }
        });
        if (muscleGroupCategories.length === 0) {
            logger_1.default.warn('No muscle group categories found. Exercises will be created without muscle group associations.');
        }
        const allEquipment = await equipmentRepository.find();
        const findEquipmentByName = (name) => {
            return allEquipment.find(equipment => equipment.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(equipment.name.toLowerCase()));
        };
        const createMuscleGroup = (primary, secondary = []) => {
            return {
                primary,
                secondary
            };
        };
        const exercisesData = [
            {
                name: 'Push-up',
                description: 'A classic bodyweight exercise that works your chest, shoulders, and triceps.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                synergistMuscleGroups: ['CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                        secondary: ['CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Start in a plank position with hands slightly wider than shoulder-width apart, fingers pointing forward, and arms extended."],
                        steps: [
                            "Lower your body by bending your elbows until your chest nearly touches the floor.",
                            "Keep your elbows at about a 45-degree angle to your body.",
                            "Maintain a straight line from head to heels throughout the movement.",
                            "Push through your palms to extend your arms and return to the starting position."
                        ],
                        tempo: "Inhale as you lower, exhale as you push up.",
                        keyPoints: ["Maintain body alignment", "Control the movement"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Don't let your hips sag or pike upward.",
                            "Keep your neck in a neutral position, eyes looking slightly ahead.",
                            "If too difficult, perform from knees or against an elevated surface."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Dumbbell Bench Press',
                description: 'A chest exercise that allows for a greater range of motion than barbell bench press.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                synergistMuscleGroups: ['CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Bench Press'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                        secondary: ['CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Lie on a flat bench with a dumbbell in each hand, positioned at chest level with palms facing forward."],
                        steps: [
                            "Press the dumbbells upward until your arms are fully extended, with the weights directly over your shoulders.",
                            "Keep your wrists straight and dumbbells parallel.",
                            "Lower the weights with control to the starting position, allowing a slight stretch in your chest."
                        ],
                        tempo: "Inhale as you lower the weights, exhale as you press up.",
                        keyPoints: ["Maintain wrist straight", "Keep dumbbells parallel"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your feet flat on the floor for stability.",
                            "Maintain a natural arch in your lower back.",
                            "Don't bounce the weights off your chest."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Barbell Bench Press',
                description: 'A fundamental compound exercise that targets the chest, front deltoids, and triceps.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                synergistMuscleGroups: ['CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Bench Press'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                        secondary: ['CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Lie on a flat bench with feet planted firmly on the ground",
                            "Grip the barbell slightly wider than shoulder-width apart",
                            "Unrack the bar and position it above your chest with arms fully extended"
                        ],
                        steps: [
                            "Lower the bar with control to your mid-chest, keeping elbows at about 45 degrees",
                            "Touch the bar lightly to your chest at the bottom of the movement",
                            "Press the bar back up to the starting position, focusing on pushing through your chest"
                        ],
                        tempo: "Inhale as you lower, exhale as you press",
                        keyPoints: [
                            "Maintain stable shoulder position",
                            "Keep feet planted throughout"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Always use a spotter for heavy sets",
                            "Avoid if experiencing shoulder pain"
                        ],
                        tips: [
                            "Keep wrists straight and elbows tucked",
                            "Maintain natural arch in lower back",
                            "Drive feet into the ground for stability"
                        ],
                        prerequisites: [
                            "Proper shoulder mobility",
                            "Core stability"
                        ]
                    }
                }
            },
            {
                name: 'Incline Dumbbell Press',
                description: 'A variation of the dumbbell press that emphasizes the upper chest muscles.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                synergistMuscleGroups: ['CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Adjustable Bench'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                        secondary: ['CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Set bench to 30-45 degree angle",
                            "Sit with back firmly against the bench",
                            "Hold dumbbells at shoulder level with palms facing forward"
                        ],
                        steps: [
                            "Press dumbbells up and slightly inward until arms are extended",
                            "Lower the weights with control back to starting position",
                            "Maintain slight bend in elbows at top of movement"
                        ],
                        tempo: "Inhale during lowering, exhale during press",
                        keyPoints: [
                            "Keep core engaged",
                            "Control the weights throughout"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if experiencing shoulder impingement",
                            "Don't go too heavy initially"
                        ],
                        tips: [
                            "Keep back pressed against bench",
                            "Don't arch excessively",
                            "Control the descent"
                        ],
                        prerequisites: [
                            "Shoulder stability",
                            "Basic pressing strength"
                        ]
                    }
                }
            },
            {
                name: 'Decline Push-up',
                description: 'A push-up variation with feet elevated that emphasizes the lower chest.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                synergistMuscleGroups: ['CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bench', 'Box'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                        secondary: ['CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Place feet on elevated surface (bench or box)",
                            "Position hands slightly wider than shoulders",
                            "Maintain straight line from head to heels"
                        ],
                        steps: [
                            "Lower chest toward ground by bending elbows",
                            "Keep core tight and body straight",
                            "Push back up to starting position"
                        ],
                        tempo: "Inhale during lowering, exhale during push",
                        keyPoints: [
                            "Maintain straight body alignment",
                            "Keep core engaged throughout"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Higher stress on shoulders than regular push-ups",
                            "Increased difficulty due to leverage"
                        ],
                        tips: [
                            "Start with lower elevation",
                            "Keep elbows at 45-degree angle",
                            "Look at floor to maintain neutral neck"
                        ],
                        prerequisites: [
                            "Mastery of regular push-ups",
                            "Good core strength"
                        ]
                    }
                }
            },
            {
                name: 'Cable Fly',
                description: 'An isolation exercise that targets the chest muscles through a full range of motion with constant tension.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST'],
                synergistMuscleGroups: ['SHOULDERS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine'],
                form: {
                    muscles: {
                        primary: ['CHEST'],
                        secondary: ['SHOULDERS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Set cable pulleys at shoulder height",
                            "Stand in center of cable machine",
                            "Grab handles with slight bend in elbows"
                        ],
                        steps: [
                            "Step forward slightly and bring arms forward and together",
                            "Keep slight bend in elbows throughout movement",
                            "Control the return to starting position",
                            "Focus on chest squeeze at peak contraction"
                        ],
                        tempo: "Exhale during fly motion, inhale during return",
                        keyPoints: [
                            "Maintain consistent tension",
                            "Keep chest up throughout"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Don't lock elbows",
                            "Avoid excessive weight"
                        ],
                        tips: [
                            "Maintain slight forward lean",
                            "Keep movement smooth and controlled",
                            "Focus on feeling chest stretch and squeeze"
                        ],
                        prerequisites: [
                            "Good shoulder mobility",
                            "Basic chest strength"
                        ]
                    }
                }
            },
            {
                name: 'Dumbbell Pullover',
                description: 'A unique chest exercise that also engages the lats and serratus anterior.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['CHEST', 'BACK'],
                synergistMuscleGroups: ['TRICEPS', 'SHOULDERS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell', 'Bench'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'BACK'],
                        secondary: ['TRICEPS', 'SHOULDERS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Lie across bench with shoulders supported",
                            "Hold dumbbell with both hands above chest",
                            "Keep slight bend in elbows"
                        ],
                        steps: [
                            "Lower weight in arc motion behind head",
                            "Keep arms relatively straight but not locked",
                            "Return to starting position in controlled arc",
                            "Maintain stable shoulder position throughout"
                        ],
                        tempo: "Inhale during lowering, exhale during return",
                        keyPoints: [
                            "Control the weight throughout",
                            "Maintain arm position"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Don't go too heavy initially",
                            "Avoid if shoulder mobility is limited"
                        ],
                        tips: [
                            "Start with lighter weight to master form",
                            "Keep core engaged throughout",
                            "Don't let lower back arch"
                        ],
                        prerequisites: [
                            "Good shoulder mobility",
                            "Core stability"
                        ]
                    }
                }
            },
            {
                name: 'Chest Dip',
                description: 'An advanced bodyweight exercise that targets the lower chest, triceps, and front deltoids.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.ADVANCED,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['CHEST', 'TRICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dip Bars'],
                form: {
                    muscles: {
                        primary: ['CHEST', 'TRICEPS'],
                        secondary: ['SHOULDERS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Grip dip bars with arms straight",
                            "Lean torso slightly forward",
                            "Keep chest up and shoulders back"
                        ],
                        steps: [
                            "Lower body by bending elbows",
                            "Keep slight forward lean for chest emphasis",
                            "Lower until upper arms are parallel to ground",
                            "Push back up to starting position"
                        ],
                        tempo: "Inhale during lowering, exhale during push",
                        keyPoints: [
                            "Maintain forward lean",
                            "Control the descent"
                        ]
                    },
                    safety: {
                        cautions: [
                            "High stress on shoulders",
                            "Advanced movement - not for beginners"
                        ],
                        tips: [
                            "Start with assisted dips if needed",
                            "Don't go too deep if shoulder mobility is limited",
                            "Keep core engaged throughout"
                        ],
                        prerequisites: [
                            "Strong pushing strength",
                            "Shoulder stability",
                            "Good tricep strength"
                        ]
                    }
                }
            },
            {
                name: 'Pull-up',
                description: 'A compound exercise that primarily targets the back muscles, particularly the latissimus dorsi.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'BICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Pull-up Bar'],
                form: {
                    muscles: {
                        primary: ['BACK', 'BICEPS'],
                        secondary: ['SHOULDERS', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Hang from a pull-up bar with hands slightly wider than shoulder-width apart, palms facing away from you."],
                        steps: [
                            "Initiate the movement by pulling your shoulder blades down and back",
                            "Pull your body up until your chin clears the bar",
                            "Lower yourself with control back to the starting position"
                        ],
                        tempo: "Exhale as you pull up, inhale as you lower",
                        keyPoints: [
                            "Keep core engaged throughout",
                            "Maintain controlled movement"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have shoulder injuries",
                            "Start with assisted variations if needed"
                        ],
                        tips: [
                            "Keep shoulders down and back",
                            "Avoid swinging or kipping",
                            "Focus on using back muscles to initiate the pull"
                        ],
                        prerequisites: [
                            "Basic shoulder mobility",
                            "Sufficient upper body strength"
                        ]
                    }
                }
            },
            {
                name: 'Lat Pulldown',
                description: 'A machine-based exercise that targets the latissimus dorsi and other back muscles.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'BICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Lat Pulldown Bar'],
                form: {
                    muscles: {
                        primary: ['BACK', 'BICEPS'],
                        secondary: ['SHOULDERS', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Sit at the lat pulldown machine with knees secured under the pads",
                            "Grip the bar slightly wider than shoulder-width apart",
                            "Keep chest up and core engaged"
                        ],
                        steps: [
                            "Pull the bar down towards your upper chest",
                            "Keep elbows close to your body",
                            "Squeeze your back muscles at the bottom",
                            "Return the bar to starting position with control"
                        ],
                        tempo: "Exhale as you pull down, inhale as you return",
                        keyPoints: [
                            "Keep chest up throughout",
                            "Focus on pulling with back muscles"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have shoulder injuries",
                            "Don't lean back excessively"
                        ],
                        tips: [
                            "Keep shoulders down and back",
                            "Maintain controlled movement",
                            "Don't use momentum to pull the weight"
                        ],
                        prerequisites: [
                            "Basic shoulder mobility",
                            "Proper machine setup knowledge"
                        ]
                    }
                }
            },
            {
                name: 'Seated Row',
                description: 'A machine-based exercise that targets the middle and upper back muscles.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'BICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Row Handle'],
                form: {
                    muscles: {
                        primary: ['BACK', 'BICEPS'],
                        secondary: ['SHOULDERS', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Sit at the row machine with chest against the pad",
                            "Grip the handles with arms extended",
                            "Keep back straight and core engaged"
                        ],
                        steps: [
                            "Pull the handles towards your lower chest",
                            "Squeeze your shoulder blades together",
                            "Return to starting position with control",
                            "Keep elbows close to your body"
                        ],
                        tempo: "Exhale as you pull, inhale as you return",
                        keyPoints: [
                            "Keep chest against pad",
                            "Focus on squeezing shoulder blades"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have back injuries",
                            "Maintain proper posture"
                        ],
                        tips: [
                            "Keep back straight throughout",
                            "Don't use momentum",
                            "Focus on controlled movement"
                        ],
                        prerequisites: [
                            "Basic back mobility",
                            "Proper machine setup knowledge"
                        ]
                    }
                }
            },
            {
                name: 'Bent-Over Row',
                description: 'A compound exercise that targets the entire back while also engaging the posterior chain.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'BICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS', 'HAMSTRINGS', 'GLUTES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Dumbbells'],
                form: {
                    muscles: {
                        primary: ['BACK', 'BICEPS'],
                        secondary: ['SHOULDERS', 'FOREARMS', 'HAMSTRINGS', 'GLUTES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST', 'HIP']
                    },
                    execution: {
                        setup: [
                            "Stand with feet shoulder-width apart",
                            "Hinge at hips and bend knees slightly",
                            "Hold barbell or dumbbells with arms extended",
                            "Keep back straight and core engaged"
                        ],
                        steps: [
                            "Pull the weight towards your lower chest",
                            "Keep elbows close to your body",
                            "Squeeze shoulder blades together at the top",
                            "Lower the weight with control"
                        ],
                        tempo: "Exhale as you pull, inhale as you lower",
                        keyPoints: [
                            "Maintain neutral spine",
                            "Keep chest up throughout"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have back injuries",
                            "Maintain proper form to prevent injury"
                        ],
                        tips: [
                            "Keep back straight throughout",
                            "Don't round your shoulders",
                            "Start with lighter weights to master form"
                        ],
                        prerequisites: [
                            "Good hip hinge mobility",
                            "Basic back strength"
                        ]
                    }
                }
            },
            {
                name: 'T-Bar Row',
                description: 'A compound exercise that targets the middle and upper back with a unique grip position.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'BICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['T-Bar Row Machine', 'Weight Plates'],
                form: {
                    muscles: {
                        primary: ['BACK', 'BICEPS'],
                        secondary: ['SHOULDERS', 'FOREARMS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST', 'SPINE']
                    },
                    execution: {
                        setup: [
                            "Position yourself on the T-bar row machine",
                            "Place chest against the pad",
                            "Grip the handles with a neutral grip",
                            "Keep back straight and core engaged"
                        ],
                        steps: [
                            "Pull the weight towards your chest",
                            "Squeeze shoulder blades together at the top",
                            "Lower the weight with control",
                            "Keep elbows close to your body"
                        ],
                        tempo: "Exhale as you pull, inhale as you lower",
                        keyPoints: [
                            "Maintain neutral spine",
                            "Focus on squeezing back muscles"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have back injuries",
                            "Maintain proper form throughout"
                        ],
                        tips: [
                            "Keep chest against pad",
                            "Don't use momentum",
                            "Start with lighter weights"
                        ],
                        prerequisites: [
                            "Basic back strength",
                            "Proper machine setup knowledge"
                        ]
                    }
                }
            },
            {
                name: 'Face Pull',
                description: 'An upper back exercise that targets the rear deltoids and upper back muscles, important for posture.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['SHOULDERS', 'BACK'],
                synergistMuscleGroups: ['FOREARMS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Rope Attachment'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS', 'BACK'],
                        secondary: ['FOREARMS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Attach rope to high pulley",
                            "Stand facing the machine",
                            "Grip rope with palms facing each other",
                            "Step back to create tension"
                        ],
                        steps: [
                            "Pull the rope towards your face",
                            "Separate the rope ends as you pull",
                            "Squeeze shoulder blades together",
                            "Return to starting position with control"
                        ],
                        tempo: "Exhale as you pull, inhale as you return",
                        keyPoints: [
                            "Keep elbows high",
                            "Focus on rear deltoid activation"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have shoulder injuries",
                            "Maintain proper posture"
                        ],
                        tips: [
                            "Keep core engaged",
                            "Don't use momentum",
                            "Focus on controlled movement"
                        ],
                        prerequisites: [
                            "Basic shoulder mobility",
                            "Proper cable machine setup knowledge"
                        ]
                    }
                }
            },
            {
                name: 'Straight-Arm Pulldown',
                description: 'An isolation exercise that targets the lats while keeping the arms straight throughout the movement.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK'],
                synergistMuscleGroups: ['CHEST', 'SHOULDERS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Straight Bar'],
                form: {
                    muscles: {
                        primary: ['BACK'],
                        secondary: ['CHEST', 'SHOULDERS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Stand facing the cable machine",
                            "Grip the bar with hands slightly wider than shoulder-width",
                            "Keep arms straight but not locked",
                            "Maintain slight bend in knees"
                        ],
                        steps: [
                            "Pull the bar down towards your thighs",
                            "Keep arms straight throughout",
                            "Focus on squeezing lats at bottom",
                            "Return to starting position with control"
                        ],
                        tempo: "Exhale as you pull down, inhale as you return",
                        keyPoints: [
                            "Keep arms straight",
                            "Focus on lat activation"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have shoulder injuries",
                            "Don't lock elbows"
                        ],
                        tips: [
                            "Keep core engaged",
                            "Maintain controlled movement",
                            "Don't use momentum"
                        ],
                        prerequisites: [
                            "Basic shoulder mobility",
                            "Proper cable machine setup knowledge"
                        ]
                    }
                }
            },
            {
                name: 'Lateral Raise',
                description: 'An isolation exercise that targets the lateral deltoids to develop shoulder width.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['SHOULDERS'],
                synergistMuscleGroups: [],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing forward."],
                        steps: [
                            "Raise the dumbbells out to the sides until they are parallel to the ground.",
                            "Lower the weights with control back to the starting position."
                        ],
                        tempo: "Exhale as you raise, inhale as you lower.",
                        keyPoints: ["Maintain upper arms stationary", "Use controlled tempo"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your elbows slightly bent throughout the movement.",
                            "Maintain a neutral spine throughout the movement.",
                            "Use a controlled tempo throughout the movement."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Front Raise',
                description: 'An isolation exercise that targets the anterior deltoids at the front of the shoulders.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['SHOULDERS'],
                synergistMuscleGroups: [],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing forward."],
                        steps: [
                            "Raise the dumbbells out in front until they are parallel to the ground.",
                            "Lower the weights with control back to the starting position."
                        ],
                        tempo: "Exhale as you raise, inhale as you lower.",
                        keyPoints: ["Maintain upper arms stationary", "Use controlled tempo"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your elbows slightly bent throughout the movement.",
                            "Maintain a neutral spine throughout the movement.",
                            "Use a controlled tempo throughout the movement."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Dumbbell Shoulder Press',
                description: 'A compound exercise that targets the deltoids and builds overall shoulder strength.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['SHOULDERS'],
                synergistMuscleGroups: ['TRICEPS', 'UPPER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS'],
                        secondary: ['TRICEPS', 'UPPER_BACK']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Sit on a bench with back support or stand with feet shoulder-width apart",
                            "Hold dumbbells at shoulder level with palms facing forward",
                            "Keep core engaged and maintain neutral spine"
                        ],
                        steps: [
                            "Press the dumbbells overhead until arms are fully extended",
                            "Keep the weights aligned with shoulders throughout the movement",
                            "Lower the weights with control back to shoulder level",
                            "Maintain stable shoulder position throughout"
                        ],
                        tempo: "Exhale as you press, inhale as you lower",
                        keyPoints: [
                            "Keep core engaged",
                            "Maintain neutral spine"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if experiencing shoulder impingement",
                            "Don't arch lower back"
                        ],
                        tips: [
                            "Start with lighter weights to master form",
                            "Keep shoulders down away from ears",
                            "Don't lock out elbows at top"
                        ],
                        prerequisites: [
                            "Good shoulder mobility",
                            "Basic pressing strength",
                            "Core stability"
                        ]
                    }
                }
            },
            {
                name: 'Military Press',
                description: 'A strict overhead pressing movement that builds shoulder strength and stability.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['SHOULDERS'],
                synergistMuscleGroups: ['TRICEPS', 'UPPER_BACK', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS'],
                        secondary: ['TRICEPS', 'UPPER_BACK', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            "Stand with feet shoulder-width apart",
                            "Hold barbell at shoulder level with hands just outside shoulders",
                            "Keep core tight and glutes engaged"
                        ],
                        steps: [
                            "Press the barbell overhead while keeping core tight",
                            "As bar clears head, push head slightly forward",
                            "Continue pressing until arms are fully extended overhead",
                            "Lower the bar with control back to shoulder level"
                        ],
                        tempo: "Exhale on press, inhale on lower",
                        keyPoints: [
                            "Maintain rigid core",
                            "Keep bar path close to face"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid excessive back arch",
                            "Don't press behind neck"
                        ],
                        tips: [
                            "Start with lighter weight to perfect form",
                            "Keep wrists straight throughout movement",
                            "Engage core and glutes for stability"
                        ],
                        prerequisites: [
                            "Good shoulder mobility",
                            "Core strength",
                            "Basic pressing mechanics"
                        ]
                    }
                }
            },
            {
                name: 'Upright Row',
                description: 'A compound exercise that targets the deltoids and upper traps using a vertical pulling motion.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['SHOULDERS', 'TRAPS'],
                synergistMuscleGroups: ['BICEPS', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Dumbbells'],
                form: {
                    muscles: {
                        primary: ['SHOULDERS', 'TRAPS'],
                        secondary: ['BICEPS', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            "Stand with feet shoulder-width apart.",
                            "Hold a barbell or dumbbells in front of your thighs with an overhand grip, slightly narrower than shoulder width."
                        ],
                        steps: [
                            "Keeping the weight close to your body, pull your elbows up and out to the sides.",
                            "Raise until the bar reaches mid-chest height.",
                            "Pause briefly at the top.",
                            "Lower the weight with control back to the starting position."
                        ],
                        tempo: "Exhale as you pull up, inhale as you lower.",
                        keyPoints: [
                            "Keep elbows above wrists throughout the movement",
                            "Maintain an upright torso",
                            "Control the descent"
                        ]
                    },
                    safety: {
                        cautions: [
                            "May aggravate shoulder impingement",
                            "Not recommended for those with existing shoulder issues"
                        ],
                        tips: [
                            "Use a wider grip to reduce shoulder impingement risk",
                            "Keep the weight close to your body",
                            "Don't raise elbows above shoulder height"
                        ],
                        prerequisites: [
                            "Good shoulder mobility",
                            "No existing shoulder impingement issues"
                        ]
                    }
                }
            },
            {
                name: 'Hammer Curl',
                description: 'A bicep curl variation that targets the brachialis and brachioradialis for complete arm development.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS', 'FOREARMS'],
                synergistMuscleGroups: ['SHOULDERS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells'],
                form: {
                    muscles: {
                        primary: ['BICEPS', 'FOREARMS'],
                        secondary: ['SHOULDERS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing your body (neutral grip)."],
                        steps: [
                            "Keeping your upper arms stationary against your sides, curl the weights towards your shoulders.",
                            "Maintain the neutral grip throughout the movement (thumbs pointing up).",
                            "Squeeze your biceps at the top of the movement.",
                            "Lower the weights with control back to the starting position."
                        ],
                        tempo: "Exhale as you curl up, inhale as you lower.",
                        keyPoints: ["Maintain upper arms stationary", "Squeeze biceps at top"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your wrists straight throughout the movement.",
                            "Avoid using momentum to lift the weights.",
                            "Maintain an upright posture."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Concentration Curl',
                description: 'An isolation exercise that maximizes bicep contraction with focused movement.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS'],
                synergistMuscleGroups: ['FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells'],
                form: {
                    muscles: {
                        primary: ['BICEPS'],
                        secondary: ['FOREARMS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Sit on a bench with legs spread apart. Hold a dumbbell in one hand, with your elbow pressed against the inner thigh of the same side."],
                        steps: [
                            "With your palm facing away from your thigh, curl the weight toward your shoulder.",
                            "Keep your upper arm stationary against your inner thigh.",
                            "Squeeze your bicep at the top of the movement.",
                            "Lower the weight with control back to the starting position.",
                            "Complete all reps on one arm before switching sides."
                        ],
                        tempo: "Exhale as you curl up, inhale as you lower.",
                        keyPoints: ["Avoid lifting your elbow off your thigh", "Keep back straight"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute back injuries"],
                        tips: [
                            "Avoid lifting your elbow off your thigh.",
                            "Keep your back straight and avoid hunching over.",
                            "Use a controlled tempo throughout the movement."
                        ],
                        prerequisites: ["Basic core stability"]
                    }
                }
            },
            {
                name: 'Preacher Curl',
                description: 'A bicep isolation exercise performed on a preacher bench to eliminate momentum and focus on the biceps.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS'],
                synergistMuscleGroups: ['FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Barbell', 'Preacher Bench'],
                form: {
                    muscles: {
                        primary: ['BICEPS'],
                        secondary: ['FOREARMS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Sit at a preacher bench with your upper arms resting on the pad. Hold a barbell or dumbbells with palms facing up."],
                        steps: [
                            "Curl the weight upward until your forearms are nearly vertical.",
                            "Squeeze your biceps at the top of the movement.",
                            "Lower the weight with control until your arms are almost fully extended.",
                            "Avoid locking out the elbows at the bottom."
                        ],
                        tempo: "Exhale as you curl up, inhale as you lower.",
                        keyPoints: ["Maintain tension", "Avoid locking out elbows"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Don't lock out your elbows at the bottom to maintain tension.",
                            "Keep your shoulders relaxed and away from your ears.",
                            "Use a weight that allows for controlled movement."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Chin-Up',
                description: 'A compound pulling exercise that primarily targets the biceps and upper back.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS', 'BACK'],
                synergistMuscleGroups: ['SHOULDERS', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Pull-up Bar'],
                form: {
                    muscles: {
                        primary: ['BICEPS', 'BACK'],
                        secondary: ['SHOULDERS', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Hang from a pull-up bar with hands shoulder-width apart and palms facing toward you (supinated grip)."],
                        steps: [
                            "Pull your body upward by flexing your elbows and pulling your elbows down.",
                            "Continue until your chin clears the bar.",
                            "Lower yourself with control until arms are fully extended at the bottom."
                        ],
                        tempo: "Exhale as you pull up, inhale as you lower.",
                        keyPoints: ["Engage core throughout the movement", "Avoid excessive swinging or kipping"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Avoid excessive swinging or kipping.",
                            "Engage your core throughout the movement.",
                            "If too difficult, use assisted chin-up variations."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Barbell Curl',
                description: 'A classic bicep exercise using a barbell to target the biceps brachii with a stable grip.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS'],
                synergistMuscleGroups: ['FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell'],
                form: {
                    muscles: {
                        primary: ['BICEPS'],
                        secondary: ['FOREARMS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand with feet shoulder-width apart, holding a barbell with an underhand grip (palms facing up) at shoulder width."],
                        steps: [
                            "Keeping your upper arms stationary against your sides, curl the barbell towards your shoulders.",
                            "Contract your biceps at the top of the movement.",
                            "Lower the barbell with control back to the starting position.",
                            "Maintain a slight bend in the elbows at the bottom to keep tension on the biceps."
                        ],
                        tempo: "Exhale as you curl up, inhale as you lower.",
                        keyPoints: ["Maintain upper arms stationary", "Keep back straight and core engaged"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries or discomfort"],
                        tips: [
                            "Keep your elbows close to your sides throughout the movement.",
                            "Avoid excessive backward lean to prevent low back strain.",
                            "Use a controlled tempo to prevent momentum and maximize bicep engagement."
                        ],
                        prerequisites: ["Basic wrist and elbow mobility"]
                    }
                }
            },
            {
                name: 'Tricep Pushdown',
                description: 'An isolation exercise that targets all three heads of the triceps using a cable machine.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['TRICEPS'],
                synergistMuscleGroups: ['SHOULDERS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine'],
                form: {
                    muscles: {
                        primary: ['TRICEPS'],
                        secondary: ['SHOULDERS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand facing a cable machine with a rope or straight bar attachment at upper chest height. Grip the attachment with both hands, elbows bent and tucked at your sides."],
                        steps: [
                            "Keeping your upper arms stationary at your sides, extend your elbows to push the attachment down.",
                            "Fully extend your arms, squeezing your triceps at the bottom of the movement.",
                            "Slowly return to the starting position, keeping tension on the triceps."
                        ],
                        tempo: "Exhale as you push down, inhale as you return.",
                        keyPoints: ["Maintain upper arms stationary", "Fully extend arms"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your elbows close to your body throughout the movement.",
                            "Maintain an upright posture with a slight forward lean.",
                            "Avoid using momentum or body weight to move the weight."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Overhead Tricep Extension',
                description: 'An isolation exercise that targets the long head of the triceps through overhead movement.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['TRICEPS'],
                synergistMuscleGroups: ['SHOULDERS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Cable Machine'],
                form: {
                    muscles: {
                        primary: ['TRICEPS'],
                        secondary: ['SHOULDERS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Stand or sit with feet shoulder-width apart. Hold a dumbbell with both hands above your head, arms fully extended."],
                        steps: [
                            "Keeping your upper arms stationary and close to your head, lower the weight behind your head by bending your elbows.",
                            "Lower until you feel a stretch in your triceps.",
                            "Extend your elbows to return the weight to the starting position, focusing on contracting your triceps."
                        ],
                        tempo: "Inhale as you lower, exhale as you extend.",
                        keyPoints: ["Maintain upper arms close to head", "Focus on triceps contraction"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your upper arms close to your head throughout the movement.",
                            "Maintain a neutral spine and avoid arching your back.",
                            "Start with lighter weights to master proper form."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Diamond Push-Up',
                description: 'A push-up variation with hands close together to emphasize the triceps.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['TRICEPS'],
                synergistMuscleGroups: ['CHEST', 'SHOULDERS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['TRICEPS'],
                        secondary: ['CHEST', 'SHOULDERS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Start in a plank position with hands close together under your chest, forming a diamond or triangle shape with your thumbs and index fingers."],
                        steps: [
                            "Lower your body by bending your elbows, keeping them close to your sides.",
                            "Descend until your chest nearly touches your hands.",
                            "Push through your palms to extend your arms and return to the starting position.",
                            "Maintain a straight line from head to heels throughout the movement."
                        ],
                        tempo: "Inhale as you lower, exhale as you push up.",
                        keyPoints: ["Maintain elbows close to body", "Keep chest up and shoulders back"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your elbows close to your body to target the triceps.",
                            "Maintain core engagement to prevent sagging hips.",
                            "If too difficult, perform from knees or with elevated hands."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Skull Crusher',
                description: 'A tricep isolation exercise where the weight is lowered toward the forehead, hence the name.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['TRICEPS'],
                synergistMuscleGroups: ['FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Barbell', 'Bench Press'],
                form: {
                    muscles: {
                        primary: ['TRICEPS'],
                        secondary: ['FOREARMS']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Lie on a flat bench holding a barbell or dumbbells with arms extended above your chest, palms facing your feet (for barbell) or each other (for dumbbells)."],
                        steps: [
                            "Keeping your upper arms stationary and perpendicular to the floor, bend your elbows to lower the weight toward your forehead.",
                            "Stop just before the weight touches your forehead.",
                            "Extend your elbows to return the weight to the starting position, focusing on contracting your triceps."
                        ],
                        tempo: "Inhale as you lower, exhale as you extend.",
                        keyPoints: ["Maintain upper arms stationary", "Focus on triceps contraction"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your elbows pointed forward, not outward.",
                            "Use a spotter when using heavier weights, especially with a barbell.",
                            "Avoid hitting your forehead with the weight."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Wrist Curl',
                description: 'An isolation exercise targeting the flexor muscles of the forearms.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['FOREARMS'],
                synergistMuscleGroups: [],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbells', 'Barbell'],
                form: {
                    muscles: {
                        primary: ['FOREARMS']
                    },
                    joints: {
                        primary: ['WRIST']
                    },
                    execution: {
                        setup: ["Sit on a bench with feet flat on the floor. Rest your forearms on your thighs with your wrists just beyond your knees, palms facing up. Hold a dumbbell or barbell with an underhand grip."],
                        steps: [
                            "Keeping your forearms stationary, curl your wrists upward as far as possible.",
                            "Squeeze your forearm muscles at the top of the movement.",
                            "Lower the weight by extending your wrists back to the starting position.",
                            "Maintain a controlled movement throughout."
                        ],
                        tempo: "Exhale as you curl up, inhale as you lower.",
                        keyPoints: ["Maintain forearms stationary", "Use controlled movement"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Keep your forearms stationary on your thighs.",
                            "Use a lighter weight to maintain proper form.",
                            "Perform the exercise through a full range of motion."
                        ],
                        prerequisites: ["Basic wrist mobility"]
                    }
                }
            },
            {
                name: 'Bodyweight Squat',
                description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CORE', 'LOWER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CORE', 'LOWER_BACK']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: ["Stand with feet shoulder-width apart, toes pointed slightly outward, arms at your sides."],
                        steps: [
                            "Initiate the movement by hinging at the hips, then bend your knees.",
                            "Lower your body as if sitting into a chair, keeping your chest up.",
                            "Lower until thighs are parallel to the ground or as low as possible with good form.",
                            "Push through your heels to return to the starting position."
                        ],
                        tempo: "Inhale as you lower, exhale as you rise.",
                        keyPoints: ["Keep knees aligned with toes", "Maintain neutral spine"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute knee injuries"],
                        tips: [
                            "Keep your knees in line with your toes, not collapsing inward.",
                            "Maintain a neutral spine throughout the movement.",
                            "Keep your weight in your heels and mid-foot, not your toes."
                        ],
                        prerequisites: ["Basic mobility in ankles, knees, and hips"]
                    }
                }
            },
            {
                name: 'Forward Lunge',
                description: 'A unilateral lower body exercise that targets the quads, hamstrings, and glutes while improving balance.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.LUNGE,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CORE', 'CALVES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight', 'Dumbbells'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CALVES']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: ["Stand tall with feet hip-width apart, hands on hips or at sides."],
                        steps: [
                            "Take a controlled step forward with one leg.",
                            "Lower your body by bending both knees until your front thigh is parallel to the ground and back knee nearly touches the floor.",
                            "Keep your front knee aligned with your ankle, not extending past your toes.",
                            "Push through the heel of your front foot to return to the starting position.",
                            "Repeat with the opposite leg to complete one repetition."
                        ],
                        tempo: "Inhale as you lower, exhale as you rise.",
                        keyPoints: ["Maintain upright torso", "Keep front knee tracked over middle toe"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute knee injuries"],
                        tips: [
                            "Maintain an upright torso throughout the movement.",
                            "Keep the front knee tracked over the middle toe, not caving inward.",
                            "Step far enough forward that your knee stays behind or aligned with your toes."
                        ],
                        prerequisites: ["Basic mobility in ankles, knees, and hips"]
                    }
                }
            },
            {
                name: 'Russian Twist',
                description: 'A rotational core exercise that targets the obliques and improves torso stability.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.CORE, Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.ROTATION,
                targetMuscleGroups: ['CORE', 'OBLIQUES'],
                synergistMuscleGroups: ['LOWER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight', 'Medicine Ball', 'Kettlebell'],
                form: {
                    muscles: {
                        primary: ['CORE', 'OBLIQUES'],
                        secondary: ['LOWER_BACK']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: ["Sit on the floor with knees bent, feet flat or slightly elevated. Lean back slightly to engage core."],
                        steps: [
                            "Clasp your hands together or hold a weight at chest level.",
                            "Keeping your back straight, rotate your torso to one side, bringing your hands or weight beside your hip.",
                            "Return to center and rotate to the opposite side to complete one repetition.",
                            "For added difficulty, lift your feet slightly off the ground."
                        ],
                        tempo: "Exhale as you rotate, inhale as you return to center.",
                        keyPoints: ["Maintain straight back", "Move with control"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute back injuries"],
                        tips: [
                            "Maintain a straight back, avoiding rounding.",
                            "Move with control rather than momentum.",
                            "If you have back issues, keep feet on the floor and avoid using weight."
                        ],
                        prerequisites: ["Basic core stability"]
                    }
                }
            },
            {
                name: 'Bicycle Crunch',
                description: 'A core exercise that targets the rectus abdominis and obliques while incorporating leg movement.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.CORE],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.CORE,
                targetMuscleGroups: ['CORE', 'OBLIQUES'],
                synergistMuscleGroups: ['HIP_FLEXORS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['CORE', 'OBLIQUES'],
                        secondary: ['HIP_FLEXORS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: ["Lie on your back with knees bent, feet lifted, and hands behind your head. Lift your shoulders off the ground."],
                        steps: [
                            "Extend one leg straight while simultaneously rotating your upper body to bring the opposite elbow toward the bent knee.",
                            "Return to center and repeat on the opposite side, creating a pedaling motion.",
                            "Keep your elbows wide and avoid pulling on your neck."
                        ],
                        tempo: "Exhale as you rotate, inhale as you extend.",
                        keyPoints: ["Maintain core engaged", "Move with control"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute back injuries"],
                        tips: [
                            "Keep your lower back pressed into the floor throughout the movement.",
                            "Move with control rather than speed.",
                            "Support your head lightly with your hands, avoid pulling on your neck."
                        ],
                        prerequisites: ["Basic core stability"]
                    }
                }
            },
            {
                name: 'Plank',
                description: 'An isometric core exercise that improves core strength and stability.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CORE, Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.CORE,
                targetMuscleGroups: ['CORE'],
                synergistMuscleGroups: ['SHOULDERS', 'GLUTES'],
                trackingFeatures: [Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['CORE'],
                        secondary: ['SHOULDERS', 'GLUTES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: ["Start in a forearm plank position with elbows directly beneath your shoulders, forearms and palms on the ground."],
                        steps: [
                            "Engage your core by drawing your navel toward your spine.",
                            "Maintain a straight line from head to heels.",
                            "Hold the position for the prescribed duration."
                        ],
                        tempo: "Breathe normally, focusing on deep, controlled breaths.",
                        keyPoints: ["Maintain body alignment", "Control the movement"]
                    },
                    safety: {
                        cautions: ["Avoid if you have wrist injuries"],
                        tips: [
                            "Don't let your hips sag or pike upward.",
                            "Keep your neck in a neutral position, eyes looking at the floor.",
                            "If too difficult, perform from knees."
                        ],
                        prerequisites: ["Basic shoulder stability"]
                    }
                }
            },
            {
                name: 'Mountain Climbers',
                description: 'A full-body exercise that elevates heart rate while engaging core and leg muscles.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.CARDIO, Enums_1.ExerciseType.CORE],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.LOCOMOTION,
                targetMuscleGroups: ['CORE', 'QUADRICEPS'],
                synergistMuscleGroups: ['SHOULDERS', 'CHEST', 'HAMSTRINGS'],
                trackingFeatures: [Enums_1.TrackingFeature.TEMPO, Enums_1.TrackingFeature.TEMPO],
                equipmentNames: ['Bodyweight'],
                form: {
                    muscles: {
                        primary: ['CORE', 'QUADRICEPS'],
                        secondary: ['SHOULDERS', 'CHEST', 'HAMSTRINGS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: ["Start in a high plank position with hands directly under shoulders, body in a straight line from head to heels."],
                        steps: [
                            "Keeping your core tight and hips level, quickly drive one knee toward your chest.",
                            "Return that leg to the starting position while simultaneously driving the opposite knee toward your chest.",
                            "Continue alternating legs in a running motion."
                        ],
                        tempo: "Breathe rhythmically, matching your breath to your movement pattern.",
                        keyPoints: ["Maintain core tightness", "Keep hips level"]
                    },
                    safety: {
                        cautions: ["Avoid if you have acute back injuries"],
                        tips: [
                            "Keep your shoulders over your wrists and core engaged.",
                            "Maintain a neutral spine, avoiding sagging or piking hips.",
                            "Adjust speed based on your fitness level."
                        ],
                        prerequisites: ["Basic core stability"]
                    }
                }
            },
            {
                name: "Leg Press",
                description: "A compound machine exercise that targets the quadriceps, hamstrings, and glutes while providing back support",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ["QUADRICEPS"],
                synergistMuscleGroups: ["HAMSTRINGS", "GLUTES", "CALVES"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["leg_press_machine"],
                form: {
                    muscles: {
                        primary: ["QUADRICEPS"],
                        secondary: ["HAMSTRINGS", "GLUTES", "CALVES"]
                    },
                    joints: {
                        primary: ["KNEE", "HIP"]
                    },
                    execution: {
                        setup: [
                            "Adjust seat position so knees are at 90 degrees",
                            "Place feet shoulder-width apart on platform",
                            "Position back firmly against pad",
                            "Release safety handles"
                        ],
                        steps: [
                            "Unlock the machine",
                            "Lower weight by bending knees to 90 degrees",
                            "Keep lower back pressed against pad",
                            "Push through heels to return to start",
                            "Lock knees at top"
                        ],
                        tempo: "3-1-1-1",
                        keyPoints: [
                            "Keep feet flat on platform",
                            "Maintain neutral spine",
                            "Don't lock knees forcefully",
                            "Control the negative"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Don't round lower back",
                            "Avoid letting knees cave inward",
                            "Don't bounce at bottom",
                            "Stop if you feel knee pain"
                        ],
                        tips: [
                            "Focus on pushing through heels",
                            "Keep core engaged throughout",
                            "Breathe steadily",
                            "Use full range of motion"
                        ],
                        prerequisites: [
                            "Basic leg strength",
                            "Proper knee alignment",
                            "Core stability"
                        ]
                    }
                }
            },
            {
                name: "Leg Extension",
                description: "An isolation exercise that targets the quadriceps muscles with minimal involvement of other muscle groups",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ["QUADRICEPS"],
                synergistMuscleGroups: [],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["leg_extension_machine"],
                form: {
                    muscles: {
                        primary: ["QUADRICEPS"],
                        secondary: []
                    },
                    joints: {
                        primary: ["KNEE"]
                    },
                    execution: {
                        setup: [
                            "Adjust seat position so knees align with machine axis",
                            "Position back against pad",
                            "Place ankles behind the padded bar",
                            "Adjust pad height to fit your leg length"
                        ],
                        steps: [
                            "Start with knees bent at 90 degrees",
                            "Extend legs until they are straight",
                            "Squeeze quadriceps at the top",
                            "Lower weight with control to starting position"
                        ],
                        tempo: "2-1-1-1",
                        keyPoints: [
                            "Keep back pressed against pad",
                            "Focus on quadriceps contraction",
                            "Control the negative portion",
                            "Don't lock knees forcefully"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have knee pain or injury",
                            "Don't use excessive weight",
                            "Don't lock knees forcefully",
                            "Stop if you feel any discomfort"
                        ],
                        tips: [
                            "Use a weight that allows full range of motion",
                            "Keep movement smooth and controlled",
                            "Focus on feeling the quadriceps work",
                            "Breathe steadily throughout"
                        ],
                        prerequisites: [
                            "Basic knee stability",
                            "No knee injuries or pain"
                        ]
                    }
                }
            },
            {
                name: "Bulgarian Split Squat",
                description: "A unilateral lower body exercise that targets the quadriceps, hamstrings, and glutes while improving balance and stability",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ["QUADRICEPS"],
                synergistMuscleGroups: ["HAMSTRINGS", "GLUTES", "CALVES"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["dumbbells", "bench"],
                form: {
                    muscles: {
                        primary: ["QUADRICEPS"],
                        secondary: ["HAMSTRINGS", "GLUTES", "CALVES"]
                    },
                    joints: {
                        primary: ["KNEE", "HIP", "ANKLE"]
                    },
                    execution: {
                        setup: [
                            "Place a bench behind you",
                            "Stand 2-3 feet in front of the bench",
                            "Place the top of your back foot on the bench",
                            "Hold dumbbells at your sides or at shoulder level"
                        ],
                        steps: [
                            "Keep your torso upright and core engaged",
                            "Lower your body by bending your front knee and hip",
                            "Continue until your front thigh is parallel to the ground",
                            "Push through your front heel to return to the starting position",
                            "Complete all reps on one leg before switching sides"
                        ],
                        tempo: "3-1-1-1",
                        keyPoints: [
                            "Keep front knee aligned with toes",
                            "Maintain upright torso",
                            "Keep back foot elevated throughout",
                            "Control the descent"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have knee or hip injuries",
                            "Start with bodyweight only",
                            "Don't let front knee extend past toes",
                            "Stop if you feel any pain"
                        ],
                        tips: [
                            "Start with a lower bench height if needed",
                            "Use a mirror to check form",
                            "Focus on balance and stability",
                            "Progress to weighted versions gradually"
                        ],
                        prerequisites: [
                            "Basic squat form",
                            "Good balance",
                            "Adequate hip and ankle mobility"
                        ]
                    }
                }
            },
            {
                name: "Leg Curl",
                description: "An isolation exercise that targets the hamstrings with minimal involvement of other muscle groups",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ["HAMSTRINGS"],
                synergistMuscleGroups: ["CALVES"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["leg_curl_machine"],
                form: {
                    muscles: {
                        primary: ["HAMSTRINGS"],
                        secondary: ["CALVES"]
                    },
                    joints: {
                        primary: ["KNEE"]
                    },
                    execution: {
                        setup: [
                            "Adjust seat position so knees align with machine axis",
                            "Position back against pad",
                            "Place ankles on top of the padded bar",
                            "Adjust pad height to fit your leg length"
                        ],
                        steps: [
                            "Start with legs extended",
                            "Curl legs back by bending knees",
                            "Continue until heels are close to glutes",
                            "Squeeze hamstrings at the top",
                            "Lower weight with control to starting position"
                        ],
                        tempo: "2-1-1-1",
                        keyPoints: [
                            "Keep hips pressed against pad",
                            "Focus on hamstring contraction",
                            "Control the negative portion",
                            "Don't use momentum"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have hamstring or knee injuries",
                            "Don't use excessive weight",
                            "Don't arch lower back",
                            "Stop if you feel any discomfort"
                        ],
                        tips: [
                            "Use a weight that allows full range of motion",
                            "Keep movement smooth and controlled",
                            "Focus on feeling the hamstrings work",
                            "Breathe steadily throughout"
                        ],
                        prerequisites: [
                            "Basic knee stability",
                            "No hamstring injuries or pain"
                        ]
                    }
                }
            },
            {
                name: "Romanian Deadlift",
                description: "A compound exercise that targets the hamstrings and glutes through a hip hinge movement pattern",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.HINGE,
                targetMuscleGroups: ["HAMSTRINGS"],
                synergistMuscleGroups: ["GLUTES", "LOWER_BACK", "CORE"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["barbell", "dumbbells"],
                form: {
                    muscles: {
                        primary: ["HAMSTRINGS"],
                        secondary: ["GLUTES", "LOWER_BACK", "CORE"]
                    },
                    joints: {
                        primary: ["HIP", "KNEE"]
                    },
                    execution: {
                        setup: [
                            "Stand with feet hip-width apart",
                            "Hold a barbell or dumbbells in front of thighs",
                            "Keep chest up and shoulders back",
                            "Engage core and maintain neutral spine"
                        ],
                        steps: [
                            "Hinge at hips by pushing them back",
                            "Keep slight bend in knees",
                            "Lower weight along thighs until feeling stretch in hamstrings",
                            "Keep back straight and chest up throughout",
                            "Drive hips forward to return to starting position",
                            "Squeeze glutes at the top"
                        ],
                        tempo: "3-1-1-1",
                        keyPoints: [
                            "Push hips back, don't squat down",
                            "Keep weight close to body",
                            "Maintain neutral spine",
                            "Feel stretch in hamstrings"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have lower back injuries",
                            "Maintain proper form to prevent injury"
                        ],
                        tips: [
                            "Start with lighter weights to master form",
                            "Use a mirror to check your back position",
                            "Focus on feeling the hamstrings stretch",
                            "Keep the movement controlled"
                        ],
                        prerequisites: [
                            "Basic hip hinge movement",
                            "Good lower back stability",
                            "Adequate hamstring flexibility"
                        ]
                    }
                }
            },
            {
                name: "Good Morning",
                description: "A compound exercise that targets the hamstrings and lower back through a hip hinge movement with the barbell positioned on the upper back",
                measurementType: Enums_1.MeasurementType.WEIGHT,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.HINGE,
                targetMuscleGroups: ["HAMSTRINGS"],
                synergistMuscleGroups: ["GLUTES", "LOWER_BACK", "CORE"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["barbell"],
                form: {
                    muscles: {
                        primary: ["HAMSTRINGS"],
                        secondary: ["GLUTES", "LOWER_BACK", "CORE"]
                    },
                    joints: {
                        primary: ["HIP", "KNEE"]
                    },
                    execution: {
                        setup: [
                            "Stand with feet shoulder-width apart",
                            "Position barbell on upper back (similar to squat position)",
                            "Keep chest up and shoulders back",
                            "Engage core and maintain neutral spine"
                        ],
                        steps: [
                            "Hinge at hips by pushing them back",
                            "Keep slight bend in knees",
                            "Lower torso until feeling stretch in hamstrings",
                            "Keep back straight and chest up throughout",
                            "Drive hips forward to return to starting position",
                            "Squeeze glutes at the top"
                        ],
                        tempo: "3-1-1-1",
                        keyPoints: [
                            "Push hips back, don't squat down",
                            "Keep bar path close to body",
                            "Maintain neutral spine",
                            "Feel stretch in hamstrings"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Avoid if you have lower back injuries",
                            "Don't round your back",
                            "Don't use excessive weight",
                            "Stop if you feel any pain"
                        ],
                        tips: [
                            "Start with lighter weights to master form",
                            "Use a mirror to check your back position",
                            "Focus on feeling the hamstrings stretch",
                            "Keep the movement controlled"
                        ],
                        prerequisites: [
                            "Basic hip hinge movement",
                            "Good lower back stability",
                            "Adequate hamstring flexibility",
                            "Experience with barbell on back"
                        ]
                    }
                }
            },
            {
                name: "Nordic Hamstring Curl",
                description: "An advanced bodyweight exercise that targets the hamstrings through an eccentric lengthening movement, requiring significant hamstring strength and control",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.ADVANCED,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ["HAMSTRINGS"],
                synergistMuscleGroups: ["CALVES", "GLUTES", "CORE"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["partner", "nordic_hamstring_bench", "ankle_straps"],
                form: {
                    muscles: {
                        primary: ["HAMSTRINGS"],
                        secondary: ["CALVES", "GLUTES", "CORE"]
                    },
                    joints: {
                        primary: ["KNEE", "HIP"]
                    },
                    execution: {
                        setup: [
                            "Kneel on a padded surface with ankles secured (by partner or straps)",
                            "Position knees hip-width apart",
                            "Keep torso upright with chest up",
                            "Engage core and maintain neutral spine"
                        ],
                        steps: [
                            "Begin with body in an upright kneeling position",
                            "Slowly lower your body forward by resisting with hamstrings",
                            "Keep hips extended and core engaged throughout",
                            "Lower as far as possible while maintaining control",
                            "Use hands to catch yourself if needed",
                            "Push back to starting position using hands if necessary"
                        ],
                        tempo: "3-1-1-1 (eccentric-pause-concentric-pause)",
                        keyPoints: [
                            "Control the descent completely",
                            "Keep hips extended throughout",
                            "Maintain neutral spine",
                            "Feel stretch in hamstrings"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Advanced exercise - not for beginners",
                            "High risk of hamstring injury if performed incorrectly",
                            "Requires significant hamstring strength",
                            "Stop immediately if you feel sharp pain"
                        ],
                        tips: [
                            "Start with assisted variations (using bands or partner)",
                            "Progress gradually to full range of motion",
                            "Use hands to catch yourself if needed",
                            "Consider using a spotter initially"
                        ],
                        prerequisites: [
                            "Strong hamstrings",
                            "Good core stability",
                            "Experience with hamstring exercises",
                            "Adequate hamstring flexibility"
                        ]
                    }
                }
            },
            {
                name: "Glute-Ham Raise",
                description: "An advanced bodyweight exercise that targets the hamstrings and glutes through a controlled lowering and raising movement, requiring significant posterior chain strength",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.ADVANCED,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ["HAMSTRINGS"],
                synergistMuscleGroups: ["GLUTES", "CALVES", "CORE", "LOWER_BACK"],
                trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
                equipmentNames: ["glute_ham_raise_bench", "partner"],
                form: {
                    muscles: {
                        primary: ["HAMSTRINGS"],
                        secondary: ["GLUTES", "CALVES", "CORE", "LOWER_BACK"]
                    },
                    joints: {
                        primary: ["KNEE", "HIP"]
                    },
                    execution: {
                        setup: [
                            "Position yourself on a GHR bench with knees on the pad and ankles secured",
                            "Adjust the bench so your knees are at the edge of the pad",
                            "Keep torso upright with chest up",
                            "Engage core and maintain neutral spine"
                        ],
                        steps: [
                            "Begin with body in an upright position, parallel to the ground",
                            "Slowly lower your body forward by bending at the knees",
                            "Keep hips extended and core engaged throughout",
                            "Lower as far as possible while maintaining control",
                            "Use hamstrings and glutes to pull yourself back to the starting position",
                            "If unable to complete the concentric phase, use hands to assist"
                        ],
                        tempo: "3-1-1-1 (eccentric-pause-concentric-pause)",
                        keyPoints: [
                            "Control the descent completely",
                            "Keep hips extended throughout",
                            "Maintain neutral spine",
                            "Feel contraction in hamstrings and glutes during the raise"
                        ]
                    },
                    safety: {
                        cautions: [
                            "Advanced exercise - not for beginners",
                            "High risk of hamstring injury if performed incorrectly",
                            "Requires significant posterior chain strength",
                            "Stop immediately if you feel sharp pain"
                        ],
                        tips: [
                            "Start with assisted variations (using bands or partner)",
                            "Progress gradually to full range of motion",
                            "Use hands to assist if needed",
                            "Consider using a spotter initially"
                        ],
                        prerequisites: [
                            "Strong hamstrings and glutes",
                            "Good core stability",
                            "Experience with hamstring exercises",
                            "Adequate posterior chain flexibility"
                        ]
                    }
                }
            },
            {
                name: 'Farmer\'s Walk',
                description: 'A functional strength exercise that involves walking while holding heavy weights in each hand.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND, Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.CARRY,
                targetMuscleGroups: ['TRAPS', 'FOREARMS', 'SHOULDERS'],
                synergistMuscleGroups: ['CORE', 'UPPER_BACK', 'BICEPS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell', 'Kettlebell'],
                form: {
                    muscles: {
                        primary: ['TRAPS', 'FOREARMS', 'SHOULDERS'],
                        secondary: ['CORE', 'UPPER_BACK', 'BICEPS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            'Place two heavy dumbbells or kettlebells on the floor',
                            'Stand between them with feet hip-width apart',
                            'Bend at the hips and knees to pick up the weights'
                        ],
                        steps: [
                            'Grip the weights firmly with both hands',
                            'Stand up straight with chest up and shoulders back',
                            'Walk forward at a steady pace, maintaining good posture',
                            'Keep the weights at your sides throughout the movement',
                            'Walk for the prescribed distance or time'
                        ],
                        tempo: 'Maintain a steady walking pace',
                        keyPoints: [
                            'Keep your core tight throughout the movement',
                            'Maintain an upright posture with chest up',
                            'Take controlled steps',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter weights to practice form',
                            'Stop immediately if you feel pain in your lower back or shoulders'
                        ],
                        tips: [
                            'Focus on maintaining good posture throughout the movement',
                            'Keep your shoulders down and back',
                            'Engage your core to protect your lower back'
                        ],
                        prerequisites: [
                            'Good grip strength',
                            'Basic core stability',
                            'Ability to maintain posture under load'
                        ]
                    }
                }
            },
            {
                name: 'Incline Barbell Press',
                description: 'A compound exercise that targets the upper chest, front deltoids, and triceps using a barbell on an incline bench.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['UPPER_CHEST', 'FRONT_DELTOIDS', 'TRICEPS'],
                synergistMuscleGroups: ['SERRATUS', 'UPPER_BACK', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Incline Bench', 'Weight Plates'],
                form: {
                    muscles: {
                        primary: ['UPPER_CHEST', 'FRONT_DELTOIDS', 'TRICEPS'],
                        secondary: ['SERRATUS', 'UPPER_BACK', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            'Set the incline bench to a 30-45 degree angle',
                            'Sit on the bench with feet firmly planted on the floor',
                            'Grip the barbell slightly wider than shoulder width',
                            'Unrack the barbell and hold it at chest level'
                        ],
                        steps: [
                            'Lower the barbell to your upper chest in a controlled manner',
                            'Pause briefly at the bottom position',
                            'Press the barbell back up to the starting position',
                            'Lock out your elbows at the top',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds down, 1 second pause, 1 second up, 1 second pause)',
                        keyPoints: [
                            'Keep your wrists straight throughout the movement',
                            'Maintain a slight arch in your lower back',
                            'Keep your elbows at a 45-degree angle to your body',
                            'Breathe out as you press the weight up',
                            'Keep your core tight throughout the movement'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Use a spotter when lifting heavy weights',
                            'Avoid bouncing the barbell off your chest',
                            'Don\'t let your elbows flare out too wide'
                        ],
                        tips: [
                            'Start with a weight you can control for the full range of motion',
                            'Focus on feeling the contraction in your upper chest',
                            'Keep your shoulders retracted throughout the movement'
                        ],
                        prerequisites: [
                            'Basic bench press proficiency',
                            'Good shoulder mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Decline Barbell Press',
                description: 'A compound exercise that targets the lower chest, front deltoids, and triceps using a barbell on a decline bench.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['LOWER_CHEST', 'FRONT_DELTOIDS', 'TRICEPS'],
                synergistMuscleGroups: ['SERRATUS', 'UPPER_BACK', 'FOREARMS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Decline Bench', 'Weight Plates'],
                form: {
                    muscles: {
                        primary: ['LOWER_CHEST', 'FRONT_DELTOIDS', 'TRICEPS'],
                        secondary: ['SERRATUS', 'UPPER_BACK', 'FOREARMS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            'Secure your legs in the decline bench',
                            'Grip the barbell slightly wider than shoulder width',
                            'Unrack the barbell and hold it at chest level'
                        ],
                        steps: [
                            'Lower the barbell to your lower chest in a controlled manner',
                            'Pause briefly at the bottom position',
                            'Press the barbell back up to the starting position',
                            'Lock out your elbows at the top',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds down, 1 second pause, 1 second up, 1 second pause)',
                        keyPoints: [
                            'Keep your wrists straight throughout the movement',
                            'Maintain control of the barbell throughout the range of motion',
                            'Keep your elbows at a 45-degree angle to your body',
                            'Breathe out as you press the weight up',
                            'Keep your core tight throughout the movement'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Use a spotter when lifting heavy weights',
                            'Avoid bouncing the barbell off your chest',
                            'Don\'t let your elbows flare out too wide',
                            'Ensure your legs are securely fastened to the bench'
                        ],
                        tips: [
                            'Start with a weight you can control for the full range of motion',
                            'Focus on feeling the contraction in your lower chest',
                            'Keep your shoulders retracted throughout the movement'
                        ],
                        prerequisites: [
                            'Basic bench press proficiency',
                            'Good shoulder mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Cable Row',
                description: 'A compound exercise that targets the back muscles using a cable machine, providing constant tension throughout the movement.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['LATS', 'MIDDLE_BACK', 'REAR_DELTOIDS'],
                synergistMuscleGroups: ['BICEPS', 'FOREARMS', 'TRAPS', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Row Attachment'],
                form: {
                    muscles: {
                        primary: ['LATS', 'MIDDLE_BACK', 'REAR_DELTOIDS'],
                        secondary: ['BICEPS', 'FOREARMS', 'TRAPS', 'CORE']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            'Sit on the bench with feet firmly planted on the footrests',
                            'Adjust the seat height so the cable is at chest level',
                            'Grip the handles with palms facing each other',
                            'Sit upright with chest up and shoulders back'
                        ],
                        steps: [
                            'Pull the handles toward your lower chest, keeping elbows close to your body',
                            'Squeeze your shoulder blades together at the end of the movement',
                            'Pause briefly in the contracted position',
                            'Return the handles to the starting position in a controlled manner',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '2-1-1-1 (2 seconds pull, 1 second pause, 1 second return, 1 second pause)',
                        keyPoints: [
                            'Keep your chest up and shoulders back throughout the movement',
                            'Focus on squeezing your shoulder blades together at the end of the pull',
                            'Keep your elbows close to your body',
                            'Maintain a slight arch in your lower back',
                            'Breathe out as you pull the weight toward you'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Avoid using momentum to pull the weight',
                            'Don\'t round your back during the movement',
                            'Don\'t let your shoulders roll forward at the end of the movement'
                        ],
                        tips: [
                            'Start with a weight you can control for the full range of motion',
                            'Focus on feeling the contraction in your back muscles',
                            'Keep your core engaged throughout the movement'
                        ],
                        prerequisites: [
                            'Basic rowing movement proficiency',
                            'Good shoulder mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Reverse Fly',
                description: 'An isolation exercise that targets the rear deltoids and upper back using dumbbells or a cable machine.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['REAR_DELTOIDS', 'UPPER_BACK'],
                synergistMuscleGroups: ['TRAPS', 'MIDDLE_BACK', 'ROTATOR_CUFF'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell', 'Cable Machine'],
                form: {
                    muscles: {
                        primary: ['REAR_DELTOIDS', 'UPPER_BACK'],
                        secondary: ['TRAPS', 'MIDDLE_BACK', 'ROTATOR_CUFF']
                    },
                    joints: {
                        primary: ['SHOULDER']
                    },
                    execution: {
                        setup: [
                            'Stand with feet hip-width apart',
                            'Bend at the hips and knees, keeping your back straight',
                            'Hold dumbbells with palms facing each other',
                            'Position your arms slightly bent with elbows pointing out to the sides'
                        ],
                        steps: [
                            'Raise your arms out to the sides, keeping your elbows slightly bent',
                            'Focus on squeezing your rear deltoids and upper back',
                            'Raise your arms until they are parallel to the floor',
                            'Pause briefly at the top of the movement',
                            'Lower the weights back to the starting position in a controlled manner',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '2-1-1-1 (2 seconds up, 1 second pause, 1 second down, 1 second pause)',
                        keyPoints: [
                            'Keep your back straight throughout the movement',
                            'Focus on squeezing your rear deltoids and upper back',
                            'Keep your elbows slightly bent throughout the movement',
                            'Maintain control of the weights throughout the range of motion',
                            'Breathe out as you raise the weights'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Avoid using momentum to raise the weights',
                            'Don\'t round your back during the movement',
                            'Don\'t let your shoulders roll forward at the end of the movement'
                        ],
                        tips: [
                            'Start with lighter weights to focus on proper form',
                            'Imagine pinching a pencil between your shoulder blades',
                            'Keep your core engaged throughout the movement'
                        ],
                        prerequisites: [
                            'Basic shoulder mobility',
                            'Adequate core stability',
                            'Ability to maintain proper posture'
                        ]
                    }
                }
            },
            {
                name: 'Zottman Curl',
                description: 'A biceps exercise that combines a regular curl with a reverse curl, targeting both the biceps brachii and brachialis muscles.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BICEPS', 'BRACHIALIS', 'FOREARMS'],
                synergistMuscleGroups: ['FRONT_DELTOIDS', 'UPPER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell'],
                form: {
                    muscles: {
                        primary: ['BICEPS', 'BRACHIALIS', 'FOREARMS'],
                        secondary: ['FRONT_DELTOIDS', 'UPPER_BACK']
                    },
                    joints: {
                        primary: ['ELBOW', 'WRIST']
                    },
                    execution: {
                        setup: [
                            'Stand with feet hip-width apart',
                            'Hold dumbbells at your sides with palms facing forward',
                            'Keep your elbows close to your body'
                        ],
                        steps: [
                            'Curl the dumbbells up toward your shoulders, keeping your elbows close to your body',
                            'At the top of the movement, rotate your wrists so your palms face down',
                            'Lower the dumbbells back down to the starting position with palms facing down',
                            'At the bottom of the movement, rotate your wrists back to the starting position',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '2-1-1-1 (2 seconds up, 1 second pause, 1 second down, 1 second pause)',
                        keyPoints: [
                            'Keep your elbows close to your body throughout the movement',
                            'Control the rotation of your wrists at the top and bottom of the movement',
                            'Keep your shoulders back and chest up',
                            'Avoid swinging the weights or using momentum',
                            'Breathe out as you curl the weights up'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter weights to practice the movement',
                            'Avoid swinging the weights or using momentum',
                            'Don\'t let your elbows flare out to the sides'
                        ],
                        tips: [
                            'Focus on feeling the contraction in your biceps and forearms',
                            'Keep your wrists straight throughout the movement',
                            'Maintain control of the weights throughout the range of motion'
                        ],
                        prerequisites: [
                            'Basic biceps curl proficiency',
                            'Good wrist mobility',
                            'Adequate forearm strength'
                        ]
                    }
                }
            },
            {
                name: 'Tricep Kickback',
                description: 'An isolation exercise that targets the triceps using dumbbells, performed in a bent-over position.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['TRICEPS'],
                synergistMuscleGroups: ['REAR_DELTOIDS', 'UPPER_BACK', 'CORE'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell'],
                form: {
                    muscles: {
                        primary: ['TRICEPS'],
                        secondary: ['REAR_DELTOIDS', 'UPPER_BACK', 'CORE']
                    },
                    joints: {
                        primary: ['ELBOW', 'SHOULDER']
                    },
                    execution: {
                        setup: [
                            'Stand with feet hip-width apart',
                            'Bend at the hips and knees, keeping your back straight',
                            'Hold dumbbells with palms facing each other',
                            'Position your upper arms parallel to the floor with elbows bent at 90 degrees'
                        ],
                        steps: [
                            'Extend your arms back until they are straight, keeping your upper arms stationary',
                            'Focus on squeezing your triceps at the end of the movement',
                            'Pause briefly at the top of the movement',
                            'Return to the starting position in a controlled manner',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '2-1-1-1 (2 seconds extend, 1 second pause, 1 second return, 1 second pause)',
                        keyPoints: [
                            'Keep your upper arms stationary throughout the movement',
                            'Focus on squeezing your triceps at the end of the movement',
                            'Keep your back straight and core engaged',
                            'Maintain control of the weights throughout the range of motion',
                            'Breathe out as you extend your arms'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter weights to practice the movement',
                            'Avoid using momentum to extend your arms',
                            'Don\'t let your back round during the movement'
                        ],
                        tips: [
                            'Focus on feeling the contraction in your triceps',
                            'Keep your elbows close to your body',
                            'Maintain a stable position throughout the movement'
                        ],
                        prerequisites: [
                            'Basic triceps exercise proficiency',
                            'Good shoulder mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Walking Lunge',
                description: 'A dynamic lower body exercise that targets the quadriceps, hamstrings, and glutes while improving balance and coordination.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND, Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.LUNGE,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CALVES', 'CORE', 'HIP_FLEXORS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell', 'Kettlebell', 'Barbell'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CALVES', 'CORE', 'HIP_FLEXORS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Stand with feet hip-width apart',
                            'Hold dumbbells at your sides or a barbell on your shoulders',
                            'Take a step forward with your right leg'
                        ],
                        steps: [
                            'Lower your body by bending both knees until your back knee nearly touches the floor',
                            'Keep your front knee aligned with your ankle',
                            'Push through your front heel to stand up',
                            'Bring your back foot forward to meet your front foot',
                            'Take a step forward with your left leg',
                            'Repeat the movement, alternating legs as you walk forward'
                        ],
                        tempo: '2-1-1-1 (2 seconds down, 1 second pause, 1 second up, 1 second step)',
                        keyPoints: [
                            'Keep your torso upright throughout the movement',
                            'Keep your front knee aligned with your ankle',
                            'Don\'t let your back knee touch the floor',
                            'Push through your front heel to stand up',
                            'Take controlled steps'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with bodyweight only to practice the movement',
                            'Avoid letting your front knee extend past your toes',
                            'Don\'t let your back knee touch the floor'
                        ],
                        tips: [
                            'Focus on maintaining good posture throughout the movement',
                            'Keep your core engaged to protect your lower back',
                            'Take smaller steps if you have balance issues'
                        ],
                        prerequisites: [
                            'Basic lunge proficiency',
                            'Good balance',
                            'Adequate lower body strength'
                        ]
                    }
                }
            },
            {
                name: 'Step-Up',
                description: 'A lower body exercise that targets the quadriceps, hamstrings, and glutes while improving balance and coordination.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND, Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CALVES', 'CORE', 'HIP_FLEXORS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Step', 'Bench', 'Dumbbell', 'Kettlebell'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CALVES', 'CORE', 'HIP_FLEXORS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Place a step or bench in front of you',
                            'Stand with feet hip-width apart',
                            'Hold dumbbells at your sides or a kettlebell in the goblet position'
                        ],
                        steps: [
                            'Step onto the bench with your right foot',
                            'Push through your right heel to lift your body up onto the bench',
                            'Bring your left foot up to meet your right foot on the bench',
                            'Step down with your left foot, followed by your right foot',
                            'Repeat the movement, alternating which foot steps up first'
                        ],
                        tempo: '2-1-1-1 (2 seconds up, 1 second pause, 1 second down, 1 second pause)',
                        keyPoints: [
                            'Keep your torso upright throughout the movement',
                            'Push through your heel to lift your body up',
                            'Control the descent',
                            'Keep your core engaged throughout the movement'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with a lower step height to practice the movement',
                            'Avoid letting your knee extend past your toes',
                            'Don\'t use momentum to step up'
                        ],
                        tips: [
                            'Focus on maintaining good posture throughout the movement',
                            'Keep your core engaged to protect your lower back',
                            'Use a lower step height if you have balance issues'
                        ],
                        prerequisites: [
                            'Basic squat proficiency',
                            'Good balance',
                            'Adequate lower body strength'
                        ]
                    }
                }
            },
            {
                name: 'Box Squat',
                description: 'A variation of the squat that targets the quadriceps, hamstrings, and glutes while improving form and depth.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CALVES', 'CORE', 'LOWER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Barbell', 'Box', 'Bench', 'Weight Plates'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CALVES', 'CORE', 'LOWER_BACK']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Place a box or bench behind you at a height that allows you to squat to parallel or slightly below',
                            'Position the barbell on your upper back',
                            'Stand with feet shoulder-width apart, toes slightly turned out'
                        ],
                        steps: [
                            'Brace your core and take a deep breath',
                            'Initiate the squat by pushing your hips back and bending your knees',
                            'Lower your body until you sit on the box or bench',
                            'Pause briefly on the box or bench without relaxing',
                            'Drive through your heels to stand back up to the starting position',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds down, 1 second pause, 1 second up, 1 second pause)',
                        keyPoints: [
                            'Keep your chest up and back straight throughout the movement',
                            'Push your knees out in the same direction as your toes',
                            'Keep your weight on your heels',
                            'Breathe out as you stand up',
                            'Keep your core tight throughout the movement'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter weights to practice the movement',
                            'Avoid rounding your back during the movement',
                            'Don\'t bounce off the box or bench'
                        ],
                        tips: [
                            'Focus on feeling the contraction in your quadriceps, hamstrings, and glutes',
                            'Keep your knees aligned with your toes',
                            'Maintain control of the barbell throughout the range of motion'
                        ],
                        prerequisites: [
                            'Basic squat proficiency',
                            'Good hip mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Goblet Squat',
                description: 'A variation of the squat that targets the quadriceps, hamstrings, and glutes while improving form and depth.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                synergistMuscleGroups: ['CALVES', 'CORE', 'UPPER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Dumbbell', 'Kettlebell'],
                form: {
                    muscles: {
                        primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                        secondary: ['CALVES', 'CORE', 'UPPER_BACK']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Stand with feet shoulder-width apart, toes slightly turned out',
                            'Hold a dumbbell or kettlebell vertically at chest level',
                            'Keep your elbows close to your body'
                        ],
                        steps: [
                            'Brace your core and take a deep breath',
                            'Initiate the squat by pushing your hips back and bending your knees',
                            'Lower your body until your thighs are parallel to the floor or slightly below',
                            'Keep your chest up and back straight throughout the movement',
                            'Drive through your heels to stand back up to the starting position',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds down, 1 second pause, 1 second up, 1 second pause)',
                        keyPoints: [
                            'Keep your chest up and back straight throughout the movement',
                            'Push your knees out in the same direction as your toes',
                            'Keep your weight on your heels',
                            'Breathe out as you stand up',
                            'Keep your core tight throughout the movement'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with a lighter weight to practice the movement',
                            'Avoid rounding your back during the movement',
                            'Don\'t let your knees cave inward'
                        ],
                        tips: [
                            'Focus on feeling the contraction in your quadriceps, hamstrings, and glutes',
                            'Keep your elbows close to your body',
                            'Maintain control of the weight throughout the range of motion'
                        ],
                        prerequisites: [
                            'Basic bodyweight squat proficiency',
                            'Good hip mobility',
                            'Adequate core stability'
                        ]
                    }
                }
            },
            {
                name: 'Side Plank',
                description: 'An isometric core exercise that targets the obliques, transverse abdominis, and quadratus lumborum.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                synergistMuscleGroups: ['SHOULDERS', 'HIPS', 'GLUTES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Mat'],
                form: {
                    muscles: {
                        primary: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                        secondary: ['SHOULDERS', 'HIPS', 'GLUTES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'HIP', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Lie on your side with your legs stacked on top of each other',
                            'Prop your upper body up on your forearm, with your elbow directly under your shoulder',
                            'Stack your feet on top of each other'
                        ],
                        steps: [
                            'Lift your hips off the ground, creating a straight line from your head to your feet',
                            'Hold this position for the prescribed duration',
                            'Lower your hips back down to the ground',
                            'Repeat on the other side'
                        ],
                        tempo: 'Hold for the prescribed duration',
                        keyPoints: [
                            'Keep your body in a straight line from head to feet',
                            'Engage your core throughout the movement',
                            'Don\'t let your hips sag toward the ground',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with shorter durations to practice the movement',
                            'Stop immediately if you feel pain in your lower back or shoulders',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the duration',
                            'Keep your neck in a neutral position',
                            'Engage your glutes to help stabilize your body'
                        ],
                        prerequisites: [
                            'Basic plank proficiency',
                            'Good shoulder stability',
                            'Adequate core strength'
                        ]
                    }
                }
            },
            {
                name: 'Dead Bug',
                description: 'A core stabilization exercise that targets the transverse abdominis and rectus abdominis while improving coordination.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['TRANSVERSE_ABDOMINIS', 'RECTUS_ABDOMINIS'],
                synergistMuscleGroups: ['HIP_FLEXORS', 'SHOULDERS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Mat'],
                form: {
                    muscles: {
                        primary: ['TRANSVERSE_ABDOMINIS', 'RECTUS_ABDOMINIS'],
                        secondary: ['HIP_FLEXORS', 'SHOULDERS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'HIP']
                    },
                    execution: {
                        setup: [
                            'Lie on your back with your arms extended toward the ceiling',
                            'Bend your knees and lift your feet off the ground, creating a 90-degree angle at your hips and knees'
                        ],
                        steps: [
                            'Brace your core and press your lower back into the floor',
                            'Lower your right arm and left leg toward the floor, keeping them straight',
                            'Stop before they touch the floor',
                            'Return to the starting position',
                            'Repeat with your left arm and right leg',
                            'Continue alternating sides for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds lower, 1 second pause, 1 second return, 1 second pause)',
                        keyPoints: [
                            'Keep your lower back pressed against the floor throughout the movement',
                            'Move your arms and legs slowly and with control',
                            'Don\'t let your lower back arch off the floor',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with smaller ranges of motion to practice the movement',
                            'Stop immediately if you feel pain in your lower back',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move your arms and legs with control'
                        ],
                        prerequisites: [
                            'Basic core awareness',
                            'Ability to maintain a neutral spine',
                            'Good coordination'
                        ]
                    }
                }
            },
            {
                name: 'Bird Dog',
                description: 'A core stabilization exercise that targets the transverse abdominis, rectus abdominis, and lower back while improving balance and coordination.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['TRANSVERSE_ABDOMINIS', 'RECTUS_ABDOMINIS', 'LOWER_BACK'],
                synergistMuscleGroups: ['SHOULDERS', 'HIPS', 'GLUTES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Mat'],
                form: {
                    muscles: {
                        primary: ['TRANSVERSE_ABDOMINIS', 'RECTUS_ABDOMINIS', 'LOWER_BACK'],
                        secondary: ['SHOULDERS', 'HIPS', 'GLUTES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'HIP']
                    },
                    execution: {
                        setup: [
                            'Start on your hands and knees with your hands directly under your shoulders and your knees directly under your hips',
                            'Keep your back in a neutral position'
                        ],
                        steps: [
                            'Brace your core and maintain a neutral spine',
                            'Extend your right arm forward and your left leg backward, keeping them parallel to the floor',
                            'Hold this position for a few seconds',
                            'Return to the starting position',
                            'Repeat with your left arm and right leg',
                            'Continue alternating sides for the prescribed number of repetitions'
                        ],
                        tempo: '2-2-2-1 (2 seconds extend, 2 seconds hold, 2 seconds return, 1 second pause)',
                        keyPoints: [
                            'Keep your back in a neutral position throughout the movement',
                            'Don\'t let your hips rotate or sag',
                            'Keep your head in a neutral position, looking at the floor',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with shorter holds to practice the movement',
                            'Stop immediately if you feel pain in your lower back or shoulders',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move your arms and legs with control'
                        ],
                        prerequisites: [
                            'Basic core awareness',
                            'Ability to maintain a neutral spine',
                            'Good balance and coordination'
                        ]
                    }
                }
            },
            {
                name: 'Pallof Press',
                description: 'An anti-rotation core exercise that targets the obliques, transverse abdominis, and quadratus lumborum.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                synergistMuscleGroups: ['SHOULDERS', 'CHEST', 'UPPER_BACK'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Resistance Band', 'Dumbbell'],
                form: {
                    muscles: {
                        primary: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                        secondary: ['SHOULDERS', 'CHEST', 'UPPER_BACK']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'HIP']
                    },
                    execution: {
                        setup: [
                            'Stand sideways to a cable machine or anchor point for a resistance band',
                            'Hold the handle or band with both hands at chest level',
                            'Stand with feet shoulder-width apart, knees slightly bent'
                        ],
                        steps: [
                            'Brace your core and maintain a neutral spine',
                            'Press the handle or band straight out in front of your chest',
                            'Hold this position for a few seconds',
                            'Return to the starting position',
                            'Repeat for the prescribed number of repetitions',
                            'Switch sides and repeat'
                        ],
                        tempo: '2-2-2-1 (2 seconds press, 2 seconds hold, 2 seconds return, 1 second pause)',
                        keyPoints: [
                            'Keep your back in a neutral position throughout the movement',
                            'Don\'t let your hips rotate',
                            'Keep your arms straight throughout the movement',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter resistance to practice the movement',
                            'Stop immediately if you feel pain in your lower back or shoulders',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move your arms with control'
                        ],
                        prerequisites: [
                            'Basic core awareness',
                            'Ability to maintain a neutral spine',
                            'Good shoulder stability'
                        ]
                    }
                }
            },
            {
                name: 'Wood Chop',
                description: 'A rotational core exercise that targets the obliques, transverse abdominis, and quadratus lumborum.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                synergistMuscleGroups: ['SHOULDERS', 'CHEST', 'UPPER_BACK', 'HIPS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Cable Machine', 'Resistance Band', 'Dumbbell', 'Kettlebell'],
                form: {
                    muscles: {
                        primary: ['OBLIQUES', 'TRANSVERSE_ABDOMINIS', 'QUADRATUS_LUMBORUM'],
                        secondary: ['SHOULDERS', 'CHEST', 'UPPER_BACK', 'HIPS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'HIP', 'SPINE']
                    },
                    execution: {
                        setup: [
                            'Stand sideways to a cable machine or anchor point for a resistance band',
                            'Hold the handle or band with both hands at shoulder level',
                            'Stand with feet shoulder-width apart, knees slightly bent'
                        ],
                        steps: [
                            'Brace your core and maintain a neutral spine',
                            'Rotate your torso and arms diagonally downward across your body',
                            'Keep your arms straight throughout the movement',
                            'Return to the starting position',
                            'Repeat for the prescribed number of repetitions',
                            'Switch sides and repeat'
                        ],
                        tempo: '2-1-1-1 (2 seconds chop, 1 second pause, 1 second return, 1 second pause)',
                        keyPoints: [
                            'Keep your back in a neutral position throughout the movement',
                            'Rotate from your core, not just your arms',
                            'Keep your arms straight throughout the movement',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with lighter resistance to practice the movement',
                            'Stop immediately if you feel pain in your lower back or shoulders',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move with control'
                        ],
                        prerequisites: [
                            'Basic core awareness',
                            'Ability to maintain a neutral spine',
                            'Good shoulder stability'
                        ]
                    }
                }
            },
            {
                name: 'Reverse Crunch',
                description: 'A core exercise that targets the lower abs and hip flexors.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['LOWER_ABS', 'HIP_FLEXORS'],
                synergistMuscleGroups: ['UPPER_ABS', 'OBLIQUES', 'QUADRICEPS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Mat', 'Bench'],
                form: {
                    muscles: {
                        primary: ['LOWER_ABS', 'HIP_FLEXORS'],
                        secondary: ['UPPER_ABS', 'OBLIQUES', 'QUADRICEPS']
                    },
                    joints: {
                        primary: ['HIP', 'SPINE']
                    },
                    execution: {
                        setup: [
                            'Lie on your back with your legs extended toward the ceiling',
                            'Place your arms flat on the floor at your sides',
                            'Press your lower back into the floor'
                        ],
                        steps: [
                            'Brace your core and maintain a neutral spine',
                            'Lift your hips off the floor, bringing your knees toward your chest',
                            'Pause briefly at the top of the movement',
                            'Lower your hips back down to the floor with control',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '2-1-1-1 (2 seconds up, 1 second pause, 1 second down, 1 second pause)',
                        keyPoints: [
                            'Keep your lower back pressed against the floor throughout the movement',
                            'Focus on using your lower abs to lift your hips',
                            'Control the descent',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with fewer repetitions to practice the movement',
                            'Stop immediately if you feel pain in your lower back',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move with control'
                        ],
                        prerequisites: [
                            'Basic core awareness',
                            'Ability to maintain a neutral spine',
                            'Basic crunch proficiency'
                        ]
                    }
                }
            },
            {
                name: 'Ab Wheel Rollout',
                description: 'An advanced core exercise that targets the entire abdominal region, particularly the rectus abdominis and transverse abdominis.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                level: Enums_1.Difficulty.ADVANCED,
                movementPattern: Enums_1.MovementPattern.SQUAT,
                targetMuscleGroups: ['RECTUS_ABDOMINIS', 'TRANSVERSE_ABDOMINIS', 'OBLIQUES'],
                synergistMuscleGroups: ['SHOULDERS', 'CHEST', 'UPPER_BACK', 'HIPS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Ab Wheel'],
                form: {
                    muscles: {
                        primary: ['RECTUS_ABDOMINIS', 'TRANSVERSE_ABDOMINIS', 'OBLIQUES'],
                        secondary: ['SHOULDERS', 'CHEST', 'UPPER_BACK', 'HIPS']
                    },
                    joints: {
                        primary: ['SHOULDER', 'HIP', 'SPINE']
                    },
                    execution: {
                        setup: [
                            'Kneel on the floor with the ab wheel in front of you',
                            'Grip the handles of the ab wheel with both hands',
                            'Position your hands directly under your shoulders'
                        ],
                        steps: [
                            'Brace your core and maintain a neutral spine',
                            'Roll the ab wheel forward, extending your arms and lowering your body toward the floor',
                            'Stop before your body touches the floor',
                            'Roll the ab wheel back to the starting position',
                            'Repeat for the prescribed number of repetitions'
                        ],
                        tempo: '3-1-1-1 (3 seconds roll out, 1 second pause, 1 second roll back, 1 second pause)',
                        keyPoints: [
                            'Keep your back in a neutral position throughout the movement',
                            'Engage your core throughout the exercise',
                            'Control the movement throughout the range of motion',
                            'Breathe steadily throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with a smaller range of motion to practice the movement',
                            'Stop immediately if you feel pain in your lower back or shoulders',
                            'Don\'t hold your breath during the exercise'
                        ],
                        tips: [
                            'Focus on maintaining good form throughout the movement',
                            'Keep your core engaged throughout the exercise',
                            'Move with control'
                        ],
                        prerequisites: [
                            'Advanced core strength',
                            'Ability to maintain a neutral spine under load',
                            'Good shoulder stability'
                        ]
                    }
                }
            },
            {
                name: 'Burpee',
                description: 'A full-body exercise that combines a squat, push-up, and jump.',
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.CARDIO, Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PUSH,
                targetMuscleGroups: ['QUADS', 'CHEST', 'SHOULDERS', 'CORE'],
                synergistMuscleGroups: ['HAMSTRINGS', 'GLUTES', 'CALVES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: [],
                form: {
                    muscles: {
                        primary: ['QUADS', 'CHEST', 'SHOULDERS', 'CORE'],
                        secondary: ['HAMSTRINGS', 'GLUTES', 'CALVES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Stand with feet shoulder-width apart',
                            'Arms at sides'
                        ],
                        steps: [
                            'Drop into a squat position with hands on the ground',
                            'Kick feet back into a push-up position',
                            'Perform a push-up',
                            'Jump feet back to squat position',
                            'Explosively jump up with arms overhead'
                        ],
                        tempo: 'Perform each movement with control, explode on the jump',
                        keyPoints: [
                            'Keep core tight throughout',
                            'Land softly on balls of feet',
                            'Maintain proper push-up form when in plank position'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Avoid if you have shoulder or knee issues',
                            'Start with modified version if needed'
                        ],
                        tips: [
                            'Can be modified by removing push-up or jump',
                            'Focus on form before speed',
                            'Stay hydrated during high-intensity cardio'
                        ],
                        prerequisites: [
                            'Ability to perform push-ups',
                            'Basic squat form',
                            'Explosive jump capability'
                        ]
                    }
                }
            },
            {
                name: 'High Knees',
                description: 'A cardio exercise that involves running in place while bringing knees up towards chest.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CARDIO],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.LOCOMOTION,
                targetMuscleGroups: ['QUADS', 'HIP_FLEXORS', 'CORE'],
                synergistMuscleGroups: ['CALVES', 'HAMSTRINGS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: [],
                form: {
                    muscles: {
                        primary: ['QUADS', 'HIP_FLEXORS', 'CORE'],
                        secondary: ['CALVES', 'HAMSTRINGS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Stand with feet hip-width apart',
                            'Arms bent at 90 degrees'
                        ],
                        steps: [
                            'Run in place',
                            'Drive knees up towards chest',
                            'Pump arms as if running',
                            'Land on balls of feet'
                        ],
                        tempo: 'Maintain a quick, steady pace',
                        keyPoints: [
                            'Keep core engaged',
                            'Stay on balls of feet',
                            'Maintain good posture'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start at a moderate pace',
                            'Land softly to reduce impact'
                        ],
                        tips: [
                            'Can be done in intervals',
                            'Focus on form over speed initially',
                            'Stay hydrated during cardio'
                        ],
                        prerequisites: [
                            'Basic running form',
                            'Adequate cardiovascular fitness'
                        ]
                    }
                }
            },
            {
                name: 'Sprint',
                description: 'A high-intensity running exercise performed at maximum speed.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CARDIO],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.LOCOMOTION,
                targetMuscleGroups: ['QUADS', 'HAMSTRINGS', 'CALVES', 'GLUTES'],
                synergistMuscleGroups: ['CORE', 'HIP_FLEXORS'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: [],
                form: {
                    muscles: {
                        primary: ['QUADS', 'HAMSTRINGS', 'CALVES', 'GLUTES'],
                        secondary: ['CORE', 'HIP_FLEXORS']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE']
                    },
                    execution: {
                        setup: [
                            'Stand in athletic stance',
                            'Feet shoulder-width apart',
                            'Arms bent at 90 degrees'
                        ],
                        steps: [
                            'Drive off balls of feet',
                            'Pump arms vigorously',
                            'Maintain forward lean',
                            'Drive knees up',
                            'Land midfoot'
                        ],
                        tempo: 'Maximum effort for short duration',
                        keyPoints: [
                            'Keep core tight',
                            'Maintain proper arm drive',
                            'Stay on balls of feet'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Proper warm-up required',
                            'Start with shorter distances',
                            'Ensure adequate recovery between sprints'
                        ],
                        tips: [
                            'Can be done in intervals',
                            'Focus on form over speed initially',
                            'Stay hydrated'
                        ],
                        prerequisites: [
                            'Basic running form',
                            'Adequate cardiovascular fitness',
                            'Proper warm-up routine'
                        ]
                    }
                }
            },
            {
                name: 'Rowing Machine',
                description: 'A full-body cardio exercise that simulates rowing motion.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CARDIO, Enums_1.ExerciseType.STRENGTH_COMPOUND],
                level: Enums_1.Difficulty.INTERMEDIATE,
                movementPattern: Enums_1.MovementPattern.PULL,
                targetMuscleGroups: ['BACK', 'SHOULDERS', 'QUADS', 'HAMSTRINGS'],
                synergistMuscleGroups: ['CORE', 'CALVES', 'GLUTES'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['ROWING_MACHINE'],
                form: {
                    muscles: {
                        primary: ['BACK', 'SHOULDERS', 'QUADS', 'HAMSTRINGS'],
                        secondary: ['CORE', 'CALVES', 'GLUTES']
                    },
                    joints: {
                        primary: ['SHOULDER', 'ELBOW', 'HIP', 'KNEE']
                    },
                    execution: {
                        setup: [
                            'Adjust foot straps',
                            'Sit with knees bent',
                            'Grip handle with overhand grip',
                            'Straight back, chest up'
                        ],
                        steps: [
                            'Drive legs back first',
                            'Lean back slightly',
                            'Pull handle to lower chest',
                            'Return to start position with control'
                        ],
                        tempo: '1:1 ratio for drive and recovery',
                        keyPoints: [
                            'Keep core engaged',
                            'Maintain straight back',
                            'Drive with legs first'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Start with proper form',
                            'Avoid rounding back',
                            'Don\'t pull too hard initially'
                        ],
                        tips: [
                            'Focus on form before intensity',
                            'Can be done in intervals',
                            'Stay hydrated during cardio'
                        ],
                        prerequisites: [
                            'Basic rowing form',
                            'Adequate cardiovascular fitness',
                            'Core stability'
                        ]
                    }
                }
            },
            {
                name: 'Elliptical Trainer',
                description: 'A low-impact cardio exercise that provides a full-body workout while being gentle on the joints, making it suitable for various fitness levels.',
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CARDIO],
                level: Enums_1.Difficulty.BEGINNER,
                movementPattern: Enums_1.MovementPattern.LOCOMOTION,
                targetMuscleGroups: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
                synergistMuscleGroups: ['CORE', 'SHOULDERS', 'BACK', 'CHEST'],
                trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
                equipmentNames: ['Elliptical Machine'],
                form: {
                    muscles: {
                        primary: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
                        secondary: ['CORE', 'SHOULDERS', 'BACK', 'CHEST']
                    },
                    joints: {
                        primary: ['HIP', 'KNEE', 'ANKLE', 'SHOULDER', 'ELBOW']
                    },
                    execution: {
                        setup: [
                            'Step onto the elliptical machine and grasp the handles',
                            'Adjust the resistance and incline settings as desired',
                            'Stand upright with your feet positioned on the foot pedals',
                            'Engage your core and maintain an upright posture',
                            'Keep your shoulders relaxed and down'
                        ],
                        steps: [
                            'Begin pedaling in a smooth, elliptical motion',
                            'Push and pull the handles in coordination with your leg movements',
                            'Maintain a steady, rhythmic pace',
                            'Keep your core engaged throughout the exercise',
                            'Focus on using your entire body, not just your legs',
                            'Continue for the prescribed duration',
                            'Cool down by gradually reducing your pace before stopping'
                        ],
                        tempo: 'Steady, rhythmic pace',
                        keyPoints: [
                            'Maintain an upright posture throughout',
                            'Coordinate your arm and leg movements',
                            'Engage your core to stabilize your body',
                            'Keep your movements smooth and controlled',
                            'Breathe rhythmically throughout the exercise'
                        ]
                    },
                    safety: {
                        cautions: [
                            'Do not perform if you have significant joint pain or injuries',
                            'Start with a lower resistance and progress gradually',
                            'Stop if you feel any pain, dizziness, or excessive fatigue'
                        ],
                        tips: [
                            'Start with a lower resistance to perfect form',
                            'Focus on maintaining proper posture throughout',
                            'Progress to higher resistance and longer durations gradually',
                            'Vary your workout by changing resistance, incline, and direction',
                            'Use the heart rate monitor if available to stay within your target zone'
                        ],
                        prerequisites: [
                            'Basic coordination',
                            'Adequate cardiovascular fitness',
                            'No significant joint limitations'
                        ]
                    }
                }
            }
        ];
        exercisesData.push({
            name: 'Clean and Press',
            description: 'A compound exercise that combines a clean (pulling the weight from the ground to the shoulders) with an overhead press.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.ADVANCED,
            movementPattern: Enums_1.MovementPattern.PULL,
            targetMuscleGroups: ['SHOULDERS', 'BACK', 'QUADRICEPS', 'HAMSTRINGS'],
            synergistMuscleGroups: ['TRAPS', 'FOREARMS', 'CORE', 'GLUTES'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Barbell', 'Dumbbells', 'Kettlebell'],
            form: {
                muscles: {
                    primary: ['SHOULDERS', 'BACK', 'QUADRICEPS', 'HAMSTRINGS'],
                    secondary: ['TRAPS', 'FOREARMS', 'CORE', 'GLUTES']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE', 'SHOULDER', 'ELBOW', 'WRIST']
                },
                execution: {
                    setup: [
                        "Stand with feet shoulder-width apart, toes slightly pointed outward",
                        "Place a barbell on the floor in front of you",
                        "Grip the barbell with hands slightly wider than shoulder-width, palms facing you"
                    ],
                    steps: [
                        "Hinge at the hips and bend the knees to lower your body toward the barbell",
                        "Explosively pull the barbell upward by extending your hips and knees",
                        "As the barbell reaches chest height, quickly rotate your elbows under the bar to catch it at shoulder level",
                        "From this position, press the barbell overhead until your arms are fully extended",
                        "Lower the barbell with control back to the starting position"
                    ],
                    tempo: "Explosive on the clean, controlled on the press and lower",
                    keyPoints: [
                        "Keep the bar close to your body throughout the movement",
                        "Engage your core throughout the exercise",
                        "Use your legs to generate power for the clean"
                    ]
                },
                safety: {
                    cautions: [
                        "Not suitable for beginners without proper coaching",
                        "High risk of injury if performed incorrectly",
                        "Avoid if you have shoulder, back, or wrist injuries"
                    ],
                    tips: [
                        "Start with lighter weights to master the technique",
                        "Consider learning the clean and press separately before combining them",
                        "Focus on proper form rather than heavy weight"
                    ],
                    prerequisites: [
                        "Good shoulder mobility",
                        "Strong core and back",
                        "Basic knowledge of Olympic lifting techniques"
                    ]
                }
            }
        }, {
            name: 'Push Press',
            description: 'A compound exercise that combines a slight dip with an explosive overhead press, allowing for heavier weights than a strict press.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['SHOULDERS', 'TRICEPS', 'QUADRICEPS'],
            synergistMuscleGroups: ['CORE', 'GLUTES', 'CALVES'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Barbell', 'Dumbbells', 'Kettlebell'],
            form: {
                muscles: {
                    primary: ['SHOULDERS', 'TRICEPS', 'QUADRICEPS'],
                    secondary: ['CORE', 'GLUTES', 'CALVES']
                },
                joints: {
                    primary: ['SHOULDER', 'ELBOW', 'HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        "Stand with feet shoulder-width apart",
                        "Hold a barbell or dumbbells at shoulder level with palms facing forward",
                        "Keep elbows tucked in and core engaged"
                    ],
                    steps: [
                        "Perform a quick dip by slightly bending your knees and hips",
                        "Explosively drive upward by extending your legs and hips",
                        "As your body straightens, press the weight overhead until your arms are fully extended",
                        "Lower the weight with control back to shoulder level",
                        "Reset and repeat the movement"
                    ],
                    tempo: "Explosive on the drive and press, controlled on the lower",
                    keyPoints: [
                        "Use the leg drive to generate momentum for the press",
                        "Keep your core tight throughout the movement",
                        "Press the weight directly overhead, not behind your head"
                    ]
                },
                safety: {
                    cautions: [
                        "Not suitable for beginners without proper coaching",
                        "High risk of injury if performed incorrectly",
                        "Avoid if you have shoulder, back, or knee injuries"
                    ],
                    tips: [
                        "Start with lighter weights to master the technique",
                        "Keep your wrists straight throughout the movement",
                        "Don't lean backward excessively during the press"
                    ],
                    prerequisites: [
                        "Good shoulder mobility",
                        "Basic overhead pressing strength",
                        "Core stability"
                    ]
                }
            }
        }, {
            name: 'Dumbbell Thruster',
            description: 'A full-body compound exercise that combines a squat with an overhead press, performed with dumbbells.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['SHOULDERS', 'TRICEPS', 'QUADRICEPS', 'GLUTES'],
            synergistMuscleGroups: ['CORE', 'CALVES', 'HAMSTRINGS'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Dumbbells'],
            form: {
                muscles: {
                    primary: ['SHOULDERS', 'TRICEPS', 'QUADRICEPS', 'GLUTES'],
                    secondary: ['CORE', 'CALVES', 'HAMSTRINGS']
                },
                joints: {
                    primary: ['SHOULDER', 'ELBOW', 'HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        "Stand with feet shoulder-width apart",
                        "Hold dumbbells at shoulder level with palms facing forward",
                        "Keep elbows tucked in and core engaged"
                    ],
                    steps: [
                        "Perform a squat by bending your knees and hips, keeping your chest up",
                        "As you reach the bottom of the squat, begin the upward movement",
                        "Explosively drive upward by extending your legs and hips",
                        "As your body straightens, press the dumbbells overhead until your arms are fully extended",
                        "Lower the dumbbells with control back to shoulder level",
                        "Reset and repeat the movement"
                    ],
                    tempo: "Controlled on the squat, explosive on the drive and press, controlled on the lower",
                    keyPoints: [
                        "Keep your elbows tucked in throughout the movement",
                        "Maintain an upright torso during the squat",
                        "Press the dumbbells directly overhead, not behind your head"
                    ]
                },
                safety: {
                    cautions: [
                        "Not suitable for beginners without proper coaching",
                        "High risk of injury if performed incorrectly",
                        "Avoid if you have shoulder, back, or knee injuries"
                    ],
                    tips: [
                        "Start with lighter weights to master the technique",
                        "Keep your wrists straight throughout the movement",
                        "Don't lean backward excessively during the press"
                    ],
                    prerequisites: [
                        "Good shoulder mobility",
                        "Basic squat and overhead pressing strength",
                        "Core stability"
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Barbell Back Squat',
            description: 'A fundamental compound exercise that targets the quadriceps, hamstrings, and glutes while also engaging the core and lower back.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.SQUAT,
            targetMuscleGroups: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
            synergistMuscleGroups: ['CORE', 'LOWER_BACK', 'CALVES'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Barbell', 'Squat Rack'],
            form: {
                muscles: {
                    primary: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
                    secondary: ['CORE', 'LOWER_BACK', 'CALVES']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Stand facing a plyo box or sturdy platform',
                        'Position your feet shoulder-width apart',
                        'Place your arms at your sides',
                        'Engage your core and maintain an upright posture'
                    ],
                    steps: [
                        'Begin by performing a countermovement (slight squat)',
                        'Explosively jump upward, swinging your arms forward and upward',
                        'Land softly on top of the box with both feet simultaneously',
                        'Land in a partial squat position with knees bent',
                        'Stand up fully on the box',
                        'Step down carefully (do not jump down)',
                        'Return to the starting position and repeat'
                    ],
                    tempo: 'Explosive concentric, controlled landing',
                    keyPoints: [
                        'Land softly and quietly on the box',
                        'Land with both feet simultaneously',
                        'Land in a partial squat position',
                        'Keep your knees aligned with your toes',
                        'Engage your core throughout the movement'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have ankle, knee, or lower back injuries',
                        'Start with a lower box height and progress gradually',
                        'Never jump down from the box - always step down',
                        'Stop if you feel any pain or excessive fatigue'
                    ],
                    tips: [
                        'Start with a lower box height to perfect form',
                        'Focus on landing softly and quietly',
                        'Progress to higher boxes as you build strength and confidence',
                        'Ensure the box is stable and secure before jumping'
                    ],
                    prerequisites: [
                        'Basic squat proficiency',
                        'Adequate lower body strength',
                        'Good balance and coordination',
                        'No significant lower body injuries'
                    ]
                }
            }
        }, {
            name: 'Jumping Jack',
            description: 'A classic full-body cardio exercise that improves coordination, agility, and cardiovascular fitness while engaging multiple muscle groups.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.CARDIO, Enums_1.ExerciseType.HIIT],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.LOCOMOTION,
            targetMuscleGroups: ['QUADS', 'CALVES', 'SHOULDERS'],
            synergistMuscleGroups: ['CORE', 'GLUTES', 'HIP_FLEXORS'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Bodyweight'],
            form: {
                muscles: {
                    primary: ['QUADS', 'CALVES', 'SHOULDERS'],
                    secondary: ['CORE', 'GLUTES', 'HIP_FLEXORS']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE', 'SHOULDER']
                },
                execution: {
                    setup: [
                        'Stand with feet together and arms at your sides',
                        'Engage your core and maintain an upright posture',
                        'Keep your shoulders relaxed and down'
                    ],
                    steps: [
                        'Jump and simultaneously spread your legs wider than shoulder-width apart',
                        'As you spread your legs, raise your arms above your head',
                        'Land softly on the balls of your feet with slightly bent knees',
                        'Immediately jump again, bringing your legs back together and lowering your arms',
                        'Continue the jumping motion rhythmically',
                        'Maintain a steady pace throughout the exercise'
                    ],
                    tempo: 'Steady, rhythmic pace',
                    keyPoints: [
                        'Land softly on the balls of your feet',
                        'Keep your knees slightly bent throughout',
                        'Coordinate your arm and leg movements',
                        'Keep your core engaged throughout',
                        'Maintain an upright posture'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have ankle, knee, hip, or shoulder injuries',
                        'Start with a slower pace to perfect form',
                        'Stop if you feel any pain or excessive fatigue'
                    ],
                    tips: [
                        'Start with a slower pace to perfect form',
                        'Focus on landing softly and quietly',
                        'Progress to faster speeds gradually',
                        'Modify the exercise by stepping instead of jumping if needed'
                    ],
                    prerequisites: [
                        'Basic coordination',
                        'Adequate lower body mobility',
                        'No significant lower body injuries'
                    ]
                }
            }
        }, {
            name: 'Bear Crawl',
            description: 'A full-body exercise that improves coordination, core strength, and cardiovascular fitness while developing functional movement patterns.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.CARDIO, Enums_1.ExerciseType.CORE],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.LOCOMOTION,
            targetMuscleGroups: ['CORE', 'SHOULDERS', 'QUADS'],
            synergistMuscleGroups: ['GLUTES', 'CALVES', 'FOREARMS'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['Bodyweight'],
            form: {
                muscles: {
                    primary: ['CORE', 'SHOULDERS', 'QUADS'],
                    secondary: ['GLUTES', 'CALVES', 'FOREARMS']
                },
                joints: {
                    primary: ['SHOULDER', 'HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Start on your hands and knees with your hands directly under your shoulders',
                        'Lift your knees slightly off the ground, balancing on your hands and toes',
                        'Keep your back flat and parallel to the ground',
                        'Engage your core and maintain a neutral spine',
                        'Position your head in line with your spine, looking down at the ground'
                    ],
                    steps: [
                        'Move forward by simultaneously moving your right hand and left foot',
                        'Follow with your left hand and right foot',
                        'Maintain the bear crawl position throughout the movement',
                        'Keep your hips level and avoid swaying from side to side',
                        'Continue crawling for the prescribed duration or distance',
                        'To reverse direction, move backward by moving your right hand and left foot backward, followed by your left hand and right foot'
                    ],
                    tempo: 'Controlled, deliberate movements',
                    keyPoints: [
                        'Keep your back flat and parallel to the ground',
                        'Maintain a neutral spine throughout',
                        'Engage your core to stabilize your body',
                        'Move your opposite hand and foot simultaneously',
                        'Keep your hips level and avoid swaying'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have wrist, shoulder, or lower back injuries',
                        'Start with shorter durations and progress gradually',
                        'Stop if you feel any pain or excessive fatigue'
                    ],
                    tips: [
                        'Start with shorter distances or durations to perfect form',
                        'Focus on maintaining proper alignment throughout',
                        'Progress to longer distances or durations gradually',
                        'Modify the exercise by crawling on your knees if needed'
                    ],
                    prerequisites: [
                        'Basic core strength',
                        'Adequate shoulder and wrist stability',
                        'No significant upper body or lower back injuries'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Shoulder Dislocates',
            description: 'A mobility exercise that improves shoulder range of motion and flexibility.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.FLEXIBILITY],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.ROTATION,
            targetMuscleGroups: ['SHOULDERS', 'UPPER_BACK'],
            synergistMuscleGroups: ['CHEST', 'LATS'],
            trackingFeatures: [Enums_1.TrackingFeature.RANGE, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['PVC_PIPE', 'BROOMSTICK', 'RESISTANCE_BAND'],
            form: {
                muscles: {
                    primary: ['SHOULDERS', 'UPPER_BACK'],
                    secondary: ['CHEST', 'LATS']
                },
                joints: {
                    primary: ['SHOULDER']
                },
                execution: {
                    setup: [
                        'Stand with feet shoulder-width apart',
                        'Hold a PVC pipe, broomstick, or resistance band with a wide overhand grip',
                        'Start with the implement in front of your body at hip level'
                    ],
                    steps: [
                        'Keeping your arms straight, slowly raise the implement overhead',
                        'Continue moving the implement behind your body in a circular motion',
                        'Complete the circle by bringing the implement back to the starting position',
                        'Reverse the direction and repeat'
                    ],
                    tempo: 'Slow and controlled, focusing on smooth movement',
                    keyPoints: [
                        'Keep your arms straight throughout the movement',
                        'Maintain a neutral spine',
                        'Breathe deeply and relax your shoulders',
                        'Only go as far as your mobility allows'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have shoulder injuries',
                        'Start with a wider grip and gradually narrow it as mobility improves',
                        'Stop if you feel pain'
                    ],
                    tips: [
                        'Use a resistance band if a PVC pipe or broomstick is too challenging',
                        'Focus on smooth, controlled movement rather than speed',
                        'Keep your core engaged to maintain proper posture'
                    ],
                    prerequisites: [
                        'Basic shoulder mobility',
                        'No significant shoulder pain or injuries'
                    ]
                }
            }
        }, {
            name: 'Hip Flexor Stretch',
            description: 'A static stretch that targets the hip flexors to improve hip mobility and reduce tightness.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.FLEXIBILITY],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.LUNGE,
            targetMuscleGroups: ['HIP_FLEXORS'],
            synergistMuscleGroups: ['QUADS'],
            trackingFeatures: [Enums_1.TrackingFeature.RANGE, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['EXERCISE_MAT'],
            form: {
                muscles: {
                    primary: ['HIP_FLEXORS'],
                    secondary: ['QUADS']
                },
                joints: {
                    primary: ['HIP', 'KNEE']
                },
                execution: {
                    setup: [
                        'Kneel on one knee with the other foot forward in a lunge position',
                        'Place your hands on your hips or the floor for support',
                        'Keep your torso upright'
                    ],
                    steps: [
                        'Gently press your hips forward',
                        'Feel a stretch in the front of your hip and thigh',
                        'Hold the stretch for the prescribed duration',
                        'Switch sides and repeat'
                    ],
                    tempo: 'Hold static position',
                    keyPoints: [
                        'Keep your torso upright',
                        'Engage your core to protect your lower back',
                        'Breathe deeply and relax into the stretch',
                        'Avoid arching your lower back'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have hip or knee injuries',
                        'Start with shorter holds and gradually increase duration',
                        'Stop if you feel pain'
                    ],
                    tips: [
                        'Place a mat under your knee for comfort',
                        'Focus on feeling the stretch in your hip flexors, not your lower back',
                        'Keep your back knee slightly off the ground for a deeper stretch'
                    ],
                    prerequisites: [
                        'Basic hip mobility',
                        'No significant hip or knee pain'
                    ]
                }
            }
        }, {
            name: 'Hamstring Stretch',
            description: 'A static stretch that targets the hamstrings to improve flexibility and reduce tightness.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.FLEXIBILITY],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['HAMSTRINGS'],
            synergistMuscleGroups: ['CALVES', 'GLUTES'],
            trackingFeatures: [Enums_1.TrackingFeature.RANGE, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['EXERCISE_MAT'],
            form: {
                muscles: {
                    primary: ['HAMSTRINGS'],
                    secondary: ['CALVES', 'GLUTES']
                },
                joints: {
                    primary: ['HIP', 'KNEE']
                },
                execution: {
                    setup: [
                        'Sit on the floor with one leg extended straight in front of you',
                        'Bend the other leg and place the sole of your foot against your inner thigh',
                        'Keep your back straight and chest up'
                    ],
                    steps: [
                        'Hinge at your hips and reach toward your extended foot',
                        'Keep your extended leg straight with toes pointing toward the ceiling',
                        'Hold the stretch for the prescribed duration',
                        'Switch legs and repeat'
                    ],
                    tempo: 'Hold static position',
                    keyPoints: [
                        'Keep your back straight and avoid rounding your spine',
                        'Focus on hinging at the hips, not bending at the waist',
                        'Breathe deeply and relax into the stretch',
                        'Only go as far as your flexibility allows'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have hamstring or lower back injuries',
                        'Start with shorter holds and gradually increase duration',
                        'Stop if you feel pain'
                    ],
                    tips: [
                        'Use a strap or towel around your foot if you can\'t reach it',
                        'Keep your extended leg straight but don\'t lock your knee',
                        'Focus on feeling the stretch in your hamstrings, not your lower back'
                    ],
                    prerequisites: [
                        'Basic hamstring flexibility',
                        'No significant hamstring or lower back pain'
                    ]
                }
            }
        }, {
            name: 'World\'s Greatest Stretch',
            description: 'A dynamic mobility exercise that targets multiple muscle groups and improves overall movement patterns.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.FLEXIBILITY],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.LUNGE,
            targetMuscleGroups: ['HIP_FLEXORS', 'HAMSTRINGS', 'GLUTES', 'SHOULDERS', 'THORACIC_SPINE'],
            synergistMuscleGroups: ['QUADS', 'CALVES', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.RANGE, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['EXERCISE_MAT'],
            form: {
                muscles: {
                    primary: ['HIP_FLEXORS', 'HAMSTRINGS', 'GLUTES', 'SHOULDERS', 'THORACIC_SPINE'],
                    secondary: ['QUADS', 'CALVES', 'CORE']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'SHOULDER', 'THORACIC_SPINE']
                },
                execution: {
                    setup: [
                        'Start in a lunge position with your right foot forward',
                        'Place your left hand on the ground next to your right foot',
                        'Raise your right arm toward the ceiling'
                    ],
                    steps: [
                        'Rotate your right arm and torso toward the ceiling',
                        'Hold briefly, then return to the starting position',
                        'Perform the prescribed number of repetitions',
                        'Switch sides and repeat'
                    ],
                    tempo: 'Controlled movement with a brief pause at the end of each rotation',
                    keyPoints: [
                        'Keep your front knee aligned with your toes',
                        'Maintain a stable base with your supporting hand',
                        'Focus on rotating from your thoracic spine, not your lower back',
                        'Breathe deeply throughout the movement'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have hip, knee, shoulder, or back injuries',
                        'Start with a smaller range of motion and gradually increase',
                        'Stop if you feel pain'
                    ],
                    tips: [
                        'Keep your movements controlled and deliberate',
                        'Focus on quality of movement rather than speed',
                        'Engage your core to maintain stability'
                    ],
                    prerequisites: [
                        'Basic lunge movement',
                        'Adequate hip and shoulder mobility',
                        'Core stability'
                    ]
                }
            }
        }, {
            name: 'Downward Dog',
            description: 'A yoga pose that stretches the entire posterior chain while building strength and stability.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.FLEXIBILITY],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['HAMSTRINGS', 'CALVES', 'SHOULDERS', 'UPPER_BACK'],
            synergistMuscleGroups: ['CORE', 'GLUTES'],
            trackingFeatures: [Enums_1.TrackingFeature.RANGE, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['EXERCISE_MAT'],
            form: {
                muscles: {
                    primary: ['HAMSTRINGS', 'CALVES', 'SHOULDERS', 'UPPER_BACK'],
                    secondary: ['CORE', 'GLUTES']
                },
                joints: {
                    primary: ['SHOULDER', 'HIP', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Start on your hands and knees with your wrists slightly in front of your shoulders',
                        'Tuck your toes under and lift your hips toward the ceiling',
                        'Form an inverted V shape with your body'
                    ],
                    steps: [
                        'Press your hands firmly into the ground',
                        'Lengthen your spine by reaching your sit bones toward the ceiling',
                        'Press your heels toward the ground',
                        'Hold the position for the prescribed duration'
                    ],
                    tempo: 'Hold static position',
                    keyPoints: [
                        'Keep your arms and legs straight',
                        'Distribute your weight evenly between your hands and feet',
                        'Engage your core to protect your lower back',
                        'Breathe deeply throughout the pose'
                    ]
                },
                safety: {
                    cautions: [
                        'Do not perform if you have wrist, shoulder, or lower back injuries',
                        'Start with shorter holds and gradually increase duration',
                        'Stop if you feel pain'
                    ],
                    tips: [
                        'Bend your knees slightly if your hamstrings are tight',
                        'Focus on lengthening your spine rather than pressing your heels to the ground',
                        'Keep your head between your arms'
                    ],
                    prerequisites: [
                        'Basic shoulder and hip mobility',
                        'Core stability',
                        'No significant wrist, shoulder, or back pain'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Hip Thrust',
            description: 'A glute-focused exercise that involves driving the hips upward against resistance, maximizing glute activation and strength.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['GLUTES'],
            synergistMuscleGroups: ['HAMSTRINGS', 'LOWER_BACK', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['bench', 'barbell'],
            form: {
                muscles: {
                    primary: ['GLUTES'],
                    secondary: ['HAMSTRINGS', 'LOWER_BACK', 'CORE']
                },
                joints: {
                    primary: ['HIP', 'KNEE']
                },
                execution: {
                    setup: [
                        'Sit on the ground with your upper back against a bench',
                        'Place a barbell over your hips, adding a pad for comfort',
                        'Bend knees to approximately 90 degrees with feet flat on the floor',
                        'Position feet hip-width apart, toes slightly turned out'
                    ],
                    steps: [
                        'Drive through your heels to raise your hips',
                        'Squeeze glutes at the top position where torso and thighs are parallel to the ground',
                        'Maintain a neutral spine throughout the movement',
                        'Lower hips back to starting position with control'
                    ],
                    tempo: 'Control the descent, pause briefly at top contraction',
                    keyPoints: [
                        'Focus on using glutes to drive the movement',
                        'Keep chin tucked to maintain neutral spine',
                        'Reach full hip extension at the top position',
                        'Maintain tension throughout the movement'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid excessive arching of the lower back',
                        'Start with bodyweight before adding resistance',
                        'Use a pad on the barbell to protect hip bones'
                    ],
                    tips: [
                        'Visualize pushing the floor away with your heels',
                        'Think about driving your knees forward to engage hamstrings',
                        'Use a lighter weight to perfect form before progression'
                    ],
                    prerequisites: [
                        'Basic hip mobility',
                        'No acute lower back pain',
                        'Core stability'
                    ]
                }
            }
        }, {
            name: 'Glute Bridge',
            description: 'A fundamental glute exercise performed lying on the back, focusing on hip extension to target the gluteal muscles.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['GLUTES'],
            synergistMuscleGroups: ['HAMSTRINGS', 'LOWER_BACK'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['Bodyweight'],
            form: {
                muscles: {
                    primary: ['GLUTES'],
                    secondary: ['HAMSTRINGS', 'LOWER_BACK']
                },
                joints: {
                    primary: ['HIP']
                },
                execution: {
                    setup: [
                        'Lie on your back with knees bent and feet flat on the floor',
                        'Position feet hip-width apart, heels about 6-8 inches from your glutes',
                        'Arms resting at your sides, palms down'
                    ],
                    steps: [
                        'Engage your core to stabilize your spine',
                        'Press through your heels to lift your hips off the ground',
                        'At the top, your body should form a straight line from shoulders to knees',
                        'Squeeze your glutes tightly at the top position',
                        'Lower your hips back to the starting position with control'
                    ],
                    tempo: 'Slow, controlled movement with a pause at the top',
                    keyPoints: [
                        'Keep your core engaged throughout the movement',
                        'Drive through the heels rather than the toes',
                        'Avoid overextending at the top position',
                        'Maintain a neutral spine position'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid excessive arching of the lower back',
                        'Don\'t lift the hips too high, which can strain the lower back',
                        'Stop if you feel any pain in your lower back'
                    ],
                    tips: [
                        'Place a rolled towel between your knees to engage inner thighs',
                        'For added difficulty, extend one leg straight during the bridge',
                        'Place arms across chest for more challenge to core stability'
                    ],
                    prerequisites: [
                        'Basic core stability',
                        'No acute lower back pain'
                    ]
                }
            }
        }, {
            name: 'Cable Pull Through',
            description: 'A hip hinge exercise using a cable machine that targets the glutes and hamstrings with a unique resistance angle.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['GLUTES', 'HAMSTRINGS'],
            synergistMuscleGroups: ['LOWER_BACK', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['cable_machine', 'rope_attachment'],
            form: {
                muscles: {
                    primary: ['GLUTES', 'HAMSTRINGS'],
                    secondary: ['LOWER_BACK', 'CORE']
                },
                joints: {
                    primary: ['HIP']
                },
                execution: {
                    setup: [
                        'Set a cable pulley to the lowest position with a rope attachment',
                        'Face away from the cable machine, straddling the cable',
                        'Hold the rope between your legs with both hands',
                        'Walk forward a few steps to create tension in the cable',
                        'Position feet shoulder-width apart, slight bend in the knees'
                    ],
                    steps: [
                        'Hinge at the hips, pushing them backward',
                        'Lower your torso forward while keeping your back straight',
                        'Allow the cable to pull your hands between your legs',
                        'Once you feel a stretch in your hamstrings, drive your hips forward',
                        'Squeeze your glutes as you return to the standing position',
                        'Keep arms straight throughout the movement'
                    ],
                    tempo: 'Controlled descent, powerful hip drive',
                    keyPoints: [
                        'Maintain a neutral spine throughout the movement',
                        'Push hips back, don\'t squat down',
                        'Keep the weight centered between your feet',
                        'Focus on hip extension, not lower back extension'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid rounding your lower back',
                        'Don\'t use momentum to swing the weight',
                        'Start with lighter weight to master form'
                    ],
                    tips: [
                        'Think about pushing your hips back as far as possible',
                        'Drive hips forward forcefully but controlled',
                        'Keep chest up throughout the movement',
                        'Focus on glute contraction at the top of the movement'
                    ],
                    prerequisites: [
                        'Proper hip hinge pattern',
                        'Basic core stability',
                        'No acute lower back pain'
                    ]
                }
            }
        }, {
            name: 'Curtsy Lunge',
            description: 'A variation of the lunge where you step one leg behind and across the other, targeting the glutes, especially the gluteus medius.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.LUNGE,
            targetMuscleGroups: ['GLUTES', 'QUADS'],
            synergistMuscleGroups: ['HAMSTRINGS', 'CALVES', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.BALANCE],
            equipmentNames: ['Bodyweight', 'dumbbells'],
            form: {
                muscles: {
                    primary: ['GLUTES', 'QUADS'],
                    secondary: ['HAMSTRINGS', 'CALVES', 'CORE']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Stand with feet hip-width apart',
                        'Optional: Hold dumbbells at your sides',
                        'Engage your core and stand tall'
                    ],
                    steps: [
                        'Step your right foot behind and across your left foot, as if curtsying',
                        'Bend both knees to lower your body toward the floor',
                        'Keep your chest up and hips squared forward',
                        'Push through your left heel to return to standing',
                        'Repeat on the other side, stepping your left foot behind and across'
                    ],
                    tempo: 'Controlled descent and ascent, pause briefly at the bottom',
                    keyPoints: [
                        'Keep your front knee tracking over your toes, not caving inward',
                        'Maintain an upright torso throughout the movement',
                        'Keep your hips squared forward, resisting the urge to rotate',
                        'Focus on stability and control rather than depth initially'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have knee or hip injuries',
                        'Start without weights until form is mastered',
                        'Don\'t allow the front knee to extend past the toes'
                    ],
                    tips: [
                        'Focus on glute engagement during the movement',
                        'Keep your weight centered between both feet',
                        'Use a mirror to check your form initially',
                        'Progress to holding weights only after mastering bodyweight version'
                    ],
                    prerequisites: [
                        'Basic lunge competency',
                        'Adequate hip mobility',
                        'Good balance and stability'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Banded Lateral Walk',
            description: 'A resistance exercise that targets the hip abductors, particularly the gluteus medius, by creating tension with a resistance band during lateral movement.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.LUNGE,
            targetMuscleGroups: ['GLUTES'],
            synergistMuscleGroups: ['HIP_ABDUCTORS', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['resistance_band'],
            form: {
                muscles: {
                    primary: ['GLUTES'],
                    secondary: ['HIP_ABDUCTORS', 'CORE']
                },
                joints: {
                    primary: ['HIP', 'KNEE']
                },
                execution: {
                    setup: [
                        'Place a resistance band just above your knees or around your ankles',
                        'Stand with feet hip-width apart, creating tension in the band',
                        'Slightly bend your knees and hinge at the hips',
                        'Engage your core and maintain good posture'
                    ],
                    steps: [
                        'Maintaining the slight squat position, step to the side with one foot',
                        'Follow with the other foot, maintaining band tension throughout',
                        'Take several steps in one direction, then reverse to return to starting position',
                        'Keep your toes pointed forward throughout the movement'
                    ],
                    tempo: 'Slow, controlled movement with constant tension',
                    keyPoints: [
                        'Maintain tension in the band throughout the exercise',
                        'Keep a slight bend in the knees the entire time',
                        'Don\'t let your knees cave inward against the band resistance',
                        'Maintain an upright torso, avoid leaning side to side'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have acute hip or knee injuries',
                        'Start with a lighter resistance band',
                        'Stop if you feel any pain in your knees or hips'
                    ],
                    tips: [
                        'Focus on pushing against the band with your lead leg',
                        'The wider your stance, the more you\'ll work the hip abductors',
                        'Keep your core engaged to prevent compensatory movements',
                        'For greater challenge, place the band around your ankles instead of knees'
                    ],
                    prerequisites: [
                        'Basic hip mobility',
                        'No acute hip or knee issues',
                        'Basic balance and stability'
                    ]
                }
            }
        }, {
            name: 'Front Squat',
            description: 'A squat variation where the weight is held in front of the body across the shoulders, placing greater emphasis on the quadriceps and core muscles.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.SQUAT,
            targetMuscleGroups: ['QUADRICEPS', 'CORE'],
            synergistMuscleGroups: ['GLUTES', 'HAMSTRINGS', 'LOWER_BACK', 'SHOULDERS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['barbell', 'squat_rack'],
            form: {
                muscles: {
                    primary: ['QUADRICEPS', 'CORE'],
                    secondary: ['GLUTES', 'HAMSTRINGS', 'LOWER_BACK', 'SHOULDERS']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Position a barbell at upper chest height on a squat rack',
                        'Step under the bar, creating a "rack" with your shoulders and crossed arms',
                        'Bar should rest across your front deltoids and clavicles',
                        'Elbows should be high and pointing forward',
                        'Stand with feet shoulder-width apart, toes slightly turned out'
                    ],
                    steps: [
                        'Brace your core and unrack the bar, stepping back from the rack',
                        'Initiate the movement by breaking at the hips and knees simultaneously',
                        'Descend by pushing your hips back and bending your knees',
                        'Keep your torso upright and elbows high throughout',
                        'Descend until thighs are at least parallel to the ground',
                        'Drive through your heels to return to the starting position',
                        'Maintain a neutral spine and engaged core throughout'
                    ],
                    tempo: 'Controlled descent, powerful ascent',
                    keyPoints: [
                        'Keep your chest up and elbows high throughout the movement',
                        'Maintain a vertical torso position, more upright than in back squats',
                        'Knees should track in line with toes, not caving inward',
                        'Weight should remain distributed across the entire foot, with emphasis on heels'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have wrist, shoulder, or knee injuries',
                        'Start with lighter weights to master form',
                        'Use a spotter or safety bars when using heavier weights'
                    ],
                    tips: [
                        'If wrist mobility is limited, try using lifting straps or a cross-arm grip',
                        'Focus on keeping elbows up to maintain a secure bar position',
                        'Practice with just the bar or even a PVC pipe to master the rack position',
                        'Use front squats to improve core strength and upper back posture'
                    ],
                    prerequisites: [
                        'Adequate ankle, hip, and thoracic spine mobility',
                        'Wrist and shoulder flexibility',
                        'Core strength and stability'
                    ]
                }
            }
        }, {
            name: 'Sumo Deadlift',
            description: 'A deadlift variation performed with a wide stance and hands inside the legs, targeting the quads, glutes and adductors more than a conventional deadlift.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['GLUTES', 'QUADRICEPS', 'ADDUCTORS'],
            synergistMuscleGroups: ['HAMSTRINGS', 'LOWER_BACK', 'TRAPS', 'FOREARMS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['barbell'],
            form: {
                muscles: {
                    primary: ['GLUTES', 'QUADRICEPS', 'ADDUCTORS'],
                    secondary: ['HAMSTRINGS', 'LOWER_BACK', 'TRAPS', 'FOREARMS']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Position your feet wider than shoulder-width apart, toes pointed out at 45 degrees',
                        'Barbell should be over midfoot',
                        'Hinge at the hips to grip the barbell with hands inside your legs, shoulder-width apart',
                        'Lower your hips until shins touch the bar, keeping your back flat',
                        'Chest up, shoulders down and back'
                    ],
                    steps: [
                        'Take a deep breath and brace your core',
                        'Drive through your heels and push the floor away',
                        'Keep the barbell close to your body throughout the lift',
                        'As the bar passes your knees, drive your hips forward to stand tall',
                        'Lock out by standing straight with shoulders back',
                        'Return the weight by hinging at the hips first, then bending the knees',
                        'Keep your back flat throughout the movement'
                    ],
                    tempo: 'Controlled but powerful on both ascent and descent',
                    keyPoints: [
                        'Maintain a neutral spine throughout the movement',
                        'Keep your chest up and shoulders back',
                        'Ensure knees track in line with toes',
                        'Push through heels and mid-foot, not the toes'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid rounding your lower back',
                        'Start with lighter weights to master proper form',
                        'Avoid if you have acute lower back injuries'
                    ],
                    tips: [
                        'Focus on pushing your knees out to engage adductors',
                        'Think about driving your feet through the floor rather than lifting with your back',
                        'Use hip drive to power the movement',
                        'Practice with just the bar to perfect your setup'
                    ],
                    prerequisites: [
                        'Good hip mobility',
                        'Core stability',
                        'No acute back problems',
                        'Basic deadlift mechanics'
                    ]
                }
            }
        }, {
            name: 'Single-Leg Deadlift',
            description: 'A unilateral deadlift variation performed on one leg that targets the posterior chain while challenging balance and stability.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['HAMSTRINGS', 'GLUTES'],
            synergistMuscleGroups: ['LOWER_BACK', 'CORE', 'CALVES'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.BALANCE],
            equipmentNames: ['dumbbell', 'kettlebell', 'Bodyweight'],
            form: {
                muscles: {
                    primary: ['HAMSTRINGS', 'GLUTES'],
                    secondary: ['LOWER_BACK', 'CORE', 'CALVES']
                },
                joints: {
                    primary: ['HIP', 'KNEE']
                },
                execution: {
                    setup: [
                        'Stand with feet hip-width apart',
                        'Hold a weight in one or both hands (or use bodyweight)',
                        'Shift your weight to one leg',
                        'Maintain a slight bend in the standing knee'
                    ],
                    steps: [
                        'Hinge at the hips while extending the non-standing leg behind you',
                        'Lower the weights toward the floor, keeping them close to your standing leg',
                        'Keep your back flat and hips square to the ground',
                        'Lower until you feel a stretch in the hamstring of your standing leg',
                        'Return to the starting position by driving through the heel of your standing foot',
                        'Squeeze your glutes at the top of the movement',
                        'Complete all reps on one side before switching legs'
                    ],
                    tempo: 'Slow, controlled movement, especially during the lowering phase',
                    keyPoints: [
                        'Keep your hips square to the ground throughout the movement',
                        'Maintain a neutral spine position',
                        'Focus on the hip hinge rather than bending at the waist',
                        'The standing leg should have a slight bend, not locked out'
                    ]
                },
                safety: {
                    cautions: [
                        'Start without weights to master balance and form',
                        'Avoid if you have significant balance issues or acute back pain',
                        'Don\'t round your lower back'
                    ],
                    tips: [
                        'Fix your gaze on a spot on the floor to help maintain balance',
                        'Start with a hand on a wall or other support if balance is challenging',
                        'Think of your raised leg and torso as opposing ends of a seesaw',
                        'Progress to weights only after mastering the bodyweight version'
                    ],
                    prerequisites: [
                        'Good single-leg balance',
                        'Proper hip hinge pattern',
                        'Core stability',
                        'Hamstring flexibility'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Standing Calf Raise',
            description: 'An isolation exercise that targets the gastrocnemius (upper calf muscle) by raising the heels while standing.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['CALVES'],
            synergistMuscleGroups: ['ANKLES', 'FEET'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['calf_raise_machine', 'smith_machine', 'barbell', 'step_platform'],
            form: {
                muscles: {
                    primary: ['CALVES'],
                    secondary: ['ANKLES', 'FEET']
                },
                joints: {
                    primary: ['ANKLE']
                },
                execution: {
                    setup: [
                        'Stand on the edge of a step or platform with heels hanging off',
                        'Hold onto a support for balance',
                        'Position balls of feet securely on the edge',
                        'Stand tall with shoulders back and core engaged'
                    ],
                    steps: [
                        'Lower your heels as far as comfortable below the level of the platform',
                        'Feel a stretch in your calves at the bottom position',
                        'Push through the balls of your feet to raise your heels as high as possible',
                        'Squeeze your calves at the top of the movement',
                        'Hold briefly at the top before lowering under control'
                    ],
                    tempo: 'Controlled movement with a brief pause at the top',
                    keyPoints: [
                        'Maintain a full range of motion, from stretch to full contraction',
                        'Keep your knees slightly bent or fully extended depending on comfort',
                        'Focus on using your calf muscles, not momentum',
                        'Control the movement throughout the entire range'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have Achilles tendon issues or ankle injuries',
                        'Don\'t bounce at the bottom of the movement',
                        'Use proper footwear for stability'
                    ],
                    tips: [
                        'Turn toes slightly inward to target outer calves',
                        'Turn toes slightly outward to target inner calves',
                        'For added challenge, use one leg at a time',
                        'Add weight by holding dumbbells or using a calf raise machine'
                    ],
                    prerequisites: [
                        'Basic ankle mobility',
                        'No acute Achilles tendon or ankle issues'
                    ]
                }
            }
        }, {
            name: 'Seated Calf Raise',
            description: 'An isolation exercise targeting the soleus (lower calf muscle) by raising the heels while seated with knees bent.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['CALVES'],
            synergistMuscleGroups: ['ANKLES', 'FEET'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['seated_calf_raise_machine', 'bench', 'barbell'],
            form: {
                muscles: {
                    primary: ['CALVES'],
                    secondary: ['ANKLES', 'FEET']
                },
                joints: {
                    primary: ['ANKLE']
                },
                execution: {
                    setup: [
                        'Sit on a seated calf raise machine or bench',
                        'Place balls of feet on the footplate or platform',
                        'Position knees bent at 90 degrees',
                        'Rest weight or machine pad on top of thighs near the knees'
                    ],
                    steps: [
                        'Lower your heels as far as comfortable below the level of the platform',
                        'Feel a stretch in your calves at the bottom position',
                        'Push through the balls of your feet to raise your heels as high as possible',
                        'Squeeze your calves at the top of the movement',
                        'Hold briefly at the top before lowering under control'
                    ],
                    tempo: 'Slow, controlled movement with a pause at the top and bottom',
                    keyPoints: [
                        'Keep knees bent at 90 degrees throughout the movement',
                        'Focus on full range of motion rather than heavy weight',
                        'Maintain proper posture with back straight',
                        'Control the weight through the entire movement'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have Achilles tendon issues or ankle injuries',
                        'Start with lighter weights to perfect form',
                        'Don\'t bounce at the bottom of the movement'
                    ],
                    tips: [
                        'Vary foot position to target different parts of the calf',
                        'Focus on quality contractions rather than quantity',
                        'Perform higher reps (12-20) for better results with calves',
                        'Stretch calves between sets to enhance muscle development'
                    ],
                    prerequisites: [
                        'Basic ankle mobility',
                        'No acute Achilles tendon or ankle issues'
                    ]
                }
            }
        }, {
            name: 'Donkey Calf Raise',
            description: 'A calf isolation exercise performed while bent at the hips, creating a unique angle for targeting the gastrocnemius muscles.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['CALVES'],
            synergistMuscleGroups: ['LOWER_BACK', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['step_platform', 'bench', 'weight_plate', 'machine'],
            form: {
                muscles: {
                    primary: ['CALVES'],
                    secondary: ['LOWER_BACK', 'CORE']
                },
                joints: {
                    primary: ['ANKLE']
                },
                execution: {
                    setup: [
                        'Place a platform or step in front of a bench or stable surface',
                        'Stand on the edge of the platform with balls of feet securely positioned',
                        'Bend at the hips to approximately 90 degrees and rest forearms on the bench',
                        'Keep your back flat and core engaged',
                        'Have a training partner sit on your lower back or use a specialized machine'
                    ],
                    steps: [
                        'Lower your heels as far as comfortable below the level of the platform',
                        'Feel a stretch in your calves at the bottom position',
                        'Push through the balls of your feet to raise your heels as high as possible',
                        'Squeeze your calves at the top of the movement',
                        'Lower your heels back to the starting position with control'
                    ],
                    tempo: 'Controlled movement with brief pauses at top and bottom',
                    keyPoints: [
                        'Maintain the bent-over position throughout the exercise',
                        'Keep your back flat, not rounded',
                        'Focus on a full range of motion in the ankles',
                        'Use controlled movements without bouncing'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have lower back issues or Achilles tendon problems',
                        'Ensure the weight on your back is secure and comfortable',
                        'Don\'t round your lower back'
                    ],
                    tips: [
                        'If no partner is available, use a weighted vest or specialized machine',
                        'The bent-over position helps isolate the calf muscles effectively',
                        'For variation, perform with toes pointing straight, in, or out',
                        'Higher rep ranges (15-25) often work best for calf development'
                    ],
                    prerequisites: [
                        'Good lower back strength and stability',
                        'Basic calf raise competency',
                        'No acute back issues'
                    ]
                }
            }
        }, {
            name: 'Single-Leg Calf Raise',
            description: 'A unilateral calf exercise that targets each leg individually for improved strength and balance.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['CALVES'],
            synergistMuscleGroups: ['ANKLES', 'FEET', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.BALANCE],
            equipmentNames: ['Bodyweight', 'dumbbell', 'step_platform'],
            form: {
                muscles: {
                    primary: ['CALVES'],
                    secondary: ['ANKLES', 'FEET', 'CORE']
                },
                joints: {
                    primary: ['ANKLE']
                },
                execution: {
                    setup: [
                        'Stand on the edge of a step or platform with one foot, heel hanging off',
                        'Hold onto a support with one hand for balance if needed',
                        'Position the ball of your foot securely on the edge',
                        'Lift your non-working foot by bending the knee behind you'
                    ],
                    steps: [
                        'Lower your heel as far as comfortable below the level of the platform',
                        'Feel a stretch in your calf at the bottom position',
                        'Push through the ball of your foot to raise your heel as high as possible',
                        'Squeeze your calf at the top of the movement',
                        'Hold briefly at the top before lowering under control',
                        'Complete all reps on one leg before switching'
                    ],
                    tempo: 'Slow, controlled movement with a brief pause at the top',
                    keyPoints: [
                        'Maintain balance throughout the movement',
                        'Use a full range of motion from stretch to contraction',
                        'Keep your core engaged for stability',
                        'Avoid leaning to one side or compensating with other muscles'
                    ]
                },
                safety: {
                    cautions: [
                        'Have a support nearby for balance if needed',
                        'Avoid if you have significant balance issues or ankle injuries',
                        'Don\'t bounce at the bottom of the movement'
                    ],
                    tips: [
                        'Hold a dumbbell in one hand for added resistance',
                        'For greater balance challenge, perform without holding a support',
                        'Focus on quality over quantity',
                        'Higher rep ranges (15-25) typically work well for calf development'
                    ],
                    prerequisites: [
                        'Basic balance ability',
                        'Ankle stability',
                        'No acute Achilles tendon or ankle issues'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Rear Delt Fly',
            description: 'An isolation exercise targeting the posterior deltoids, helping to improve shoulder definition, posture and balance in shoulder development.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.PULL,
            targetMuscleGroups: ['SHOULDERS'],
            synergistMuscleGroups: ['UPPER_BACK', 'TRAPS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['dumbbells', 'cables', 'resistance_bands', 'pec_deck_machine'],
            form: {
                muscles: {
                    primary: ['SHOULDERS'],
                    secondary: ['UPPER_BACK', 'TRAPS']
                },
                joints: {
                    primary: ['SHOULDER']
                },
                execution: {
                    setup: [
                        'For dumbbell variation: Sit at the end of a bench with a slight forward lean',
                        'Hold dumbbells in front of you with palms facing each other',
                        'Maintain a slight bend in the elbows',
                        'Keep your back flat and core engaged'
                    ],
                    steps: [
                        'With elbows slightly bent, raise arms out to the sides',
                        'Focus on using your rear deltoids to move the weight',
                        'Continue raising until arms are roughly parallel to the floor',
                        'Squeeze your shoulder blades together at the top',
                        'Slowly lower the weights back to the starting position with control'
                    ],
                    tempo: 'Controlled movement, especially during the lowering phase',
                    keyPoints: [
                        'Keep the movement in the horizontal plane',
                        'Maintain a slight bend in the elbows throughout',
                        'Focus on squeezing the rear deltoids, not just moving the weight',
                        'Avoid using momentum or swinging the weights'
                    ]
                },
                safety: {
                    cautions: [
                        'Start with lighter weights to perfect form',
                        'Avoid if you have shoulder injuries',
                        'Don\'t arch your back excessively'
                    ],
                    tips: [
                        'Try different hand positions (palms down, neutral, or thumbs up)',
                        'For greater isolation, perform on an incline bench',
                        'Focus on feeling the contraction in the rear deltoids',
                        'Can also be performed standing with a forward hinge at the hips'
                    ],
                    prerequisites: [
                        'Basic shoulder mobility',
                        'No acute shoulder injuries',
                        'Core stability'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Arnold Press',
            description: 'A compound shoulder exercise named after Arnold Schwarzenegger that works all three heads of the deltoid through a rotational pressing movement.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.PUSH,
            targetMuscleGroups: ['SHOULDERS'],
            synergistMuscleGroups: ['TRICEPS', 'UPPER_CHEST', 'TRAPS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['dumbbells'],
            form: {
                muscles: {
                    primary: ['SHOULDERS'],
                    secondary: ['TRICEPS', 'UPPER_CHEST', 'TRAPS']
                },
                joints: {
                    primary: ['SHOULDER', 'ELBOW']
                },
                execution: {
                    setup: [
                        'Sit on a bench with back support or stand with feet shoulder-width apart',
                        'Hold a dumbbell in each hand at shoulder height',
                        'Position dumbbells in front of shoulders with palms facing your body',
                        'Elbows should be bent and pointing down'
                    ],
                    steps: [
                        'Begin pressing the dumbbells upward while simultaneously rotating your palms',
                        'By the time your arms are extended, palms should be facing forward',
                        'At the top, your arms should be fully extended overhead',
                        'Reverse the movement by rotating palms back toward your body as you lower',
                        'Return to the starting position with dumbbells at shoulder height'
                    ],
                    tempo: 'Controlled, fluid movement throughout the entire range',
                    keyPoints: [
                        'Focus on the rotational component during the press',
                        'Keep core engaged to prevent arching your back',
                        'Maintain control throughout the entire movement',
                        'Don\'t let elbows flare excessively to the sides'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have shoulder impingement or rotator cuff issues',
                        'Start with lighter weights to master the rotation technique',
                        'Don\'t arch your lower back when pressing overhead'
                    ],
                    tips: [
                        'Focus on the mind-muscle connection with your deltoids',
                        'The rotational component helps target all three deltoid heads',
                        'Keep shoulders down and back throughout the movement',
                        'Can be performed seated (for more stability) or standing (for more core engagement)'
                    ],
                    prerequisites: [
                        'Good shoulder mobility and stability',
                        'No acute shoulder injuries',
                        'Core stability'
                    ]
                }
            }
        }, {
            name: 'Back Extension',
            description: 'An exercise that targets the lower back, glutes, and hamstrings by extending the torso from a bent-over position.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['LOWER_BACK'],
            synergistMuscleGroups: ['GLUTES', 'HAMSTRINGS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['hyperextension_bench', 'roman_chair', 'weight_plate'],
            form: {
                muscles: {
                    primary: ['LOWER_BACK'],
                    secondary: ['GLUTES', 'HAMSTRINGS']
                },
                joints: {
                    primary: ['SPINE', 'HIP']
                },
                execution: {
                    setup: [
                        'Adjust the hyperextension bench to fit your height',
                        'Position yourself with your hips on the pad and feet secured under the foot pads',
                        'Cross arms over chest or place hands behind head',
                        'For added resistance, hold a weight plate against your chest'
                    ],
                    steps: [
                        'Begin with your torso bent forward at the hips, maintaining a neutral spine',
                        'Engage your lower back and glutes to raise your torso',
                        'Continue until your body forms a straight line',
                        'Hold the top position briefly, focusing on contracting your lower back muscles',
                        'Lower your torso back to the starting position with control'
                    ],
                    tempo: 'Slow, controlled movement especially during lowering phase',
                    keyPoints: [
                        'Maintain a neutral spine throughout the movement',
                        'Focus on using your lower back muscles, not momentum',
                        'Don\'t hyperextend beyond a straight line at the top',
                        'Control the descent rather than letting gravity pull you down'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have acute lower back pain or disc issues',
                        'Don\'t hyperextend the back beyond a neutral position',
                        'Start without weight until form is mastered'
                    ],
                    tips: [
                        'Focus on squeezing the glutes at the top of the movement',
                        'For a more hamstring-focused variation, round your back slightly',
                        'For a more back-focused variation, maintain a flat back throughout',
                        'Can be performed with a twist at the top to engage obliques'
                    ],
                    prerequisites: [
                        'No acute lower back injuries',
                        'Basic core strength',
                        'Hip mobility'
                    ]
                }
            }
        }, {
            name: 'Kettlebell Swing',
            description: 'A dynamic, full-body exercise using a kettlebell to develop power, strength, and cardiovascular fitness through a hip-hinge movement pattern.',
            measurementType: Enums_1.MeasurementType.WEIGHT,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND, Enums_1.ExerciseType.POWER],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.HINGE,
            targetMuscleGroups: ['GLUTES', 'HAMSTRINGS'],
            synergistMuscleGroups: ['LOWER_BACK', 'CORE', 'SHOULDERS', 'QUADS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.POWER],
            equipmentNames: ['kettlebell'],
            form: {
                muscles: {
                    primary: ['GLUTES', 'HAMSTRINGS'],
                    secondary: ['LOWER_BACK', 'CORE', 'SHOULDERS', 'QUADS']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'SHOULDER']
                },
                execution: {
                    setup: [
                        'Stand with feet slightly wider than shoulder-width apart',
                        'Place kettlebell on the floor in front of you',
                        'Hinge at the hips to grip the kettlebell with both hands',
                        'Tilt the kettlebell slightly toward you',
                        'Keep your back flat and core engaged'
                    ],
                    steps: [
                        'Hike the kettlebell back between your legs like a football center',
                        'Quickly drive your hips forward to propel the kettlebell forward and up',
                        'Allow the kettlebell to rise to chest height through momentum',
                        'As the kettlebell begins to descend, guide it back between your legs',
                        'Hinge at the hips and slightly bend knees to absorb the weight',
                        'Immediately transition into the next repetition'
                    ],
                    tempo: 'Explosive hip drive, controlled descent',
                    keyPoints: [
                        'Power comes from the hips, not the arms or shoulders',
                        'Keep the core tight throughout the movement',
                        'Maintain a neutral spine position',
                        'Let the kettlebell float at the top, don\'t muscle it up'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have lower back issues',
                        'Start with a lighter kettlebell to master form',
                        'Keep the kettlebell close to the body throughout the movement'
                    ],
                    tips: [
                        'Think of the movement as a hip hinge, not a squat',
                        'Squeeze your glutes forcefully at the top of the swing',
                        'Inhale on the downswing, exhale forcefully on the upswing',
                        'Practice with a hip hinge pattern before adding the kettlebell'
                    ],
                    prerequisites: [
                        'Proper hip hinge pattern',
                        'Core strength and stability',
                        'No acute back issues'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Crunch',
            description: 'A basic abdominal exercise that targets the rectus abdominis by flexing the spine.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION, Enums_1.ExerciseType.CORE],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.CORE,
            targetMuscleGroups: ['ABS'],
            synergistMuscleGroups: ['OBLIQUES', 'HIP_FLEXORS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.COUNT],
            equipmentNames: ['Bodyweight', 'Exercise_Mat'],
            form: {
                muscles: {
                    primary: ['ABS'],
                    secondary: ['OBLIQUES', 'HIP_FLEXORS']
                },
                joints: {
                    primary: ['SPINE']
                },
                execution: {
                    setup: [
                        'Lie on your back on a mat',
                        'Bend your knees with feet flat on the floor, hip-width apart',
                        'Place hands lightly behind or beside your head, or cross arms over chest',
                        'Keep elbows wide and chin slightly tucked'
                    ],
                    steps: [
                        'Engage your core muscles',
                        'Curl your upper body forward by flexing your spine',
                        'Lift your shoulder blades off the ground',
                        'Focus on contracting your abdominal muscles',
                        'Hold the contracted position briefly',
                        'Lower back down with control, but don\'t let your head completely touch the ground'
                    ],
                    tempo: 'Controlled movement with a brief pause at the top',
                    keyPoints: [
                        'Focus on spinal flexion rather than lifting high',
                        'Avoid pulling on your neck with your hands',
                        'Maintain tension in your abs throughout the set',
                        'Exhale on the way up, inhale on the way down'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have neck or lower back issues',
                        'Don\'t pull on your head or neck',
                        'Keep movements controlled'
                    ],
                    tips: [
                        'For more challenge, hold a weight plate on your chest',
                        'To better isolate abs, press your lower back into the floor',
                        'Keep the movement small but focused',
                        'Think about bringing your ribs toward your pelvis'
                    ],
                    prerequisites: [
                        'Basic core awareness',
                        'No acute back pain',
                        'Ability to maintain neutral spine'
                    ]
                }
            }
        }, {
            name: 'Hanging Leg Raise',
            description: 'An advanced core exercise that targets the lower abdominal region while hanging from a bar.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION, Enums_1.ExerciseType.CORE],
            level: Enums_1.Difficulty.ADVANCED,
            movementPattern: Enums_1.MovementPattern.CORE,
            targetMuscleGroups: ['ABS', 'HIP_FLEXORS'],
            synergistMuscleGroups: ['OBLIQUES', 'FOREARMS', 'SHOULDERS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['pull_up_bar', 'captain\'s_chair'],
            form: {
                muscles: {
                    primary: ['ABS', 'HIP_FLEXORS'],
                    secondary: ['OBLIQUES', 'FOREARMS', 'SHOULDERS']
                },
                joints: {
                    primary: ['HIP', 'SHOULDER']
                },
                execution: {
                    setup: [
                        'Hang from a pull-up bar with an overhand grip slightly wider than shoulder-width',
                        'Allow your body to hang fully extended',
                        'Engage your shoulders by pulling them down away from your ears',
                        'Brace your core'
                    ],
                    steps: [
                        'Keep your legs straight or slightly bent',
                        'Initiate the movement by engaging your lower abs',
                        'Raise your legs forward and upward until they are parallel to the ground (or higher if possible)',
                        'Maintain control and avoid swinging or using momentum',
                        'Slowly lower your legs back to the starting position with control'
                    ],
                    tempo: 'Controlled movement, especially during the lowering phase',
                    keyPoints: [
                        'Focus on using your abs to lift, not hip flexors',
                        'Keep your upper body stable throughout the movement',
                        'Avoid swinging or using momentum',
                        'Maintain tension in your core throughout the entire set'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have shoulder, grip, or lower back issues',
                        'Don\'t perform if you can\'t maintain a stable hanging position',
                        'Start with knee raises if leg raises are too challenging'
                    ],
                    tips: [
                        'For beginners, bend knees to reduce leverage',
                        'To make more challenging, raise legs higher or add ankle weights',
                        'Focus on posterior pelvic tilt at the top of the movement',
                        'To isolate abs more, think about lifting your pelvis toward your ribs'
                    ],
                    prerequisites: [
                        'Adequate grip strength',
                        'Shoulder stability',
                        'Core strength',
                        'No acute lower back issues'
                    ]
                }
            }
        }, {
            name: 'Ab Rollout',
            description: 'A challenging core exercise that targets the entire abdominal wall through an extension and controlled return movement.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND, Enums_1.ExerciseType.CORE],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.CORE,
            targetMuscleGroups: ['ABS', 'CORE'],
            synergistMuscleGroups: ['SHOULDERS', 'LATS', 'HIP_FLEXORS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.RANGE],
            equipmentNames: ['ab_wheel', 'stability_ball', 'barbell'],
            form: {
                muscles: {
                    primary: ['ABS', 'CORE'],
                    secondary: ['SHOULDERS', 'LATS', 'HIP_FLEXORS']
                },
                joints: {
                    primary: ['SHOULDER', 'SPINE', 'HIP']
                },
                execution: {
                    setup: [
                        'Kneel on a mat with knees hip-width apart',
                        'Hold an ab wheel with both hands, positioned directly under your shoulders',
                        'Arms should be straight, with a slight bend in the elbows',
                        'Engage your core and maintain a neutral spine'
                    ],
                    steps: [
                        'Slowly roll the wheel forward, extending your body as far as possible while maintaining control',
                        'Keep your core tight and back flat throughout the movement',
                        'Extend until you feel a strong contraction in your abs, but before your back begins to arch',
                        'Engage your abs and use them to pull the wheel back to the starting position',
                        'Keep your arms straight throughout the movement'
                    ],
                    tempo: 'Slow and controlled in both directions',
                    keyPoints: [
                        'Maintain a neutral spine throughout the movement',
                        'Keep your core engaged to prevent lower back arching',
                        'Only roll out as far as you can control the movement',
                        'Focus on using your abs to pull back, not your arms'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have shoulder or lower back issues',
                        'Start with modified versions if you\'re a beginner',
                        'Stop if you feel any pain in your lower back'
                    ],
                    tips: [
                        'For beginners, limit the range of motion or start with a stability ball',
                        'Focus on keeping your hips stable throughout the movement',
                        'Gradually increase the distance of the rollout as you build strength',
                        'Advanced variation: perform from a standing position'
                    ],
                    prerequisites: [
                        'Strong core strength',
                        'Ability to maintain neutral spine under tension',
                        'Shoulder stability',
                        'No acute lower back issues'
                    ]
                }
            }
        });
        exercisesData.push({
            name: 'Toe Touches',
            description: 'A basic abdominal exercise that targets the upper abs by reaching toward the toes.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_ISOLATION, Enums_1.ExerciseType.CORE],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.CORE,
            targetMuscleGroups: ['ABS'],
            synergistMuscleGroups: ['HIP_FLEXORS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.COUNT],
            equipmentNames: ['Bodyweight', 'exercise_mat'],
            form: {
                muscles: {
                    primary: ['ABS'],
                    secondary: ['HIP_FLEXORS']
                },
                joints: {
                    primary: ['SPINE', 'HIP']
                },
                execution: {
                    setup: [
                        'Lie on your back on a mat',
                        'Extend your legs straight up toward the ceiling, perpendicular to your body',
                        'Keep your arms extended alongside your body',
                        'Engage your core muscles'
                    ],
                    steps: [
                        'Keeping your legs straight and stable, lift your upper body off the ground',
                        'Reach with your hands toward your toes',
                        'Contract your abs at the top of the movement',
                        'Slowly lower your upper body back to the ground with control',
                        'Maintain the position of your legs throughout the exercise'
                    ],
                    tempo: 'Controlled movement with a brief pause at the top',
                    keyPoints: [
                        'Keep your legs as stable as possible throughout the exercise',
                        'Focus on using your abs to lift your upper body, not momentum',
                        'Maintain a slight posterior pelvic tilt to protect your lower back',
                        'Exhale as you reach up, inhale as you lower down'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have lower back or neck issues',
                        'Don\'t allow your legs to sway or drop during the movement',
                        'Stop if you feel strain in your lower back'
                    ],
                    tips: [
                        'For easier variation, bend your knees slightly',
                        'For more challenge, hold the contracted position longer',
                        'Focus on quality contractions rather than speed or quantity',
                        'Keep your neck relaxed and chin slightly tucked'
                    ],
                    prerequisites: [
                        'Basic core strength',
                        'No acute back pain',
                        'Hamstring flexibility to hold legs vertical'
                    ]
                }
            }
        }, {
            name: 'Hollow Hold',
            description: 'An isometric core exercise that develops total core strength and stability through a challenging bodyweight hold.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.CORE, Enums_1.ExerciseType.STRENGTH_ISOLATION],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.CORE,
            targetMuscleGroups: ['ABS', 'CORE'],
            synergistMuscleGroups: ['HIP_FLEXORS', 'QUADS', 'SHOULDERS'],
            trackingFeatures: [Enums_1.TrackingFeature.FORM, Enums_1.TrackingFeature.TEMPO],
            equipmentNames: ['Bodyweight', 'exercise_mat'],
            form: {
                muscles: {
                    primary: ['ABS', 'CORE'],
                    secondary: ['HIP_FLEXORS', 'QUADS', 'SHOULDERS']
                },
                joints: {
                    primary: ['SPINE', 'HIP', 'SHOULDER']
                },
                execution: {
                    setup: [
                        'Lie on your back on a mat',
                        'Press your lower back into the floor',
                        'Extend your arms overhead',
                        'Raise your legs off the ground with knees straight or slightly bent'
                    ],
                    steps: [
                        'Lift your shoulders off the ground',
                        'Maintain the position with your lower back pressed into the floor',
                        'Hold your body in a slightly curved "hollow" position',
                        'Hold for the prescribed duration while maintaining proper form',
                        'Keep breathing throughout the hold'
                    ],
                    tempo: 'Static hold with full body tension',
                    keyPoints: [
                        'The key is maintaining constant pressure between your lower back and the floor',
                        'Adjust difficulty by changing arm and leg position (closer to body = easier)',
                        'Avoid letting your lower back arch off the floor',
                        'Keep your head in a neutral position, looking straight up'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have lower back or neck issues',
                        'Start with a modified position if you\'re a beginner',
                        'Don\'t hold your breath during the exercise'
                    ],
                    tips: [
                        'For beginners, bend knees or keep arms alongside body',
                        'For advanced variation, straighten legs and keep arms overhead',
                        'Focus on quality of position rather than duration initially',
                        'This exercise builds fundamental core strength for many other movements'
                    ],
                    prerequisites: [
                        'Basic core strength',
                        'Ability to maintain posterior pelvic tilt',
                        'No acute back pain'
                    ]
                }
            }
        }, {
            name: 'Jump Rope',
            description: 'A full-body cardio exercise that improves coordination, footwork, and cardiovascular endurance.',
            measurementType: Enums_1.MeasurementType.DURATION,
            types: [Enums_1.ExerciseType.CARDIO],
            level: Enums_1.Difficulty.BEGINNER,
            movementPattern: Enums_1.MovementPattern.LOCOMOTION,
            targetMuscleGroups: ['CALVES'],
            synergistMuscleGroups: ['SHOULDERS', 'FOREARMS', 'QUADS', 'HAMSTRINGS', 'CORE'],
            trackingFeatures: [Enums_1.TrackingFeature.COUNT, Enums_1.TrackingFeature.TEMPO],
            equipmentNames: ['jump_rope'],
            form: {
                muscles: {
                    primary: ['CALVES'],
                    secondary: ['SHOULDERS', 'FOREARMS', 'QUADS', 'HAMSTRINGS', 'CORE']
                },
                joints: {
                    primary: ['ANKLE', 'WRIST', 'SHOULDER']
                },
                execution: {
                    setup: [
                        'Stand with feet close together',
                        'Hold rope handles with hands at hip height',
                        'Position the rope behind you on the ground',
                        'Maintain slight bend in knees and elbows',
                        'Keep your core engaged and posture upright'
                    ],
                    steps: [
                        'Swing the rope overhead with a wrist rotation',
                        'Jump slightly off the ground as the rope passes under your feet',
                        'Land softly on the balls of your feet',
                        'Maintain a consistent rhythm and controlled breathing',
                        'Keep movements minimal and efficient'
                    ],
                    tempo: 'Consistent, rhythmic pace',
                    keyPoints: [
                        'Jump only 1-2 inches off the ground',
                        'Use your wrists, not your arms, to turn the rope',
                        'Keep your elbows close to your body',
                        'Maintain an upright posture throughout'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have ankle, knee, or foot injuries',
                        'Use caution on hard surfaces',
                        'Start with short durations and build gradually'
                    ],
                    tips: [
                        'Practice without the rope first if you\'re a beginner',
                        'Start with a heavier rope for easier control',
                        'For variety, try alternating feet, double jumps, or high knees',
                        'Use jump rope as a warm-up or for interval training'
                    ],
                    prerequisites: [
                        'Basic coordination',
                        'Ankle mobility',
                        'Cardiovascular fitness baseline',
                        'No acute lower body injuries'
                    ]
                }
            }
        }, {
            name: 'Box Jump',
            description: 'A plyometric exercise that develops power, explosiveness, and coordination in the lower body.',
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.PLYOMETRIC, Enums_1.ExerciseType.POWER],
            level: Enums_1.Difficulty.INTERMEDIATE,
            movementPattern: Enums_1.MovementPattern.SQUAT,
            targetMuscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
            synergistMuscleGroups: ['CALVES', 'CORE', 'LOWER_BACK'],
            trackingFeatures: [Enums_1.TrackingFeature.POWER, Enums_1.TrackingFeature.FORM],
            equipmentNames: ['plyo_box', 'sturdy_bench'],
            form: {
                muscles: {
                    primary: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
                    secondary: ['CALVES', 'CORE', 'LOWER_BACK']
                },
                joints: {
                    primary: ['HIP', 'KNEE', 'ANKLE']
                },
                execution: {
                    setup: [
                        'Stand facing a sturdy box or platform at an appropriate height',
                        'Position yourself about 6-8 inches from the box',
                        'Stand with feet shoulder-width apart',
                        'Arms at sides or in athletic ready position'
                    ],
                    steps: [
                        'Lower into a quarter squat position while swinging arms back',
                        'Swing arms forward and explosively extend hips, knees, and ankles to jump onto the box',
                        'Land softly in a partial squat position with both feet completely on the box',
                        'Stand up fully on the box to complete the rep',
                        'Step down one foot at a time (don\'t jump down)',
                        'Reset your position and repeat'
                    ],
                    tempo: 'Explosive jump, controlled landing, methodical step down',
                    keyPoints: [
                        'Land softly with knees tracking over toes',
                        'Use arm swing to help generate power',
                        'Land in the middle of the box, not on the edge',
                        'Always step down rather than jumping down to protect your joints'
                    ]
                },
                safety: {
                    cautions: [
                        'Avoid if you have knee, ankle, or hip injuries',
                        'Start with a lower box height and progress gradually',
                        'Ensure the box is sturdy and won\'t tip or slide'
                    ],
                    tips: [
                        'Start with a box height where you can land with minimal knee flexion',
                        'Focus on landing softly with "quiet" feet',
                        'Look at the center of the box, not your feet, when jumping',
                        'Perform when fresh, not when fatigued, to reduce injury risk'
                    ],
                    prerequisites: [
                        'Adequate lower body strength',
                        'Good squat form',
                        'Lower body power development',
                        'No acute lower body injuries'
                    ]
                }
            }
        });
        let addedCount = 0;
        let skippedCount = 0;
        for (const exerciseData of exercisesData) {
            const normalizedName = exerciseData.name.toLowerCase().trim();
            const existingSimilar = await exerciseRepository.findOne({
                where: {
                    name: (0, typeorm_1.ILike)(normalizedName)
                }
            });
            if (existingSimilar) {
                logger_1.default.info(`Skipping exercise "${exerciseData.name}" - exact match already exists`);
                skippedCount++;
                continue;
            }
            const exercise = new Exercise_1.Exercise();
            exercise.name = exerciseData.name;
            exercise.description = exerciseData.description;
            exercise.measurementType = exerciseData.measurementType;
            exercise.types = exerciseData.types;
            exercise.level = exerciseData.level;
            exercise.movementPattern = exerciseData.movementPattern;
            exercise.trackingFeatures = exerciseData.trackingFeatures || [];
            if (exerciseData.targetMuscleGroups && exerciseData.targetMuscleGroups.length > 0) {
                exercise.targetMuscleGroups = exerciseData.targetMuscleGroups;
            }
            else {
                exercise.targetMuscleGroups = [];
            }
            if (exerciseData.synergistMuscleGroups && exerciseData.synergistMuscleGroups.length > 0) {
                exercise.synergistMuscleGroups = exerciseData.synergistMuscleGroups;
            }
            else {
                exercise.synergistMuscleGroups = [];
            }
            exercise.form = exerciseData.form;
            if (muscleGroupCategories.length > 0) {
                exercise.categories = muscleGroupCategories.filter(category => exerciseData.targetMuscleGroups.includes(category.name.toUpperCase()));
            }
            if (allEquipment.length > 0 && exerciseData.equipmentNames) {
                exercise.equipmentOptions = [];
                for (const equipmentName of exerciseData.equipmentNames) {
                    const equipment = findEquipmentByName(equipmentName);
                    if (equipment) {
                        exercise.equipmentOptions.push(equipment);
                    }
                }
            }
            const stats = generateExerciseStats();
            exercise.stats = stats;
            await exerciseRepository.save(exercise);
            addedCount++;
        }
        logger_1.default.info(`Successfully seeded ${addedCount} exercises, skipped ${skippedCount} duplicates`);
    }
    catch (error) {
        logger_1.default.error('Error seeding exercises:', error);
        throw error;
    }
}
async function updateExerciseStats() {
    try {
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const exercises = await exerciseRepository.find();
        logger_1.default.info(`Found ${exercises.length} exercises to update stats for.`);
        let updatedCount = 0;
        for (const exercise of exercises) {
            exercise.stats = generateExerciseStats();
            await exerciseRepository.save(exercise);
            updatedCount++;
            if (updatedCount % 10 === 0) {
                logger_1.default.info(`Updated stats for ${updatedCount}/${exercises.length} exercises`);
            }
        }
        logger_1.default.info(`Successfully updated stats for all ${updatedCount} exercises`);
    }
    catch (error) {
        logger_1.default.error('Failed to update exercise stats:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExercises.js.map