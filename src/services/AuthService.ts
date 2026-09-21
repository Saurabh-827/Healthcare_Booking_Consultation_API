import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

  async login(userData: any) {
    // 1. Email check
    const user = await this.userRepository.findByEmail(userData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Password check 
    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. JWT Token generattion
    const payload = {
      id: user.id,
      role: user.role
    };
  
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1d' }); // 1 day validity

    return { user, token };
  }
}