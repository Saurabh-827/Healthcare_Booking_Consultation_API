import request from 'supertest';
import app from '../app'; 
import { AppointmentService } from '../services/AppointmentService';

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

describe('POST /api/v1/appointments/book', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails (missing slot_id)', async () => {
    const res = await request(app)
      .post('/api/v1/appointments/book')
      .set('x-idempotency-key', 'test-key-123')
      .send({
        doctor_id: 'd1f38354-e3af-49c6-9391-25f9002c4a39'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully book an appointment and return 201', async () => {
    jest.spyOn(AppointmentService.prototype, 'bookAppointment').mockResolvedValueOnce({
      appointment: { id: 'new-apt-123', status: 'pending' } as any,
      isCachedResponse: false,
      message: 'Appointment booked successfully'
    });

    const res = await request(app)
      .post('/api/v1/appointments/book')
      .set('x-idempotency-key', 'test-key-456')
      .send({
        doctor_id: 'd1f38354-e3af-49c6-9391-25f9002c4a39',
        slot_id: 'c6812a3f-73ab-4e89-9963-85040543dcd3'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 200 for idempotent request (duplicate key)', async () => {
    jest.spyOn(AppointmentService.prototype, 'bookAppointment').mockResolvedValueOnce({
      appointment: { id: 'old-apt-123', status: 'pending' } as any,
      isCachedResponse: true,
      message: 'Booking already processed (Idempotent response)'
    });

    const res = await request(app)
      .post('/api/v1/appointments/book')
      .set('x-idempotency-key', 'duplicate-key-789')
      .send({
        doctor_id: 'd1f38354-e3af-49c6-9391-25f9002c4a39',
        slot_id: 'c6812a3f-73ab-4e89-9963-85040543dcd3'
      });

    expect(res.status).toBe(200); 
    expect(res.body.success).toBe(true);
  });
});