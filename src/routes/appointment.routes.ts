import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { bookingSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/book', authenticate, authorizeRole(['Patient']), validate(bookingSchema), AppointmentController.book);

export default router;