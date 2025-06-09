import { Repository } from 'typeorm';
import OrderSQLite from '../entities/sqlite/order';
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

// Helper to map TypeORM OrderSQLite entity to IOrder interface
function mapOrderEntityToIOrder(order: OrderSQLite): IOrder {
  let products: string[];
  try {
    products = JSON.parse(order.products);
  } catch {
    products = [];
  }

  return {
    _id: order.id.toString(),
    products: products,
    total: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
  } as IOrder;
}

class OrderRepositorySQLite implements IOrderRepository {
  private repo: Repository<OrderSQLite>;

  constructor() {
    const dataSource = dbManager.getSQLiteDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error('SQLite data source not initialized in OrderRepositorySQLite');
      throw new Error('SQLite data source not initialized');
    }
    this.repo = dataSource.getRepository(OrderSQLite);
  }

  async create(data: IOrder): Promise<IOrder> {
    const order = this.repo.create({
      products: JSON.stringify(data.products),
      totalAmount: data.total,
      status: data.status || 'pending',
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
      products: data.products ? JSON.stringify(data.products) : undefined,
      totalAmount: data.total,
      status: data.status,
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

export default OrderRepositorySQLite;
