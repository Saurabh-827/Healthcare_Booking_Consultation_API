import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middlewares/error.middleware';
import doctorRoutes from './routes/doctor.routes';
import prescriptionRoutes from './routes/prescription.routes';
import { globalRateLimiter, authRateLimiter } from './middlewares/rateLimiter.middleware';

import morgan from 'morgan';
import { logger } from './utils/logger';
import { metricsRegistry, metricsMiddleware } from './utils/metrics';
import responseTime from 'response-time';
import adminRoutes from './routes/admin.routes';
import availabilityRoutes from './routes/availability.routes';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(responseTime());
app.use(metricsMiddleware);

// Morgan HTTP Logger (Winston connected)
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configured Morgan to use custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  }
);
app.use(morganMiddleware);

app.use(globalRateLimiter);

// Routes
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/admin', adminRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Healthcare API is running' });
});
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;