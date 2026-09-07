import { AppError } from '../utils/appError.js';
import prisma from '../config/prisma.js';

/**
 * Checks if the user is assigned as an interviewer to the specified application.
 * @param {string} applicationId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const isInterviewerAssignedToApplication = async (applicationId, userId) => {
  if (!applicationId || !userId) return false;

  const panelAssignment = await prisma.interviewPanel.findUnique({
    where: {
      applicationId_userId: {
        applicationId,
        userId,
      },
    },
  });

  return Boolean(panelAssignment);
};

/**
 * Reusable candidate/application-level authorization middleware.
 * Verifies that:
 * 1. The user is authenticated.
 * 2. If the user is a recruiter, access is permitted (recruiters have pipeline oversight).
 * 3. If the user is an interviewer, verifies that req.user.id is actually assigned to the application in InterviewPanel.
 * Returns 403 Forbidden if not assigned.
 */
export const requireApplicationAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const applicationId = req.params.applicationId || req.params.id || req.body?.applicationId;

    if (!applicationId) {
      return next(new AppError('Application ID is required for resource authorization.', 400));
    }

    // Recruiters have global access to manage and view pipeline candidates
    if (req.user.role === 'recruiter') {
      return next();
    }

    // For interviewers: query database using req.user.id (never trusting client-supplied IDs)
    const isAssigned = await isInterviewerAssignedToApplication(applicationId, req.user.id);

    if (!isAssigned) {
      return next(
        new AppError(
          'Forbidden: You are not assigned to this application and cannot access its details or leave feedback.',
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Reusable validation rule: verifies that a target user is an eligible interviewer.
 * Ensures that any future interview-panel assignment targets a user whose actual database role is 'interviewer'.
 * @param {string} userId
 * @returns {Promise<object>} The validated interviewer user record.
 */
export const validateInterviewerRole = async (userId) => {
  if (!userId) {
    throw new AppError('User ID is required to validate interviewer eligibility.', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role !== 'interviewer') {
    throw new AppError(
      `Invalid assignment: Only users with the 'interviewer' role can be assigned to interview panels. User '${user.name}' has role '${user.role}'.`,
      400
    );
  }

  return user;
};