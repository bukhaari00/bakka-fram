import { Router } from 'express';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createTasksRouter(prisma) {
  const router = Router();
  const tasksService = new TasksService(prisma);
  const tasksController = new TasksController(tasksService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  // Task Endpoints
  router.get('/', tasksController.list);
  router.post('/', requirePermission(PERMISSIONS.TASKS_MANAGE), tasksController.create);
  router.patch('/:id/progress', requirePermission(PERMISSIONS.TASKS_UPDATE_PROGRESS), tasksController.updateProgress);

  // Irrigation Endpoints
  router.get('/irrigation', requirePermission(PERMISSIONS.IRRIGATION_VIEW), tasksController.listIrrigation);
  router.post('/irrigation', requirePermission(PERMISSIONS.IRRIGATION_MANAGE), tasksController.createIrrigation);

  return router;
}
