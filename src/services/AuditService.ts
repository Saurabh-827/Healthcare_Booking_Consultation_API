import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export class AuditService {
  static async logAction(
    userId: string | null, 
    action: string, 
    entity: string, 
    entityId?: string, 
    details?: any
  ): Promise<void> {
    try {
      await AuditLog.create({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        details
      });
      logger.info(`[Audit] ${action} on ${entity} by User:${userId}`);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }
}