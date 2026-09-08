import * as feedbackService from './feedback.service.js';

export const createFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.createFeedback(id, req.body, req.user);

    res.status(201).json({
      status: 'success',
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedbacks = await feedbackService.getApplicationFeedback(id);

    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      data: { feedbacks },
    });
  } catch (error) {
    next(error);
  }
};
