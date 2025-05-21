// Controller for Order resource
import { Request, Response } from 'express';
import IOrderRepository from '../repositories/IOrderRepository';
import { OrderRepositoryMongo } from '../repositories/OrderRepositoryMongo';
import OrderRepositoryMSSQL from '../repositories/OrderRepositoryMSSQL';
import { connectMSSQL } from '../connectMSSQL';
import { IOrder } from '../types';
import { orderSchema, orderUpdateSchema } from '../validation/orderValidation';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandlerMiddleware';
import { clearCache, invalidateCache } from '../middleware/cacheMiddleware';

// Dynamic repository selection based on DB_TYPE
let orderRepo: IOrderRepository;
if (process.env.DB_TYPE === 'mssql') {
  connectMSSQL().then(() => {
    orderRepo = new OrderRepositoryMSSQL();
    console.log('Connected to MSSQL and using OrderRepositoryMSSQL');
  }).catch(err => {
    console.error('MSSQL connection failed:', err);
    orderRepo = new OrderRepositoryMongo(); // fallback to Mongo
  });
} else {
  orderRepo = new OrderRepositoryMongo();
  console.log('Using MongoDB for orders');
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepo.create(req.body);
  
  // Invalidate orders list cache
  invalidateCache('orders');
  
  res.status(201).json(order);
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await orderRepo.findAll();
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepo.findById(req.params.id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  res.json(order);
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepo.update(req.params.id, req.body);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Invalidate both the list cache and the individual order cache
  invalidateCache('orders', req.params.id);
  
  res.json(order);
});

export const partialUpdateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepo.partialUpdate(req.params.id, req.body);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Invalidate both the list cache and the individual order cache
  invalidateCache('orders', req.params.id);
  
  res.json(order);
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepo.delete(req.params.id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Invalidate both the list cache and the individual order cache
  invalidateCache('orders', req.params.id);
  
  res.json({ message: 'Order deleted successfully' });
});
