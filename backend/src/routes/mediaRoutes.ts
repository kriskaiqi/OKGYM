import { Router } from 'express';
import { MediaController } from '../controllers/MediaController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const mediaController = new MediaController();

// Configure multer for file upload
const storage = mediaController.configureStorage('local');
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: mediaController.fileFilter,
});

// Media upload route
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  mediaController.uploadMedia.bind(mediaController)
);

// Get media by ID
router.get(
  '/:id',
  mediaController.getMediaById.bind(mediaController)
);

// Get media by entity
router.get(
  '/entity/:entityType/:entityId',
  mediaController.getMediaByEntity.bind(mediaController)
);

// Update media
router.put(
  '/:id',
  authenticate,
  mediaController.updateMedia.bind(mediaController)
);

// Delete media
router.delete(
  '/:id',
  authenticate,
  mediaController.deleteMedia.bind(mediaController)
);

export default router; 