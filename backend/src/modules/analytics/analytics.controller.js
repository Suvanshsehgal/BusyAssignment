import * as analyticsService from './analytics.service.js';

export const getOverviewKPIs = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverviewKPIs({
      referenceDate: req.query.referenceDate || req.query.date,
    });

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsByJob = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalyticsByJob();

    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsByStage = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalyticsByStage();

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsTrend = async (req, res, next) => {
  try {
    const data = await analyticsService.getApplicationsTrend({
      referenceDate: req.query.referenceDate || req.query.date,
    });

    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};
