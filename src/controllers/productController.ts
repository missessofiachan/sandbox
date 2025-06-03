// Controller for Product resource
import { Request, Response } from 'express';
import IProductRepository from '../repositories/IProductRepository';
import { ProductRepositoryMongo } from '../repositories/ProductRepositoryMongo';
import { ProductRepositoryMSSQL } from '../repositories/ProductRepositoryMSSQL';
import { invalidateCache } from '../middleware/cacheMiddleware';
import {
  asyncHandler,
  NotFoundError,
} from '../middleware/errorHandlerMiddleware';
import { logger } from '../utils/logger';
import process from 'process'; // Import for ESM/TypeScript global

// Dynamic repository selection based on DB_TYPE
function getProductRepo(): IProductRepository {
  if (process.env.DB_TYPE === 'mssql') {
    try {
      return new ProductRepositoryMSSQL();
    } catch (err) {
      logger.error(`MSSQL product repository initialization failed: ${err}`);
      logger.info('Falling back to MongoDB product repository');
      return new ProductRepositoryMongo();
    }
  } else {
    return new ProductRepositoryMongo();
  }
}

// Initialize repository lazily to ensure database connection is established first
let productRepo: IProductRepository;

function getRepository(): IProductRepository {
  if (!productRepo) {
    productRepo = getProductRepo();
  }
  return productRepo;
}

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getRepository().create(req.body);

    // Invalidate the products list cache
    invalidateCache('products');

    res.status(201).json(product);
  }
);

export const getAllProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await getRepository().findAll();
    res.json(products);
  }
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getRepository().findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getRepository().update(req.params.id, req.body);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Invalidate both the list cache and the individual product cache
    invalidateCache('products', req.params.id);

    res.json(product);
  }
);

export const partialUpdateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getRepository().partialUpdate(
      req.params.id,
      req.body
    );
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Invalidate both the list cache and the individual product cache
    invalidateCache('products', req.params.id);

    res.json(product);
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getRepository().delete(req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Invalidate both the list cache and the individual product cache
    invalidateCache('products', req.params.id);

    res.json({ message: 'Product deleted successfully' });
  }
);
