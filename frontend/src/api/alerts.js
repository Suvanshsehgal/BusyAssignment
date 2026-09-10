import { apiClient } from './client.js';

/**
 * Fetch all active stalled candidate alerts for recruiter.
 * Calls GET /api/v1/alerts.
 * @returns {Promise<Array>} List of active stalled candidate alerts
 */
export const getAlertsApi = async () => {
  const response = await apiClient.get('/alerts');
  return response.data ?? [];
};

/**
 * Fetch active stalled alert count for navigation badges.
 * Calls GET /api/v1/alerts/count.
 * @returns {Promise<{ count: number }>} Alert count object
 */
export const getAlertsCountApi = async () => {
  const response = await apiClient.get('/alerts/count');
  return response.data ?? { count: 0 };
};

/**
 * Dismiss a stalled candidate alert for the application's current stage.
 * Tries POST /api/v1/alerts/:id/dismiss with fallback to PATCH /api/v1/alerts/:id/dismiss.
 * @param {string} applicationId - UUID of the candidate application
 * @returns {Promise<Object>} Dismissal confirmation
 */
export const dismissAlertApi = async (applicationId) => {
  try {
    const response = await apiClient.post(`/alerts/${applicationId}/dismiss`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const fallbackRes = await apiClient.patch(`/alerts/${applicationId}/dismiss`);
      return fallbackRes.data;
    }
    throw err;
  }
};
