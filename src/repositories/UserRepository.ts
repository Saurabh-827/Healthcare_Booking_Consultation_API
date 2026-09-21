import { injectable } from 'tsyringe';
import { User } from '../models/User';

@injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    return await User.create(userData as any);
  }
}