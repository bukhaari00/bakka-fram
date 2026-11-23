import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const createTaskSchema = z.object({
  title: z.string().min(2),
  taskType: z.string().min(2),
  fieldId: z.string().uuid().optional(),
  plantingBatchId: z.string().uuid().optional(),
  assignedUserIds: z.array(z.string().uuid()).optional(),
  supervisorUserId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  plannedDate: z.string(),
  dueDate: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional()
});

const updateProgressSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
  laborHours: z.number().nonnegative().optional()
});

const createIrrigationSchema = z.object({
  fieldId: z.string().uuid(),
  plantingBatchId: z.string().uuid().optional(),
  eventDate: z.string().optional(),
  waterSource: z.string().min(2),
  irrigationMethod: z.string().min(2),
  durationMinutes: z.number().int().positive().optional(),
  waterVolumeLiters: z.number().positive().optional(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional()
});

export class TasksController {
  constructor(tasksService) {
    this.tasksService = tasksService;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.tasksService.listTasks({
        farmId: req.user.farmId,
        user: req.user,
        status: req.query.status,
        fieldId: req.query.fieldId,
        date: req.query.date,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const validated = createTaskSchema.parse(req.body);
      const task = await this.tasksService.createTask({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, task, 201);
    } catch (err) { next(err); }
  };

  updateProgress = async (req, res, next) => {
    try {
      const validated = updateProgressSchema.parse(req.body);
      const updated = await this.tasksService.updateTaskProgress({
        farmId: req.user.farmId,
        taskId: req.params.id,
        ...validated,
        actorUserId: req.user.id,
        actorRole: req.user.roleName,
        req
      });
      return successResponse(res, updated);
    } catch (err) { next(err); }
  };

  listIrrigation = async (req, res, next) => {
    try {
      const result = await this.tasksService.listIrrigationEvents({
        farmId: req.user.farmId,
        fieldId: req.query.fieldId,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  createIrrigation = async (req, res, next) => {
    try {
      const validated = createIrrigationSchema.parse(req.body);
      const event = await this.tasksService.createIrrigationEvent({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, event, 201);
    } catch (err) { next(err); }
  };
}
