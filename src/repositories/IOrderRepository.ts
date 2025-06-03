import { IOrder } from '../types';

export default interface IOrderRepository {
  create(data: IOrder): Promise<IOrder>;
  findById(id: string | number): Promise<IOrder | null>;
  findAll(): Promise<IOrder[]>;
  update(id: string | number, data: Partial<IOrder>): Promise<IOrder | null>;
  partialUpdate(
    id: string | number,
    data: Partial<IOrder>
  ): Promise<IOrder | null>;
  delete(id: string | number): Promise<IOrder | null>;
}
