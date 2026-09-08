import * as careersService from './careers.service.js';

export const getPublicOpenJobs = async (req, res, next) => {
  try {
    const jobs = await careersService.getPublicOpenJobs();

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicOpenJobById = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await careersService.getPublicOpenJobById(jobId);

    res.status(200).json({
      status: 'success',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const submitPublicApplication = async (req, res, next) => {
  try {
    const jobId = req.params.id || req.body.jobOpeningId || req.body.jobId;
    const { candidateName, name, email, notes } = req.body;

    const application = await careersService.submitPublicApplication({
      jobId,
      candidateName: candidateName || name,
      email,
      notes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};
