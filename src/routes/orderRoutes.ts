// Express route definitions for order CRUD operations
import express from 'express';
import * as orderController from '../controllers/orderController';
import authMiddleware, { requireAdmin } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validationMiddleware';
import { orderSchema, orderUpdateSchema } from '../validation/orderValidation';
import cacheResponse from '../middleware/cacheMiddleware';

// Get cache duration from environment variables or use defaults
const ORDERS_CACHE_DURATION = Number(process.env.ORDERS_CACHE_DURATION) || 120; // 2 minutes
const ORDER_CACHE_DURATION = Number(process.env.CACHE_DURATION) || 60; // 1 minute

const router = express.Router();

// Create a new order (authenticated user)
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validateRequest(orderSchema),
  orderController.createOrder
);

// Get all orders (admin only) - cached for 2 minutes
router.get(
  '/',
  authMiddleware,
  requireAdmin,
  cacheResponse(ORDERS_CACHE_DURATION),
  orderController.getAllOrders
);

// Get a single order by ID (authenticated user) - cached for 1 minute
router.get(
  '/:id',
  authMiddleware,
  requireAdmin,
  cacheResponse(ORDER_CACHE_DURATION),
  orderController.getOrderById
);

// Update an order by ID (admin only)
router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateRequest(orderUpdateSchema),
  orderController.updateOrder
);

// Partially update an order by ID (admin only)
router.patch(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateRequest(orderUpdateSchema),
  orderController.partialUpdateOrder
);

// Delete an order by ID (admin only)
router.delete('/:id', authMiddleware, requireAdmin, orderController.deleteOrder);

export default router;
