import { injectable } from 'tsyringe';
import { AvailabilitySlot } from '../models/AvailabilitySlot';
import { Op } from 'sequelize';

@injectable()
export class AvailabilitySlotRepository {
  async create(data: any) {
    return await AvailabilitySlot.create(data);
  }

  async findAvailableSlots(doctorId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return await AvailabilitySlot.findAll({
      where: {
        doctor_id: doctorId,
        status: 'available',
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [['start_time', 'ASC']]
    });
  }
}