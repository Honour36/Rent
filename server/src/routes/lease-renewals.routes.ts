import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { leaseRenewalsController } from '../controllers/lease-renewals.controller';

const router = Router();

router.use(authenticate);

router.get('/', leaseRenewalsController.list);
router.post('/', leaseRenewalsController.create);

export default router;
