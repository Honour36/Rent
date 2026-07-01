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

// Get signed URL for receipt PDF stored in Supabase Storage
router.get('/:paymentId/signed-url', receiptsController.getReceiptSignedUrl.bind(receiptsController));

// Send receipt
router.post('/:paymentId/send', receiptsController.sendReceipt.bind(receiptsController));

export default router;
