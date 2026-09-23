import { injectable, inject } from 'tsyringe';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AppError } from '../utils/AppError';
import { Appointment } from '../models/Appointment';
import { AvailabilitySlot } from '../models/AvailabilitySlot';
import { sequelize } from '../config/database';

@injectable()
export class AppointmentService {
  constructor(
    @inject(AppointmentRepository) private appointmentRepository: AppointmentRepository
  ) {}

  async bookAppointment(patientId: string, doctorId: string, slotId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new AppError('Idempotency-Key is required in headers to prevent double booking', 400);
    }

    // 1. IDEMPOTENCY CHECK
    const existingBooking = await this.appointmentRepository.findByIdempotencyKey(idempotencyKey);
    if (existingBooking) {
      return { 
        appointment: existingBooking, 
        isCachedResponse: true,
        message: 'Booking already processed (Idempotent response)' 
      };
    }

    const transaction = await sequelize.transaction();

    try {
      // 2. FETCH AND LOCK SLOT (Pessimistic Locking)
      const slot = await AvailabilitySlot.findOne({
        where: { id: slotId, doctor_id: doctorId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!slot) {
        throw new AppError('Invalid slot or doctor combination', 404);
      }

      if (slot.status !== 'available') {
        throw new AppError('This slot is already booked or cancelled', 409);
      }

      // 3. CREATE APPOINTMENT
      const newAppointment = await Appointment.create({
        patient_id: patientId,
        doctor_id: doctorId,
        slot_id: slotId,
        appointment_date: slot.start_time,
        status: 'pending',
        idempotency_key: idempotencyKey
      }, { transaction });

      // 4. UPDATE SLOT STATUS
      slot.status = 'booked';
      await slot.save({ transaction });

      // 5. COMMIT TRANSACTION 
      await transaction.commit();

      return { 
        appointment: newAppointment, 
        isCachedResponse: false,
        message: 'Appointment booked successfully' 
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}