import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as alertsController from './alerts.controller.js';

const router = express.Router();

// Stalled alert endpoints are strictly recruiter-only
router.use(authenticate, requireRole('recruiter'));

// GET /api/v1/alerts and /api/v1/alerts/stalled - Retrieve active stalled alerts
router.get('/', alertsController.getStalledAlerts);
router.get('/stalled', alertsController.getStalledAlerts);

// GET /api/v1/alerts/count - Retrieve active alert count for UI navigation badges
router.get('/count', alertsController.getStalledAlertsCount);

// POST /api/v1/alerts/:applicationId/dismiss - Dismiss an alert for the candidate's current stage
router.post('/:applicationId/dismiss', alertsController.dismissAlert);

export default router;
