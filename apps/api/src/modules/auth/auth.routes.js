import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { createAuthMiddleware } from '../../middleware/auth.js';

export function createAuthRouter(prisma) {
  const router = Router();
  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);
  const authenticate = createAuthMiddleware(prisma);

  // Public Authentication Endpoints
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/forgot-password', authController.forgotPassword);

  // Authenticated Endpoints
  router.post('/logout', authenticate, authController.logout);
  router.get('/me', authenticate, authController.me);
  router.post('/enroll-device', authenticate, authController.enrollDevice);

  return router;
}
