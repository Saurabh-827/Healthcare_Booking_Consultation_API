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
  static async onboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user_id, speciality, experience_years } = req.body;
      const doctorService = container.resolve(DoctorService);

      const result = await doctorService.onboardDoctor(user_id, speciality, experience_years);

      res.status(201).json({
        success: true,
        message: 'Doctor profile created and user promoted to Doctor',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}