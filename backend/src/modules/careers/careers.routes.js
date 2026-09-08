import express from 'express';
import * as careersController from './careers.controller.js';
import { publicApplicationRateLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

// Publicly list all currently open job openings (unauthenticated)
router.get('/jobs', careersController.getPublicOpenJobs);

// Publicly view details of a specific open job (unauthenticated)
router.get('/jobs/:id', careersController.getPublicOpenJobById);

// Public candidate self-application (unauthenticated, rate-limited against abuse)
router.post('/jobs/:id/apply', publicApplicationRateLimiter, careersController.submitPublicApplication);
router.post('/apply', publicApplicationRateLimiter, careersController.submitPublicApplication);

export default router;
