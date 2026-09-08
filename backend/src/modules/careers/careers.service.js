import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Retrieves all currently open job openings for the public careers page.
 * Strictly excludes Closed and Archived job openings.
 *
 * @returns {Promise<Array<object>>} List of active, open job openings
 */
export const getPublicOpenJobs = async () => {
  const jobs = await prisma.jobOpening.findMany({
    where: {
      status: 'Open',
    },
    select: {
      id: true,
      title: true,
      department: true,
      description: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return jobs;
};

/**
 * Retrieves details of a specific job opening for the public careers page.
 * If the job does not exist or is not 'Open' (i.e. Closed or Archived),
 * it is treated as not found to public visitors.
 *
 * @param {string} jobId UUID of the job opening
 * @returns {Promise<object>} Job opening details
 */
export const getPublicOpenJobById = async (jobId) => {
  if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
    throw new AppError('Job opening ID is required.', 400);
  }

  const job = await prisma.jobOpening.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      department: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });

  if (!job || job.status !== 'Open') {
    throw new AppError('Job opening not found or is no longer open for applications.', 404);
  }

  return job;
};

/**
 * Submits a public candidate self-application for an open job opening.
 * - Enforces required fields (candidateName, valid email)
 * - Verifies the job exists and has status === 'Open'
 * - Prevents duplicate applications for the same email and job opening (409 Conflict)
 * - Hardcodes source to 'Careers Page' and stage to 'Applied'
 * - Creates Application and immutable Timeline record atomically
 * - Protects candidate PII from redundant leakage in timeline metadata
 *
 * @param {object} params
 * @param {string} params.jobId Target job opening ID
 * @param {string} params.candidateName Candidate full name
 * @param {string} params.email Candidate email address
 * @param {string} [params.notes] Optional candidate cover note or message
 * @returns {Promise<object>} Created application record
 */
export const submitPublicApplication = async ({ jobId, candidateName, email, notes } = {}) => {
  // 1. Validate candidateName
  if (!candidateName || typeof candidateName !== 'string' || candidateName.trim().length < 2) {
    throw new AppError('Candidate name is required and must be at least 2 characters long.', 400);
  }

  // 2. Validate email
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new AppError('A valid email address is required.', 400);
  }

  // 3. Validate jobId
  if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
    throw new AppError('Job opening ID is required.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = candidateName.trim();
  const trimmedNotes = notes && typeof notes === 'string' ? notes.trim() : null;

  // 4. Verify job exists and is Open
  const job = await prisma.jobOpening.findUnique({
    where: { id: jobId.trim() },
    select: {
      id: true,
      title: true,
      department: true,
      status: true,
    },
  });

  if (!job) {
    throw new AppError('Job opening not found.', 404);
  }

  if (job.status !== 'Open') {
    throw new AppError('This job opening is no longer open for applications.', 400);
  }

  // 5. Duplicate Application Protection (Same email + same job)
  const existingApplication = await prisma.application.findFirst({
    where: {
      jobOpeningId: job.id,
      email: normalizedEmail,
    },
    select: {
      id: true,
      stage: true,
    },
  });

  if (existingApplication) {
    throw new AppError(
      'You have already submitted an application for this job opening.',
      409
    );
  }

  const now = new Date();

  // 6. Atomic creation of Application and Timeline entry
  const application = await prisma.$transaction(async (tx) => {
    const newApp = await tx.application.create({
      data: {
        candidateName: trimmedName,
        email: normalizedEmail,
        source: 'Careers Page', // Strictly server-enforced; cannot be spoofed
        notes: trimmedNotes,
        jobOpeningId: job.id,
        stage: 'Applied', // Strictly server-enforced
        stageEnteredAt: now,
        appliedDate: now,
      },
      select: {
        id: true,
        candidateName: true,
        email: true,
        source: true,
        notes: true,
        stage: true,
        appliedDate: true,
        stageEnteredAt: true,
        jobOpeningId: true,
        createdAt: true,
        jobOpening: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    });

    // Append immutable timeline audit event without leaking redundant candidate PII
    await tx.timeline.create({
      data: {
        applicationId: newApp.id,
        eventType: 'APPLICATION_CREATED',
        newStage: 'Applied',
        userId: null, // Public self-application has no internal authenticated actor
        details: {
          source: 'Careers Page',
          jobTitle: job.title,
          submissionChannel: 'public_careers_portal',
        },
        createdAt: now,
      },
    });

    return newApp;
  });

  return application;
};
