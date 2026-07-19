import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { checklistTemplatesController } from '../controllers/checklist-templates.controller';

const router = Router();

router.use(authenticate);

router.get('/', checklistTemplatesController.list);
router.post('/', checklistTemplatesController.create);
router.get('/:id', checklistTemplatesController.getById);
router.patch('/:id', checklistTemplatesController.update);
router.delete('/:id', checklistTemplatesController.delete);
router.get('/:id/pdf', checklistTemplatesController.getPdf);

export default router;
