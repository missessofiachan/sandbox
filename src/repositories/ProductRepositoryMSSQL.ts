import Product from "../entities/Product";
import { getRepository } from "typeorm";
import IProductRepository from "./IProductRepository";

export class ProductRepositoryMSSQL implements IProductRepository {
  private repo = getRepository(Product);

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
