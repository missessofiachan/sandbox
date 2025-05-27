// Controller for User resource (registration and CRUD)
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {
  asyncHandler,
  NotFoundError,
  BadRequestError,
} from '../middleware/errorHandlerMiddleware';
import IUserRepository from '../repositories/IUserRepository';
import { UserRepositoryMongo } from '../repositories/UserRepositoryMongo';
import UserRepositoryMSSQL from '../repositories/UserRepositoryMSSQL';
import { connectMSSQL } from '../connectMSSQL';

// Dynamic repository selection based on DB_TYPE
import { logger } from '../utils/logger';

function getUserRepo(): IUserRepository {
  if (process.env.DB_TYPE === 'mssql') {
    try {
      return new UserRepositoryMSSQL();
    } catch (err) {
      logger.error(`MSSQL user repository initialization failed: ${err}`);
      logger.info('Falling back to MongoDB user repository');
      return new UserRepositoryMongo();
    }
  } else {
    return new UserRepositoryMongo();
  }
}

// Initialize repository lazily to ensure database connection is established first
let userRepo: IUserRepository;

function getRepository(): IUserRepository {
  if (!userRepo) {
    userRepo = getUserRepo();
  }
  return userRepo;
}

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Check if user already exists
  const existing = await getRepository().findByEmail(req.body.email);
  if (existing) {
    throw new BadRequestError('User already exists').withDetails({
      field: 'email',
      value: req.body.email,
    });
  }
  // Hash password before saving
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await getRepository().create({
    ...req.body,
    password: hashedPassword,
  });
  res.status(201).json(user);
});

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await getRepository().findAll();
    res.json(users);
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await getRepository().findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  // Hash password if present
  let updateData = { ...req.body };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const user = await getRepository().update(req.params.id, updateData);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

export const partialUpdateUser = asyncHandler(
  async (req: Request, res: Response) => {
    let updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await getRepository().partialUpdate(req.params.id, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  }
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await getRepository().delete(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json({ message: 'User deleted successfully' });
});
