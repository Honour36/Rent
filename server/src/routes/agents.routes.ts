import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { agentsController } from '../controllers/agents.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin')); // Only admins can manage agents

router.get('/', agentsController.list);
router.post('/invite', agentsController.invite);
router.patch('/:id', agentsController.update);

export const agentsRoutes = router;
