import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { PrescriptionService } from '../services/PrescriptionService';
import { AppError } from '../utils/AppError';

export class PrescriptionController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = (req as any).user?.id || (req as any).userId || (req as any).user?.userId;
      if (!doctorId) {
        return next(new AppError('Doctor ID could not be extracted from Token', 401));}
      const { appointment_id, symptoms, diagnosis, medicines, notes } = req.body;

      const prescriptionService = container.resolve(PrescriptionService);
      const prescription = await prescriptionService.writePrescription(
        doctorId,
        appointment_id,
        { symptoms, diagnosis, medicines, notes }
      );

      res.status(201).json({
        success: true,
        message: 'Prescription generated successfully',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }
}