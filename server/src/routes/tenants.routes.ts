import { Router } from 'express';
import { tenantsController } from '../controllers/tenants.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', tenantsController.list);
router.post('/', roleAuthorize('admin', 'senior_agent'), tenantsController.create);
router.get('/:id', tenantsController.getById);
router.patch('/:id', roleAuthorize('admin', 'senior_agent'), tenantsController.update);

router.delete('/:id', roleAuthorize('admin', 'senior_agent'), tenantsController.delete);
export default router;
