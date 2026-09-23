import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/profile', authenticate, authorizeRole(['Patient', 'Doctor', 'Admin']), AuthController.profile);

export default router;
