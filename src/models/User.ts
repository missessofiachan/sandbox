import { Schema, model } from 'mongoose';
import { Document } from '../types';

export interface IUserModel extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date; 
}

const userSchema = new Schema<IUserModel>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [4, 'Password must be at least 4 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default model<IUserModel>('User', userSchema);
