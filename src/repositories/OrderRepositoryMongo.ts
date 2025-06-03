import Order from '../models/Order';
import IOrderRepository from './IOrderRepository';
import { IOrder } from '../types';

export class OrderRepositoryMongo implements IOrderRepository {
  async create(data: IOrder) {
    return Order.create(data);
  }
  async findById(id: string) {
    return Order.findById(id);
  }
  async findAll() {
    return Order.find();
  }
  async update(id: string, data: Partial<IOrder>) {
    return Order.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  async partialUpdate(id: string, data: Partial<IOrder>) {
    return Order.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }
  async delete(id: string) {
    return Order.findByIdAndDelete(id);
  }
}
