import { Repository } from 'typeorm';
import UserSQLite from '../entities/sqlite/user';
import IUserRepository from './IUserRepository';
import { dbManager } from '../database/dbManager';
import { logger } from '../utils/logger';
import { IUser } from '../types';

// Helper to map TypeORM UserSQLite entity to IUser interface
function mapUserEntityToIUser(user: UserSQLite): IUser {
  return {
    _id: user.id.toString(),
    email: user.email,
    password: user.password,
    role: user.role,
    createdAt: user.createdAt,
  } as unknown as IUser;
}

class UserRepositorySQLite implements IUserRepository {
  private repo: Repository<UserSQLite>;

  constructor() {
    const dataSource = dbManager.getSQLiteDataSource();
    if (!dataSource || !dataSource.isInitialized) {
      logger.error('SQLite data source not initialized in UserRepositorySQLite');
      throw new Error('SQLite data source not initialized');
    }
    this.repo = dataSource.getRepository(UserSQLite);
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

export default UserRepositorySQLite;
