import Product from '../entities/Product';
import { Repository } from 'typeorm';
import IProductRepository from './IProductRepository';
import { dbManager } from '../database/dbManager';
import { logger } from '../utils/logger';
import { IProduct } from '../types';

// Helper to map TypeORM Product entity to IProduct interface
function mapProductEntityToIProduct(product: Product): IProduct {
  return {
    _id: product.id,
    name: product.name,
    price: Number(product.price),
    description: product.description,
    inStock: true, // MSSQL doesn't track this, default to true
    createdAt: product.createdAt,
  } as IProduct;
}

export class ProductRepositoryMSSQL implements IProductRepository {
  private repo: Repository<Product>;

  constructor() {
    const dataSource = dbManager.getMSSQLDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error(
        'MSSQL data source not initialized in ProductRepositoryMSSQL'
      );
      throw new Error('MSSQL data source not initialized');
    }
    this.repo = dataSource.getRepository(Product);
  }

  async create(data: IProduct): Promise<IProduct> {
    const product = this.repo.create({
      name: data.name,
      price: data.price,
      description: data.description,
      // category and inStock are not in IProduct, but can be mapped if needed
    });
    const saved = await this.repo.save(product);
    return mapProductEntityToIProduct(saved);
  }

  async findById(id: string | number): Promise<IProduct | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const found = await this.repo.findOne({ where: { id: numericId } });
    return found ? mapProductEntityToIProduct(found) : null;
  }

  async findAll(): Promise<IProduct[]> {
    const all = await this.repo.find();
    return all.map(mapProductEntityToIProduct);
  }

  async update(
    id: string | number,
    data: Partial<IProduct>
  ): Promise<IProduct | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }

  async partialUpdate(
    id: string | number,
    data: Partial<IProduct>
  ): Promise<IProduct | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }

  async delete(id: string | number): Promise<IProduct | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const product = await this.findById(numericId);
    if (product) await this.repo.delete(numericId);
    return product;
  }
}
