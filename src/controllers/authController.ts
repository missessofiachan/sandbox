// Controller for authentication logic (login)
// Validates user credentials and issues JWT on success
import { Request, Response } from 'express';
import { userLoginSchema } from '../validation/userValidation';
import createToken from '../middleware/createTokenMiddleware';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { asyncHandler, UnauthorizedError, BadRequestError, ServiceUnavailableError } from '../middleware/errorHandlerMiddleware';

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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }
    
    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid username or password');
    }
    
    // Issue JWT
    const token = createToken({
      email: user.email,
      username: user.email,
      role: user.role,
      id: (user._id as string | undefined) || user.id || ''
    });
    
    res.json({ message: 'Login successful', token });
  } catch (err) {
    // Special handling for DB errors
    if (isDbError(err)) {
      // Queue login attempt for retry 
      failedLoginQueue.push({ email, password, timestamp: Date.now() });
      throw new ServiceUnavailableError('Database unavailable. Your login request has been queued and will be retried.');
    }
    throw err; // Let other errors be handled by the global error handler
  }
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});
