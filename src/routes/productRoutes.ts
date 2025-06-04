// Express route definitions for product CRUD operations
import express from 'express';
import * as productController from '../controllers/productController';
import authMiddleware, { requireAdmin } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validationMiddleware';
import {
  productSchema,
  productUpdateSchema,
} from '../validation/productValidation';
import cacheResponse from '../middleware/cacheMiddleware';

// Get cache duration from environment variables or use defaults
const PRODUCTS_CACHE_DURATION =
  Number(process.env.PRODUCTS_CACHE_DURATION) || 300; // 5 minutes
const PRODUCT_CACHE_DURATION = Number(process.env.CACHE_DURATION) || 60; // 1 minute

const router = express.Router();

// Create a new product (admin only)
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validateRequest(productSchema),
  productController.createProduct
);
// Get all products (public) - cached for 5 minutes
router.get(
  '/',
  cacheResponse(PRODUCTS_CACHE_DURATION),
  productController.getAllProducts
);
// Get a single product by ID (public) - cached for 1 minute
router.get(
  '/:id',
  cacheResponse(PRODUCT_CACHE_DURATION),
  productController.getProductById
);
// Update a product by ID (admin only)
router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateRequest(productSchema),
  productController.updateProduct
);
// Partially update a product by ID (admin only)
router.patch(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateRequest(productUpdateSchema),
  productController.partialUpdateProduct
);
// Delete a product by ID (admin only)
router.delete('/:id', authMiddleware, requireAdmin, productController.deleteProduct);

export default router;
