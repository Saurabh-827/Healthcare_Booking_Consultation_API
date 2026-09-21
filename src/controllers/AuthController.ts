import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const authService = container.resolve(AuthService);
      const { user, token } = await authService.login(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          }
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}