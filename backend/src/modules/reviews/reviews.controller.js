import * as reviewsService from './reviews.service.js';

export const getMyReviews = async (req, res, next) => {
  try {
    // Strictly derive interviewer ID from req.user.id
    const applications = await reviewsService.getMyReviews(req.user.id);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
        reviews: applications, // Provide both for ergonomics
      },
    });
  } catch (error) {
    next(error);
  }
};
