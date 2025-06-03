import { IUser } from '../types';

export interface IUserRepository {
  create(data: IUser): Promise<IUser>;
  findById(id: string | number): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: string | number, data: Partial<IUser>): Promise<IUser | null>;
  partialUpdate(
    id: string | number,
    data: Partial<IUser>
  ): Promise<IUser | null>;
  delete(id: string | number): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
}

export default IUserRepository;
