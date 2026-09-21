import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/pay', authenticate, authorizeRole(['Patient']), PaymentController.pay);

export default router;