import { AuditLog } from "../models/AuditLog";
import { logger } from "../utils/logger";

export class AuditService {
  static async logAction(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    details?: any,
  ): Promise<void> {
    try {
      await AuditLog.create({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        details,
      });
      logger.info(
        `[Audit] ${String(action).replace(/[\r\n]/g, " ")} on ${String(entity).replace(/[\r\n]/g, " ")} by User:${String(userId).replace(/[\r\n]/g, " ")}`,
      );
    } catch (error) {
      logger.error("Failed to create audit log:", error);
    }
  }
}
