import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Check if running in Jest test environment
const isTest = process.env.NODE_ENV === 'test';

// 1. Redis Client Setup
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redisClient = createClient({
  socket: { host: REDIS_HOST, port: parseInt(REDIS_PORT, 10) }
});

if (!isTest) {
  redisClient.on('error', (err) => logger.error(`Redis Client Error: ${String(err).replace(/[\r\n]/g, ' ')}`));
  redisClient.on('connect', () => logger.info('Redis Client Connected successfully'));
  
  (async () => {
    try { await redisClient.connect(); } catch (e) {}
  })();
}


// 2. Global Rate Limiter (Public APIs)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: isTest ? undefined: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// 3. Strict Rate Limiter (Authentication / Booking APIs)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  store:isTest ? undefined : new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  message: {
    success: false,
    message: 'Too many attempts, please try again after an hour.'
  }
});