import { Router } from 'express';
import "reflect-metadata";
import { authRoutes } from './auth.routes';
import mediaRoutes from './mediaRoutes';
import achievementRoutes from './achievementRoutes';
// Import other route modules as needed

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/achievements', achievementRoutes);
// Register other routes here as they are implemented

// Export the router setup function
export const setupRoutes = (app: any) => {
    app.use('/api', router);
};

export default router; 