import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { billingController } from '../controllers/billing.controller';

const router = Router();

// Paynow POSTs form-urlencoded to this - public (Paynow is the caller, not
// a logged-in user), so it sits before the authenticate() gate below. The
// rest of the app only parses JSON (see index.ts), so urlencoded parsing is
// scoped to just this one route rather than added globally.
router.post('/paynow/callback', express.urlencoded({ extended: true }), billingController.callback);

router.use(authenticate);
router.post('/subscribe', billingController.subscribe);
router.get('/status/:id', billingController.status);
router.get('/payments', billingController.list);

export default router;
