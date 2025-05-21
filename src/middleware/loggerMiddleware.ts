import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

// Error handling middleware for logging errors
export const errorLoggerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Create structured log with important metadata
  const logMessage = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method,
    statusCode,
    requestId: req.headers['x-request-id'] || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  // Log based on severity
  if (statusCode >= 500) {
    logger.error(`Server Error: ${err.message}`, logMessage);
  } else if (statusCode >= 400) {
    logger.warn(`Client Error: ${err.message}`, logMessage);
  } else {
    logger.info(`Other Error: ${err.message}`, logMessage);
  }
  
  next(err);
};
