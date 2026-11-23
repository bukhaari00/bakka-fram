import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';
import { ROLES, TASK_STATUSES } from '@bakka/shared';

export class TasksService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listTasks({ farmId, user, status, fieldId, date, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };

    // Worker can only see tasks assigned to them
    if (user.roleName === ROLES.FARM_WORKER) {
      where.assignments = {
        some: { user_id: user.id }
      };
    }

    if (status) where.status = status;
    if (fieldId) where.field_id = fieldId;
    if (date) where.planned_date = new Date(date);

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          field: true,
          planting_batch: { include: { crop_type: true } },
          supervisor: { select: { id: true, full_name: true } },
          assignments: { include: { user: { select: { id: true, full_name: true, role_name: true } } } },
          activities: { orderBy: { created_at: 'desc' } }
        },
        orderBy: [{ planned_date: 'asc' }, { priority: 'desc' }]
      })
    ]);

    return { total, page, limit, items };
  }

  async createTask({
    farmId,
    title,
    taskType,
    fieldId,
    plantingBatchId,
    assignedUserIds = [],
    supervisorUserId,
    priority = 'MEDIUM',
    plannedDate,
    dueDate,
    instructions,
    notes,
    actorUserId,
    req
  }) {
    const taskId = uuidv4();

    const task = await this.prisma.task.create({
      data: {
        id: taskId,
        farm_id: farmId,
        title,
        task_type: taskType,
        field_id: fieldId || null,
        planting_batch_id: plantingBatchId || null,
        supervisor_user_id: supervisorUserId || actorUserId,
        priority,
        status: TASK_STATUSES.PENDING,
        planned_date: new Date(plannedDate),
        due_date: dueDate ? new Date(dueDate) : null,
        instructions,
        notes,
        assignments: {
          create: assignedUserIds.map(uid => ({
            id: uuidv4(),
            user_id: uid
          }))
        },
        activities: {
          create: {
            id: uuidv4(),
            user_id: actorUserId,
            status_from: 'NONE',
            status_to: TASK_STATUSES.PENDING,
            notes: 'Task created and scheduled.'
          }
        }
      },
      include: {
        assignments: true
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      newValues: { title, taskType, priority, plannedDate, assignedCount: assignedUserIds.length },
      req
    });

    return task;
  }

  async updateTaskProgress({
    farmId,
    taskId,
    status,
    notes,
    laborHours,
    actorUserId,
    actorRole,
    req
  }) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, farm_id: farmId },
      include: { assignments: true }
    });

    if (!task) {
      throw new AppError('Task not found in this farm.', 404);
    }

    // Worker validation: verify assignment
    if (actorRole === ROLES.FARM_WORKER) {
      const isAssigned = task.assignments.some(a => a.user_id === actorUserId);
      if (!isAssigned) {
        throw new AppError('You are not assigned to this task.', 403);
      }
    }

    const previousStatus = task.status;
    const isCompleting = status === TASK_STATUSES.COMPLETED;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        notes: notes !== undefined ? notes : task.notes,
        labor_hours: laborHours !== undefined ? laborHours : task.labor_hours,
        completed_at: isCompleting ? new Date() : (status === TASK_STATUSES.PENDING ? null : task.completed_at),
        version: { increment: 1 },
        activities: {
          create: {
            id: uuidv4(),
            user_id: actorUserId,
            status_from: previousStatus,
            status_to: status,
            notes: notes || `Status changed to ${status}`
          }
        }
      },
      include: {
        activities: { orderBy: { created_at: 'desc' } }
      }
    });

    return updated;
  }

  // --- Irrigation Events ---
  async listIrrigationEvents({ farmId, fieldId, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };
    if (fieldId) where.field_id = fieldId;

    const [total, items] = await Promise.all([
      this.prisma.irrigationEvent.count({ where }),
      this.prisma.irrigationEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          field: true,
          planting_batch: { include: { crop_type: true } },
          recorded_by: { select: { id: true, full_name: true } }
        },
        orderBy: { event_date: 'desc' }
      })
    ]);

    return { total, page, limit, items };
  }

  async createIrrigationEvent({
    farmId,
    fieldId,
    plantingBatchId,
    eventDate,
    waterSource,
    irrigationMethod,
    durationMinutes,
    waterVolumeLiters,
    cost,
    notes,
    actorUserId,
    req
  }) {
    const event = await this.prisma.irrigationEvent.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        field_id: fieldId,
        planting_batch_id: plantingBatchId || null,
        recorded_by_user_id: actorUserId,
        event_date: new Date(eventDate || Date.now()),
        water_source: waterSource,
        irrigation_method: irrigationMethod,
        duration_minutes: durationMinutes || null,
        water_volume_liters: waterVolumeLiters || null,
        cost: cost || 0,
        notes
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'IRRIGATION_EVENT_LOGGED',
      entityType: 'IrrigationEvent',
      entityId: event.id,
      newValues: { fieldId, waterSource, irrigationMethod, durationMinutes },
      req
    });

    return event;
  }
}
