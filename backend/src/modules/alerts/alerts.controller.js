import * as alertsService from './alerts.service.js';

export const getStalledAlerts = async (req, res, next) => {
  try {
    const referenceDate = req.query.referenceDate || req.query.date;
    const data = await alertsService.getStalledAlerts({ referenceDate });

    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStalledAlertsCount = async (req, res, next) => {
  try {
    const referenceDate = req.query.referenceDate || req.query.date;
    const data = await alertsService.getStalledAlertsCount({ referenceDate });

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const dismissAlert = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId || req.params.id;
    const dismissedById = req.user.id;
    const referenceDate = req.body?.referenceDate || req.query?.referenceDate;

    const dismissal = await alertsService.dismissAlert({
      applicationId,
      dismissedById,
      referenceDate,
    });

    res.status(200).json({
      status: 'success',
      message: 'Alert dismissed for current stage',
      data: { dismissal },
    });
  } catch (error) {
    next(error);
  }
};
