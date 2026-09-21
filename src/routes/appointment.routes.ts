import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/book', authenticate, authorizeRole(['Patient']), AppointmentController.book);

export default router;