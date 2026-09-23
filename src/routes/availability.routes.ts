import { Router } from 'express';
import { AvailabilitySlotController } from '../controllers/AvailabilitySlotController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSlotSchema } from '../utils/validationSchemas';

const router = Router();

router.get('/', AvailabilitySlotController.getAvailable);
router.post('/create', authenticate, authorizeRole(['Doctor', 'Admin']), validate(createSlotSchema), AvailabilitySlotController.create);

export default router;