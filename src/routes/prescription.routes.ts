import { Router } from 'express';
import { PrescriptionController } from '../controllers/PrescriptionController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Doctor']), PrescriptionController.create);

export default router;