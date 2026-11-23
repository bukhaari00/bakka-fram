import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional()
}).refine(data => data.email || data.username || data.identifier, {
  message: 'Email or username is required'
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, or dashes'),
  phone: z.string().min(6, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(2, 'Email or username is required')
});

const enrollDeviceSchema = z.object({
  deviceId: z.string().min(4),
  deviceName: z.string().optional(),
  offlineVerifierHash: z.string().min(10),
  offlineVerifierSalt: z.string().min(6)
});

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res, next) => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.authService.login({
        ...validated,
        req
      });
      return successResponse(res, result, 200, { message: 'Authentication successful' });
    } catch (err) {
      next(err);
    }
  };

  register = async (req, res, next) => {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await this.authService.register({
        ...validated,
        req
      });
      return successResponse(res, result, 201, { message: 'User registered successfully. Welcome to Bakka System!' });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await this.authService.forgotPassword({
        ...validated,
        req
      });
      return successResponse(res, result, 200, { message: result.message });
    } catch (err) {
      next(err);
    }
  };

  enrollDevice = async (req, res, next) => {
    try {
      const validated = enrollDeviceSchema.parse(req.body);
      const result = await this.authService.enrollDevice({
        userId: req.user.id,
        ...validated,
        req
      });
      return successResponse(res, result, 200, { message: 'Device successfully enrolled for offline use' });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.authService.logout({
        sessionId: req.sessionId,
        userId: req.user?.id,
        farmId: req.user?.farmId,
        req
      });
      return successResponse(res, { loggedOut: true }, 200, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      return successResponse(res, {
        user: req.user,
        farm: req.farm
      });
    } catch (err) {
      next(err);
    }
  };
}
