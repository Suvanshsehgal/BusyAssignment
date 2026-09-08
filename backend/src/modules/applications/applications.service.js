import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export const createApplication = async (
  { candidateName, candidate_name, email, source, notes, jobOpeningId, job_opening_id },
  userId
) => {
  const name = candidateName || candidate_name;
  const targetJobId = jobOpeningId || job_opening_id;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Candidate name is required and cannot be empty.', 400);
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new AppError('Candidate email is required and cannot be empty.', 400);
  }

  if (!source || typeof source !== 'string' || source.trim() === '') {
    throw new AppError('Application source is required (e.g., LinkedIn, Referral, Careers Page).', 400);
  }

  if (!targetJobId || typeof targetJobId !== 'string' || targetJobId.trim() === '') {
    throw new AppError('Job opening ID is required.', 400);
  }

  // Validate that the referenced job opening exists
  const job = await prisma.jobOpening.findUnique({
    where: { id: targetJobId },
  });

  if (!job) {
    throw new AppError('Job opening not found. Application must reference an existing job.', 404);
  }

  // Prevent adding candidates to archived jobs
  if (job.status === 'Archived') {
    throw new AppError('Cannot submit applications to an archived job opening.', 400);
  }

  const now = new Date();

  // Create Application and initial immutable Timeline audit entry inside a database transaction
  const application = await prisma.$transaction(async (tx) => {
    const newApp = await tx.application.create({
      data: {
        candidateName: name.trim(),
        email: email.trim().toLowerCase(),
        source: source.trim(),
        notes: notes ? notes.trim() : null,
        jobOpeningId: targetJobId,
        stage: 'Applied',
        stageEnteredAt: now,
        appliedDate: now,
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
        applicationId: newApp.id,
        eventType: 'APPLICATION_CREATED',
        newStage: 'Applied',
        userId: userId || null,
        details: {
          candidateName: newApp.candidateName,
          email: newApp.email,
          source: newApp.source,
          jobTitle: job.title,
          note: 'Initial application submission',
        },
        createdAt: now,
      },
    });

    return newApp;
  }, { maxWait: 10000, timeout: 20000 });

  return application;
};

export const getApplications = async (query = {}) => {
  const {
    search,
    q,
    jobOpeningId,
    job_opening_id,
    stage,
    source,
    sortBy,
    sort_by,
    sortOrder,
    sort_order,
    order,
    direction,
    page: rawPage,
    limit: rawLimit,
  } = query;

  const where = {};

  // 1. Text search across candidateName and email (case-insensitive)
  const searchTerm = (search || q || '').trim();
  if (searchTerm) {
    where.OR = [
      { candidateName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // 2. Filter by jobOpeningId
  const targetJobId = jobOpeningId || job_opening_id;
  if (targetJobId && targetJobId.trim()) {
    where.jobOpeningId = targetJobId.trim();
  }

  // 3. Filter by stage
  if (stage && stage.trim()) {
    where.stage = stage.trim();
  }

  // 4. Filter by source
  if (source && source.trim()) {
    where.source = source.trim();
  }

  // 5. Server-side sorting
  const sortKey = (sortBy || sort_by || 'appliedDate').trim();
  const sortDir = (sortOrder || sort_order || order || direction || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  let sortField = 'appliedDate';
  if (sortKey === 'applied_date' || sortKey === 'appliedDate') {
    sortField = 'appliedDate';
  } else if (sortKey === 'stage') {
    sortField = 'stage';
  } else if (sortKey === 'updated_at' || sortKey === 'updatedAt') {
    sortField = 'updatedAt';
  } else if (sortKey === 'created_at' || sortKey === 'createdAt') {
    sortField = 'createdAt';
  } else if (sortKey === 'candidate_name' || sortKey === 'candidateName') {
    sortField = 'candidateName';
  }

  const orderBy = [
    { [sortField]: sortDir },
    { id: 'asc' }, // deterministic secondary tie-breaker
  ];

  // 6. Pagination parameters
  let page = parseInt(rawPage, 10);
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(rawLimit, 10);
  if (Number.isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  // Execute count and paginated query concurrently at database level
  const [total_count, data] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        jobOpening: {
          select: {
            id: true,
            title: true,
            department: true,
            status: true,
          },
        },
        interviewPanels: {
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
        },
      },
    }),
  ]);

  const total_pages = total_count === 0 ? 0 : Math.ceil(total_count / limit);

  return {
    data,
    total_count,
    page,
    total_pages,
  };
};

