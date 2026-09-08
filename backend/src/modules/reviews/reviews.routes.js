import { Router } from 'express';
import * as reviewsController from './reviews.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

// /api/v1/my-reviews is strictly restricted to authenticated interviewers
router.use(authenticate, requireRole('interviewer'));

router.get('/', reviewsController.getMyReviews);

export default router;
