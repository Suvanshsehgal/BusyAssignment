import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { validateInterviewerRole } from '../../middleware/requireApplicationAccess.js';

/**
 * Assigns one or more eligible interviewers to an application's interview panel.
 * Only users with role 'interviewer' can be assigned.
 * Prevents duplicate assignments.
 *
 * @param {string} applicationId
 * @param {object} payload { userId, userIds, interviewerId, scheduledAt }
 * @param {string} actorId Recruiter performing the assignment
 * @returns {Promise<Array>} The updated interview panel
 */
export const assignPanel = async (applicationId, { userId, userIds, interviewerId, scheduledAt } = {}, actorId) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  // 1. Verify application exists
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  // 2. Normalize target user IDs into a unique array
  let targetIds = [];
  if (Array.isArray(userIds)) {
    targetIds = userIds;
  } else if (userId) {
    targetIds = [userId];
  } else if (interviewerId) {
    targetIds = [interviewerId];
  }

  targetIds = [...new Set(targetIds.filter((id) => typeof id === 'string' && id.trim() !== ''))];

  if (targetIds.length === 0) {
    throw new AppError('At least one interviewer user ID is required.', 400);
  }

  // 3. Verify each target user exists and has the 'interviewer' role
  const validatedUsers = [];
  for (const uid of targetIds) {
    const user = await validateInterviewerRole(uid);
    validatedUsers.push(user);
  }

  // 4. Check for existing panel assignments to prevent duplicates
  const existingAssignments = await prisma.interviewPanel.findMany({
    where: {
      applicationId,
      userId: { in: targetIds },
    },
  });

  if (targetIds.length === 1 && existingAssignments.length > 0) {
    throw new AppError('Interviewer is already assigned to this application panel.', 400);
  }

  const existingUserIds = new Set(existingAssignments.map((a) => a.userId));
  const newIdsToAssign = targetIds.filter((uid) => !existingUserIds.has(uid));

  if (newIdsToAssign.length === 0) {
    throw new AppError('All specified interviewers are already assigned to this application panel.', 400);
  }

  const now = new Date();

  // 5. Execute atomic transaction to assign interviewers and append timeline audit events
  await prisma.$transaction(async (tx) => {
    for (const uid of newIdsToAssign) {
      const user = validatedUsers.find((u) => u.id === uid);

      await tx.interviewPanel.create({
        data: {
          applicationId,
          userId: uid,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          assignedAt: now,
        },
      });

      await tx.timeline.create({
        data: {
          applicationId,
          eventType: 'INTERVIEWER_ASSIGNED',
          userId: actorId || null,
          details: {
            interviewerId: uid,
            interviewerName: user?.name,
            interviewerEmail: user?.email,
          },
          createdAt: now,
        },
      });
    }
  }, { maxWait: 10000, timeout: 20000 });

  return getPanel(applicationId);
};

/**
 * Retrieves the list of assigned interviewers for an application.
 *
 * @param {string} applicationId
 * @returns {Promise<Array>}
 */
export const getPanel = async (applicationId) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const panel = await prisma.interviewPanel.findMany({
    where: { applicationId },
    orderBy: { assignedAt: 'asc' },
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
  });

  return panel.map((p) => ({
    id: p.id,
    applicationId: p.applicationId,
    assignedAt: p.assignedAt,
    user: p.user,
  }));
};

/**
 * Removes an interviewer from an application panel.
 * Does not delete historical feedback or timeline entries.
 *
 * @param {string} applicationId
 * @param {string} userId
 * @param {string} actorId Recruiter performing the removal
 * @returns {Promise<object>}
 */
export const removePanelMember = async (applicationId, userId, actorId) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  if (!userId) {
    throw new AppError('User ID is required to remove from panel.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const assignment = await prisma.interviewPanel.findUnique({
    where: {
      applicationId_userId: {
        applicationId,
        userId,
      },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!assignment) {
    throw new AppError('Interviewer is not assigned to this application panel.', 404);
  }

  const now = new Date();

  // Remove panel assignment and record audit timeline event atomically
  await prisma.$transaction(async (tx) => {
    await tx.interviewPanel.delete({
      where: {
        applicationId_userId: {
          applicationId,
          userId,
        },
      },
    });

    await tx.timeline.create({
      data: {
        applicationId,
        eventType: 'INTERVIEWER_UNASSIGNED',
        userId: actorId || null,
        details: {
          removedUserId: userId,
          removedUserName: assignment.user?.name,
          removedUserEmail: assignment.user?.email,
        },
        createdAt: now,
      },
    });
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true };
};
