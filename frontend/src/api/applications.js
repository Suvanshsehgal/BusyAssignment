import { apiClient } from './client.js';

/**
 * Fetch paginated list of applications with server-side search, filters, sorting, and pagination.
 * @param {Object} [params]
 * @param {string} [params.search] - Search across candidateName and email
 * @param {string} [params.jobOpeningId] - Filter by job opening UUID
 * @param {string} [params.stage] - Filter by stage
 * @param {string} [params.source] - Filter by application source
 * @param {string} [params.sortBy] - 'appliedDate' | 'stage' | 'updatedAt' | 'candidateName'
 * @param {string} [params.sortOrder] - 'asc' | 'desc'
 * @param {number} [params.page] - Page number (1-based)
 * @param {number} [params.limit] - Page size
 * @returns {Promise<{ data: Array, total_count: number, page: number, total_pages: number }>}
 */
export const getApplicationsApi = async (params = {}) => {
  const queryParams = {};
  if (params.search) queryParams.search = params.search;
  if (params.jobOpeningId) queryParams.jobOpeningId = params.jobOpeningId;
  if (params.stage) queryParams.stage = params.stage;
  if (params.source) queryParams.source = params.source;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;

  const response = await apiClient.get('/applications', { params: queryParams });
  return {
    data: response.data ?? [],
    total_count: response.total_count ?? 0,
    page: response.page ?? 1,
    total_pages: response.total_pages ?? 1,
  };
};

/**
 * Fetch a single application by ID with job, panel, feedbacks, and timeline events.
 * @param {string} id
 */
export const getApplicationByIdApi = async (id) => {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data?.application;
};

/**
 * Create a new application.
 * @param {Object} data - { candidateName, email, source, notes, jobOpeningId }
 */
export const createApplicationApi = async (data) => {
  const response = await apiClient.post('/applications', data);
  return response.data?.application;
};

/**
 * Update basic application metadata (cannot change stage through this endpoint).
 * @param {string} id
 * @param {Object} data - { candidateName?, email?, source?, notes?, jobOpeningId? }
 */
export const updateApplicationApi = async (id, data) => {
  const response = await apiClient.patch(`/applications/${id}`, data);
  return response.data?.application;
};

/**
 * Delete an application (only allowed if no feedback recorded and no active panel members).
 * @param {string} id
 */
export const deleteApplicationApi = async (id) => {
  const response = await apiClient.delete(`/applications/${id}`);
  return response;
};

/**
 * Advance an application sequentially to the next pipeline stage.
 * @param {string} id
 * @param {Object} [payload] - { targetStage?, notes? }
 */
export const advanceApplicationApi = async (id, payload = {}) => {
  const response = await apiClient.patch(`/applications/${id}/advance`, payload);
  return response.data?.application;
};

/**
 * Reject an application from any non-rejected stage.
 * @param {string} id
 * @param {Object} [payload] - { reason?, notes? }
 */
export const rejectApplicationApi = async (id, payload = {}) => {
  const response = await apiClient.patch(`/applications/${id}/reject`, payload);
  return response.data?.application;
};

/**
 * Reinstate a rejected application back to its rejectedFromStage.
 * @param {string} id
 * @param {Object} [payload] - { notes? }
 */
export const reinstateApplicationApi = async (id, payload = {}) => {
  const response = await apiClient.patch(`/applications/${id}/reinstate`, payload);
  return response.data?.application;
};

/**
 * Fetch assigned interview panel members for an application.
 * @param {string} id
 */
export const getApplicationPanelApi = async (id) => {
  const response = await apiClient.get(`/applications/${id}/panel`);
  return response.data?.panel ?? [];
};

/**
 * Assign an interviewer to an application's panel.
 * @param {string} id - Application ID
 * @param {Object} payload - { userId, scheduledAt? }
 */
export const assignPanelMemberApi = async (id, payload) => {
  const response = await apiClient.post(`/applications/${id}/panel`, payload);
  return response.data?.panel;
};

/**
 * Remove an interviewer from an application's panel.
 * @param {string} id - Application ID
 * @param {string} userId - Interviewer User ID
 */
export const removePanelMemberApi = async (id, userId) => {
  const response = await apiClient.delete(`/applications/${id}/panel/${userId}`);
  return response;
};

/**
 * Fetch recorded feedback scorecards for an application.
 * @param {string} id
 */
export const getApplicationFeedbackApi = async (id) => {
  const response = await apiClient.get(`/applications/${id}/feedback`);
  return response.data?.feedbacks ?? [];
};

/**
 * Fetch immutable audit timeline events for an application.
 * @param {string} id
 */
export const getApplicationTimelineApi = async (id) => {
  const response = await apiClient.get(`/applications/${id}/timeline`);
  return response.data?.timeline ?? [];
};

/**
 * Bulk advance multiple applications.
 * @param {Object} payload - { applicationIds: string[], notes?: string }
 * @returns {Promise<{ total: number, succeeded_count: number, failed_count: number, successful: Array, failed: Array, results: Array }>}
 */
export const bulkAdvanceApplicationsApi = async (payload) => {
  const response = await apiClient.post('/applications/bulk-advance', payload);
  return response.data;
};

/**
 * Bulk reject multiple applications.
 * @param {Object} payload - { applicationIds: string[], reason?: string }
 * @returns {Promise<{ total: number, succeeded_count: number, failed_count: number, successful: Array, failed: Array, results: Array }>}
 */
export const bulkRejectApplicationsApi = async (payload) => {
  const response = await apiClient.post('/applications/bulk-reject', payload);
  return response.data;
};

/**
 * Export applications as an RFC 4180 CSV file from the backend.
 * Triggers a browser download using a temporary Object URL.
 * @param {Object} [params]
 */
export const exportApplicationsCsvApi = async (params = {}) => {
  const queryParams = { ...params, all: true };
  const response = await apiClient.get('/applications/export-csv', {
    params: queryParams,
    responseType: 'blob',
  });

  // Trigger browser download
  const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'applications.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
