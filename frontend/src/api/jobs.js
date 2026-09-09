import { apiClient } from './client.js';

/**
 * Fetch list of jobs from backend.
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - 'Open' | 'Closed' | 'Archived'
 * @param {string} [params.includeArchived] - 'true' | 'false'
 * @returns {Promise<Array>} List of jobs
 */
export const getJobsApi = async (params = {}) => {
  const queryParams = {};
  if (params.status) queryParams.status = params.status;
  if (params.includeArchived) queryParams.includeArchived = params.includeArchived;

  const response = await apiClient.get('/jobs', { params: queryParams });
  return response.data?.jobs ?? [];
};

/**
 * Fetch a single job opening by its ID.
 * @param {string} id - Job opening UUID
 * @returns {Promise<Object>} Job details
 */
export const getJobByIdApi = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data?.job;
};

/**
 * Create a new job opening.
 * @param {Object} data - { title, department, description, status? }
 * @returns {Promise<Object>} Created job
 */
export const createJobApi = async (data) => {
  const response = await apiClient.post('/jobs', data);
  return response.data?.job;
};

/**
 * Update an existing job opening.
 * @param {string} id - Job opening UUID
 * @param {Object} data - { title?, department?, description?, status? }
 * @returns {Promise<Object>} Updated job
 */
export const updateJobApi = async (id, data) => {
  const response = await apiClient.patch(`/jobs/${id}`, data);
  return response.data?.job;
};

/**
 * Soft archive a job opening.
 * @param {string} id - Job opening UUID
 * @returns {Promise<Object>} Archived job
 */
export const archiveJobApi = async (id) => {
  const response = await apiClient.patch(`/jobs/${id}/archive`);
  return response.data?.job;
};

/**
 * Restore an archived job opening back to Open.
 * @param {string} id - Job opening UUID
 * @returns {Promise<Object>} Restored job
 */
export const restoreJobApi = async (id) => {
  const response = await apiClient.patch(`/jobs/${id}/restore`);
  return response.data?.job;
};
