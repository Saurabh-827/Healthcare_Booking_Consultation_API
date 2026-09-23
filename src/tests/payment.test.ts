import request from 'supertest';
import app from '../app';
import { PaymentService } from '../services/PaymentService';

// ==========================================
// Global Mocks (Redis, BullMQ, Logger, Metrics)
// ==========================================
jest.mock('express-rate-limit', () => jest.fn().mockImplementation(() => (req: any, res: any, next: any) => next()));
jest.mock('rate-limit-redis', () => jest.fn());
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({ on: jest.fn(), connect: jest.fn().mockResolvedValue(true) }))
}));
jest.mock('bullmq', () => ({ Queue: jest.fn(), Worker: jest.fn() }));
jest.mock('../utils/logger', () => ({
  logger: { http: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() }
}));
jest.mock('../utils/metrics', () => ({
  metricsMiddleware: (req: any, res: any, next: any) => next(),
  metricsRegistry: { metrics: jest.fn(), contentType: 'text/plain' }
}));

// Auth Middlewares Mock
jest.mock('../middlewares/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'fake-patient-uuid', role: 'Patient' };
    next();
  },
  authorizeRole: () => (req: any, res: any, next: any) => next()
}));

describe('POST /api/v1/payments/pay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully and return 201', async () => {
    jest.spyOn(PaymentService.prototype, 'processPayment').mockResolvedValueOnce({
      payment: { id: 'pay-123', amount: 500, status: 'completed' } as any,
      isCachedResponse: false, 
      message: 'Payment successful'
    });

    const res = await request(app)
      .post('/api/v1/payments/pay')
      .set('x-idempotency-key', 'payment-key-1')
      .send({
        appointment_id: 'apt-123',
        amount: 500
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  it('should return error if validation/idempotency fails', async () => {
    const res = await request(app)
      .post('/api/v1/payments/pay')
      .send({
        appointment_id: 'apt-123',
        amount: 500
      });

    // Without idempotency header, we expect a 400 Bad Request
    expect(res.status).toBeGreaterThanOrEqual(400); 
  });
});