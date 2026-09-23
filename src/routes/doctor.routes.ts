import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', DoctorController.search);

router.post('/onboard', authenticate, authorizeRole(['Admin']), DoctorController.onboard);

export default router;