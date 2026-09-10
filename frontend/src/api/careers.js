import { apiClient } from './client.js';

/**
 * Fetch all currently open public job openings.
 * Calls GET /api/v1/careers/jobs (with fallback to /api/v1/public/careers/jobs if supported).
 * @returns {Promise<Array>} List of open public job openings
 */
export const getPublicJobsApi = async () => {
  try {
    const response = await apiClient.get('/careers/jobs', { skipAuth: true });
    return response.data?.jobs ?? [];
  } catch (err) {
    if (err.response?.status === 404) {
      // Fallback in case of alias route
      const fallbackRes = await apiClient.get('/public/careers/jobs', { skipAuth: true });
      return fallbackRes.data?.jobs ?? [];
    }
    throw err;
  }
};

/**
 * Fetch details of a single open public job opening.
 * Calls GET /api/v1/careers/jobs/:id.
 * @param {string} jobId - UUID of the job opening
 * @returns {Promise<Object>} Public job opening details
 */
export const getPublicJobByIdApi = async (jobId) => {
  try {
    const response = await apiClient.get(`/careers/jobs/${jobId}`, { skipAuth: true });
    return response.data?.job;
  } catch (err) {
    if (err.response?.status === 404 && err.response?.data?.message?.includes('Cannot find')) {
      // Fallback in case of alias route
      const fallbackRes = await apiClient.get(`/public/careers/jobs/${jobId}`, { skipAuth: true });
      return fallbackRes.data?.job;
    }
    throw err;
  }
};

/**
 * Submit a public candidate self-application.
 * Calls POST /api/v1/careers/jobs/:id/apply (or POST /api/v1/careers/apply).
 * @param {Object} payload - { jobId: string, candidateName: string, email: string, notes?: string }
 * @returns {Promise<Object>} Created application record
 */
export const submitPublicApplicationApi = async ({ jobId, candidateName, email, notes }) => {
  try {
    const response = await apiClient.post(
      `/careers/jobs/${jobId}/apply`,
      {
        candidateName,
        email,
        notes: notes || undefined,
      },
      { skipAuth: true }
    );
    return response.data?.application;
  } catch (err) {
    if (err.response?.status === 404 && err.response?.data?.message?.includes('Cannot find')) {
      // Fallback to /careers/apply or /public/careers/apply
      const fallbackRes = await apiClient.post(
        '/careers/apply',
        {
          jobId,
          candidateName,
          email,
          notes: notes || undefined,
        },
        { skipAuth: true }
      );
      return fallbackRes.data?.application;
    }
    throw err;
  }
};
