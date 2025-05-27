// Express middleware to check for valid JWT in Authorization header
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  // Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return void 0;
  }
  // Extract token from header
  const token = authHeader.split(' ')[1];
  try {
    // Use secret from env or fallback
    const secret = process.env.SECRET_KEY || 'defaultsecret';
    // Verify token
    const decoded = jwt.verify(token, secret) as JWTPayload;
    // Attach decoded user info to request
    req.user = decoded;
    next();
  } catch (err) {
    // Token invalid or expired
    res.status(401).json({ error: 'Invalid or expired token' });
    return void 0;
  }
};

// Role-based access control middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return void 0;
  }
  next();
};

export default authMiddleware;
