import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeRole(['Admin']));

router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/analytics', AdminController.getAnalytics);

export default router;