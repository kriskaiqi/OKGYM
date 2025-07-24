"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAudioCues = seedAudioCues;
const AudioCue_1 = require("../models/AudioCue");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const Enums_1 = require("../models/shared/Enums");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function ensureDirectoriesExist() {
    const publicDir = path.join(process.cwd(), 'public');
    const audioDir = path.join(publicDir, 'audio');
    const cuesDir = path.join(audioDir, 'cues');
    const dirs = [publicDir, audioDir, cuesDir];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            logger_1.default.info(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    return { cuesDir };
}
function createPlaceholderFile(filePath, cueText) {
    if (!fs.existsSync(filePath)) {
        logger_1.default.info(`Creating placeholder file: ${filePath}`);
        fs.writeFileSync(filePath, `This is a placeholder for audio cue: "${cueText}". Replace with a real MP3 file.`);
    }
}
async function seedAudioCues() {
    try {
        logger_1.default.info('Starting audio cues seeding...');
        try {
            const { cuesDir } = ensureDirectoriesExist();
            logger_1.default.info(`Audio directories prepared at: ${cuesDir}`);
        }
        catch (dirError) {
            logger_1.default.error('Error creating directories for audio cues:', dirError);
            throw dirError;
        }
        let audioCueRepository;
        try {
            audioCueRepository = data_source_1.AppDataSource.getRepository(AudioCue_1.AudioCue);
            logger_1.default.info('Successfully obtained AudioCue repository');
        }
        catch (repoError) {
            logger_1.default.error('Error getting AudioCue repository:', {
                error: repoError instanceof Error ? repoError.message : 'Unknown error',
                details: JSON.stringify(repoError, null, 2)
            });
            throw repoError;
        }
        let existingCount;
        try {
            existingCount = await audioCueRepository.count();
            logger_1.default.info(`Found ${existingCount} existing audio cues`);
        }
        catch (countError) {
            logger_1.default.error('Error counting existing audio cues:', {
                error: countError instanceof Error ? countError.message : 'Unknown error',
                details: JSON.stringify(countError, null, 2)
            });
            throw countError;
        }
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} audio cues. Skipping seed.`);
            return;
        }
        const audioCuesData = [
            {
                name: "Back Straight Reminder",
                script: "Keep your back straight",
                type: Enums_1.AudioCueType.FORM_REMINDER,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/back-straight.mp3",
                durationSeconds: 1.8,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 5,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    specificMuscleGroups: ["back", "core"],
                    tags: ["form", "posture", "safety"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Core Engagement",
                script: "Engage your core",
                type: Enums_1.AudioCueType.FORM_REMINDER,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/engage-core.mp3",
                durationSeconds: 1.5,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 5,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    specificMuscleGroups: ["abs", "core"],
                    tags: ["form", "engagement", "stability"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Breathing Technique",
                script: "Breathe steadily",
                type: Enums_1.AudioCueType.BREATHING,
                trigger: Enums_1.AudioCueTrigger.TIME_BASED,
                audioUrl: "/static/audio/cues/breathe-steady.mp3",
                durationSeconds: 1.6,
                volume: 75,
                voiceType: "calm",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 4,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["breathing", "rhythm", "technique"],
                    intensity: "low",
                    tone: "calming"
                }
            },
            {
                name: "Movement Control",
                script: "Control the movement",
                type: Enums_1.AudioCueType.FORM_REMINDER,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/control-movement.mp3",
                durationSeconds: 1.7,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 5,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["form", "control", "technique"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Full ROM Reminder",
                script: "Full range of motion",
                type: Enums_1.AudioCueType.FORM_REMINDER,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/full-range.mp3",
                durationSeconds: 1.9,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 5,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["range", "technique", "effectiveness"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Heel Drive",
                script: "Drive through your heels",
                type: Enums_1.AudioCueType.INSTRUCTION,
                trigger: Enums_1.AudioCueTrigger.REPETITION_BASED,
                audioUrl: "/static/audio/cues/drive-heels.mp3",
                durationSeconds: 1.8,
                volume: 85,
                voiceType: "energetic",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 6,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    specificMuscleGroups: ["glutes", "quads", "hamstrings"],
                    tags: ["legs", "power", "technique"],
                    intensity: "high",
                    tone: "instructional"
                }
            },
            {
                name: "Peak Contraction",
                script: "Squeeze at the top",
                type: Enums_1.AudioCueType.INSTRUCTION,
                trigger: Enums_1.AudioCueTrigger.REPETITION_BASED,
                audioUrl: "/static/audio/cues/squeeze-top.mp3",
                durationSeconds: 1.6,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 6,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["contraction", "peak", "technique"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Elbow Position",
                script: "Elbows at 90 degrees",
                type: Enums_1.AudioCueType.INSTRUCTION,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/elbows-90.mp3",
                durationSeconds: 1.7,
                volume: 80,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 6,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    specificMuscleGroups: ["chest", "shoulders", "triceps"],
                    tags: ["form", "angles", "technique"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Neck Position",
                script: "Chin tucked",
                type: Enums_1.AudioCueType.FORM_REMINDER,
                trigger: Enums_1.AudioCueTrigger.FORM_BASED,
                audioUrl: "/static/audio/cues/chin-tucked.mp3",
                durationSeconds: 1.4,
                volume: 75,
                voiceType: "neutral",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 5,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    specificMuscleGroups: ["neck", "upper back"],
                    tags: ["form", "posture", "safety"],
                    intensity: "medium",
                    tone: "instructional"
                }
            },
            {
                name: "Power Generation",
                script: "Explode upward",
                type: Enums_1.AudioCueType.INSTRUCTION,
                trigger: Enums_1.AudioCueTrigger.REPETITION_BASED,
                audioUrl: "/static/audio/cues/explode-up.mp3",
                durationSeconds: 1.5,
                volume: 90,
                voiceType: "energetic",
                language: "English",
                isEnabled: true,
                includeVibration: true,
                priority: 7,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["power", "explosive", "dynamic"],
                    intensity: "high",
                    tone: "motivational"
                }
            },
            {
                name: "Push Through",
                script: "Push through it",
                type: Enums_1.AudioCueType.MOTIVATION,
                trigger: Enums_1.AudioCueTrigger.TIME_BASED,
                audioUrl: "/static/audio/cues/push-through.mp3",
                durationSeconds: 1.6,
                volume: 90,
                voiceType: "energetic",
                language: "English",
                isEnabled: true,
                includeVibration: true,
                priority: 7,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["motivation", "endurance", "mental"],
                    intensity: "high",
                    tone: "motivational"
                }
            },
            {
                name: "Final Rep",
                script: "Last rep best rep",
                type: Enums_1.AudioCueType.MOTIVATION,
                trigger: Enums_1.AudioCueTrigger.REPETITION_BASED,
                audioUrl: "/static/audio/cues/last-rep.mp3",
                durationSeconds: 1.8,
                volume: 90,
                voiceType: "energetic",
                language: "English",
                isEnabled: true,
                includeVibration: true,
                priority: 8,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["motivation", "strength", "finish"],
                    intensity: "high",
                    tone: "motivational"
                }
            },
            {
                name: "Confidence Boost",
                script: "You've got this",
                type: Enums_1.AudioCueType.MOTIVATION,
                trigger: Enums_1.AudioCueTrigger.TIME_BASED,
                audioUrl: "/static/audio/cues/got-this.mp3",
                durationSeconds: 1.5,
                volume: 85,
                voiceType: "encouraging",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 6,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["motivation", "confidence", "mental"],
                    intensity: "medium",
                    tone: "supportive"
                }
            },
            {
                name: "Progress Update",
                script: "Almost there",
                type: Enums_1.AudioCueType.MOTIVATION,
                trigger: Enums_1.AudioCueTrigger.TIME_BASED,
                audioUrl: "/static/audio/cues/almost-there.mp3",
                durationSeconds: 1.4,
                volume: 85,
                voiceType: "encouraging",
                language: "English",
                isEnabled: true,
                includeVibration: false,
                priority: 6,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["motivation", "progress", "endurance"],
                    intensity: "medium",
                    tone: "supportive"
                }
            },
            {
                name: "Achievement Celebration",
                script: "New personal best!",
                type: Enums_1.AudioCueType.MILESTONE,
                trigger: Enums_1.AudioCueTrigger.EVENT_BASED,
                audioUrl: "/static/audio/cues/personal-best.mp3",
                durationSeconds: 1.9,
                volume: 90,
                voiceType: "celebratory",
                language: "English",
                isEnabled: true,
                includeVibration: true,
                priority: 8,
                isSystemDefault: true,
                isPremium: false,
                metadata: {
                    tags: ["achievement", "celebration", "milestone"],
                    intensity: "high",
                    tone: "celebratory"
                }
            }
        ];
        for (const cueData of audioCuesData) {
            if (cueData.audioUrl) {
                const audioFilename = cueData.audioUrl.split('/').pop();
                if (audioFilename) {
                    const audioPath = path.join(process.cwd(), 'public', 'audio', 'cues', audioFilename);
                    createPlaceholderFile(audioPath, cueData.script);
                }
            }
        }
        for (const cueData of audioCuesData) {
            const audioCue = new AudioCue_1.AudioCue();
            Object.assign(audioCue, cueData);
            await audioCueRepository.save(audioCue);
        }
        logger_1.default.info(`Successfully seeded ${audioCuesData.length} audio cues with placeholder files`);
        logger_1.default.info(`Place your actual audio files in: ${path.join(process.cwd(), 'public', 'audio', 'cues')}`);
    }
    catch (error) {
        logger_1.default.error('Error seeding audio cues:', error);
        throw error;
    }
}
//# sourceMappingURL=seedAudioCues.js.map