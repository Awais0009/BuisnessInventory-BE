import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// API routes
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Business Inventory API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        verifyToken: 'POST /api/auth/verify-token',
        confirmEmail: 'POST /api/auth/confirm-email',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        resendConfirmation: 'POST /api/auth/resend-confirmation',
        logout: 'POST /api/auth/logout',
        test: 'GET /api/auth/test'
      }
    }
  });
});

export default router;
