import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { noticesToVacateController } from '../controllers/notices-to-vacate.controller';

const router = Router();

router.use(authenticate);

router.get('/', noticesToVacateController.list);
router.post('/', noticesToVacateController.create);
router.post('/:id/withdraw', noticesToVacateController.withdraw);

export default router;
