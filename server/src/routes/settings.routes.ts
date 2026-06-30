import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.use(authenticate);

// Account routes (admin only)
router.get('/account', authorize('admin'), settingsController.getAccount);
router.patch('/account', authorize('admin'), settingsController.updateAccount);

// Templates routes
router.get('/templates', settingsController.getTemplates); // all authenticated users can get templates
router.post('/templates', authorize('admin'), settingsController.createTemplate);
router.put('/templates/:id', authorize('admin'), settingsController.updateTemplate);
router.delete('/templates/:id', authorize('admin'), settingsController.deleteTemplate);

export const settingsRoutes = router;
