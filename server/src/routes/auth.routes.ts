import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

import { authenticate } from '../middleware/auth.middleware';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/accept-invite', authController.acceptInvite);
router.get('/me', authenticate, (req, res) => authController.me(req as any, res));

export default router;
