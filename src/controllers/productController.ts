// Controller for Product resource
import { Request, Response } from 'express';
import IProductRepository from '../repositories/IProductRepository';
import { ProductRepositoryMongo } from '../repositories/ProductRepositoryMongo';
// import { ProductRepositoryMSSQL } from '../repositories/ProductRepositoryMSSQL';
// import { connectMSSQL } from '../connectMSSQL';
import { productSchema, productUpdateSchema } from '../validation/productValidation';

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

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const product = await productRepo.create(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productRepo.findAll();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const product = await productRepo.update(req.params.id, req.body);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const partialUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error } = productUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
    return;
  }
  try {
    const product = await productRepo.partialUpdate(req.params.id, req.body);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productRepo.delete(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
