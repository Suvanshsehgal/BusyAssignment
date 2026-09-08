import { Router } from 'express';
import * as applicationsController from './applications.controller.js';
import * as panelsController from '../panels/panels.controller.js';
import * as feedbackController from '../feedback/feedback.controller.js';
import * as timelineController from '../timeline/timeline.controller.js';
import * as alertsController from '../alerts/alerts.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { requireApplicationAccess } from '../../middleware/requireApplicationAccess.js';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Recruiter-only candidate ingestion and listing
router.post('/', requireRole('recruiter'), applicationsController.createApplication);
router.get('/', requireRole('recruiter'), applicationsController.getApplications);

// Recruiter-only CSV export (registered before parameterized /:id routes)
router.get('/export-csv', requireRole('recruiter'), applicationsController.exportApplicationsCsv);
router.get('/csv', requireRole('recruiter'), applicationsController.exportApplicationsCsv);

// Recruiter-only bulk pipeline actions (registered before parameterized /:id routes)
router.post('/bulk-advance', requireRole('recruiter'), applicationsController.bulkAdvanceApplications);
router.patch('/bulk-advance', requireRole('recruiter'), applicationsController.bulkAdvanceApplications);
router.post('/bulk-reject', requireRole('recruiter'), applicationsController.bulkRejectApplications);
router.patch('/bulk-reject', requireRole('recruiter'), applicationsController.bulkRejectApplications);

// Pipeline state machine transitions (recruiter-only)
router.patch('/:id/advance', requireRole('recruiter'), applicationsController.advanceApplication);
router.patch('/:id/reject', requireRole('recruiter'), applicationsController.rejectApplication);
router.patch('/:id/reinstate', requireRole('recruiter'), applicationsController.reinstateApplication);

// Panel management (recruiter-only modification, application-access retrieval)
router.post('/:id/panel', requireRole('recruiter'), panelsController.assignPanel);
router.get('/:id/panel', requireApplicationAccess, panelsController.getPanel);
router.delete('/:id/panel/:userId', requireRole('recruiter'), panelsController.removePanelMember);

// Feedback (interviewer submission guarded by panel assignment, retrieval access-guarded)
router.post(
  '/:id/feedback',
  requireRole('interviewer'),
  requireApplicationAccess,
  feedbackController.createFeedback
);
router.get('/:id/feedback', requireApplicationAccess, feedbackController.getApplicationFeedback);

// Timeline audit trail (accessible to recruiters or assigned panel interviewers; read-only)
router.get('/:id/timeline', requireApplicationAccess, timelineController.getApplicationTimeline);

// Candidate details (accessible to recruiters or assigned panel interviewers)
router.get('/:id', requireApplicationAccess, applicationsController.getApplicationById);

// Candidate metadata updates & safe deletion (recruiter-only)
router.patch('/:id', requireRole('recruiter'), applicationsController.updateApplication);
router.delete('/:id', requireRole('recruiter'), applicationsController.deleteApplication);

// Stalled candidate alert dismissal for candidate's current stage (recruiter-only)
router.post('/:id/dismiss-alert', requireRole('recruiter'), alertsController.dismissAlert);
router.post('/:id/alerts/dismiss', requireRole('recruiter'), alertsController.dismissAlert);

export default router;