import { getRepository } from "typeorm";
import User from "../entities/user";
import IUserRepository from "./IUserRepository";

class UserRepositoryMSSQL implements IUserRepository {
  private repo = getRepository(User);

  async create(data: any) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
  async findById(id: string | number) {
    return this.repo.findOne({ where: { id } });
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
