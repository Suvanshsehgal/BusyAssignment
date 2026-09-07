import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import {
  determineNextStage,
  validateRejection,
  validateReinstatement,
} from './pipeline.rules.js';

/**
 * Advance an application sequentially forward by exactly one stage.
 * Updates stageEnteredAt to the current timestamp.
 * Runs atomically within a database transaction.
 *
 * @param {string} id Application ID
 * @param {object} options
 * @param {string} [options.requestedTargetStage] Optional target stage supplied by client (must match sequential next stage)
 * @param {string} [options.notes] Optional transition notes
 * @param {string} [options.userId] ID of the recruiter performing the advance
 * @returns {Promise<object>} The updated application
 */
export const advanceApplication = async (
  id,
  { requestedTargetStage, notes, userId } = {}
) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const currentStage = application.stage;
  const nextStage = determineNextStage(currentStage, requestedTargetStage);
  const now = new Date();

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        stage: nextStage,
        stageEnteredAt: now,
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
      },
    });

    // Record immutable audit timeline event
    await tx.timeline.create({
      data: {
        applicationId: id,
        eventType: 'STAGE_CHANGED',
        oldStage: currentStage,
        newStage: nextStage,
        userId: userId || null,
        details: {
          previousStage: currentStage,
          newStage: nextStage,
          notes: notes || `Candidate advanced from ${currentStage} to ${nextStage}`,
        },
        createdAt: now,
      },
    });

    return updated;
  });

  return updatedApplication;
};

/**
 * Reject an application from any non-rejected stage.
 * Sets stage to Rejected and stores the previous stage in rejectedFromStage.
 * Preserves existing stageEnteredAt timing for historical analytics/SLA.
 * Runs atomically within a database transaction.
 *
 * @param {string} id Application ID
 * @param {object} options
 * @param {string} [options.reason] Rejection reason
 * @param {string} [options.notes] Optional recruiter notes
 * @param {string} [options.userId] ID of the recruiter performing rejection
 * @returns {Promise<object>} The updated application
 */
export const rejectApplication = async (
  id,
  { reason, notes, userId } = {}
) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  validateRejection(application.stage);

  const currentStage = application.stage;
  const rejectionDetails = reason || notes || 'Application rejected';
  const now = new Date();

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        stage: 'Rejected',
        rejectedFromStage: currentStage,
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
      },
    });

    await tx.timeline.create({
      data: {
        applicationId: id,
        eventType: 'APPLICATION_REJECTED',
        oldStage: currentStage,
        newStage: 'Rejected',
        userId: userId || null,
        details: {
          rejectedFromStage: currentStage,
          reason: rejectionDetails,
        },
        createdAt: now,
      },
    });

    return updated;
  });

  return updatedApplication;
};

/**
 * Reinstate a rejected application back to its exact rejectedFromStage.
 * Resets stageEnteredAt to now and clears rejectedFromStage.
 * Runs atomically within a database transaction.
 *
 * @param {string} id Application ID
 * @param {object} options
 * @param {string} [options.notes] Optional recruiter reinstatement notes
 * @param {string} [options.userId] ID of the recruiter performing reinstatement
 * @returns {Promise<object>} The updated application
 */
export const reinstateApplication = async (
  id,
  { notes, userId } = {}
) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const targetStage = validateReinstatement(application);
  const now = new Date();

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        stage: targetStage,
        stageEnteredAt: now,
        rejectedFromStage: null,
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
      },
    });

    await tx.timeline.create({
      data: {
        applicationId: id,
        eventType: 'APPLICATION_REINSTATED',
        oldStage: 'Rejected',
        newStage: targetStage,
        userId: userId || null,
        details: {
          reinstatedToStage: targetStage,
          notes: notes || `Reinstated candidate to ${targetStage}`,
        },
        createdAt: now,
      },
    });

    return updated;
  });

  return updatedApplication;
};
