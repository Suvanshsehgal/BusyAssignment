import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

/**
 * Creates feedback/scorecard submitted by an assigned interviewer.
 * Input validation enforces content requirements and score range (1-5).
 * Interviewer identity is strictly derived from req.user.
 *
 * @param {string} applicationId
 * @param {object} payload { content, score }
 * @param {object} interviewer Authenticated user record
 * @returns {Promise<object>} Created feedback
 */
export const createFeedback = async (applicationId, { content, score } = {}, interviewer) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  if (!interviewer || !interviewer.id) {
    throw new AppError('Interviewer authentication required.', 401);
  }

  // 1. Verify application exists
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  // 2. Validate feedback content
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new AppError('Feedback content is required and cannot be empty.', 400);
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length < 3) {
    throw new AppError('Feedback content must be at least 3 characters long.', 400);
  }

  if (trimmedContent.length > 10000) {
    throw new AppError('Feedback content cannot exceed 10,000 characters.', 400);
  }

  // 3. Validate score (optional, integer 1-5 scale)
  let validatedScore = null;
  if (score !== undefined && score !== null && score !== '') {
    const numScore = Number(score);
    if (!Number.isInteger(numScore) || numScore < 1 || numScore > 5) {
      throw new AppError('Feedback score must be an integer between 1 and 5.', 400);
    }
    validatedScore = numScore;
  }

  const now = new Date();

  // 4. Create Feedback and append timeline audit event in an atomic transaction
  const feedback = await prisma.$transaction(async (tx) => {
    const newFeedback = await tx.feedback.create({
      data: {
        applicationId,
        interviewerId: interviewer.id,
        content: trimmedContent,
        score: validatedScore,
        createdAt: now,
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.timeline.create({
      data: {
        applicationId,
        eventType: 'FEEDBACK_SUBMITTED',
        userId: interviewer.id,
        details: {
          score: validatedScore,
          interviewerName: interviewer.name,
          feedbackId: newFeedback.id,
        },
        createdAt: now,
      },
    });

    return newFeedback;
  }, { maxWait: 10000, timeout: 20000 });

  return feedback;
};

/**
 * Retrieves all feedback scorecards for an application.
 *
 * @param {string} applicationId
 * @returns {Promise<Array>}
 */
export const getApplicationFeedback = async (applicationId) => {
  if (!applicationId) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
    include: {
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return feedbacks;
};
