// Error handling middleware for consistent API error responses
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Define error types for better error handling
export class APIError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Add additional details to the error
   * @param details Additional error details
   * @returns this error instance for chaining
   */
  withDetails(details: unknown): APIError {
    this.details = details;
    return this;
  }
}

// Not Found Error
export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Bad Request Error
export class BadRequestError extends APIError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

// Unauthorized Error
export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

// Forbidden Error
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

// Service Unavailable Error
export class ServiceUnavailableError extends APIError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

// Conflict Error (for duplicate resources)
export class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// Too Many Requests Error
export class TooManyRequestsError extends APIError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Log error with additional request information for debugging
  logger.error(`Error: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    body: req.body,
  });

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails = null;
  let isOperational = false;
  // Handle API errors thrown by our application
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    errorDetails = err.details || null;
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.message;
    isOperational = true;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  }

  // Handle Mongoose/MongoDB duplicate key error
  else if (
    err.name === 'MongoServerError' &&
    typeof (err as unknown as { code?: number }).code === 'number' &&
    (err as unknown as { code: number }).code === 11000
  ) {
    statusCode = 409;
    message = 'Duplicate key error';
    isOperational = true;
    errorDetails = 'A record with the same unique key already exists';
  }

  // Handle MongoDB network errors
  else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database connection error';
    isOperational = true;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  // Handle JWT expiration
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Determine if we should include the stack trace
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Format the response
  const errorResponse: {
    status: string;
    message: string;
    details?: unknown;
    stack?: string;
  } = {
    status: 'error',
    message,
  };

  // Include additional details in development or for operational errors
  if (isDevelopment || isOperational) {
    if (errorDetails) {
      errorResponse.details = errorDetails;
    }

    if (isDevelopment && !isOperational) {
      errorResponse.stack = err.stack;
    }
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// Handle 404 errors for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new NotFoundError(`Not found - ${req.originalUrl}`);
  // Use errorHandler directly to avoid unused 'next'
  errorHandler(error, req, res, (() => {}) as NextFunction);
};

// Async handler to catch errors in async functions
export const asyncHandler = <
  T extends (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<unknown> | unknown,
>(
  fn: T
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
