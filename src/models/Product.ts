// Mongoose model for Product
import { Schema, model } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IProduct>('Product', productSchema);