export * from './applications.bulk.js';
export * from './applications.csv.js';

export const getApplicationById = async (id) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      jobOpening: {
        select: {
          id: true,
          title: true,
          department: true,
          status: true,
        },
      },
      interviewPanels: {
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
      },
      feedbacks: {
        select: {
          id: true,
          content: true,
          score: true,
          createdAt: true,
          interviewer: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      timelineEvents: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  return application;
};

export const updateApplication = async (id, updateData) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const existingApp = await prisma.application.findUnique({
    where: { id },
  });

  if (!existingApp) {
    throw new AppError('Application not found.', 404);
  }

  // Reject stage changes through this endpoint
  if (updateData.stage !== undefined) {
    throw new AppError('Stage transitions cannot be modified through the basic application edit endpoint.', 400);
  }

  const dataToUpdate = {};

  const name = updateData.candidateName || updateData.candidate_name;
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new AppError('Candidate name cannot be empty.', 400);
    }
    dataToUpdate.candidateName = name.trim();
  }

  if (updateData.email !== undefined) {
    if (typeof updateData.email !== 'string' || updateData.email.trim() === '') {
      throw new AppError('Candidate email cannot be empty.', 400);
    }
    dataToUpdate.email = updateData.email.trim().toLowerCase();
  }

  if (updateData.source !== undefined) {
    if (typeof updateData.source !== 'string' || updateData.source.trim() === '') {
      throw new AppError('Source cannot be empty.', 400);
    }
    dataToUpdate.source = updateData.source.trim();
  }

  if (updateData.notes !== undefined) {
    dataToUpdate.notes = updateData.notes ? updateData.notes.trim() : null;
  }

  const updated = await prisma.application.update({
    where: { id },
    data: dataToUpdate,
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

  return updated;
};

export const deleteApplication = async (id) => {
  if (!id) {
    throw new AppError('Application ID is required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      feedbacks: true,
      interviewPanels: true,
      timelineEvents: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  // Safety & Audit Integrity Rules:
  // 1. Cannot delete if interviewer feedback has been recorded
  if (application.feedbacks && application.feedbacks.length > 0) {
    throw new AppError(
      'Cannot delete an application with recorded interviewer feedback. Historical evaluation records must be preserved.',
      400
    );
  }

  // 2. Cannot delete if interviewers are actively assigned to panels
  if (application.interviewPanels && application.interviewPanels.length > 0) {
    throw new AppError(
      'Cannot delete an application with assigned interviewers. Remove panel assignments first or reject the application.',
      400
    );
  }

  // 3. Cannot delete if application progressed past Applied stage or has stage transition audit history
  const hasProgressedEvents = application.timelineEvents.some(
    (e) => e.eventType !== 'APPLICATION_CREATED'
  );

  if (application.stage !== 'Applied' || hasProgressedEvents) {
    throw new AppError(
      'Cannot delete an application that has progressed through the hiring pipeline. Reject the application instead to maintain an immutable audit trail.',
      400
    );
  }

  // Safe deletion of fresh unprogressed application
  await prisma.$transaction(async (tx) => {
    await tx.timeline.deleteMany({ where: { applicationId: id } });
    await tx.alertDismissal.deleteMany({ where: { applicationId: id } });
    await tx.application.delete({ where: { id } });
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true };
};