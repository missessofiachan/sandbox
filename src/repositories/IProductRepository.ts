export interface IProductRepository {
  create(data: any): Promise<any>;
  findById(id: string | number): Promise<any>;
  findAll(): Promise<any[]>;
  update(id: string | number, data: any): Promise<any>;
  partialUpdate(id: string | number, data: any): Promise<any>;
  delete(id: string | number): Promise<any>;
}
export default IProductRepository;
