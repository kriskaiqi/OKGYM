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
const Media_1 = require("../models/Media");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const path = __importStar(require("path"));
const mediaUtils_1 = require("../utils/mediaUtils");
async function seedWorkoutPlanMedia() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const mediaRepository = data_source_1.AppDataSource.getRepository(Media_1.Media);
        const workoutPlanRepository = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const mediaCount = await mediaRepository.count({
            where: { context: Media_1.MediaContext.WORKOUT }
        });
        if (mediaCount > 0) {
            logger_1.default.info(`Workout plan media already exists. Count: ${mediaCount}`);
            return;
        }
        const workoutPlans = await workoutPlanRepository.find();
        logger_1.default.info(`Found ${workoutPlans.length} workout plans to process`);
        if (workoutPlans.length === 0) {
            logger_1.default.warn('No workout plans found. Please seed workout plans first.');
            return;
        }
        const imagesDir = (0, mediaUtils_1.ensureDirectory)(path.join(process.cwd(), 'public', 'static', 'workouts', 'images'));
        const videosDir = (0, mediaUtils_1.ensureDirectory)(path.join(process.cwd(), 'public', 'static', 'workouts', 'videos'));
        logger_1.default.info(`Media directories prepared at:
      - Images: ${imagesDir}
      - Videos: ${videosDir}`);
        for (const workoutPlan of workoutPlans) {
            try {
                const hasImage = await (0, mediaUtils_1.mediaExistsForEntity)(mediaRepository, workoutPlan.id, Media_1.MediaType.IMAGE);
                const hasVideo = await (0, mediaUtils_1.mediaExistsForEntity)(mediaRepository, workoutPlan.id, Media_1.MediaType.VIDEO);
                if (hasImage && hasVideo) {
                    logger_1.default.info(`Media already exists for workout plan: ${workoutPlan.name}`);
                    continue;
                }
                const imageMedia = (0, mediaUtils_1.createMediaRecord)({
                    type: Media_1.MediaType.IMAGE,
                    context: Media_1.MediaContext.WORKOUT,
                    entityName: workoutPlan.name,
                    directory: 'workouts/images',
                    entityId: workoutPlan.id,
                    isPrimary: true,
                    displayOrder: 1
                });
                const videoMedia = (0, mediaUtils_1.createMediaRecord)({
                    type: Media_1.MediaType.VIDEO,
                    context: Media_1.MediaContext.WORKOUT,
                    entityName: workoutPlan.name,
                    directory: 'workouts/videos',
                    entityId: workoutPlan.id,
                    isPrimary: true,
                    displayOrder: 1
                });
                const imagePath = path.join(imagesDir, imageMedia.filename);
                (0, mediaUtils_1.createPlaceholderFile)(imagePath, workoutPlan.name);
                const videoPath = path.join(videosDir, videoMedia.filename);
                (0, mediaUtils_1.createPlaceholderFile)(videoPath, workoutPlan.name, true);
                const savedImageMedia = await mediaRepository.save(imageMedia);
                const savedVideoMedia = await mediaRepository.save(videoMedia);
                if (!hasImage) {
                    workoutPlan.thumbnail_media_id = savedImageMedia.id;
                }
                if (!hasVideo) {
                    workoutPlan.video_media_id = savedVideoMedia.id;
                }
                await workoutPlanRepository.save(workoutPlan);
                logger_1.default.info(`Added media for workout plan "${workoutPlan.name}":
          - Thumbnail image ID: ${savedImageMedia.id}
          - Demonstration video ID: ${savedVideoMedia.id}`);
            }
            catch (error) {
                logger_1.default.error(`Error creating media for workout plan "${workoutPlan.name}":`, error);
            }
        }
        const finalMediaCount = await mediaRepository.count({
            where: { context: Media_1.MediaContext.WORKOUT }
        });
        logger_1.default.info(`Successfully created ${finalMediaCount} media records for workout plans
      (${workoutPlans.length} thumbnail images and ${workoutPlans.length} videos)`);
        logger_1.default.info(`
      Place your actual workout plan thumbnails in: ${imagesDir}
      Place your actual workout plan videos in: ${videosDir}
      
      Image files should be named like: beginner-full-body-workout.jpg
      Video files should be named like: beginner-full-body-workout.mp4
    `);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error seeding workout plan media:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed after error');
        }
        throw error;
    }
}
seedWorkoutPlanMedia()
    .then(() => {
    console.log('Workout plan media seeding completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to seed workout plan media:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-workout-plan-media.js.map