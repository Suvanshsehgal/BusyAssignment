import { apiClient } from './client.js';

/**
 * Sends login request to backend
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginApi = async ({ email, password }) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data; // { user, token }
};

/**
 * Retrieves current authenticated user profile
 * @returns {Promise<object>} User object with role
 */
export const getMeApi = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data.user;
};
