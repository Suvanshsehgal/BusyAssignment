import * as applicationsService from './applications.service.js';
import * as pipelineService from '../pipeline/pipeline.service.js';

export const createApplication = async (req, res, next) => {
  try {
    const application = await applicationsService.createApplication(req.body, req.user?.id);

    res.status(201).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { jobOpeningId, stage } = req.query;
    const applications = await applicationsService.getApplications({ jobOpeningId, stage });

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await applicationsService.getApplicationById(id);

    res.status(200).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await applicationsService.updateApplication(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    await applicationsService.deleteApplication(id);

    res.status(200).json({
      status: 'success',
      message: 'Application deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const advanceApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetStage, stage, notes } = req.body || {};
    const application = await pipelineService.advanceApplication(id, {
      requestedTargetStage: targetStage || stage,
      notes,
      userId: req.user?.id,
    });

    res.status(200).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body || {};
    const application = await pipelineService.rejectApplication(id, {
      reason,
      notes,
      userId: req.user?.id,
    });

    res.status(200).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const reinstateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body || {};
    const application = await pipelineService.reinstateApplication(id, {
      notes,
      userId: req.user?.id,
    });

    res.status(200).json({
      status: 'success',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};