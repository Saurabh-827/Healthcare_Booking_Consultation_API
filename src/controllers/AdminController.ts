import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export class AdminController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Latest 50 actions
      const logs = await AuditLog.findAll({
        limit: 50,
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}