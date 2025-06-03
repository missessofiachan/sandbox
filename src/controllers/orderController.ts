// Controller for Order resource
import { Request, Response } from 'express';
import IOrderRepository from '../repositories/IOrderRepository';
import { OrderRepositoryMongo } from '../repositories/OrderRepositoryMongo';
import OrderRepositoryMSSQL from '../repositories/OrderRepositoryMSSQL';
import { logger } from '../utils/logger';
import {
  asyncHandler,
  NotFoundError,
} from '../middleware/errorHandlerMiddleware';
import { invalidateCache } from '../middleware/cacheMiddleware';
import process from 'process';

// Dynamic repository selection based on DB_TYPE
function getOrderRepo(): IOrderRepository {
  if (process.env.DB_TYPE === 'mssql') {
    try {
      return new OrderRepositoryMSSQL();
    } catch (err) {
      logger.error(`MSSQL order repository initialization failed: ${err}`);
      logger.info('Falling back to MongoDB order repository');
      return new OrderRepositoryMongo();
    }
  } else {
    return new OrderRepositoryMongo();
  }
}

// Initialize repository lazily to ensure database connection is established first
let orderRepo: IOrderRepository;

function getRepository(): IOrderRepository {
  if (!orderRepo) {
    orderRepo = getOrderRepo();
  }
  return orderRepo;
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getRepository().create(req.body);

  // Invalidate orders list cache
  invalidateCache('orders');

  res.status(201).json(order);
});

export const getAllOrders = asyncHandler(
  async (_req: Request, res: Response) => {
    const orders = await getRepository().findAll();
    res.json(orders);
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await getRepository().findById(req.params.id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    res.json(order);
  }
);

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getRepository().update(req.params.id, req.body);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Invalidate both the list cache and the individual order cache
  invalidateCache('orders', req.params.id);

  res.json(order);
});

export const partialUpdateOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await getRepository().partialUpdate(req.params.id, req.body);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Invalidate both the list cache and the individual order cache
    invalidateCache('orders', req.params.id);

    res.json(order);
  }
);

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getRepository().delete(req.params.id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Invalidate both the list cache and the individual order cache
  invalidateCache('orders', req.params.id);

  res.json({ message: 'Order deleted successfully' });
});
