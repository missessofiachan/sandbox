// Controller for Order resource
import { Request, Response } from 'express';
import Order from '../models/Order';
import { IOrder } from '../types';
import { orderSchema, orderUpdateSchema } from '../validation/orderValidation';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandlerMiddleware';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders: IOrder[] = await Order.find().populate('products');
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('products');
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  res.json(order);
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  res.json(order);
});

export const partialUpdateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  res.json(order);
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  res.json({ message: 'Order deleted successfully' });
});
