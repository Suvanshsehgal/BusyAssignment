import prisma from '../../config/prisma.js';

const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(
    
    val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generates an RFC 4180 compliant CSV export for applications.
 * By default filters for active pipeline candidates (excluding terminal Rejected and Hired).
 * Supports optional filters: jobOpeningId, stage, source, search.
 *
 * @param {object} query
 * @returns {Promise<string>} RFC 4180 CSV string
 */
export const exportApplicationsCsv = async (query = {}) => {
  const {
    jobOpeningId,
    job_opening_id,
    stage,
    source,
    search,
    q,
    all,
    includeAll,
  } = query;

  const where = {};

  const searchTerm = (search || q || '').trim();
  if (searchTerm) {
    where.OR = [
      { candidateName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const targetJobId = jobOpeningId || job_opening_id;
  if (targetJobId && targetJobId.trim()) {
    where.jobOpeningId = targetJobId.trim();
  }

  if (stage && stage.trim()) {
    where.stage = stage.trim();
  } else if (!all && !includeAll) {
    // Default to active pipeline applications (excluding terminal Hired and Rejected stages)
    where.stage = { notIn: ['Rejected', 'Hired'] };
  }

  if (source && source.trim()) {
    where.source = source.trim();
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: [
      { appliedDate: 'desc' },
      { id: 'asc' },
    ],
    include: {
      jobOpening: {
        select: {
          id: true,
          title: true,
          department: true,
        },
      },
    },
  });

  const headers = [
    'Application ID',
    'Candidate Name',
    'Candidate Email',
    'Job Title',
    'Department',
    'Stage',
    'Source',
    'Applied Date',
    'Stage Entered At',
    'Rejected From Stage',
    'Notes',
  ];

  const rows = applications.map((app) => [
    app.id,
    app.candidateName,
    app.email,
    app.jobOpening?.title || '',
    app.jobOpening?.department || '',
    app.stage,
    app.source,
    app.appliedDate ? app.appliedDate.toISOString() : '',
    app.stageEnteredAt ? app.stageEnteredAt.toISOString() : '',
    app.rejectedFromStage || '',
    app.notes || '',
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n');

  return csvContent;
};
