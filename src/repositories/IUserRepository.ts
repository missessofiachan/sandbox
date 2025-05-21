export interface IUserRepository {
  create(data: any): Promise<any>;
  findById(id: string | number): Promise<any>;
  findAll(): Promise<any[]>;
  update(id: string | number, data: any): Promise<any>;
  partialUpdate(id: string | number, data: any): Promise<any>;
  delete(id: string | number): Promise<any>;
  findByEmail(email: string): Promise<any>;
}
export default IUserRepository;
