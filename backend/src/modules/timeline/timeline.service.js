import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

/**
 * Retrieves the complete chronological audit timeline for an application.
 *
 * Immutability Guarantee:
 * - Timeline records are append-only.
 * - No update or delete operations are exposed by this service or any API route.
 * - Events are sorted in deterministic chronological order (createdAt ASC, id ASC).
 *
 * @param {string} applicationId - Application UUID
 * @returns {Promise<Array<object>>} - Array of timeline audit events with user actor details
 */
export const getApplicationTimeline = async (applicationId) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const timeline = await prisma.timeline.findMany({
    where: { applicationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
  });

  return timeline;
};
