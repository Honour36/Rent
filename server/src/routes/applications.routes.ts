import { Router } from 'express';
import { applicationsController } from '../controllers/applications.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize as roleAuthorize } from '../middleware/role.middleware';

const router = Router();

// ─── Public routes (no auth) ──────────────────────────────────────────────────
router.get('/public/:token', applicationsController.getPublic);
router.post('/public/:token', applicationsController.submitPublic);
router.post('/public/:token/id-document', applicationsController.uploadPublicIdDocument);

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.use(authenticate);

router.post(
  '/generate-link',
  roleAuthorize('admin', 'senior_agent'),
  applicationsController.generateLink,
);
router.get('/', applicationsController.list);
router.get('/:id', applicationsController.getById);
router.get('/:id/pdf', applicationsController.getPdf);
router.get('/:id/id-document', applicationsController.getIdDocumentUrl);
router.patch('/:id/status', roleAuthorize('admin', 'senior_agent'), applicationsController.updateStatus);
router.post('/:id/request-more-info', roleAuthorize('admin', 'senior_agent'), applicationsController.requestMoreInfo);
router.delete('/:id', roleAuthorize('admin', 'senior_agent'), (req, res) => applicationsController.delete(req as any, res));

export default router;
