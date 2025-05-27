import User from '../models/User';
import IUserRepository from './IUserRepository';

export class UserRepositoryMongo implements IUserRepository {
  async create(data: any) {
    return User.create(data);
  }
  async findById(id: string) {
    return User.findById(id);
  }
  async findAll() {
    return User.find();
  }
  async update(id: string, data: any) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  async partialUpdate(id: string, data: any) {
    return User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }
  async delete(id: string) {
    return User.findByIdAndDelete(id);
  }
  async findByEmail(email: string) {
    return User.findOne({ email });
  }
}
