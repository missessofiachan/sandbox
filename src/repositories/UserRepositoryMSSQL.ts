import { Repository } from 'typeorm';
import User from '../entities/user';
import IUserRepository from './IUserRepository';
import { dbManager } from '../database/dbManager';
import { logger } from '../utils/logger';
import { IUser } from '../types';

// Helper to map TypeORM User entity to IUser interface
function mapUserEntityToIUser(user: User): IUser {
  return {
    _id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    createdAt: user.createdAt,
  } as unknown as IUser;
}

class UserRepositoryMSSQL implements IUserRepository {
  private repo: Repository<User>;

  constructor() {
    const dataSource = dbManager.getMSSQLDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error('MSSQL data source not initialized in UserRepositoryMSSQL');
      throw new Error('MSSQL data source not initialized');
    }
    this.repo = dataSource.getRepository(User);
  }

  async create(data: IUser): Promise<IUser> {
    const user = this.repo.create({
      email: data.email,
      password: data.password,
      role: data.role,
    });
    const saved = await this.repo.save(user);
    return mapUserEntityToIUser(saved);
  }
  async findById(id: string | number): Promise<IUser | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const found = await this.repo.findOne({ where: { id: numericId } });
    return found ? mapUserEntityToIUser(found) : null;
  }
  async findAll(): Promise<IUser[]> {
    const all = await this.repo.find();
    return all.map(mapUserEntityToIUser);
  }
  async update(
    id: string | number,
    data: Partial<IUser>
  ): Promise<IUser | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }
  async partialUpdate(
    id: string | number,
    data: Partial<IUser>
  ): Promise<IUser | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.repo.update(numericId, data);
    return this.findById(numericId);
  }
  async delete(id: string | number): Promise<IUser | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const user = await this.findById(numericId);
    if (user) await this.repo.delete(numericId);
    return user;
  }
  async findByEmail(email: string): Promise<IUser | null> {
    const found = await this.repo.findOne({ where: { email } });
    return found ? mapUserEntityToIUser(found) : null;
  }
}
export default UserRepositoryMSSQL;
