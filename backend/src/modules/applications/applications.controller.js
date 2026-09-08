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
    const result = await applicationsService.getApplications(req.query);

    res.status(200).json({
      status: 'success',
      data: result.data,
      total_count: result.total_count,
      page: result.page,
      total_pages: result.total_pages,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkAdvanceApplications = async (req, res, next) => {
  try {
    const applicationIds = req.body.applicationIds || req.body.application_ids || req.body.ids;
    const { notes } = req.body;
    const result = await applicationsService.bulkAdvanceApplications({
      applicationIds,
      notes,
      userId: req.user?.id,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkRejectApplications = async (req, res, next) => {
  try {
    const applicationIds = req.body.applicationIds || req.body.application_ids || req.body.ids;
    const { reason } = req.body;
    const result = await applicationsService.bulkRejectApplications({
      applicationIds,
      reason,
      userId: req.user?.id,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const exportApplicationsCsv = async (req, res, next) => {
  try {
    const csvContent = await applicationsService.exportApplicationsCsv(req.query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.status(200).send(csvContent);
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