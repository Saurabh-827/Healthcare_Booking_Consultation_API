import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name is too short'),
    last_name: z.string().min(1, 'Last name cannot be empty').optional(),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

export const bookingSchema = z.object({
  body: z.object({
    doctor_id: z.string().uuid('Invalid Doctor ID format'),
    appointment_date: z.string().datetime('Invalid ISO datetime format')
  })
});
