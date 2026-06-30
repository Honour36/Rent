import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { reportsController } from '../controllers/reports.controller';

const router = Router();

router.get('/owner-statement', authenticate, (req, res) => reportsController.list(req as any, res));
router.post('/owner-statement/generate', authenticate, (req, res) => reportsController.generate(req as any, res));
router.get('/owner-statement/:id/pdf', authenticate, (req, res) => reportsController.pdf(req as any, res));
router.post('/owner-statement/:id/approve', authenticate, (req, res) => reportsController.approve(req as any, res));
router.post('/owner-statement/:id/dispatch', authenticate, (req, res) => reportsController.dispatch(req as any, res));

router.get('/arrears', authenticate, (req, res) => reportsController.getArrearsReport(req as any, res));
router.get('/vacancy', authenticate, (req, res) => reportsController.getVacancyReport(req as any, res));
router.get('/lease-expiry', authenticate, (req, res) => reportsController.getLeaseExpiryReport(req as any, res));
router.get('/collection-rate', authenticate, (req, res) => reportsController.getCollectionRateReport(req as any, res));
router.get('/maintenance', authenticate, (req, res) => reportsController.getMaintenanceReport(req as any, res));
router.get('/trust-ledger', authenticate, (req, res) => reportsController.getTrustLedgerReport(req as any, res));

export default router;
