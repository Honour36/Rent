import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { communicationsController } from '../controllers/communications.controller';

const router = Router();

router.get('/', authenticate, (req, res) => communicationsController.list(req as any, res));
router.post('/', authenticate, (req, res) => communicationsController.compose(req as any, res));

export default router;
