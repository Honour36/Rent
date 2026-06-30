import { Router } from 'express';
import { tenanciesController } from '../controllers/tenancies.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.patch('/:id/activate', roleAuthorize('admin', 'senior_agent'), tenanciesController.activate);
router.get('/pending/unit/:unitId', roleAuthorize('admin', 'senior_agent', 'junior_agent'), tenanciesController.getPendingByUnitId);

export const tenanciesRoutes = router;
