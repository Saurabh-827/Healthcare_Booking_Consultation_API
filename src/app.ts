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

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(globalRateLimiter);

// Routes
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Healthcare API is running' });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;