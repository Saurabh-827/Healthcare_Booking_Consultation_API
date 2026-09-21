import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const authService = container.resolve(AuthService);
      
      const user = await authService.registerPatient(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
}