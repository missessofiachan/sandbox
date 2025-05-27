// Middleware to verify JWT token in the Authorization header using jsonwebtoken
// If valid, attaches decoded user info to req.user, else returns 401 error
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

// Middleware to verify JWT token
const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  // Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
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
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default verifyToken;
