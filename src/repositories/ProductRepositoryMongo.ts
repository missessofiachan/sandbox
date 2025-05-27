import Product from '../models/Product';
import IProductRepository from './IProductRepository';

export class ProductRepositoryMongo implements IProductRepository {
  async create(data: any) {
    return Product.create(data);
  }
  async findById(id: string) {
    return Product.findById(id);
  }
  async findAll() {
    return Product.find();
  }
  async update(id: string, data: any) {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  async partialUpdate(id: string, data: any) {
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
