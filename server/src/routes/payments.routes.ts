import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', paymentsController.list);
router.post('/', paymentsController.create);

export default router;
