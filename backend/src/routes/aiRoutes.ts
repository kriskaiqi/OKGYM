import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const aiController = new AIController();

// Configure multer for video upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept video files only
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Analyze exercise form from video
router.post(
    '/analyze',
    authenticate,
    upload.single('video'),
    aiController.analyzeExerciseForm.bind(aiController)
);

// Get exercise form analysis history
router.get(
    '/history/:exerciseId',
    authenticate,
    aiController.getExerciseHistory.bind(aiController)
);

export default router; 