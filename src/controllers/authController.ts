// Controller for authentication logic (login)
// Validates user credentials and issues JWT on success
import { Request, Response } from 'express';
import { userLoginSchema } from '../validation/userValidation';
import createToken from '../middleware/createTokenMiddleware';
import User from '../models/User';
import bcrypt from 'bcrypt';

// Simple in-memory queue for failed login attempts 
const failedLoginQueue: Array<{ email: string; password: string; timestamp: number }> = [];

function isDbError(err: any): boolean {
  // Check for common Mongoose/Mongo network errors
  return (
    err &&
    (err.name === 'MongoNetworkError' ||
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('failed to connect') ||
      err.message?.includes('not connected'))
  );
}

export const login = async (req: Request, res: Response): Promise<void> => {
  // No need to validate here since it's handled by the middleware
  const { email, password } = req.body;
  try {
    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    // Issue JWT
    const token = createToken({
      email: user.email,
      username: user.email,
      role: user.role,
      id: (user._id as string | undefined) || user.id || ''
    });
    res.json({ message: 'Login successful', token });
  } catch (err: any) {
    if (isDbError(err)) {
      // Queue login attempt for retry 
      failedLoginQueue.push({ email, password, timestamp: Date.now() });
      res.status(503).json({ error: 'Database unavailable. Your login request has been queued and will be retried.' });
    } else {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.json({ message: 'Logout successful' });
};
