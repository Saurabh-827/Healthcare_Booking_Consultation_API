import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name is too short'),
    last_name: z.string().min(1, 'Last name cannot be empty').optional(),
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

export const bookingSchema = z.object({
  body: z.object({
    doctor_id: z.uuid('Invalid Doctor ID format'),
    slot_id: z.uuid('Invalid Slot ID format')
  })
});

export const createSlotSchema = z.object({
  body: z.object({
    doctor_id: z.uuid('Invalid Doctor ID format'),
    start_time: z.iso.datetime('Invalid ISO datetime format'),
    end_time: z.iso.datetime('Invalid ISO datetime format'),
  })
});