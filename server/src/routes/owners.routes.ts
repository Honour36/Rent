import { Router } from 'express';
import { ownersController } from '../controllers/owners.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';
import { enforceTierLimit } from '../middleware/tier.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ownersController.list);
router.post('/', roleAuthorize('admin', 'senior_agent'), enforceTierLimit('owners'), ownersController.create);
router.get('/:id', ownersController.getById);
router.patch('/:id', roleAuthorize('admin', 'senior_agent'), ownersController.update);

export default router;
