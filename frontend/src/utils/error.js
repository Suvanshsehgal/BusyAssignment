/**
 * Extracts a user-friendly error message from an API or network error object.
 *
 * @param {any} error
 * @param {string} [fallbackMessage]
 * @returns {string}
 */
export const getErrorMessage = (
  error,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
) => {
  if (!error) return fallbackMessage;

  // Backend AppError response envelope { status: 'fail'|'error', message: '...' }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Network connectivity failure (no HTTP response received)
  if (error.request && !error.response) {
    return 'Unable to reach the server. Please check your network connection.';
  }

  // Specific HTTP status codes if message not provided in body
  if (error.response?.status === 401) {
    return 'Invalid email or password. Please try again.';
  }

  if (error.response?.status === 403) {
    return 'Access denied: You do not have permission to access this resource.';
  }

  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
};
