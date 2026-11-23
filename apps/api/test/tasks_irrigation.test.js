import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksService } from '../src/modules/tasks/tasks.service.js';
import { ROLES, TASK_STATUSES } from '@bakka/shared';

describe('Bakka Farm Tasks & Irrigation Operations Tests', () => {
  let mockPrisma;
  let tasksService;

  beforeEach(() => {
    mockPrisma = {
      task: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn()
      },
      irrigationEvent: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      }
    };

    tasksService = new TasksService(mockPrisma);
  });

  it('restricts farm worker to viewing only their assigned tasks', async () => {
    mockPrisma.task.count.mockResolvedValue(1);
    mockPrisma.task.findMany.mockResolvedValue([
      { id: 'task-1', title: 'Weed Plot 3', status: 'PENDING' }
    ]);

    const workerUser = {
      id: 'worker-101',
      roleName: ROLES.FARM_WORKER
    };

    await tasksService.listTasks({
      farmId: 'farm-1',
      user: workerUser
    });

    expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          farm_id: 'farm-1',
          assignments: {
            some: { user_id: 'worker-101' }
          }
        })
      })
    );
  });

  it('creates task with multiple assigned workers and audit record', async () => {
    mockPrisma.task.create.mockResolvedValue({
      id: 'task-10',
      title: 'Drip Irrigation Maintenance',
      task_type: 'IRRIGATION',
      status: 'PENDING'
    });

    const task = await tasksService.createTask({
      farmId: 'farm-1',
      title: 'Drip Irrigation Maintenance',
      taskType: 'IRRIGATION',
      plannedDate: '2026-11-25',
      assignedUserIds: ['worker-1', 'worker-2'],
      actorUserId: 'supervisor-1'
    });

    expect(task.id).toBe('task-10');
    expect(mockPrisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assignments: {
            create: [
              expect.objectContaining({ user_id: 'worker-1' }),
              expect.objectContaining({ user_id: 'worker-2' })
            ]
          }
        })
      })
    );
  });

  it('updates task progress and records status transition history', async () => {
    mockPrisma.task.findFirst.mockResolvedValue({
      id: 'task-10',
      farm_id: 'farm-1',
      status: 'IN_PROGRESS',
      assignments: [{ user_id: 'worker-1' }]
    });

    mockPrisma.task.update.mockResolvedValue({
      id: 'task-10',
      status: 'COMPLETED',
      labor_hours: 4.5
    });

    const updated = await tasksService.updateTaskProgress({
      farmId: 'farm-1',
      taskId: 'task-10',
      status: 'COMPLETED',
      laborHours: 4.5,
      notes: 'Completed spraying before noon',
      actorUserId: 'worker-1',
      actorRole: ROLES.FARM_WORKER
    });

    expect(updated.status).toBe('COMPLETED');
    expect(mockPrisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          labor_hours: 4.5,
          activities: {
            create: expect.objectContaining({
              status_from: 'IN_PROGRESS',
              status_to: 'COMPLETED'
            })
          }
        })
      })
    );
  });
});
