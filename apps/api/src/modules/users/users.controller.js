import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  username: z.string().min(3).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  roleName: z.string(),
  phone: z.string().optional()
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  roleName: z.string().optional(),
  phone: z.string().optional()
});

const toggleActiveSchema = z.object({
  isActive: z.boolean()
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters long')
});

export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  list = async (req, res, next) => {
    try {
      const { search, role } = req.query;
      const users = await this.usersService.listUsers({
        farmId: req.user.farmId,
        search,
        role
      });
      return successResponse(res, users);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const user = await this.usersService.getUserById({
        farmId: req.user.farmId,
        userId: req.params.id
      });
      return successResponse(res, user);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const validated = createUserSchema.parse(req.body);
      const user = await this.usersService.createUser({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, user, 201, { message: 'User account created successfully' });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const validated = updateUserSchema.parse(req.body);
      const user = await this.usersService.updateUser({
        farmId: req.user.farmId,
        userId: req.params.id,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, user, 200, { message: 'User information updated successfully' });
    } catch (err) {
      next(err);
    }
  };

  toggleActive = async (req, res, next) => {
    try {
      const { isActive } = toggleActiveSchema.parse(req.body);
      const user = await this.usersService.toggleActiveStatus({
        farmId: req.user.farmId,
        userId: req.params.id,
        isActive,
        actorUserId: req.user.id,
        req
      });
      const actionText = isActive ? 'activated' : 'deactivated';
      return successResponse(res, user, 200, { message: `User account ${actionText} successfully` });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { newPassword } = resetPasswordSchema.parse(req.body);
      const result = await this.usersService.resetPassword({
        farmId: req.user.farmId,
        userId: req.params.id,
        newPassword,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, result, 200, { message: result.message });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const result = await this.usersService.deleteUser({
        farmId: req.user.farmId,
        userId: req.params.id,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, result, 200, { message: result.message });
    } catch (err) {
      next(err);
    }
  };
}
