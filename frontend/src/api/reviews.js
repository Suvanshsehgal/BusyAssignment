import { apiClient } from './client.js';

/**
 * Fetch all candidate applications assigned to the currently authenticated interviewer.
 * Calls GET /api/v1/my-reviews.
 * @returns {Promise<Array>} Array of assigned candidate application objects
 */
export const getMyReviewsApi = async () => {
  const response = await apiClient.get('/my-reviews');
  return response.data?.applications ?? [];
};

/**
 * Submit an evaluation feedback scorecard for an assigned application.
 * Calls POST /api/v1/applications/:id/feedback.
 * @param {string} applicationId - Application UUID
 * @param {Object} payload - { content: string, score?: number }
 * @returns {Promise<Object>} Created feedback record
 */
export const submitFeedbackApi = async (applicationId, payload) => {
  const response = await apiClient.post(`/applications/${applicationId}/feedback`, payload);
  return response.data?.feedback;
};
