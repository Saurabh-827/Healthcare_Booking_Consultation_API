import { injectable, inject } from 'tsyringe';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AppError } from '../utils/AppError';

@injectable()
export class AppointmentService {
  constructor(
    @inject(AppointmentRepository) private appointmentRepository: AppointmentRepository
  ) {}

  async bookAppointment(patientId: string, doctorId: string, date: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new AppError('Idempotency-Key is required in headers to prevent double booking', 400);
    }

    // 1. IDEMPOTENCY CHECK:
    const existingBooking = await this.appointmentRepository.findByIdempotencyKey(idempotencyKey);
    
    if (existingBooking) {
      return { 
        appointment: existingBooking, 
        isCachedResponse: true,
        message: 'Booking already processed (Idempotent response)' 
      };
    }

    // 2. New request -> booking
    const newAppointment = await this.appointmentRepository.create({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date: new Date(date),
      status: 'pending',
      idempotency_key: idempotencyKey
    });

    return { 
      appointment: newAppointment, 
      isCachedResponse: false,
      message: 'Appointment booked successfully' 
    };
  }
}