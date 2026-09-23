import { injectable, inject } from 'tsyringe';
import { AvailabilitySlotRepository } from '../repositories/AvailabilitySlotRepository';
import { AppError } from '../utils/AppError';

@injectable()
export class AvailabilitySlotService {
  constructor(
    @inject(AvailabilitySlotRepository) private slotRepository: AvailabilitySlotRepository
  ) {}

  async createSlot(doctorId: string, startTime: string, endTime: string) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('End time must be after start time', 400);
    }
    return await this.slotRepository.create({
      doctor_id: doctorId,
      start_time: startTime,
      end_time: endTime,
      status: 'available'
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    if (!doctorId || !date) {
      throw new AppError('Doctor ID and date (YYYY-MM-DD) are required', 400);
    }
    return await this.slotRepository.findAvailableSlots(doctorId, date);
  }
}