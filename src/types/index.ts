import { Document } from 'mongoose';
export { Document };

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  inStock?: boolean;
  createdAt: Date;
}

export interface IOrder extends Document {
  products: string[]; // Array of Product IDs
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
