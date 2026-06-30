import { Router } from 'express';
import { receiptsController } from '../controllers/receipts.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Secure all receipts routes
router.use(authenticate);

// Get receipt by payment ID
router.get('/:paymentId', receiptsController.getReceipt.bind(receiptsController));

// Stream PDF
router.get('/:paymentId/pdf', receiptsController.getReceiptPdf.bind(receiptsController));

// Send receipt
router.post('/:paymentId/send', receiptsController.sendReceipt.bind(receiptsController));

export default router;
