import Product from "../entities/Product";
import { Repository } from "typeorm";
import IProductRepository from "./IProductRepository";
import { dbManager } from "../database/dbManager";
import { logger } from "../utils/logger";

export class ProductRepositoryMSSQL implements IProductRepository {
  private repo: Repository<Product>;

  constructor() {
    const dataSource = dbManager.getMSSQLDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error('MSSQL data source not initialized in ProductRepositoryMSSQL');
      throw new Error('MSSQL data source not initialized');
    }
    this.repo = dataSource.getRepository(Product);
  }

  async create(data: any) {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }
  
  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
  
  async findAll() {
    return this.repo.find();
  }
  
  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
  
  async partialUpdate(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
  
  async delete(id: number) {
    const product = await this.findById(id);
    if (product) await this.repo.delete(id);
    return product;
  }
}
