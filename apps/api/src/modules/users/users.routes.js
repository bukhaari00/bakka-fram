import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { createAuthMiddleware, requirePermission, requireRole } from '../../middleware/auth.js';
import { PERMISSIONS, ROLES } from '@bakka/shared';

export function createUsersRouter(prisma) {
  const router = Router();
  const usersService = new UsersService(prisma);
  const usersController = new UsersController(usersService);
  const authenticate = createAuthMiddleware(prisma);

  // User management requires authentication and either USERS_MANAGE permission or ADMIN role
  router.use(authenticate);
  router.use(requirePermission(PERMISSIONS.USERS_MANAGE));

  router.get('/', usersController.list);
  router.post('/', usersController.create);
  router.get('/:id', usersController.getById);
  router.put('/:id', usersController.update);
  router.delete('/:id', usersController.delete);
  router.patch('/:id/status', usersController.toggleActive);
  router.post('/:id/reset-password', usersController.resetPassword);

  return router;
}
