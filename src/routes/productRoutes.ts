// Express route definitions for product CRUD operations
import express from 'express';
import * as productController from '../controllers/productController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Create a new product (admin only)
router.post('/', authMiddleware, productController.createProduct);
// Get all products (public)
router.get('/', productController.getAllProducts);
// Get a single product by ID (public)
router.get('/:id', productController.getProductById);
// Update a product by ID (admin only)
router.put('/:id', authMiddleware, productController.updateProduct);
// Partially update a product by ID (admin only)
router.patch('/:id', authMiddleware, productController.partialUpdateProduct);
// Delete a product by ID (admin only)
router.delete('/:id', authMiddleware, productController.deleteProduct);

export default router;
