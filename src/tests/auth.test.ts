import 'reflect-metadata'; 
import request from 'supertest';
import { container } from 'tsyringe';
import app from '../app'; 
import { UserRepository } from '../repositories/UserRepository';

jest.mock('express-rate-limit', () => jest.fn().mockImplementation(() => (req: any, res: any, next: any) => next()));
jest.mock('rate-limit-redis', () => jest.fn());
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(true),
  }))
}));
jest.mock('bullmq', () => ({
  Queue: jest.fn(),
  Worker: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  logger: { http: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() }
}));
jest.mock('../utils/metrics', () => ({
  metricsMiddleware: (req: any, res: any, next: any) => next(),
  metricsRegistry: { metrics: jest.fn(), contentType: 'text/plain' }
}));


describe('Auth Flow API Tests', () => {
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    container.registerInstance(UserRepository, mockUserRepository);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new patient', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '123-uuid',
        email: 'test@patient.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'Patient'
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@patient.com',
          password: 'securePassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Patient registered successfully');
      expect(response.body.data.email).toBe('test@patient.com');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@patient.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: '123-uuid', email: 'test@patient.com' });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@patient.com',
          password: 'securePassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});