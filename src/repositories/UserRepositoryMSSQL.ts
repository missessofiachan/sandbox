import { Repository } from "typeorm";
import User from "../entities/user";
import IUserRepository from "./IUserRepository";
import { dbManager } from "../database/dbManager";
import { logger } from "../utils/logger";

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

  async create(data: any) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
  async findById(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.repo.findOne({ where: { id: numericId } });
  }
  async findAll() {
    return this.repo.find();
  }
  async update(id: string | number, data: any) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
  async partialUpdate(id: string | number, data: any) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
  async delete(id: string | number) {
    const user = await this.findById(id);
    if (user) await this.repo.delete(id);
    return user;
  }
  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
export default UserRepositoryMSSQL;
