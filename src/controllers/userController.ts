// Controller for User resource (registration and CRUD)
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { IUserModel } from '../models/User';
import { userLoginSchema } from '../validation/userValidation';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = userLoginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    // Check if user already exists
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = userLoginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    // Hash password if present
    let updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const partialUpdateUser = async (req: Request, res: Response): Promise<void> => {
  // Validate request body (allow partial fields)
  const partialSchema = userLoginSchema.fork(['email', 'password', 'role'], s => s.optional()).min(1);
  const { error } = partialSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    let updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
