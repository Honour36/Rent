import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { maintenanceController } from '../controllers/maintenance.controller';

const router = Router();

router.get('/', authenticate, (req, res) => maintenanceController.list(req as any, res));
router.get('/:id', authenticate, (req, res) => maintenanceController.getById(req as any, res));
router.post('/', authenticate, (req, res) => maintenanceController.create(req as any, res));
router.patch('/:id', authenticate, (req, res) => maintenanceController.update(req as any, res));
router.delete('/:id', authenticate, (req, res) => maintenanceController.delete(req as any, res));

export default router;
