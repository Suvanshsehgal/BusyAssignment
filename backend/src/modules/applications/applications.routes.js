import { Router } from 'express';
import * as applicationsController from './applications.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

// Restrict all application management to authenticated recruiters
router.use(authenticate, requireRole('recruiter'));

router.post('/', applicationsController.createApplication);
router.get('/', applicationsController.getApplications);
router.get('/:id', applicationsController.getApplicationById);
router.patch('/:id', applicationsController.updateApplication);
router.delete('/:id', applicationsController.deleteApplication);

export default router;