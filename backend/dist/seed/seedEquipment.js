"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEquipment = seedEquipment;
const Equipment_1 = require("../models/Equipment");
const data_source_1 = require("../data-source");
const Enums_1 = require("../models/shared/Enums");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedEquipment() {
    try {
        const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        const existingCount = await equipmentRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} equipment items. Skipping seed.`);
            return;
        }
        const allCategories = await categoryRepository.find();
        if (allCategories.length === 0) {
            logger_1.default.warn('No exercise categories found. Equipment will be created without category associations.');
        }
        const muscleGroupCategories = allCategories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.MUSCLE_GROUP);
        const equipmentTypeCategories = allCategories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.EQUIPMENT);
        const specialCategories = allCategories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.SPECIAL);
        const movementPatternCategories = allCategories.filter(cat => cat.type === ExerciseCategory_1.CategoryType.MOVEMENT_PATTERN);
        const getCategoryByName = (name) => {
            return allCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
        };
        const equipmentData = [
            {
                name: 'Dumbbells',
                description: 'Variable weight handheld weights for a wide range of exercises.',
                category: Enums_1.EquipmentCategory.DUMBBELLS,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms'],
                trainingTypes: ['Strength_Compound', 'Strength_Isolation'],
                specifications: {
                    material: 'Metal, rubber, or neoprene coating',
                    color: 'Various',
                    adjustable: true,
                    warranty: 'Typically 1-5 years depending on brand',
                    features: ['Hexagonal design prevents rolling', 'Knurled handles for grip', 'Color-coded weights'],
                    accessories: ['Dumbbell rack', 'Grip pads', 'Adjustable collars']
                },
                alternatives: {
                    homeMade: ['Water bottles filled with sand', 'Milk jugs filled with water'],
                    budget: ['Resistance bands', 'Bodyweight exercises'],
                    premium: ['Adjustable dumbbells', 'Smart dumbbells with tracking'],
                    similar: ['Kettlebells', 'Fixed barbells']
                },
                purchaseUrl: 'https://www.example.com/dumbbells',
                estimatedPrice: 100,
                manufacturer: 'Various'
            },
            {
                name: 'Barbell',
                description: 'Long bar used with weight plates for compound exercises and maximum loading.',
                category: Enums_1.EquipmentCategory.BARBELLS,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.MEDIUM,
                targetMuscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes'],
                trainingTypes: ['Strength_Compound', 'Power'],
                specifications: {
                    material: 'Steel',
                    color: 'Silver/Black',
                    adjustable: true,
                    warranty: 'Typically 2-5 years',
                    features: ['Knurled grip', 'Olympic or standard sizing', 'Rotating sleeves'],
                    accessories: ['Weight plates', 'Collars', 'Pad for hip thrusts']
                },
                alternatives: {
                    homeMade: ['PVC pipe with concrete weights'],
                    budget: ['Fixed weight barbells', 'Resistance bands'],
                    premium: ['Specialty barbells (trap bar, safety squat bar)', 'Competition barbells'],
                    similar: ['Smith machine', 'Fixed barbells']
                },
                purchaseUrl: 'https://www.example.com/barbells',
                estimatedPrice: 150,
                manufacturer: 'Rogue, Eleiko, York'
            },
            {
                name: 'Kettlebell',
                description: 'Cast iron ball with a handle for dynamic, full-body exercises and ballistic movements.',
                category: Enums_1.EquipmentCategory.KETTLEBELLS,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Shoulders', 'Core', 'Glutes', 'Quadriceps', 'Back'],
                trainingTypes: ['Strength_Compound', 'Power', 'Functional'],
                specifications: {
                    material: 'Cast iron, sometimes vinyl-coated',
                    color: 'Various',
                    adjustable: false,
                    warranty: 'Typically 1-2 years',
                    features: ['Sturdy handle', 'Flat bottom for stability', 'Color-coded by weight'],
                    accessories: ['Kettlebell rack', 'Grip chalk', 'Wrist guards']
                },
                alternatives: {
                    homeMade: ['Milk jug filled with sand', 'Dumbbell used for kettlebell movements'],
                    budget: ['Resistance bands', 'Dumbbells'],
                    premium: ['Competition kettlebells', 'Adjustable kettlebells'],
                    similar: ['Steel mace', 'Medicine ball']
                },
                purchaseUrl: 'https://www.example.com/kettlebells',
                estimatedPrice: 60,
                manufacturer: 'Kettlebell Kings, Rogue'
            },
            {
                name: 'Resistance Bands',
                description: 'Elastic bands that provide variable resistance throughout the range of motion.',
                category: Enums_1.EquipmentCategory.RESISTANCE_BANDS,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.MINIMAL,
                targetMuscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Glutes'],
                trainingTypes: ['Strength_Isolation', 'Rehabilitation', 'Mobility'],
                specifications: {
                    material: 'Latex or fabric',
                    color: 'Various (often color-coded by resistance)',
                    adjustable: true,
                    warranty: 'Typically 3-12 months',
                    features: ['Multiple resistance levels', 'Portable', 'Door anchors'],
                    accessories: ['Handles', 'Ankle cuffs', 'Door anchor', 'Carrying bag']
                },
                alternatives: {
                    homeMade: ['Bicycle inner tubes', 'Exercise tubing'],
                    budget: ['Bodyweight exercises'],
                    premium: ['Cable machines', 'Smart resistance systems'],
                    similar: ['Suspension trainers', 'Resistance tubes']
                },
                purchaseUrl: 'https://www.example.com/resistance-bands',
                estimatedPrice: 30,
                manufacturer: 'TheraBand, Rogue'
            },
            {
                name: 'Suspension Trainer',
                description: 'Adjustable straps with handles that use bodyweight for functional strength training.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Core', 'Chest', 'Back', 'Shoulders', 'Arms'],
                trainingTypes: ['Strength_Compound', 'Functional', 'Core', 'Bodyweight'],
                specifications: {
                    material: 'Nylon straps with metal/plastic handles',
                    color: 'Black/Yellow',
                    adjustable: true,
                    warranty: 'Typically 1-2 years',
                    features: ['Adjustable length', 'Multiple anchor options', 'Non-slip handles'],
                    accessories: ['Door anchor', 'Extension strap', 'Carrying bag']
                },
                alternatives: {
                    homeMade: ['Rope with PVC pipe handles'],
                    budget: ['Resistance bands', 'Doorway pull-up bar'],
                    premium: ['Wall-mounted systems', 'Commercial suspension frames'],
                    similar: ['Gymnastics rings', 'Battle ropes']
                },
                purchaseUrl: 'https://www.example.com/suspension-trainer',
                estimatedPrice: 100,
                manufacturer: 'TRX, FITINDEX'
            },
            {
                name: 'Pull-up Bar',
                description: 'Bar mounted on a wall or doorway for upper body pulling exercises.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Back', 'Biceps', 'Forearms', 'Core'],
                trainingTypes: ['Strength_Compound', 'Bodyweight'],
                specifications: {
                    material: 'Steel with foam padding',
                    color: 'Black/Silver',
                    adjustable: false,
                    warranty: 'Typically 1 year',
                    features: ['Multiple grip positions', 'No-screw installation (for doorway type)', 'Foam padding'],
                    accessories: ['Gymnastics rings', 'Pull-up assist bands', 'Ab straps']
                },
                alternatives: {
                    homeMade: ['Tree branch', 'Sturdy horizontal beam'],
                    budget: ['Resistance bands with door anchor'],
                    premium: ['Wall-mounted pull-up station', 'Power tower'],
                    similar: ['Gymnastic rings', 'Climbing holds']
                },
                purchaseUrl: 'https://www.example.com/pullup-bar',
                estimatedPrice: 40,
                manufacturer: 'Iron Gym, ProSource'
            },
            {
                name: 'Yoga Mat',
                description: 'Non-slip mat for floor exercises, yoga, and general workout support.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.MINIMAL,
                targetMuscleGroups: ['Core', 'Full_Body'],
                trainingTypes: ['Flexibility', 'Balance', 'Core', 'Mobility'],
                specifications: {
                    material: 'PVC, TPE, or natural rubber',
                    color: 'Various',
                    adjustable: false,
                    warranty: 'Typically 3-12 months',
                    features: ['Non-slip texture', 'Cushioning', 'Easy to clean'],
                    accessories: ['Carrying strap', 'Mat towel', 'Cleaning spray']
                },
                alternatives: {
                    homeMade: ['Blanket or towel'],
                    budget: ['Exercise towel', 'Carpet'],
                    premium: ['Cork yoga mats', 'Extra-thick professional mats'],
                    similar: ['Exercise mat', 'Fitness towel']
                },
                purchaseUrl: 'https://www.example.com/yoga-mat',
                estimatedPrice: 25,
                manufacturer: 'Manduka, Lululemon, Gaiam'
            },
            {
                name: 'Adjustable Bench',
                description: 'Versatile weight bench with adjustable incline for various exercises.',
                category: Enums_1.EquipmentCategory.BENCHES,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.MEDIUM,
                targetMuscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
                trainingTypes: ['Strength_Compound', 'Strength_Isolation'],
                specifications: {
                    material: 'Steel frame with vinyl upholstery',
                    color: 'Black/Red',
                    adjustable: true,
                    warranty: 'Typically 2-5 years',
                    features: ['Multiple incline positions', 'Stable base', 'Padded surface'],
                    accessories: ['Leg developer attachment', 'Preacher curl attachment', 'Dip station']
                },
                alternatives: {
                    homeMade: ['Sturdy chair or ottoman'],
                    budget: ['Flat utility bench', 'Exercise ball'],
                    premium: ['Commercial gym bench', 'FID bench with attachments'],
                    similar: ['Flat bench', 'Specialized benches (preacher, abdominal)']
                },
                purchaseUrl: 'https://www.example.com/adjustable-bench',
                estimatedPrice: 150,
                manufacturer: 'Rogue, Rep Fitness, Bowflex'
            },
            {
                name: 'Squat Rack',
                description: 'Frame to safely hold barbell for squats, presses, and other free weight exercises.',
                category: Enums_1.EquipmentCategory.RACKS,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.PREMIUM,
                spaceRequired: Enums_1.SpaceRequirement.LARGE,
                targetMuscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Back', 'Chest', 'Shoulders'],
                trainingTypes: ['Strength_Compound', 'Power'],
                specifications: {
                    material: 'Heavy gauge steel',
                    color: 'Black',
                    adjustable: true,
                    warranty: 'Typically 5-10 years',
                    features: ['Safety bars/pins', 'Adjustable J-hooks', 'Pull-up bar'],
                    accessories: ['Dip bars', 'Landmine attachment', 'Plate storage', 'Band pegs']
                },
                alternatives: {
                    homeMade: ['Not recommended for safety reasons'],
                    budget: ['Squat stands', 'Independent squat stands'],
                    premium: ['Power rack', 'Half rack with platform'],
                    similar: ['Smith machine', 'Functional trainer']
                },
                purchaseUrl: 'https://www.example.com/squat-rack',
                estimatedPrice: 400,
                manufacturer: 'Rogue, Titan Fitness, Rep Fitness'
            },
            {
                name: 'Medicine Ball',
                description: 'Weighted ball for dynamic and explosive exercises, rotational movements, and throws.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Core', 'Chest', 'Shoulders', 'Back'],
                trainingTypes: ['Power', 'Functional', 'Core', 'Plyometric'],
                specifications: {
                    material: 'Rubber, leather, or synthetic material',
                    color: 'Various (often color-coded by weight)',
                    adjustable: false,
                    warranty: 'Typically 1 year',
                    features: ['Textured surface for grip', 'Bounce or no-bounce options', 'Even weight distribution'],
                    accessories: ['Storage rack', 'Training guide']
                },
                alternatives: {
                    homeMade: ['Basketball filled with sand', 'Weighted backpack'],
                    budget: ['Dumbbells for certain movements', 'Sandbag'],
                    premium: ['Slam balls', 'Smart medicine balls with tracking'],
                    similar: ['Slam ball', 'Wall ball']
                },
                purchaseUrl: 'https://www.example.com/medicine-ball',
                estimatedPrice: 40,
                manufacturer: 'Dynamax, Rogue'
            },
            {
                name: 'Plyo Box',
                description: 'Sturdy box for jumping, stepping, and elevated exercises to build power and explosiveness.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.MEDIUM,
                targetMuscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
                trainingTypes: ['Plyometric', 'Power', 'HIIT'],
                specifications: {
                    material: 'Wood or foam-covered steel',
                    color: 'Black/Wood',
                    adjustable: false,
                    warranty: 'Typically 1 year',
                    features: ['Multiple height options', 'Non-slip surface', 'Reinforced corners'],
                    accessories: ['Jump mat', 'Training guide']
                },
                alternatives: {
                    homeMade: ['DIY wooden box', 'Sturdy chair'],
                    budget: ['Step platform', 'Aerobic stepper'],
                    premium: ['Adjustable plyo box', 'Soft plyo box set'],
                    similar: ['Step platform', 'Weight bench (for step-ups only)']
                },
                purchaseUrl: 'https://www.example.com/plyo-box',
                estimatedPrice: 100,
                manufacturer: 'Rogue, Rep Fitness, JFIT'
            },
            {
                name: 'Treadmill',
                description: 'Running machine for cardiovascular training, walking, jogging, and sprinting regardless of weather.',
                category: Enums_1.EquipmentCategory.CARDIO,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.PREMIUM,
                spaceRequired: Enums_1.SpaceRequirement.LARGE,
                targetMuscleGroups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Core'],
                trainingTypes: ['Cardio', 'HIIT', 'Endurance'],
                specifications: {
                    material: 'Steel frame with rubber belt',
                    color: 'Black/Silver',
                    adjustable: true,
                    warranty: 'Typically 1-3 years, motor often 5+ years',
                    features: ['Adjustable incline', 'Speed control', 'Heart rate monitor', 'Programs'],
                    accessories: ['Heart rate chest strap', 'Floor mat', 'Device holder']
                },
                alternatives: {
                    homeMade: ['Outdoor running'],
                    budget: ['Jump rope', 'Running outdoors'],
                    premium: ['Curved manual treadmill', 'Commercial-grade treadmill'],
                    similar: ['Elliptical', 'Stationary bike', 'Rowing machine']
                },
                purchaseUrl: 'https://www.example.com/treadmill',
                estimatedPrice: 1000,
                manufacturer: 'NordicTrack, ProForm, LifeFitness'
            },
            {
                name: 'Jump Rope',
                description: 'Simple but effective tool for cardiovascular training, coordination, and footwork.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Calves', 'Shoulders', 'Forearms', 'Core'],
                trainingTypes: ['Cardio', 'HIIT', 'Endurance'],
                specifications: {
                    material: 'PVC, speed cable, or leather',
                    color: 'Various',
                    adjustable: true,
                    warranty: 'Typically 6 months',
                    features: ['Adjustable length', 'Weighted or speed options', 'Comfortable handles'],
                    accessories: ['Carrying bag', 'Replacement cable']
                },
                alternatives: {
                    homeMade: ['Rope with makeshift handles'],
                    budget: ['Jumping jacks', 'High knees'],
                    premium: ['Smart jump rope with counter', 'Weighted jump rope set'],
                    similar: ['Agility ladder', 'Battle rope']
                },
                purchaseUrl: 'https://www.example.com/jump-rope',
                estimatedPrice: 20,
                manufacturer: 'Crossrope, Rogue'
            },
            {
                name: 'Rowing Machine',
                description: 'Full-body cardio machine that simulates rowing motion for comprehensive workouts.',
                category: Enums_1.EquipmentCategory.CARDIO,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.PREMIUM,
                spaceRequired: Enums_1.SpaceRequirement.LARGE,
                targetMuscleGroups: ['Back', 'Biceps', 'Quadriceps', 'Hamstrings', 'Core', 'Shoulders'],
                trainingTypes: ['Cardio', 'HIIT', 'Endurance'],
                specifications: {
                    material: 'Steel frame, various resistance mechanisms',
                    color: 'Black/Silver',
                    adjustable: true,
                    warranty: 'Typically 2-5 years',
                    features: ['Air, magnetic, or water resistance', 'Performance monitor', 'Ergonomic seat', 'Adjustable resistance'],
                    accessories: ['Floor mat', 'Heart rate monitor', 'Seat cushion']
                },
                alternatives: {
                    homeMade: ['Resistance band rowing motions'],
                    budget: ['Resistance bands with rowing movements'],
                    premium: ['Concept2 or WaterRower premium models', 'Smart rowers with classes'],
                    similar: ['Ski erg', 'Cable machine with rowing attachment']
                },
                purchaseUrl: 'https://www.example.com/rowing-machine',
                estimatedPrice: 900,
                manufacturer: 'Concept2, WaterRower, NordicTrack'
            },
            {
                name: 'Foam Roller',
                description: 'Cylindrical tool for self-myofascial release, recovery, and mobility improvement.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.MINIMAL,
                targetMuscleGroups: ['Full_Body'],
                trainingTypes: ['Recovery', 'Mobility', 'Rehabilitation'],
                specifications: {
                    material: 'EVA foam or EPP foam',
                    color: 'Various',
                    adjustable: false,
                    warranty: 'Typically 1 year',
                    features: ['Various density options', 'Smooth or textured surface', 'Hollow or solid core'],
                    accessories: ['Exercise guide', 'Carrying bag']
                },
                alternatives: {
                    homeMade: ['PVC pipe with padding', 'Tennis ball for targeted areas'],
                    budget: ['Tennis/lacrosse ball', 'Rolling pin'],
                    premium: ['Vibrating foam roller', 'Specialized trigger point tools'],
                    similar: ['Massage stick', 'Trigger point ball']
                },
                purchaseUrl: 'https://www.example.com/foam-roller',
                estimatedPrice: 25,
                manufacturer: 'TriggerPoint, OPTP'
            },
            {
                name: 'Battle Ropes',
                description: 'Heavy ropes for dynamic, high-intensity exercise focusing on upper body and core.',
                category: Enums_1.EquipmentCategory.SPECIALTY,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.MID_RANGE,
                spaceRequired: Enums_1.SpaceRequirement.MEDIUM,
                targetMuscleGroups: ['Shoulders', 'Arms', 'Back', 'Core'],
                trainingTypes: ['HIIT', 'Power', 'Endurance'],
                specifications: {
                    material: 'Polyester or dacron',
                    color: 'Black',
                    adjustable: false,
                    warranty: 'Typically 1 year',
                    features: ['Heat-shrunk ends', 'Durable braided construction', 'Various thicknesses available'],
                    accessories: ['Anchor', 'Protective sleeve', 'Exercise guide']
                },
                alternatives: {
                    homeMade: ['Garden hose filled with sand', 'Chains'],
                    budget: ['Resistance bands', 'Dumbbells for similar movements'],
                    premium: ['Premium battle ropes with integrated sensors', 'Commercial-grade ropes'],
                    similar: ['Suspension trainer', 'Heavy bag']
                },
                purchaseUrl: 'https://www.example.com/battle-ropes',
                estimatedPrice: 80,
                manufacturer: 'Onnit, Rogue'
            },
            {
                name: 'Resistance Tubes with Handles',
                description: 'Versatile rubber tubes with handles for portable resistance training.',
                category: Enums_1.EquipmentCategory.RESISTANCE_BANDS,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.MINIMAL,
                targetMuscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
                trainingTypes: ['Strength_Isolation', 'Rehabilitation'],
                specifications: {
                    material: 'Latex or rubber with foam handles',
                    color: 'Various (color-coded by resistance)',
                    adjustable: false,
                    warranty: 'Typically 3-6 months',
                    features: ['Comfortable handles', 'Different resistance levels', 'Door anchor compatible'],
                    accessories: ['Door anchor', 'Ankle straps', 'Carrying bag', 'Exercise chart']
                },
                alternatives: {
                    homeMade: ['Elastic bands with homemade handles'],
                    budget: ['Flat resistance bands', 'Bodyweight exercises'],
                    premium: ['Cable machine', 'Complete resistance band kit with accessories'],
                    similar: ['Exercise bands', 'Cable attachments']
                },
                purchaseUrl: 'https://www.example.com/resistance-tubes',
                estimatedPrice: 25,
                manufacturer: 'Black Mountain Products, Fitness Insanity'
            },
            {
                name: 'Multi-Gym Home Station',
                description: 'All-in-one home gym with multiple exercise stations for total body workouts.',
                category: Enums_1.EquipmentCategory.MACHINES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.PREMIUM,
                spaceRequired: Enums_1.SpaceRequirement.LARGE,
                targetMuscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'],
                trainingTypes: ['Strength_Compound', 'Strength_Isolation'],
                specifications: {
                    material: 'Steel frame with vinyl upholstery',
                    color: 'Black/Grey',
                    adjustable: true,
                    warranty: 'Typically 2-5 years, frame often 10+ years',
                    features: ['Multiple weight stacks', 'Press station', 'Lat pulldown', 'Leg developer', 'Cable crossover'],
                    accessories: ['Additional handles', 'Exercise chart', 'Floor mat']
                },
                alternatives: {
                    homeMade: ['Not feasible for home production'],
                    budget: ['Resistance bands with door anchor', 'Bodyweight training station'],
                    premium: ['Commercial grade machines', 'Functional trainer'],
                    similar: ['Cable crossover machine', 'Smith machine']
                },
                purchaseUrl: 'https://www.example.com/multi-gym',
                estimatedPrice: 1500,
                manufacturer: 'Bowflex, Marcy, Body-Solid'
            },
            {
                name: 'Stability Ball',
                description: 'Large inflatable ball for core training, balance work, and exercise modifications.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.BEGINNER,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.MEDIUM,
                targetMuscleGroups: ['Core', 'Back', 'Chest', 'Glutes'],
                trainingTypes: ['Core', 'Balance', 'Rehabilitation'],
                specifications: {
                    material: 'Anti-burst PVC',
                    color: 'Various',
                    adjustable: false,
                    warranty: 'Typically 6 months',
                    features: ['Anti-burst construction', 'Textured surface for grip', 'Various sizes available'],
                    accessories: ['Air pump', 'Measuring tape', 'Exercise guide', 'Ball base']
                },
                alternatives: {
                    homeMade: ['Not feasible for safe home production'],
                    budget: ['Rolled towel for support', 'Floor exercises'],
                    premium: ['Weighted stability ball', 'Professional-grade ball with base'],
                    similar: ['BOSU ball', 'Balance disc']
                },
                purchaseUrl: 'https://www.example.com/stability-ball',
                estimatedPrice: 25,
                manufacturer: 'Gaiam, TheraBand, URBNFit'
            },
            {
                name: 'Ab Roller Wheel',
                description: 'Wheel with handles for intense core and shoulder stability training.',
                category: Enums_1.EquipmentCategory.ACCESSORIES,
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                costTier: Enums_1.CostTier.BUDGET,
                spaceRequired: Enums_1.SpaceRequirement.SMALL,
                targetMuscleGroups: ['Core', 'Shoulders', 'Back', 'Chest'],
                trainingTypes: ['Core', 'Strength_Compound'],
                specifications: {
                    material: 'Plastic wheel with metal or plastic handles',
                    color: 'Various',
                    adjustable: false,
                    warranty: 'Typically 6 months',
                    features: ['Ergonomic handles', 'Non-slip wheel', 'Single or double wheel design'],
                    accessories: ['Knee pad', 'Exercise guide']
                },
                alternatives: {
                    homeMade: ['Barbell with weight plates'],
                    budget: ['Plank variations', 'Bodyweight core exercises'],
                    premium: ['Ab roller with resistance or digital counter'],
                    similar: ['Ab dolly', 'Sliders']
                },
                purchaseUrl: 'https://www.example.com/ab-roller',
                estimatedPrice: 15,
                manufacturer: 'Perfect Fitness, SKLZ'
            }
        ];
        for (const item of equipmentData) {
            const equipment = new Equipment_1.Equipment();
            equipment.name = item.name;
            equipment.description = item.description;
            equipment.category = item.category;
            equipment.difficulty = item.difficulty;
            equipment.costTier = item.costTier;
            equipment.spaceRequired = item.spaceRequired;
            equipment.purchaseUrl = item.purchaseUrl;
            equipment.estimatedPrice = item.estimatedPrice;
            equipment.manufacturer = item.manufacturer;
            equipment.specifications = {};
            if (item.specifications) {
                Object.entries(item.specifications).forEach(([key, value]) => {
                    if (value !== null) {
                        if (key === 'adjustable' && typeof value === 'string') {
                            equipment.specifications[key] =
                                value.includes('adjustable') || value.includes('Available');
                        }
                        else {
                            equipment.specifications[key] = value;
                        }
                    }
                });
            }
            equipment.alternatives = item.alternatives;
            if (muscleGroupCategories.length > 0) {
                equipment.muscleGroupsTargeted = [];
                for (const muscleGroupName of item.targetMuscleGroups) {
                    const category = muscleGroupCategories.find(cat => cat.name.toLowerCase() === muscleGroupName.toLowerCase());
                    if (category) {
                        equipment.muscleGroupsTargeted.push(category);
                    }
                }
            }
            await equipmentRepository.save(equipment);
        }
        logger_1.default.info(`Successfully seeded ${equipmentData.length} equipment items`);
    }
    catch (error) {
        logger_1.default.error('Error seeding equipment:', error);
        throw error;
    }
}
//# sourceMappingURL=seedEquipment.js.map