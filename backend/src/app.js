import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import healthRouter from './modules/health/health.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import jobsRouter from './modules/jobs/jobs.routes.js';
import applicationsRouter from './modules/applications/applications.routes.js';
import reviewsRouter from './modules/reviews/reviews.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import alertsRouter from './modules/alerts/alerts.routes.js';
import careersRouter from './modules/careers/careers.routes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API v1 prefix routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/my-reviews', reviewsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/alerts', alertsRouter);
app.use('/api/v1/careers', careersRouter);

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
