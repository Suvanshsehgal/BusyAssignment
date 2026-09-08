import { AppError } from '../../utils/appError.js';
import { advanceApplication, rejectApplication } from '../pipeline/pipeline.service.js';

/**
 * Bulk advance a batch of applications sequentially according to the state machine.
 * Each application is processed independently in its own transaction.
 * A single failure does NOT fail the rest of the batch.
 *
 * @param {object} params
 * @param {string[]} params.applicationIds - List of application UUIDs to advance
 * @param {string} [params.notes] - Optional recruiter notes
 * @param {string} params.userId - Authenticated recruiter ID
 * @returns {Promise<object>} Results object with successful and failed arrays
 */
export const bulkAdvanceApplications = async ({ applicationIds, notes, userId } = {}) => {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new AppError('An array of application IDs is required for bulk advance.', 400);
  }

  const successful = [];
  const failed = [];
  const results = [];

  for (const id of applicationIds) {
    if (!id || typeof id !== 'string') {
      const failure = {
        id: String(id),
        status: 'failed',
        reason: 'Invalid application ID format.',
      };
      failed.push(failure);
      results.push(failure);
      continue;
    }

    try {
      const updated = await advanceApplication(id, { notes, userId });
      const success = {
        id,
        status: 'success',
        newStage: updated.stage,
        application: updated,
      };
      successful.push(success);
      results.push(success);
    } catch (err) {
      const failure = {
        id,
        status: 'failed',
        reason: err.message || 'Failed to advance application.',
      };
      failed.push(failure);
      results.push(failure);
    }
  }

  return {
    total: applicationIds.length,
    succeeded_count: successful.length,
    failed_count: failed.length,
    successful,
    failed,
    results,
  };
};

/**
 * Bulk reject a batch of applications.
 * Each application is processed independently in its own transaction.
 * A single failure does NOT fail the rest of the batch.
 *
 * @param {object} params
 * @param {string[]} params.applicationIds - List of application UUIDs to reject
 * @param {string} [params.reason] - Optional rejection reason
 * @param {string} params.userId - Authenticated recruiter ID
 * @returns {Promise<object>} Results object with successful and failed arrays
 */
export const bulkRejectApplications = async ({ applicationIds, reason, userId } = {}) => {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new AppError('An array of application IDs is required for bulk reject.', 400);
  }

  const successful = [];
  const failed = [];
  const results = [];

  for (const id of applicationIds) {
    if (!id || typeof id !== 'string') {
      const failure = {
        id: String(id),
        status: 'failed',
        reason: 'Invalid application ID format.',
      };
      failed.push(failure);
      results.push(failure);
      continue;
    }

    try {
      const updated = await rejectApplication(id, { reason, userId });
      const success = {
        id,
        status: 'success',
        stage: 'Rejected',
        rejectedFromStage: updated.rejectedFromStage,
        application: updated,
      };
      successful.push(success);
      results.push(success);
    } catch (err) {
      const failure = {
        id,
        status: 'failed',
        reason: err.message || 'Failed to reject application.',
      };
      failed.push(failure);
      results.push(failure);
    }
  }

  return {
    total: applicationIds.length,
    succeeded_count: successful.length,
    failed_count: failed.length,
    successful,
    failed,
    results,
  };
};
