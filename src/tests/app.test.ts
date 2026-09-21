import request from 'supertest';
import app from '../app';

describe('App Health Check', () => {
  it('should return 200 OK for /health endpoint', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'OK',
      message: 'Healthcare API is running'
    });
  });
});