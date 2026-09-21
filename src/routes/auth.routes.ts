import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Private routes
router.get('/profile', authenticate, authorizeRole(['Patient']), (req: any, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to your private profile',
    user: req.user 
  });
});

export default router;