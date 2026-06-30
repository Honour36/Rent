import { Router } from 'express';
import { propertiesController } from '../controllers/properties.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', propertiesController.list);
router.post('/', roleAuthorize('admin', 'senior_agent'), propertiesController.create);
router.get('/:id', propertiesController.getById);

export default router;
