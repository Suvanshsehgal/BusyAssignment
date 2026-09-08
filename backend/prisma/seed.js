import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PipelineHQ ATS database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.alertDismissal.deleteMany();
  await prisma.timeline.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.interviewPanel.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobOpening.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const defaultPasswordHash = await bcrypt.hash('PipelineHQ2026!', 10);

  // 3. Create Users
  const sarahRecruiter = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah.connor@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'recruiter',
    },
  });

  const marcusRecruiter = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'recruiter',
    },
  });

  const alexInterviewer = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'interviewer',
    },
  });

  const priyaInterviewer = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.patel@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'interviewer',
    },
  });

  const davidInterviewer = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david.kim@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'interviewer',
    },
  });

  const elenaInterviewer = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@pipelinehq.com',
      passwordHash: defaultPasswordHash,
      role: 'interviewer',
    },
  });

  console.log('Created recruiters and interviewers.');

  // 4. Create Job Openings (Open, Closed, Archived)
  const engJob = await prisma.jobOpening.create({
    data: {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      description: 'Lead backend and frontend architecture using Node.js, Express, React, and PostgreSQL.',
      status: 'Open',
    },
  });

  const designJob = await prisma.jobOpening.create({
    data: {
      title: 'Lead Product Designer',
      department: 'Product Design',
      description: 'Own end-to-end design systems and workflow UX for our enterprise ATS platform.',
      status: 'Open',
    },
  });

  const salesJob = await prisma.jobOpening.create({
    data: {
      title: 'Enterprise Account Executive',
      department: 'Sales',
      description: 'Close enterprise pipeline software contracts and manage quarterly quotas.',
      status: 'Closed',
    },
  });

  const devopsJob = await prisma.jobOpening.create({
    data: {
      title: 'Principal DevOps Architect',
      department: 'Infrastructure',
      description: 'Manage multi-region Kubernetes clusters and high-availability cloud deployments.',
      status: 'Archived',
    },
  });

  console.log('Created JobOpenings across Open, Closed, and Archived statuses.');

  // Helper date generators
  const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 5. Create Applications across all pipeline stages

  // App 1: Applied (Fresh)
  const app1 = await prisma.application.create({
    data: {
      candidateName: 'Alice Chen',
      email: 'alice.chen@example.com',
      source: 'LinkedIn',
      notes: 'Strong portfolio with open-source contributions.',
      jobOpeningId: engJob.id,
      stage: 'Applied',
      appliedDate: daysAgo(3),
      stageEnteredAt: daysAgo(3),
    },
  });
  await prisma.timeline.create({
    data: {
      applicationId: app1.id,
      eventType: 'APPLICATION_CREATED',
      newStage: 'Applied',
      userId: sarahRecruiter.id,
      details: { note: 'Direct inbound application via LinkedIn' },
      createdAt: daysAgo(3),
    },
  });

  // App 2: Screening (Stalled > 10 days, Alert Dismissed)
  const app2 = await prisma.application.create({
    data: {
      candidateName: 'Brian Miller',
      email: 'brian.miller@example.com',
      source: 'Referral',
      notes: 'Referred by Alex Rivera. Resume looks strong.',
      jobOpeningId: engJob.id,
      stage: 'Screening',
      appliedDate: daysAgo(20),
      stageEnteredAt: daysAgo(14), // Stalled 14 days
    },
  });
  await prisma.timeline.createMany({
    data: [
      {
        applicationId: app2.id,
        eventType: 'APPLICATION_CREATED',
        newStage: 'Applied',
        userId: marcusRecruiter.id,
        createdAt: daysAgo(20),
      },
      {
        applicationId: app2.id,
        eventType: 'STAGE_CHANGED',
        oldStage: 'Applied',
        newStage: 'Screening',
        userId: marcusRecruiter.id,
        createdAt: daysAgo(14),
      },
    ],
  });
  // Dismissal in Screening stage
  await prisma.alertDismissal.create({
    data: {
      applicationId: app2.id,
      stage: 'Screening',
      dismissedAt: daysAgo(2),
      dismissedById: marcusRecruiter.id,
    },
  });

  // App 3: Interview (Assigned to multiple interviewers, Stalled > 10 days, Undismissed alert)
  const app3 = await prisma.application.create({
    data: {
      candidateName: 'Clara Dupont',
      email: 'clara.dupont@example.com',
      source: 'Careers Page',
      notes: 'Exceptional systems design background.',
      jobOpeningId: engJob.id,
      stage: 'Interview',
      appliedDate: daysAgo(25),
      stageEnteredAt: daysAgo(12), // Stalled 12 days
    },
  });
  await prisma.interviewPanel.createMany({
    data: [
      { applicationId: app3.id, userId: alexInterviewer.id, assignedAt: daysAgo(12), scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // Tomorrow (current week)
      { applicationId: app3.id, userId: priyaInterviewer.id, assignedAt: daysAgo(12), scheduledAt: daysAgo(9) },
    ],
  });
  await prisma.feedback.createMany({
    data: [
      {
        applicationId: app3.id,
        interviewerId: alexInterviewer.id,
        content: 'Clear understanding of event-driven architectures and caching strategies. Strong Hire.',
        score: 5,
        createdAt: daysAgo(10),
      },
      {
        applicationId: app3.id,
        interviewerId: priyaInterviewer.id,
        content: 'Great communication skills and collaborative approach during the pair-programming exercise.',
        score: 4,
        createdAt: daysAgo(9),
      },
    ],
  });
  await prisma.timeline.createMany({
    data: [
      {
        applicationId: app3.id,
        eventType: 'APPLICATION_CREATED',
        newStage: 'Applied',
        userId: sarahRecruiter.id,
        createdAt: daysAgo(25),
      },
      {
        applicationId: app3.id,
        eventType: 'STAGE_CHANGED',
        oldStage: 'Applied',
        newStage: 'Screening',
        userId: sarahRecruiter.id,
        createdAt: daysAgo(18),
      },
      {
        applicationId: app3.id,
        eventType: 'STAGE_CHANGED',
        oldStage: 'Screening',
        newStage: 'Interview',
        userId: sarahRecruiter.id,
        createdAt: daysAgo(12),
      },
      {
        applicationId: app3.id,
        eventType: 'INTERVIEWER_ASSIGNED',
        userId: sarahRecruiter.id,
        details: { interviewers: ['Alex Rivera', 'Priya Patel'] },
        createdAt: daysAgo(12),
      },
      {
        applicationId: app3.id,
        eventType: 'FEEDBACK_SUBMITTED',
        userId: alexInterviewer.id,
        details: { score: 5 },
        createdAt: daysAgo(10),
      },
    ],
  });

  // App 4: Offer stage
  const app4 = await prisma.application.create({
    data: {
      candidateName: 'Daniel Evans',
      email: 'daniel.evans@example.com',
      source: 'Inbound',
      notes: 'Verbal offer extended. Pending final compensation review.',
      jobOpeningId: designJob.id,
      stage: 'Offer',
      appliedDate: daysAgo(18),
      stageEnteredAt: daysAgo(2),
    },
  });
  await prisma.interviewPanel.create({
    data: { applicationId: app4.id, userId: davidInterviewer.id, assignedAt: daysAgo(10), scheduledAt: daysAgo(2) },
  });
  await prisma.feedback.create({
    data: {
      applicationId: app4.id,
      interviewerId: davidInterviewer.id,
      content: 'Outstanding design vision and mastery of Figma component libraries.',
      score: 5,
      createdAt: daysAgo(8),
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app4.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', createdAt: daysAgo(18) },
      { applicationId: app4.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', createdAt: daysAgo(14) },
      { applicationId: app4.id, eventType: 'STAGE_CHANGED', oldStage: 'Screening', newStage: 'Interview', createdAt: daysAgo(10) },
      { applicationId: app4.id, eventType: 'STAGE_CHANGED', oldStage: 'Interview', newStage: 'Offer', createdAt: daysAgo(2) },
    ],
  });

  // App 5: Hired stage
  const app5 = await prisma.application.create({
    data: {
      candidateName: 'Emily Watson',
      email: 'emily.watson@example.com',
      source: 'Referral',
      notes: 'Accepted offer! Start date set for next month.',
      jobOpeningId: designJob.id,
      stage: 'Hired',
      appliedDate: daysAgo(40),
      stageEnteredAt: daysAgo(5),
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app5.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', createdAt: daysAgo(40) },
      { applicationId: app5.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', createdAt: daysAgo(30) },
      { applicationId: app5.id, eventType: 'STAGE_CHANGED', oldStage: 'Screening', newStage: 'Interview', createdAt: daysAgo(20) },
      { applicationId: app5.id, eventType: 'STAGE_CHANGED', oldStage: 'Interview', newStage: 'Offer', createdAt: daysAgo(10) },
      { applicationId: app5.id, eventType: 'STAGE_CHANGED', oldStage: 'Offer', newStage: 'Hired', createdAt: daysAgo(5) },
    ],
  });

  // App 6: Rejected with rejectedFromStage = 'Interview'
  const app6 = await prisma.application.create({
    data: {
      candidateName: 'Frank Castle',
      email: 'frank.castle@example.com',
      source: 'LinkedIn',
      notes: 'Strong technical chops but looking for fully remote architecture role.',
      jobOpeningId: devopsJob.id, // Application inside Archived job
      stage: 'Rejected',
      rejectedFromStage: 'Interview',
      appliedDate: daysAgo(30),
      stageEnteredAt: daysAgo(4),
    },
  });
  await prisma.interviewPanel.createMany({
    data: [
      { applicationId: app6.id, userId: elenaInterviewer.id, assignedAt: daysAgo(15) },
      { applicationId: app6.id, userId: alexInterviewer.id, assignedAt: daysAgo(15) },
    ],
  });
  await prisma.feedback.create({
    data: {
      applicationId: app6.id,
      interviewerId: elenaInterviewer.id,
      content: 'Candidate preferred on-premise infrastructure over our AWS multi-region roadmap.',
      score: 3,
      createdAt: daysAgo(10),
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app6.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', createdAt: daysAgo(30) },
      { applicationId: app6.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', createdAt: daysAgo(22) },
      { applicationId: app6.id, eventType: 'STAGE_CHANGED', oldStage: 'Screening', newStage: 'Interview', createdAt: daysAgo(15) },
      {
        applicationId: app6.id,
        eventType: 'APPLICATION_REJECTED',
        oldStage: 'Interview',
        newStage: 'Rejected',
        userId: sarahRecruiter.id,
        details: { reason: 'Location preference mismatch', rejectedFromStage: 'Interview' },
        createdAt: daysAgo(4),
      },
    ],
  });

  // App 7: Rejected with rejectedFromStage = 'Screening'
  const app7 = await prisma.application.create({
    data: {
      candidateName: 'Grace Hopper',
      email: 'grace.hopper@example.com',
      source: 'Indeed',
      notes: 'Sales experience focused primarily on SMB rather than Enterprise quota.',
      jobOpeningId: salesJob.id, // Application inside Closed job
      stage: 'Rejected',
      rejectedFromStage: 'Screening',
      appliedDate: daysAgo(15),
      stageEnteredAt: daysAgo(6),
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app7.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', createdAt: daysAgo(15) },
      { applicationId: app7.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', createdAt: daysAgo(10) },
      {
        applicationId: app7.id,
        eventType: 'APPLICATION_REJECTED',
        oldStage: 'Screening',
        newStage: 'Rejected',
        userId: marcusRecruiter.id,
        details: { reason: 'Quota requirements misaligned', rejectedFromStage: 'Screening' },
        createdAt: daysAgo(6),
      },
    ],
  });

  // App 8: Screening (Stalled > 10 days, un-dismissed alert)
  const app8 = await prisma.application.create({
    data: {
      candidateName: 'Hector Salamanca',
      email: 'hector.salamanca@example.com',
      source: 'Campus',
      notes: 'Campus recruitment candidate. Needs phone screen follow-up.',
      jobOpeningId: engJob.id,
      stage: 'Screening',
      appliedDate: daysAgo(21),
      stageEnteredAt: daysAgo(16), // Stalled 16 days
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app8.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', createdAt: daysAgo(21) },
      { applicationId: app8.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', createdAt: daysAgo(16) },
    ],
  });

  // App 9: Reinstated Candidate (Demonstrates Rejection -> Reinstatement lifecycle)
  const app9 = await prisma.application.create({
    data: {
      candidateName: 'Iris West',
      email: 'iris.west@example.com',
      source: 'LinkedIn',
      notes: 'Initially rejected due to hiring freeze on design team; reinstated when headcount reopened.',
      jobOpeningId: designJob.id,
      stage: 'Screening',
      rejectedFromStage: null,
      appliedDate: daysAgo(28),
      stageEnteredAt: daysAgo(3),
    },
  });
  await prisma.timeline.createMany({
    data: [
      { applicationId: app9.id, eventType: 'APPLICATION_CREATED', newStage: 'Applied', userId: sarahRecruiter.id, createdAt: daysAgo(28) },
      { applicationId: app9.id, eventType: 'STAGE_CHANGED', oldStage: 'Applied', newStage: 'Screening', userId: sarahRecruiter.id, createdAt: daysAgo(22) },
      { applicationId: app9.id, eventType: 'APPLICATION_REJECTED', oldStage: 'Screening', newStage: 'Rejected', userId: marcusRecruiter.id, details: { reason: 'Temporary hiring freeze', rejectedFromStage: 'Screening' }, createdAt: daysAgo(14) },
      { applicationId: app9.id, eventType: 'APPLICATION_REINSTATED', oldStage: 'Rejected', newStage: 'Screening', userId: sarahRecruiter.id, details: { reinstatedToStage: 'Screening', reason: 'Headcount reauthorized' }, createdAt: daysAgo(3) },
    ],
  });

  // App 10: Applied Stage Stalled Candidate (Stalled 15 days in initial Applied stage)
  const app10 = await prisma.application.create({
    data: {
      candidateName: 'James Gordon',
      email: 'james.gordon@example.com',
      source: 'Careers Page',
      notes: 'Applied during holiday break; pending initial resume review.',
      jobOpeningId: engJob.id,
      stage: 'Applied',
      appliedDate: daysAgo(15),
      stageEnteredAt: daysAgo(15), // Stalled 15 days in Applied
    },
  });
  await prisma.timeline.create({
    data: {
      applicationId: app10.id,
      eventType: 'APPLICATION_CREATED',
      newStage: 'Applied',
      userId: sarahRecruiter.id,
      createdAt: daysAgo(15),
    },
  });

  console.log('Seeded 10 candidate applications across all stages with panels, feedback, timeline events, and alert dismissals.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
