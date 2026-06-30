import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all dashboard routes
router.use(authenticate);

router.get('/overview', dashboardController.getOverview);

export { router as dashboardRouter };
