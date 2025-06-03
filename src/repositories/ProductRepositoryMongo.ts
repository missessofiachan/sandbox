import Product from '../models/Product';
import IProductRepository from './IProductRepository';
import { IProduct } from '../types';

export class ProductRepositoryMongo implements IProductRepository {
  async create(data: IProduct) {
    return Product.create(data);
  }
  async findById(id: string) {
    return Product.findById(id);
  }
  async findAll() {
    return Product.find();
  }
  async update(id: string, data: Partial<IProduct>) {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  async partialUpdate(id: string, data: Partial<IProduct>) {
    return Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }
  async delete(id: string) {
    return Product.findByIdAndDelete(id);
  }
}
