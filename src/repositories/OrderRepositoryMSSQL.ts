import { Repository } from 'typeorm';
import Order from '../entities/orders';
import IOrderRepository from './IOrderRepository';
import { dbManager } from '../database/dbManager';
import { logger } from '../utils/logger';

class OrderRepositoryMSSQL implements IOrderRepository {
  private repo: Repository<Order>;

  constructor() {
    const dataSource = dbManager.getMSSQLDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error('MSSQL data source not initialized in OrderRepositoryMSSQL');
      throw new Error('MSSQL data source not initialized');
    }
    this.repo = dataSource.getRepository(Order);
  }

  async create(data: any) {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }
  async findById(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.repo.findOne({ where: { id: numericId } });
  }
  async findAll() {
    return this.repo.find();
  }
  async update(id: string | number, data: any) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }
  async partialUpdate(id: string | number, data: any) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }
  async delete(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const order = await this.findById(numericId);
    if (order) await this.repo.delete(numericId);
    return order;
  }
}
export default OrderRepositoryMSSQL;
