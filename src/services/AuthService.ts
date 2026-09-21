import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';

@injectable()
export class AuthService {
  // Dependency Injection in action
  constructor(
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  async registerPatient(userData: any) {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Save to database via Repository
    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'Patient', // Explicitly setting role
    });

    return newUser;
  }
}