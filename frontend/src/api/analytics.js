import { apiClient } from './client.js';

/**
 * Fetch executive overview KPIs (Open Positions, Active Candidates, Interviews This Week, Hires This Month).
 * @returns {Promise<object>} KPI data object
 */
export const getOverviewKPIsApi = async () => {
  const res = await apiClient.get('/analytics/overview');
  return res.data;
};

/**
 * Fetch 12-week chronological applications volume trend.
 * @returns {Promise<Array<object>>} Chronological array of 12 weekly application count buckets
 */
export const getApplicationsTrendApi = async () => {
  const res = await apiClient.get('/analytics/applications-trend');
  return res.data;
};

/**
 * Fetch application distribution breakdown by pipeline stage.
 * @returns {Promise<object>} Stage breakdown data
 */
export const getAnalyticsByStageApi = async () => {
  const res = await apiClient.get('/analytics/by-stage');
  return res.data;
};

/**
 * Fetch application counts grouped by job opening.
 * @returns {Promise<Array<object>>} Job-level application breakdown array
 */
export const getAnalyticsByJobApi = async () => {
  const res = await apiClient.get('/analytics/by-job');
  return res.data;
};
