import { Router } from 'express';
import { unitsController } from '../controllers/units.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.post('/', roleAuthorize('admin', 'senior_agent'), unitsController.create);
router.patch('/:id', roleAuthorize('admin', 'senior_agent'), unitsController.update);

export default router;
