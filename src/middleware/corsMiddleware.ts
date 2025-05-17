import cors from 'cors';
import { RequestHandler, Request, Response, NextFunction } from 'express';

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

// Global error handler middleware
export function globalErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
}

export default corsMiddleware;
