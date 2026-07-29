import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';
import { migrationsController } from '../controllers/migrations.controller';

const router = Router();

router.use(authenticate);
router.use(roleAuthorize('admin', 'senior_agent'));

router.get('/fields', migrationsController.fields);
router.get('/template', migrationsController.template);
router.post('/preview', migrationsController.preview);
router.post('/commit', migrationsController.commit);
router.post('/summary-email', migrationsController.sendSummaryEmail);

export default router;
