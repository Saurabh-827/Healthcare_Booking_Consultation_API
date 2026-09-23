import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

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
      throw new AppError('User with this email already exists', 400);
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
    // 1. Check if email and password are provided
    if (!userData.email || !userData.password) {
      throw new AppError('Email and password are required', 400);
    }

    // 2. Email check 
    const user = await this.userRepository.findByEmail(userData.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Password check 
    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // 4. JWT Token generattion
    const payload = {
      id: user.id,
      role: user.role
    };
  
   const jwtSecret = process.env.JWT_SECRET;
   if (!jwtSecret) throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
   const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    return { user, token };
  }
}