import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

// All analytics endpoints require authentication and recruiter-only role
router.use(authenticate);
router.use(requireRole('recruiter'));

// Recruiter analytics endpoints
router.get('/overview', analyticsController.getOverviewKPIs);
router.get('/by-job', analyticsController.getAnalyticsByJob);
router.get('/by-stage', analyticsController.getAnalyticsByStage);
router.get('/applications-trend', analyticsController.getApplicationsTrend);

export default router;
