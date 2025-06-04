// Mongoose model for Order
import { Schema, model, Types } from 'mongoose';
import { IOrder } from '../types';

const orderSchema = new Schema<IOrder>({
  products: [{ type: Types.ObjectId, ref: 'Product', required: true }],
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'shipped', 'delivered'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<IOrder>('Order', orderSchema);
