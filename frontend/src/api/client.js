import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://busyassignment.onrender.com/api/v1';
export const TOKEN_STORAGE_KEY = 'pipelinehq_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unpack responses and handle 401 session expirations
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If receiving 401 from a protected endpoint (excluding login attempts), clear stored session
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
