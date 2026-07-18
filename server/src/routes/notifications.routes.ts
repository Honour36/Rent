import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { notificationsController } from '../controllers/notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.list);
router.get('/count', notificationsController.count);
router.patch('/mark-all-read', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);

export default router;
