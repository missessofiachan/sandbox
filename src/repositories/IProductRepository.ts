import { IProduct } from '../types';

export interface IProductRepository {
  create(data: IProduct): Promise<IProduct>;
  findById(id: string | number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  update(
    id: string | number,
    data: Partial<IProduct>
  ): Promise<IProduct | null>;
  partialUpdate(
    id: string | number,
    data: Partial<IProduct>
  ): Promise<IProduct | null>;
  delete(id: string | number): Promise<IProduct | null>;
}

export default IProductRepository;
