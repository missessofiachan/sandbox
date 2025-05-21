// Controller for User resource (registration and CRUD)
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandlerMiddleware';
import IUserRepository from '../repositories/IUserRepository';
import { UserRepositoryMongo } from '../repositories/UserRepositoryMongo';
import UserRepositoryMSSQL from '../repositories/UserRepositoryMSSQL';
import { connectMSSQL } from '../connectMSSQL';

// Dynamic repository selection based on DB_TYPE
let userRepo: IUserRepository;
if (process.env.DB_TYPE === 'mssql') {
  connectMSSQL().then(() => {
    userRepo = new UserRepositoryMSSQL();
    console.log('Connected to MSSQL and using UserRepositoryMSSQL');
  }).catch(err => {
    console.error('MSSQL connection failed:', err);
    userRepo = new UserRepositoryMongo(); // fallback to Mongo
  });
} else {
  userRepo = new UserRepositoryMongo();
  console.log('Using MongoDB for users');
}

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Check if user already exists
  const existing = await userRepo.findByEmail(req.body.email);
  if (existing) {
    throw new BadRequestError('User already exists').withDetails({
      field: 'email',
      value: req.body.email
    });
  }
  // Hash password before saving
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await userRepo.create({ ...req.body, password: hashedPassword });
  res.status(201).json(user);
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userRepo.findAll();
  res.json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepo.findById(req.params.id);
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
  const user = await userRepo.update(req.params.id, updateData);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

export const partialUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  let updateData = { ...req.body };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const user = await userRepo.partialUpdate(req.params.id, updateData);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepo.delete(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json({ message: 'User deleted successfully' });
});
