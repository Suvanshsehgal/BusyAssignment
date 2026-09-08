import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export const STALLED_THRESHOLD_DAYS = 10;

/**
 * Calculates cutoff timestamp for stalled application detection.
 * An application is stalled if it has been in its current non-terminal stage
 * for strictly MORE than 10 days (i.e. stageEnteredAt < cutoff).
 *
 * @param {Date|string} [referenceDate] Optional reference date for testing boundaries
 * @returns {{ now: Date, cutoff: Date }}
 */
export const getCutoffDate = (referenceDate) => {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const cutoff = new Date(now.getTime() - STALLED_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
  return { now, cutoff };
};

/**
 * Retrieves all active stalled candidate alerts.
 * Excludes:
 * - Terminal stages (Rejected, Hired)
 * - Candidates stalled for <= 10 days
 * - Applications associated with Archived jobs
 * - Applications where an AlertDismissal exists for the current stage
 *
 * @param {object} [options]
 * @param {Date|string} [options.referenceDate] Optional reference date for testing
 * @returns {Promise<Array<object>>} List of active stalled alerts
 */
export const getStalledAlerts = async ({ referenceDate } = {}) => {
  const { now, cutoff } = getCutoffDate(referenceDate);

  const applications = await prisma.application.findMany({
    where: {
      stage: { notIn: ['Rejected', 'Hired'] },
      stageEnteredAt: { lt: cutoff },
      jobOpening: {
        status: { not: 'Archived' },
      },
    },
    include: {
      jobOpening: {
        select: {
          id: true,
          title: true,
          department: true,
          status: true,
        },
      },
      alertDismissals: {
        select: {
          stage: true,
          dismissedAt: true,
          dismissedById: true,
        },
      },
    },
    orderBy: {
      stageEnteredAt: 'asc',
    },
  });

  // Filter out applications whose alert has been dismissed for their current stage
  const activeAlerts = applications
    .filter((app) => !app.alertDismissals.some((d) => d.stage === app.stage))
    .map((app) => {
      const enteredAtMs = new Date(app.stageEnteredAt).getTime();
      const diffMs = now.getTime() - enteredAtMs;
      const daysStalled = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const hoursStalled = Math.floor(diffMs / (60 * 60 * 1000));

      return {
        id: `alert-${app.id}-${app.stage}`,
        applicationId: app.id,
        candidateName: app.candidateName,
        email: app.email,
        jobOpeningId: app.jobOpeningId,
        jobTitle: app.jobOpening?.title || 'Unknown',
        department: app.jobOpening?.department || 'Unknown',
        stage: app.stage,
        stageEnteredAt: app.stageEnteredAt,
        daysStalled,
        hoursStalled,
        thresholdDays: STALLED_THRESHOLD_DAYS,
        alertType: 'STALLED_CANDIDATE',
        createdAt: app.stageEnteredAt,
      };
    });

  return activeAlerts;
};

/**
 * Retrieves count of active stalled alerts for navigation badges.
 *
 * @param {object} [options]
 * @param {Date|string} [options.referenceDate] Optional reference date for testing
 * @returns {Promise<{ count: number }>}
 */
export const getStalledAlertsCount = async ({ referenceDate } = {}) => {
  const alerts = await getStalledAlerts({ referenceDate });
  return { count: alerts.length };
};

/**
 * Dismisses a stalled candidate alert for the application's current stage.
 * Persists an AlertDismissal record without modifying the immutable Phase 7 timeline.
 *
 * @param {object} params
 * @param {string} params.applicationId Application ID to dismiss alert for
 * @param {string} [params.dismissedById] User ID of the recruiter dismissing the alert
 * @param {Date|string} [params.referenceDate] Optional reference date for testing
 * @returns {Promise<object>} Result of the dismissal
 */
export const dismissAlert = async ({ applicationId, dismissedById, referenceDate } = {}) => {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      stage: true,
      stageEnteredAt: true,
      candidateName: true,
    },
  });

  if (!app) {
    throw new AppError('Application not found', 404);
  }

  if (app.stage === 'Rejected' || app.stage === 'Hired') {
    throw new AppError(`Cannot dismiss alerts for applications in terminal stage (${app.stage})`, 400);
  }

  const dismissedAt = referenceDate ? new Date(referenceDate) : new Date();

  const dismissal = await prisma.alertDismissal.upsert({
    where: {
      applicationId_stage: {
        applicationId: app.id,
        stage: app.stage,
      },
    },
    update: {
      dismissedAt,
      dismissedById,
    },
    create: {
      applicationId: app.id,
      stage: app.stage,
      dismissedById,
      dismissedAt,
    },
  });

  return {
    applicationId: app.id,
    stage: app.stage,
    dismissedAt: dismissal.dismissedAt,
    dismissedById: dismissal.dismissedById,
  };
};
