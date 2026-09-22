import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/audit-logs', authenticate, authorizeRole(['Admin']), AdminController.getAuditLogs);

export default router;