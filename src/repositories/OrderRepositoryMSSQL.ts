import { Repository } from 'typeorm';
import Order from '../entities/orders';
import IOrderRepository from './IOrderRepository';
import { dbManager } from '../database/dbManager';
import { logger } from '../utils/logger';
import { IOrder } from '../types';

// Helper type guard for customerName
function hasCustomerName(obj: unknown): obj is { customerName: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'customerName' in obj &&
    typeof (obj as { customerName?: unknown }).customerName === 'string'
  );
}

// Helper to map TypeORM Order entity to IOrder interface
function mapOrderEntityToIOrder(order: Order): IOrder {
  return {
    _id: order.id,
    products: order.products,
    total: Number(order.totalAmount),
    status: 'completed', // or map from another field if available
    createdAt: order.createdAt,
  } as IOrder;
}

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

  async create(data: IOrder): Promise<IOrder> {
    const order = this.repo.create({
      products: data.products,
      totalAmount: data.total,
      customerName: hasCustomerName(data) ? data.customerName : '',
    });
    const saved = await this.repo.save(order);
    return mapOrderEntityToIOrder(saved);
  }
  async findById(id: string | number): Promise<IOrder | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const found = await this.repo.findOne({ where: { id: numericId } });
    return found ? mapOrderEntityToIOrder(found) : null;
  }
  async findAll(): Promise<IOrder[]> {
    const all = await this.repo.find();
    return all.map(mapOrderEntityToIOrder);
  }
  async update(
    id: string | number,
    data: Partial<IOrder>
  ): Promise<IOrder | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, {
      products: data.products,
      totalAmount: data.total,
      customerName: hasCustomerName(data) ? data.customerName : undefined,
    });
    return this.findById(numericId);
  }
  async partialUpdate(
    id: string | number,
    data: Partial<IOrder>
  ): Promise<IOrder | null> {
    return this.update(id, data);
  }
  async delete(id: string | number): Promise<IOrder | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const order = await this.findById(numericId);
    if (order) await this.repo.delete(numericId);
    return order;
  }
}
export default OrderRepositoryMSSQL;
