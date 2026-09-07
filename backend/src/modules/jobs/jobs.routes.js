import { Router } from 'express';
import * as jobsController from './jobs.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

// Restrict all job opening management to authenticated recruiters
router.use(authenticate, requireRole('recruiter'));

router.post('/', jobsController.createJob);
router.get('/', jobsController.getJobs);
router.get('/:id', jobsController.getJobById);
router.patch('/:id', jobsController.updateJob);
router.patch('/:id/archive', jobsController.archiveJob);
router.patch('/:id/restore', jobsController.restoreJob);
router.get('/:jobId/applications', jobsController.getJobApplications);

export default router;