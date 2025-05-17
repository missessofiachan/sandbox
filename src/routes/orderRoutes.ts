// Express route definitions for order CRUD operations
import express from 'express';
import * as orderController from '../controllers/orderController';
import authMiddleware from '../middleware/authMiddleware';
import validateRequest from '../middleware/validationMiddleware';
import { orderSchema, orderUpdateSchema } from '../validation/orderValidation';

const router = express.Router();

// Create a new order (authenticated user)
router.post('/', authMiddleware, validateRequest(orderSchema), orderController.createOrder);
// Get all orders (admin only)
router.get('/', authMiddleware, orderController.getAllOrders);
// Get a single order by ID (authenticated user)
router.get('/:id', authMiddleware, orderController.getOrderById);
// Update an order by ID (admin only)
router.put('/:id', authMiddleware, validateRequest(orderSchema), orderController.updateOrder);
// Partially update an order by ID (admin only)
router.patch('/:id', authMiddleware, validateRequest(orderUpdateSchema), orderController.partialUpdateOrder);
// Delete an order by ID (admin only)
router.delete('/:id', authMiddleware, orderController.deleteOrder);

export default router;
