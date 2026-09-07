import { config } from '../config/env.js';

// Centralized error-handling middleware
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  const response = {
    status,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
