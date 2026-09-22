import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { DoctorService } from '../services/DoctorService';

export class DoctorController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorService = container.resolve(DoctorService);
      const doctors = await doctorService.searchDoctors(req.query);

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      next(error);
    }
  }
}