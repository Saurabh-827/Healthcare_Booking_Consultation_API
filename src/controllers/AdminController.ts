import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuditLog } from '../models/AuditLog';
import { AdminService } from '../services/AdminService';

export class AdminController {

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.findAll({
        limit: 50,
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminService = container.resolve(AdminService);
      const stats = await adminService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: 'Platform analytics fetched successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
