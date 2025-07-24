"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAIModelConfig = seedAIModelConfig;
const AIModelConfig_1 = require("../models/AIModelConfig");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedAIModelConfig() {
    try {
        const modelConfigRepository = data_source_1.AppDataSource.getRepository(AIModelConfig_1.AIModelConfig);
        const existingCount = await modelConfigRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} AI model configurations. Skipping seed.`);
            return;
        }
        const modelConfigsData = [
            {
                name: 'Squat Analyzer',
                description: 'Analyzes squat form, detects common issues like knee position, back angle, and depth.',
                type: AIModelConfig_1.ModelType.FORM_DETECTION,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/analyze/squat',
                parameters: {
                    minConfidence: 0.75,
                    trackingPoints: ['ankles', 'knees', 'hips', 'shoulders', 'neck'],
                    detectionThresholds: {
                        kneeAlignment: 0.8,
                        hipDepth: 0.7,
                        backAngle: 0.85
                    }
                },
                metadata: {
                    applicableExercises: ['squat', 'front-squat', 'goblet-squat'],
                    accuracy: 0.92,
                    processingTime: '180ms'
                }
            },
            {
                name: 'Deadlift Form Checker',
                description: 'Monitors deadlift technique, focusing on back position, hip hinge, and bar path.',
                type: AIModelConfig_1.ModelType.FORM_DETECTION,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/analyze/deadlift',
                parameters: {
                    minConfidence: 0.8,
                    trackingPoints: ['ankles', 'knees', 'hips', 'shoulders', 'neck', 'wrists'],
                    detectionThresholds: {
                        backFlatness: 0.85,
                        hipHinge: 0.8,
                        barPath: 0.75
                    }
                },
                metadata: {
                    applicableExercises: ['deadlift', 'romanian-deadlift', 'sumo-deadlift'],
                    accuracy: 0.94,
                    processingTime: '210ms'
                }
            },
            {
                name: 'Push-up Counter',
                description: 'Counts push-up repetitions and validates proper depth and body alignment.',
                type: AIModelConfig_1.ModelType.FORM_DETECTION,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/analyze/pushup',
                parameters: {
                    minConfidence: 0.75,
                    trackingPoints: ['wrists', 'elbows', 'shoulders', 'hips', 'ankles'],
                    detectionThresholds: {
                        elbowAngle: 0.7,
                        bodyAlignment: 0.8,
                        repDepth: 0.75
                    }
                },
                metadata: {
                    applicableExercises: ['push-up', 'incline-push-up', 'decline-push-up'],
                    accuracy: 0.95,
                    processingTime: '150ms'
                }
            },
            {
                name: 'Plank Position Validator',
                description: 'Assesses plank position quality, focusing on body alignment and core engagement.',
                type: AIModelConfig_1.ModelType.FORM_DETECTION,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/analyze/plank',
                parameters: {
                    minConfidence: 0.7,
                    trackingPoints: ['ankles', 'knees', 'hips', 'shoulders', 'neck'],
                    detectionThresholds: {
                        bodyLinearity: 0.8,
                        hipPosition: 0.75,
                        shoulderStability: 0.7
                    }
                },
                metadata: {
                    applicableExercises: ['plank', 'side-plank', 'plank-variations'],
                    accuracy: 0.9,
                    processingTime: '120ms'
                }
            },
            {
                name: 'Rep Counter',
                description: 'Universal repetition counter that works across various exercise types.',
                type: AIModelConfig_1.ModelType.MOVEMENT_TRACKING,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/track/reps',
                parameters: {
                    minConfidence: 0.7,
                    cycleDetection: true,
                    noiseReduction: 0.3,
                    patternRecognition: {
                        sensitivityThreshold: 0.65,
                        temporalWindow: '1.5s'
                    }
                },
                metadata: {
                    universalCompatibility: true,
                    accuracy: 0.93,
                    processingTime: '100ms'
                }
            },
            {
                name: 'Range of Motion Analyzer',
                description: 'Measures exercise range of motion and provides feedback for improvement.',
                type: AIModelConfig_1.ModelType.MOVEMENT_TRACKING,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/track/rom',
                parameters: {
                    minConfidence: 0.75,
                    jointAngleTracking: true,
                    referenceProportions: {
                        useRelativeScaling: true,
                        anthropometricModel: 'standard'
                    }
                },
                metadata: {
                    applicableExercises: ['all'],
                    accuracy: 0.91,
                    processingTime: '160ms'
                }
            },
            {
                name: 'Tempo Tracker',
                description: 'Analyzes exercise tempo, including concentric, eccentric, and pause phases.',
                type: AIModelConfig_1.ModelType.MOVEMENT_TRACKING,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/track/tempo',
                parameters: {
                    minConfidence: 0.7,
                    phaseDetection: {
                        concentric: true,
                        eccentric: true,
                        isometric: true
                    },
                    timeUnits: 'seconds'
                },
                metadata: {
                    applicableExercises: ['all-resistance'],
                    accuracy: 0.89,
                    processingTime: '130ms'
                }
            },
            {
                name: 'Balance Analyzer',
                description: 'Evaluates balance and stability during standing or dynamic exercises.',
                type: AIModelConfig_1.ModelType.SPECIALIZED,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/specialized/balance',
                parameters: {
                    minConfidence: 0.7,
                    centerOfMassTracking: true,
                    stabilityMetrics: {
                        swayAnalysis: true,
                        timeToStabilize: true
                    }
                },
                metadata: {
                    applicableExercises: ['single-leg-exercises', 'balance-training', 'yoga-poses'],
                    accuracy: 0.87,
                    processingTime: '190ms'
                }
            },
            {
                name: 'Weight Distribution Checker',
                description: 'Analyzes weight distribution between limbs during bilateral exercises.',
                type: AIModelConfig_1.ModelType.SPECIALIZED,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.ACTIVE,
                endpoint: '/api/ai/specialized/weight-distribution',
                parameters: {
                    minConfidence: 0.75,
                    sideComparison: {
                        leftRightDifferential: true,
                        normalizedScoring: true
                    },
                    asymmetryThreshold: 0.15
                },
                metadata: {
                    applicableExercises: ['squat', 'deadlift', 'bench-press', 'shoulder-press'],
                    accuracy: 0.88,
                    processingTime: '170ms'
                }
            },
            {
                name: 'Movement Fluidity Scorer',
                description: 'Scores the fluidity and smoothness of exercise execution.',
                type: AIModelConfig_1.ModelType.SPECIALIZED,
                version: '1.0.0',
                status: AIModelConfig_1.ModelStatus.BETA,
                endpoint: '/api/ai/specialized/fluidity',
                parameters: {
                    minConfidence: 0.7,
                    accelerationAnalysis: true,
                    jerkDetection: {
                        sensitivityThreshold: 0.6,
                        smoothingFactor: 0.3
                    }
                },
                metadata: {
                    applicableExercises: ['all'],
                    accuracy: 0.85,
                    processingTime: '200ms'
                }
            }
        ];
        for (const configData of modelConfigsData) {
            const modelConfig = new AIModelConfig_1.AIModelConfig();
            Object.assign(modelConfig, configData);
            await modelConfigRepository.save(modelConfig);
        }
        logger_1.default.info(`Successfully seeded ${modelConfigsData.length} AI model configurations`);
    }
    catch (error) {
        logger_1.default.error('Error seeding AI model configurations:', error);
        throw error;
    }
}
//# sourceMappingURL=seedAIModelConfig.js.map