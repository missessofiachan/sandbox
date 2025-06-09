import ProductSQLite from '../../entities/sqlite/product';
import { Repository } from 'typeorm';
import IProductRepository from '../IProductRepository';
import { dbManager } from '../../database/dbManager';
import { logger } from '../../utils/logger';
import { IProduct } from '../../types';

// Helper to map TypeORM ProductSQLite entity to IProduct interface
function mapProductEntityToIProduct(product: ProductSQLite): IProduct {
  return {
    _id: product.id.toString(),
    name: product.name,
    price: Number(product.price),
    description: product.description,
    inStock: product.inStock,
    createdAt: product.createdAt,
  } as IProduct;
}

export class ProductRepositorySQLite implements IProductRepository {
  private repo: Repository<ProductSQLite>;

  constructor() {
    const dataSource = dbManager.getSQLiteDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error(
        'SQLite data source not initialized in ProductRepositorySQLite'
      );
      throw new Error('SQLite data source not initialized');
    }
    this.repo = dataSource.getRepository(ProductSQLite);
  }

  async create(data: IProduct): Promise<IProduct> {
    const product = this.repo.create({
      name: data.name,
      price: data.price,
      description: data.description,
      inStock: data.inStock !== undefined ? data.inStock : true,
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
