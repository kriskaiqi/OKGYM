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
exports.seedExerciseMedia = seedExerciseMedia;
const Media_1 = require("../models/Media");
const Exercise_1 = require("../models/Exercise");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const path = __importStar(require("path"));
const mediaUtils_1 = require("../utils/mediaUtils");
async function seedExerciseMedia() {
    try {
        logger_1.default.info('Starting to seed exercise media...');
        const mediaRepository = data_source_1.AppDataSource.getRepository(Media_1.Media);
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const currentMediaCount = await mediaRepository.count({
            where: { context: Media_1.MediaContext.EXERCISE }
        });
        logger_1.default.info(`Current exercise media count: ${currentMediaCount}`);
        const exercises = await exerciseRepository.find();
        logger_1.default.info(`Found ${exercises.length} exercises to process`);
        const imagesDir = (0, mediaUtils_1.ensureDirectory)(path.join(process.cwd(), 'public', 'static', 'exercises', 'images'));
        const videosDir = (0, mediaUtils_1.ensureDirectory)(path.join(process.cwd(), 'public', 'static', 'exercises', 'videos'));
        logger_1.default.info(`Media directories prepared at:
      - Images: ${imagesDir}
      - Videos: ${videosDir}`);
        let imagesCreated = 0;
        let videosCreated = 0;
        for (const exercise of exercises) {
            try {
                const hasMedia = await (0, mediaUtils_1.mediaExistsForEntity)(mediaRepository, exercise.id, Media_1.MediaType.IMAGE);
                if (hasMedia) {
                    logger_1.default.info(`Media already exists for exercise: ${exercise.name}`);
                    continue;
                }
                const imageMedia = (0, mediaUtils_1.createMediaRecord)({
                    type: Media_1.MediaType.IMAGE,
                    context: Media_1.MediaContext.EXERCISE,
                    entityName: exercise.name,
                    directory: 'exercises/images',
                    entityId: exercise.id,
                    isPrimary: true,
                    displayOrder: 1
                });
                const videoMedia = (0, mediaUtils_1.createMediaRecord)({
                    type: Media_1.MediaType.VIDEO,
                    context: Media_1.MediaContext.EXERCISE,
                    entityName: exercise.name,
                    directory: 'exercises/videos',
                    entityId: exercise.id,
                    isPrimary: true,
                    displayOrder: 1
                });
                const imagePath = path.join(imagesDir, imageMedia.filename);
                (0, mediaUtils_1.createPlaceholderFile)(imagePath, exercise.name);
                const videoPath = path.join(videosDir, videoMedia.filename);
                (0, mediaUtils_1.createPlaceholderFile)(videoPath, exercise.name, true);
                const savedImageMedia = await mediaRepository.save(imageMedia);
                const savedVideoMedia = await mediaRepository.save(videoMedia);
                await data_source_1.AppDataSource.createQueryBuilder()
                    .insert()
                    .into('exercise_media')
                    .values([
                    { exercise_id: exercise.id, media_id: savedImageMedia.id },
                    { exercise_id: exercise.id, media_id: savedVideoMedia.id }
                ])
                    .execute();
                imagesCreated++;
                videosCreated++;
                logger_1.default.info(`Added media for exercise "${exercise.name}":
          - Image ID: ${savedImageMedia.id}
          - Video ID: ${savedVideoMedia.id}`);
            }
            catch (error) {
                logger_1.default.error(`Error creating media for exercise "${exercise.name}":`, error);
            }
        }
        const finalMediaCount = await mediaRepository.count({
            where: { context: Media_1.MediaContext.EXERCISE }
        });
        const mediaCreated = finalMediaCount - currentMediaCount;
        logger_1.default.info(`Initial exercise media count: ${currentMediaCount}`);
        logger_1.default.info(`Final exercise media count: ${finalMediaCount}`);
        logger_1.default.info(`Created ${mediaCreated} new media records (${imagesCreated} images and ${videosCreated} videos)`);
        logger_1.default.info(`
      Place your actual exercise images in: ${imagesDir}
      Place your actual exercise videos in: ${videosDir}
      
      Image files should be named like: bench-press.jpg
      Video files should be named like: bench-press.mp4
    `);
    }
    catch (error) {
        logger_1.default.error('Error seeding exercise media:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExerciseMedia.js.map