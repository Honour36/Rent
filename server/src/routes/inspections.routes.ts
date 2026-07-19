import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { inspectionsController } from '../controllers/inspections.controller';

const router = Router();

router.use(authenticate);

router.get('/', inspectionsController.list);
router.get('/tenancy/:tenancyId/suggested-items', inspectionsController.getSuggestedItems);
router.post('/', inspectionsController.schedule);
router.post('/:id/complete', inspectionsController.complete);
router.post('/:id/cancel', inspectionsController.cancel);

export default router;
