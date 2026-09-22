import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';

const router = Router();

router.get('/', DoctorController.search);

export default router;