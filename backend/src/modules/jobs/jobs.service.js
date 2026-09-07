import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

const ALLOWED_JOB_STATUSES = ['Open', 'Closed', 'Archived'];

export const createJob = async ({ title, department, description, status }) => {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('Job title is required and cannot be empty.', 400);
  }

  if (!department || typeof department !== 'string' || department.trim() === '') {
    throw new AppError('Department is required and cannot be empty.', 400);
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw new AppError('Job description is required and cannot be empty.', 400);
  }

  const assignedStatus = status ? status.trim() : 'Open';

  if (!ALLOWED_JOB_STATUSES.includes(assignedStatus)) {
    throw new AppError(`Invalid job status '${status}'. Allowed statuses are: ${ALLOWED_JOB_STATUSES.join(', ')}.`, 400);
  }

  const job = await prisma.jobOpening.create({
    data: {
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      status: assignedStatus,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return job;
};

export const getJobs = async ({ includeArchived = 'false', status } = {}) => {
  const where = {};

  if (status) {
    if (!ALLOWED_JOB_STATUSES.includes(status)) {
      throw new AppError(`Invalid status filter '${status}'. Allowed statuses: ${ALLOWED_JOB_STATUSES.join(', ')}.`, 400);
    }
    where.status = status;
  } else if (includeArchived !== 'true') {
    // Exclude archived jobs by default
    where.status = { not: 'Archived' };
  }

  const jobs = await prisma.jobOpening.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return jobs;
};

export const getJobById = async (id) => {
  if (!id) {
    throw new AppError('Job ID is required.', 400);
  }

  const job = await prisma.jobOpening.findUnique({
    where: { id },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    throw new AppError('Job opening not found.', 404);
  }

  return job;
};

export const updateJob = async (id, { title, department, description, status }) => {
  if (!id) {
    throw new AppError('Job ID is required.', 400);
  }

  const existingJob = await prisma.jobOpening.findUnique({
    where: { id },
  });

  if (!existingJob) {
    throw new AppError('Job opening not found.', 404);
  }

  const dataToUpdate = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new AppError('Job title cannot be empty.', 400);
    }
    dataToUpdate.title = title.trim();
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || department.trim() === '') {
      throw new AppError('Department cannot be empty.', 400);
    }
    dataToUpdate.department = department.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      throw new AppError('Job description cannot be empty.', 400);
    }
    dataToUpdate.description = description.trim();
  }

  if (status !== undefined) {
    if (!ALLOWED_JOB_STATUSES.includes(status)) {
      throw new AppError(`Invalid job status '${status}'. Allowed statuses are: ${ALLOWED_JOB_STATUSES.join(', ')}.`, 400);
    }
    dataToUpdate.status = status;
  }

  const updatedJob = await prisma.jobOpening.update({
    where: { id },
    data: dataToUpdate,
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return updatedJob;
};

export const archiveJob = async (id) => {
  if (!id) {
    throw new AppError('Job ID is required.', 400);
  }

  const job = await prisma.jobOpening.findUnique({
    where: { id },
  });

  if (!job) {
    throw new AppError('Job opening not found.', 404);
  }

  // Soft state change: sets status to Archived without deleting job or its applications
  const archivedJob = await prisma.jobOpening.update({
    where: { id },
    data: { status: 'Archived' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return archivedJob;
};

export const restoreJob = async (id) => {
  if (!id) {
    throw new AppError('Job ID is required.', 400);
  }

  const job = await prisma.jobOpening.findUnique({
    where: { id },
  });

  if (!job) {
    throw new AppError('Job opening not found.', 404);
  }

  if (job.status !== 'Archived') {
    throw new AppError(`Cannot restore job with status '${job.status}'. Only Archived jobs can be restored.`, 400);
  }

  const restoredJob = await prisma.jobOpening.update({
    where: { id },
    data: { status: 'Open' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return restoredJob;
};

export const getJobApplications = async (jobId) => {
  if (!jobId) {
    throw new AppError('Job ID is required.', 400);
  }

  const job = await prisma.jobOpening.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new AppError('Job opening not found.', 404);
  }

  const applications = await prisma.application.findMany({
    where: { jobOpeningId: jobId },
    orderBy: { appliedDate: 'desc' },
    include: {
      interviewPanels: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  return applications;
};