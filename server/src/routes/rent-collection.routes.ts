import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { rentCollectionController } from '../controllers/rent-collection.controller';

const router = Router();

// ─── Public routes (no auth - the owner isn't a logged-in user) ──────────────
router.get('/public/:token', rentCollectionController.getPublic);
router.post('/public/:token', rentCollectionController.schedule);

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.use(authenticate);
router.get('/', rentCollectionController.list);

export default router;
