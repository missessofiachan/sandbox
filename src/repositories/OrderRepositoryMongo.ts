import Order from '../models/Order';
import IOrderRepository from './IOrderRepository';

export class OrderRepositoryMongo implements IOrderRepository {
  async create(data: any) {
    return Order.create(data);
  }
  async findById(id: string) {
    return Order.findById(id);
  }
  async findAll() {
    return Order.find();
  }
  async update(id: string, data: any) {
    return Order.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  async partialUpdate(id: string, data: any) {
    return Order.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }
  async delete(id: string) {
    return Order.findByIdAndDelete(id);
  }
}
