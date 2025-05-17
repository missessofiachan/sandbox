// Controller for User resource (registration and CRUD)
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { IUserModel } from '../models/User';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandlerMiddleware';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Check if user already exists
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new BadRequestError('User already exists').withDetails({
      field: 'email',
      value: req.body.email
    });
  }
  // Hash password before saving
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ ...req.body, password: hashedPassword });
  res.status(201).json(user);
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
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
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json({ message: 'User deleted successfully' });
});
