import prisma from '../../config/prisma.js';

/**
 * Calculates start and end of week (Monday 00:00:00.000 UTC to Sunday 23:59:59.999 UTC)
 * @param {Date} [date]
 * @returns {{ startOfWeek: Date, endOfWeek: Date }}
 */
export const getWeekBoundaries = (date = new Date()) => {
  const current = new Date(date);
  const day = current.getUTCDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const startOfWeek = new Date(current);
  startOfWeek.setUTCDate(current.getUTCDate() + diffToMonday);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

/**
 * Calculates start and end of month in UTC
 * @param {Date} [date]
 * @returns {{ startOfMonth: Date, endOfMonth: Date }}
 */
export const getMonthBoundaries = (date = new Date()) => {
  const current = new Date(date);
  const startOfMonth = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { startOfMonth, endOfMonth };
};

/**
 * Overview KPIs: Open Positions, Active Applications, Interviews Scheduled This Week, Hires This Month
 * Executes all aggregations at the database level.
 *
 * @param {object} [options]
 * @param {Date} [options.referenceDate] Optional date override for testing boundaries
 * @returns {Promise<object>} KPI object
 */
export const getOverviewKPIs = async ({ referenceDate } = {}) => {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const { startOfWeek, endOfWeek } = getWeekBoundaries(now);
  const { startOfMonth, endOfMonth } = getMonthBoundaries(now);

  const [
    openPositions,
    activeApplications,
    interviewsScheduledThisWeek,
    hiresThisMonth,
  ] = await Promise.all([
    // 1. Open Positions (JobOpening where status = 'Open')
    prisma.jobOpening.count({
      where: { status: 'Open' },
    }),

    // 2. Active Applications (Application in active funnel stages)
    prisma.application.count({
      where: {
        stage: { notIn: ['Rejected', 'Hired'] },
      },
    }),

    // 3. Interviews Scheduled This Week (explicit scheduledAt or Interview panel assigned this week)
    prisma.interviewPanel.count({
      where: {
        OR: [
          {
            scheduledAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
          {
            scheduledAt: null,
            assignedAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
            application: {
              stage: 'Interview',
            },
          },
        ],
      },
    }),

    // 4. Hires This Month (Application in Hired stage reached this month)
    prisma.application.count({
      where: {
        stage: 'Hired',
        stageEnteredAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),
  ]);

  return {
    open_positions: openPositions,
    active_applications: activeApplications,
    interviews_scheduled_this_week: interviewsScheduledThisWeek,
    hires_this_month: hiresThisMonth,
    // Provide camelCase aliases as well for flexibility
    openPositions,
    activeApplications,
    interviewsScheduledThisWeek,
    hiresThisMonth,
    meta: {
      week_start: startOfWeek.toISOString(),
      week_end: endOfWeek.toISOString(),
      month_start: startOfMonth.toISOString(),
      month_end: endOfMonth.toISOString(),
    },
  };
};

/**
 * Breakdown of applications by job opening.
 * Groups by job opening and stage using database-level aggregations.
 *
 * @returns {Promise<Array<object>>} Array of job breakdown objects
 */
export const getAnalyticsByJob = async () => {
  const [jobs, stageCounts] = await Promise.all([
    prisma.jobOpening.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.application.groupBy({
      by: ['jobOpeningId', 'stage'],
      _count: { id: true },
    }),
  ]);

  // Index stage counts by jobOpeningId
  const countsByJob = new Map();
  for (const group of stageCounts) {
    if (!countsByJob.has(group.jobOpeningId)) {
      countsByJob.set(group.jobOpeningId, {});
    }
    countsByJob.get(group.jobOpeningId)[group.stage] = group._count.id;
  }

  const allStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  const results = jobs.map((job) => {
    const jobStageMap = countsByJob.get(job.id) || {};
    const stages = {};
    let totalApplications = 0;
    let activeApplications = 0;

    for (const stage of allStages) {
      const count = jobStageMap[stage] || 0;
      stages[stage] = count;
      totalApplications += count;
      if (stage !== 'Rejected' && stage !== 'Hired') {
        activeApplications += count;
      }
    }

    return {
      job_id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      total_applications: totalApplications,
      active_applications: activeApplications,
      totalApplications,
      activeApplications,
      stages,
    };
  });

  return results;
};

/**
 * Breakdown of applications by pipeline stage including the rejected state.
 * Uses Prisma database-level groupBy.
 *
 * @returns {Promise<object>} Stage breakdown summary
 */
export const getAnalyticsByStage = async () => {
  const allStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  const stageCounts = await prisma.application.groupBy({
    by: ['stage'],
    _count: { id: true },
  });

  const countMap = {};
  for (const group of stageCounts) {
    countMap[group.stage] = group._count.id;
  }

  let totalApplications = 0;
  let activeApplications = 0;

  const stages = {};
  const breakdown = [];

  for (const stage of allStages) {
    const count = countMap[stage] || 0;
    stages[stage] = count;
    totalApplications += count;
    if (stage !== 'Rejected' && stage !== 'Hired') {
      activeApplications += count;
    }
  }

  for (const stage of allStages) {
    const count = stages[stage];
    const percentage = totalApplications > 0
      ? Number(((count / totalApplications) * 100).toFixed(2))
      : 0;

    breakdown.push({
      stage,
      count,
      percentage,
      is_active: stage !== 'Rejected' && stage !== 'Hired',
    });
  }

  return {
    total_applications: totalApplications,
    active_applications: activeApplications,
    rejected_applications: stages.Rejected || 0,
    hired_applications: stages.Hired || 0,
    stages,
    breakdown,
  };
};

/**
 * Applications trend over the last 12 weeks in a frontend-friendly chronological format.
 * Guarantees all 12 weekly buckets exist even if count is zero.
 *
 * @param {object} [options]
 * @param {Date} [options.referenceDate] Optional reference date for testing boundaries
 * @returns {Promise<Array<object>>} Chronological array of 12 weekly application count buckets
 */
export const getApplicationsTrend = async ({ referenceDate } = {}) => {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const { startOfWeek: currentWeekStart } = getWeekBoundaries(now);

  // Generate 12 weekly buckets from 11 weeks ago to current week
  const buckets = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setUTCDate(currentWeekStart.getUTCDate() - i * 7);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);

    const weekNumber = Math.ceil(
      ((start - new Date(Date.UTC(start.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7
    );

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[start.getUTCMonth()]} ${start.getUTCDate()} - ${monthNames[end.getUTCMonth()]} ${end.getUTCDate()}`;

    buckets.push({
      week_index: 12 - i,
      week_code: `${start.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      label,
      count: 0,
      _startMs: start.getTime(),
      _endMs: end.getTime(),
    });
  }

  const oldestBucketStart = new Date(buckets[0]._startMs);

  // Query timestamps of all applications received within the 12-week window
  const applications = await prisma.application.findMany({
    where: {
      appliedDate: {
        gte: oldestBucketStart,
      },
    },
    select: {
      appliedDate: true,
    },
  });

  // Distribute applications into their respective chronological buckets
  for (const app of applications) {
    const appTime = new Date(app.appliedDate).getTime();
    for (const bucket of buckets) {
      if (appTime >= bucket._startMs && appTime <= bucket._endMs) {
        bucket.count++;
        break;
      }
    }
  }

  // Clean internal tracking fields before returning
  return buckets.map(({ _startMs, _endMs, ...rest }) => rest);
};
