import { injectable } from 'tsyringe';
import { Appointment } from '../models/Appointment';

@injectable()
export class AppointmentRepository {
  async findByIdempotencyKey(key: string) {
    return await Appointment.findOne({ where: { idempotency_key: key } });
  }

  async create(data: any) {
    return await Appointment.create(data);
  }
}