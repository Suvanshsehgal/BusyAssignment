import prisma from '../../config/prisma.js';

/**
 * Retrieves all candidate applications assigned to the authenticated interviewer.
 * Derives the interviewer identity strictly from interviewerId (never trusting client parameters).
 *
 * @param {string} interviewerId
 * @returns {Promise<Array>}
 */
export const getMyReviews = async (interviewerId) => {
  const panelAssignments = await prisma.interviewPanel.findMany({
    where: { userId: interviewerId },
    orderBy: { assignedAt: 'desc' },
    include: {
      application: {
        include: {
          jobOpening: {
            select: {
              id: true,
              title: true,
              department: true,
              status: true,
            },
          },
          feedbacks: {
            where: { interviewerId },
            select: {
              id: true,
              content: true,
              score: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  return panelAssignments.map((assignment) => ({
    id: assignment.application.id,
    candidateName: assignment.application.candidateName,
    email: assignment.application.email,
    source: assignment.application.source,
    stage: assignment.application.stage,
    appliedDate: assignment.application.appliedDate,
    stageEnteredAt: assignment.application.stageEnteredAt,
    notes: assignment.application.notes,
    assignedAt: assignment.assignedAt,
    jobOpening: assignment.application.jobOpening,
    myFeedback: assignment.application.feedbacks,
  }));
};
