import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { levyChargesController } from '../controllers/levy-charges.controller';

const router = Router();

router.use(authenticate);

router.get('/', levyChargesController.list);
router.get('/property/:propertyId', levyChargesController.listForProperty);
router.post('/', levyChargesController.create);
router.post('/:id/deactivate', levyChargesController.deactivate);

export default router;
