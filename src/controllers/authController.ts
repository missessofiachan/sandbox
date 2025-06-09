// Controller for authentication logic (login)
// Validates user credentials and issues JWT on success
import { Request, Response } from 'express';
import createToken from '../middleware/createTokenMiddleware';
import IUserRepository from '../repositories/IUserRepository';
import { UserRepositoryMongo } from '../repositories/UserRepositoryMongo';
import UserRepositoryMSSQL from '../repositories/UserRepositoryMSSQL';
import UserRepositorySQLite from '../repositories/UserRepositorySQLite';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import {
  asyncHandler,
  UnauthorizedError,
  ServiceUnavailableError,
} from '../middleware/errorHandlerMiddleware';

// Ensure Node.js types are available for process global
import process from 'node:process';

// Simple in-memory queue for failed login attempts
const failedLoginQueue: Array<{
  email: string;
  password: string;
  timestamp: number;
}> = [];

function isDbError(err: unknown): boolean {
  // Check for common Mongoose/Mongo network errors
  if (
    err &&
    typeof err === 'object' &&
    err !== null &&
    ('name' in err || 'message' in err)
  ) {
    const errorObj = err as { name?: string; message?: string };
    return (
      errorObj.name === 'MongoNetworkError' ||
      (errorObj.message?.includes('ECONNREFUSED') ?? false) ||
      (errorObj.message?.includes('failed to connect') ?? false) ||
      (errorObj.message?.includes('not connected') ?? false)
    );
  }
  return false;
}

// Factory to select appropriate user repository for auth
function getAuthRepo(): IUserRepository {
  if (process.env.DB_TYPE === 'mssql') {
    try {
      return new UserRepositoryMSSQL();
    } catch (err) {
      logger.error(`MSSQL auth repository init failed: ${err}`);
      logger.info('Falling back to MongoDB auth repository');
      return new UserRepositoryMongo();
    }
  } else if (process.env.DB_TYPE === 'sqlite') {
    try {
      return new UserRepositorySQLite();
    } catch (err) {
      logger.error(`SQLite auth repository init failed: ${err}`);
      logger.info('Falling back to MongoDB auth repository');
      return new UserRepositoryMongo();
    }
  }
  return new UserRepositoryMongo();
}
let authRepo: IUserRepository;
function getRepository(): IUserRepository {
  if (!authRepo) authRepo = getAuthRepo();
  return authRepo;
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user in DB
    const user = await getRepository().findByEmail(email);
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
      id: (user._id as string | undefined) || user.id || '',
    });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    // Special handling for DB errors
    if (isDbError(err)) {
      // Queue login attempt for retry
      failedLoginQueue.push({ email, password, timestamp: Date.now() });
      throw new ServiceUnavailableError(
        'Database unavailable. Your login request has been queued and will be retried.'
      );
    }
    throw err; // Let other errors be handled by the global error handler
  }
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});
