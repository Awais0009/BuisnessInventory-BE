import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.get('/test', authController.test);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/confirm-email', authController.confirmEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-confirmation', authController.resendConfirmation);

// Protected routes
router.get('/profile', authenticateToken, authController.profile);
router.post('/verify-token', authenticateToken, authController.verifyToken);
router.post('/logout', authenticateToken, authController.logout);

export default router;
