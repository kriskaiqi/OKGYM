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
exports.ensureDirectory = ensureDirectory;
exports.createPlaceholderFile = createPlaceholderFile;
exports.getAbsolutePath = getAbsolutePath;
exports.createMediaRecord = createMediaRecord;
exports.getNormalizedFilename = getNormalizedFilename;
exports.mediaExistsForEntity = mediaExistsForEntity;
exports.getPublicUrl = getPublicUrl;
exports.updateEntityMedia = updateEntityMedia;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Media_1 = require("../models/Media");
const logger_1 = __importDefault(require("./logger"));
function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        logger_1.default.info(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
}
function createPlaceholderFile(filePath, entityName, isVideo = false) {
    if (!fs.existsSync(filePath)) {
        logger_1.default.info(`Creating placeholder file: ${filePath}`);
        const fileType = isVideo ? 'video' : 'image';
        fs.writeFileSync(filePath, `This is a placeholder for ${fileType}: ${entityName}. Replace with a real ${fileType}.`);
    }
}
function getAbsolutePath(directory, entityName, extension) {
    const filename = getNormalizedFilename(entityName, extension);
    return path.join(directory, filename);
}
function createMediaRecord({ type, context, entityName, directory, entityId, isPrimary = true, displayOrder = 1 }) {
    const media = new Media_1.Media();
    const extension = type === Media_1.MediaType.IMAGE ? 'jpg' : 'mp4';
    const filename = getNormalizedFilename(entityName, extension);
    media.type = type;
    media.context = context;
    media.url = `/static/${directory}/${filename}`;
    media.filename = filename;
    media.mimeType = type === Media_1.MediaType.IMAGE ? 'image/jpeg' : 'video/mp4';
    media.size = type === Media_1.MediaType.IMAGE ?
        Math.floor(Math.random() * 500000) + 100000 :
        Math.floor(Math.random() * 10000000) + 1000000;
    media.quality = 'MEDIUM';
    media.displayOrder = displayOrder;
    media.isPrimary = isPrimary;
    media.entityType = context.toString().toLowerCase();
    if (entityId) {
        media.entityStringId = entityId;
    }
    if (type === Media_1.MediaType.IMAGE) {
        media.dimensions = { width: 800, height: 600 };
    }
    else if (type === Media_1.MediaType.VIDEO) {
        media.dimensions = { width: 1280, height: 720 };
        media.duration = Math.floor(Math.random() * 90) + 30;
    }
    return media;
}
function getNormalizedFilename(name, extension) {
    return `${name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
}
async function mediaExistsForEntity(repository, entityId, type) {
    const count = await repository.count({
        where: {
            entityStringId: entityId,
            type
        }
    });
    return count > 0;
}
function getPublicUrl(directory, filename) {
    return `/static/${directory}/${filename}`;
}
async function updateEntityMedia(mediaRepository, entityRepository, entity, media, fieldName) {
    const savedMedia = await mediaRepository.save(media);
    entity[fieldName] = savedMedia.id;
    await entityRepository.save(entity);
}
//# sourceMappingURL=mediaUtils.js.map