import * as timelineService from './timeline.service.js';

/**
 * Controller to retrieve the immutable audit timeline for an application.
 * GET /api/v1/applications/:id/timeline
 */
export const getApplicationTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timeline = await timelineService.getApplicationTimeline(id);

    res.status(200).json({
      status: 'success',
      results: timeline.length,
      data: { timeline },
    });
  } catch (error) {
    next(error);
  }
};
