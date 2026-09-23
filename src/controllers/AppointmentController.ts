import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AppointmentService } from '../services/AppointmentService';

export class AppointmentController {
  static async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idempotencyKey = req.headers['x-idempotency-key'] as string;
      const { doctor_id, slot_id } = req.body;
      
      const patient_id = (req as any).user.id; 

      const appointmentService = container.resolve(AppointmentService);
      
      // Updated call
      const result = await appointmentService.bookAppointment(
        patient_id, 
        doctor_id, 
        slot_id, 
        idempotencyKey
      );
      
      res.status(result.isCachedResponse ? 200 : 201).json({
        success: true,
        message: result.message,
        data: result.appointment
      });
    } catch (error) {
      next(error);
    }
  }
}