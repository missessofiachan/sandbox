// Controller for Product resource
import { Request, Response, NextFunction } from 'express';
import IProductRepository from '../repositories/IProductRepository';
import { ProductRepositoryMongo } from '../repositories/ProductRepositoryMongo';
// import { ProductRepositoryMSSQL } from '../repositories/ProductRepositoryMSSQL';
// import { connectMSSQL } from '../connectMSSQL';
import { productSchema, productUpdateSchema } from '../validation/productValidation';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandlerMiddleware';
import { clearCache, invalidateCache } from '../middleware/cacheMiddleware';

// Initialize with MongoDB repository (SQL disabled)
const productRepo: IProductRepository = new ProductRepositoryMongo();
console.log('Using MongoDB for products');

// SQL connection disabled
// connectMSSQL().then(() => {
//   productRepo = new ProductRepositoryMSSQL();
//   console.log('Connected to MSSQL and using ProductRepositoryMSSQL');
// }).catch(err => {
//   console.error('MSSQL connection failed:', err);
// });

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productRepo.create(req.body);
  
  // Invalidate the products list cache
  invalidateCache('products');
  
  res.status(201).json(product);
});

export const getAllProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productRepo.findAll();
  res.json(products);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productRepo.findById(req.params.id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  res.json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productRepo.update(req.params.id, req.body);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  // Invalidate both the list cache and the individual product cache
  invalidateCache('products', req.params.id);
  
  res.json(product);
});

export const partialUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productRepo.partialUpdate(req.params.id, req.body);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  // Invalidate both the list cache and the individual product cache
  invalidateCache('products', req.params.id);
  
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productRepo.delete(req.params.id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  // Invalidate both the list cache and the individual product cache
  invalidateCache('products', req.params.id);
  
  res.json({ message: 'Product deleted successfully' });
});
