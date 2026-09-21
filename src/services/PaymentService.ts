import { injectable, inject } from 'tsyringe';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { AppError } from '../utils/AppError';
import { Appointment } from '../models/Appointment';

@injectable()
export class PaymentService {
  constructor(
    @inject(PaymentRepository) private paymentRepository: PaymentRepository
  ) {}

  async processPayment(appointmentId: string, amount: number, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new AppError('Idempotency-Key is required for payments to prevent double charging', 400);
    }

    // 1. IDEMPOTENCY CHECK
    const existingPayment = await this.paymentRepository.findByIdempotencyKey(idempotencyKey);
    if (existingPayment) {
      return {
        payment: existingPayment,
        isCachedResponse: true,
        message: 'Payment already processed (Idempotent response)'
      };
    }

    // 2. Validate Appointment
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // 3. Create Mock Payment
    const newPayment = await this.paymentRepository.create({
      appointment_id: appointmentId,
      amount: amount,
      status: 'completed',
      idempotency_key: idempotencyKey
    });

    // 4. Update Appointment Status -> Confirmed
    appointment.status = 'confirmed';
    await appointment.save();

    return {
      payment: newPayment,
      isCachedResponse: false,
      message: 'Payment successful'
    };
  }
}