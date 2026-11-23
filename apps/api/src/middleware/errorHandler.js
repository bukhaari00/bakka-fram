import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : (statusCode === 500 ? 'Internal server error' : err.message);

  if (statusCode === 500) {
    console.error(`[UnhandledError] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[ClientError ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  return errorResponse(res, message, statusCode, err.details || null);
}

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isPublic = true;
    this.details = details;
  }
}
