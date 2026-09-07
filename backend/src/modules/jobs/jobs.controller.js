import * as jobsService from './jobs.service.js';

export const createJob = async (req, res, next) => {
  try {
    const { title, department, description, status } = req.body;
    const job = await jobsService.createJob({ title, department, description, status });

    res.status(201).json({
      status: 'success',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { includeArchived, status } = req.query;
    const jobs = await jobsService.getJobs({ includeArchived, status });

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobsService.getJobById(id);

    res.status(200).json({
      status: 'success',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, department, description, status } = req.body;
    const job = await jobsService.updateJob(id, { title, department, description, status });

    res.status(200).json({
      status: 'success',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobsService.archiveJob(id);

    res.status(200).json({
      status: 'success',
      message: 'Job opening archived successfully.',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobsService.restoreJob(id);

    res.status(200).json({
      status: 'success',
      message: 'Job opening restored successfully.',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await jobsService.getJobApplications(jobId);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};