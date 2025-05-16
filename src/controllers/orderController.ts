// Controller for Order resource
import { Request, Response } from 'express';
import Order from '../models/Order';
import { IOrder } from '../types';
import { orderSchema, orderUpdateSchema } from '../validation/orderValidation';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = orderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders: IOrder[] = await Order.find().populate('products');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('products');
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = orderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const partialUpdateOrder = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = orderUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
