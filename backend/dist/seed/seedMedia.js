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
exports.seedMedia = seedMedia;
const Media_1 = require("../models/Media");
const data_source_1 = require("../data-source");
const Equipment_1 = require("../models/Equipment");
const logger_1 = __importDefault(require("../utils/logger"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function ensureDirectoriesExist() {
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    const equipmentImagesDir = path.join(imagesDir, 'equipment');
    const videosDir = path.join(publicDir, 'videos');
    const equipmentVideosDir = path.join(videosDir, 'equipment');
    const dirs = [publicDir, imagesDir, equipmentImagesDir, videosDir, equipmentVideosDir];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            logger_1.default.info(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    return { equipmentImagesDir, equipmentVideosDir };
}
function createPlaceholderFile(filePath, entityName, isVideo = false) {
    if (!fs.existsSync(filePath)) {
        logger_1.default.info(`Creating placeholder file: ${filePath}`);
        const fileType = isVideo ? 'video' : 'image';
        fs.writeFileSync(filePath, `This is a placeholder for equipment ${fileType}: ${entityName}. Replace with a real ${fileType}.`);
    }
}
async function seedMedia() {
    try {
        const mediaRepository = data_source_1.AppDataSource.getRepository(Media_1.Media);
        const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const { equipmentImagesDir, equipmentVideosDir } = ensureDirectoriesExist();
        logger_1.default.info(`Media directories prepared at:
      - Images: ${equipmentImagesDir}
      - Videos: ${equipmentVideosDir}`);
        const existingCount = await mediaRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} media records. Skipping seed.`);
            return;
        }
        const allEquipment = await equipmentRepository.find();
        if (allEquipment.length === 0) {
            logger_1.default.warn('No equipment found. Please seed equipment first.');
            return;
        }
        logger_1.default.info(`Creating media for ${allEquipment.length} equipment items (both images and videos)`);
        for (const equipment of allEquipment) {
            const imageFilename = `${equipment.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            const imageRelativePath = `/images/equipment/${imageFilename}`;
            const imageAbsolutePath = path.join(equipmentImagesDir, imageFilename);
            const videoFilename = `${equipment.name.toLowerCase().replace(/\s+/g, '-')}.mp4`;
            const videoRelativePath = `/videos/equipment/${videoFilename}`;
            const videoAbsolutePath = path.join(equipmentVideosDir, videoFilename);
            createPlaceholderFile(imageAbsolutePath, equipment.name);
            createPlaceholderFile(videoAbsolutePath, equipment.name, true);
            const imageMedia = new Media_1.Media();
            imageMedia.type = Media_1.MediaType.IMAGE;
            imageMedia.context = Media_1.MediaContext.EQUIPMENT;
            imageMedia.url = `/static${imageRelativePath}`;
            imageMedia.filename = imageFilename;
            imageMedia.mimeType = 'image/jpeg';
            imageMedia.size = Math.floor(Math.random() * 500000) + 100000;
            imageMedia.quality = 'MEDIUM';
            imageMedia.displayOrder = 1;
            imageMedia.isPrimary = true;
            imageMedia.entityType = 'equipment';
            imageMedia.entityStringId = equipment.id;
            const videoMedia = new Media_1.Media();
            videoMedia.type = Media_1.MediaType.VIDEO;
            videoMedia.context = Media_1.MediaContext.EQUIPMENT;
            videoMedia.url = `/static${videoRelativePath}`;
            videoMedia.filename = videoFilename;
            videoMedia.mimeType = 'video/mp4';
            videoMedia.size = Math.floor(Math.random() * 10000000) + 1000000;
            videoMedia.quality = 'MEDIUM';
            videoMedia.displayOrder = 1;
            videoMedia.isPrimary = true;
            videoMedia.entityType = 'equipment';
            videoMedia.entityStringId = equipment.id;
            videoMedia.dimensions = { width: 1280, height: 720 };
            videoMedia.duration = Math.floor(Math.random() * 90) + 30;
            const savedImageMedia = await mediaRepository.save(imageMedia);
            const savedVideoMedia = await mediaRepository.save(videoMedia);
            try {
                if (equipment && equipment.id) {
                    equipment.image_id = savedImageMedia.id;
                    equipment.video_id = savedVideoMedia.id;
                    await equipmentRepository.save(equipment);
                    logger_1.default.info(`Updated equipment ${equipment.name} with media references:
            - Image ID: ${savedImageMedia.id}
            - Video ID: ${savedVideoMedia.id}`);
                }
                else {
                    logger_1.default.warn(`Skipping media assignment for equipment with invalid ID`);
                }
            }
            catch (equipmentUpdateError) {
                logger_1.default.error(`Error updating equipment with media references:`, {
                    error: equipmentUpdateError instanceof Error ? equipmentUpdateError.message : 'Unknown error',
                    equipmentId: equipment.id
                });
            }
        }
        const totalCount = allEquipment.length * 2;
        logger_1.default.info(`Successfully created ${totalCount} media records (${allEquipment.length} images and ${allEquipment.length} videos)`);
        logger_1.default.info(`
      Place your actual equipment images in: ${equipmentImagesDir}
      Place your actual equipment videos in: ${equipmentVideosDir}
      
      Image files should be named like: treadmill.jpg, dumbbells.jpg, etc.
      Video files should be named like: treadmill.mp4, dumbbells.mp4, etc.
    `);
    }
    catch (error) {
        logger_1.default.error('Error seeding media:', error);
        throw error;
    }
}
//# sourceMappingURL=seedMedia.js.map