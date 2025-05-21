import winston, { format } from 'winston';
import path from 'path';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Get log level from environment or default to 'info'
const level = process.env.LOG_LEVEL || 'info';

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define format for console
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

// Define format for file logs (no colors, but with metadata)
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
  format.json(),
);

// Create the logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Define transports for console and files
const transports = [
  // Console
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
  }),
];

// Create and export the logger
const logger = winston.createLogger({
  level,
  levels,
  transports,
});

// HTTP request logger - use this for middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log when the response finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
    
    // Set log level based on status code
    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });
  
  next();
};

export { logger, requestLogger };
