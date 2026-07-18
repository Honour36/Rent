import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { depositsController } from '../controllers/deposits.controller';

const router = Router();

router.use(authenticate);

router.get('/', depositsController.list);
router.get('/tenancy/:tenancyId', depositsController.getForTenancy);
router.post('/tenancy/:tenancyId/resolve', depositsController.resolve);

export default router;
