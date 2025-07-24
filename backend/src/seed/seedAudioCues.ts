import { AudioCue } from '../models/AudioCue';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { AudioCueType, AudioCueTrigger } from '../models/shared/Enums';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure required directories exist for storing audio files
 */
function ensureDirectoriesExist() {
  const publicDir = path.join(process.cwd(), 'public');
  const audioDir = path.join(publicDir, 'audio');
  const cuesDir = path.join(audioDir, 'cues');
  
  // Create directories if they don't exist
  const dirs = [publicDir, audioDir, cuesDir];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      logger.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  return { cuesDir };
}

/**
 * Create a placeholder text file with a message
 */
function createPlaceholderFile(filePath: string, cueText: string) {
  if (!fs.existsSync(filePath)) {
    logger.info(`Creating placeholder file: ${filePath}`);
    // Write a text file noting this is a placeholder
    fs.writeFileSync(
      filePath,
      `This is a placeholder for audio cue: "${cueText}". Replace with a real MP3 file.`
    );
  }
}

/**
 * Seed the database with audio cues for workout guidance
 */
export async function seedAudioCues(): Promise<void> {
  try {
    logger.info('Starting audio cues seeding...');
    
    // Ensure directories exist first
    try {
      const { cuesDir } = ensureDirectoriesExist();
      logger.info(`Audio directories prepared at: ${cuesDir}`);
    } catch (dirError) {
      logger.error('Error creating directories for audio cues:', dirError);
      throw dirError;
    }
    
    // Get repository with proper error handling
    let audioCueRepository;
    try {
      audioCueRepository = AppDataSource.getRepository(AudioCue);
      logger.info('Successfully obtained AudioCue repository');
    } catch (repoError) {
      logger.error('Error getting AudioCue repository:', {
        error: repoError instanceof Error ? repoError.message : 'Unknown error',
        details: JSON.stringify(repoError, null, 2)
      });
      throw repoError;
    }
    
    // Check if we already have audio cues
    let existingCount;
    try {
      existingCount = await audioCueRepository.count();
      logger.info(`Found ${existingCount} existing audio cues`);
    } catch (countError) {
      logger.error('Error counting existing audio cues:', {
        error: countError instanceof Error ? countError.message : 'Unknown error',
        details: JSON.stringify(countError, null, 2)
      });
      throw countError;
    }
    
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} audio cues. Skipping seed.`);
      return;
    }
    
    // Create audio cues data
    const audioCuesData = [
      // General Guidance (5)
      {
        name: "Back Straight Reminder",
        script: "Keep your back straight",
        type: AudioCueType.FORM_REMINDER,
        trigger: AudioCueTrigger.FORM_BASED,
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
        type: AudioCueType.FORM_REMINDER,
        trigger: AudioCueTrigger.FORM_BASED,
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
        type: AudioCueType.BREATHING,
        trigger: AudioCueTrigger.TIME_BASED,
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
        type: AudioCueType.FORM_REMINDER,
        trigger: AudioCueTrigger.FORM_BASED,
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
        type: AudioCueType.FORM_REMINDER,
        trigger: AudioCueTrigger.FORM_BASED,
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
      
      // Exercise-specific (5)
      {
        name: "Heel Drive",
        script: "Drive through your heels",
        type: AudioCueType.INSTRUCTION,
        trigger: AudioCueTrigger.REPETITION_BASED,
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
        type: AudioCueType.INSTRUCTION,
        trigger: AudioCueTrigger.REPETITION_BASED,
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
        type: AudioCueType.INSTRUCTION,
        trigger: AudioCueTrigger.FORM_BASED,
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
        type: AudioCueType.FORM_REMINDER,
        trigger: AudioCueTrigger.FORM_BASED,
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
        type: AudioCueType.INSTRUCTION,
        trigger: AudioCueTrigger.REPETITION_BASED,
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
      
      // Motivational (5)
      {
        name: "Push Through",
        script: "Push through it",
        type: AudioCueType.MOTIVATION,
        trigger: AudioCueTrigger.TIME_BASED,
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
        type: AudioCueType.MOTIVATION,
        trigger: AudioCueTrigger.REPETITION_BASED,
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
        type: AudioCueType.MOTIVATION,
        trigger: AudioCueTrigger.TIME_BASED,
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
        type: AudioCueType.MOTIVATION,
        trigger: AudioCueTrigger.TIME_BASED,
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
        type: AudioCueType.MILESTONE,
        trigger: AudioCueTrigger.EVENT_BASED,
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
    
    // Create placeholder audio files
    for (const cueData of audioCuesData) {
      if (cueData.audioUrl) {
        const audioFilename = cueData.audioUrl.split('/').pop();
        if (audioFilename) {
          const audioPath = path.join(process.cwd(), 'public', 'audio', 'cues', audioFilename);
          createPlaceholderFile(audioPath, cueData.script);
        }
      }
    }
    
    // Save audio cues to the database
    for (const cueData of audioCuesData) {
      const audioCue = new AudioCue();
      Object.assign(audioCue, cueData);
      await audioCueRepository.save(audioCue);
    }
    
    logger.info(`Successfully seeded ${audioCuesData.length} audio cues with placeholder files`);
    logger.info(`Place your actual audio files in: ${path.join(process.cwd(), 'public', 'audio', 'cues')}`);
  } catch (error) {
    logger.error('Error seeding audio cues:', error);
    throw error;
  }
} 