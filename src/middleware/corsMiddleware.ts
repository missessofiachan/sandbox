import cors from 'cors';
import { RequestHandler, Request, Response } from 'express';

// Configure and export CORS middleware
const corsMiddleware = (): RequestHandler => {
  // Use the cors package for all routes
  return (req, res, next) => {
    cors({
      origin: process.env.CORS_ORIGIN || '*', // Use env var for allowed origins
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    })(req, res, (err) => {
      if (err) return next(err);
      // Handle pre-flight OPTIONS requests globally
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
      } else {
        next();
      }
    });
  };
};

// Type guard for error objects
function isErrorWithStatusAndMessage(
  err: unknown
): err is { status?: number; message?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('status' in err || 'message' in err)
  );
}

// Global error handler middleware
export function globalErrorHandler(err: unknown, _req: Request, res: Response) {
  let status = 500;
  let message = 'Internal Server Error';
  if (isErrorWithStatusAndMessage(err)) {
    if (typeof err.status === 'number') status = err.status;
    if (typeof err.message === 'string') message = err.message;
  }
  res.status(status).json({ error: message });
}

export default corsMiddleware;
