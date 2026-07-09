import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => paymentsController.list(req, res));
router.post('/', (req, res) => paymentsController.create(req, res));
router.get('/:id', (req, res) => paymentsController.getById(req, res));
router.patch('/:id', (req, res) => paymentsController.update(req, res));
router.delete('/:id', (req, res) => paymentsController.delete(req, res));

export default router;
