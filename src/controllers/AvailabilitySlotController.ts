import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AvailabilitySlotService } from '../services/AvailabilitySlotService';

export class AvailabilitySlotController {
  
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctor_id, start_time, end_time } = req.body;
      const slotService = container.resolve(AvailabilitySlotService);
      
      const slot = await slotService.createSlot(doctor_id, start_time, end_time);
      
      res.status(201).json({ success: true, message: 'Slot created successfully', data: slot });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.query.doctor_id as string;
      const date = req.query.date as string;
      const slotService = container.resolve(AvailabilitySlotService);
      
      const slots = await slotService.getAvailableSlots(doctorId, date);
      
      res.status(200).json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  }
}