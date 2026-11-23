'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { CheckSquare, Plus, Clock, CheckCircle } from 'lucide-react';

interface TaskRecord {
  id: string;
  title: string;
  task_type: string;
  field_name: string;
  assigned_worker: string;
  priority: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  planned_date: string;
  labor_hours?: number;
}

const INITIAL_TASKS: TaskRecord[] = [
  { id: 't-1', title: 'Weed Plot A Tomato Beds', task_type: 'WEEDING', field_name: 'Wabiga Shabelle - Plot A', assigned_worker: 'Cabdi Maxamed', priority: 'HIGH', status: 'IN_PROGRESS', planned_date: '2026-11-23', labor_hours: 3.5 },
  { id: 't-2', title: 'Irrigation Gate Opening & Check', task_type: 'IRRIGATION', field_name: 'Ceel-Wadaag - Plot B', assigned_worker: 'Faarax Cali', priority: 'URGENT', status: 'PENDING', planned_date: '2026-11-23' },
  { id: 't-3', title: 'Fertilizer Top Dressing (Urea)', task_type: 'FERTILIZING', field_name: 'Banaanka Bari - Plot C', assigned_worker: 'Xasan Axmed', priority: 'MEDIUM', status: 'PENDING', planned_date: '2026-11-24' },
  { id: 't-4', title: 'Tractor Soil Tilling & Harrowing', task_type: 'LAND_PREPARATION', field_name: 'Beerta Hoos - Plot D', assigned_worker: 'Jaamac Yuusuf', priority: 'LOW', status: 'COMPLETED', planned_date: '2026-11-21', labor_hours: 6.0 }
];

export default function TasksPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('WEEDING');
  const [fieldName, setFieldName] = useState('Wabiga Shabelle - Plot A');
  const [worker, setWorker] = useState('Cabdi Maxamed');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    async function load() {
      const local = await db.tasks.toArray();
      if (local && local.length > 0) {
        setTasks(local);
      } else {
        setTasks(INITIAL_TASKS);
        for (const t of INITIAL_TASKS) {
          await db.tasks.put(t);
        }
      }
    }
    load();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);

    const taskObj = updated.find(t => t.id === taskId);
    if (taskObj) {
      await syncEngine.saveOfflineMutation('Task', 'UPDATE', taskObj);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: TaskRecord = {
      id: generateUUID(),
      title,
      task_type: taskType,
      field_name: fieldName,
      assigned_worker: worker,
      priority,
      status: 'PENDING',
      planned_date: new Date().toISOString().slice(0, 10)
    };

    await syncEngine.saveOfflineMutation('Task', 'CREATE', newTask);
    setTasks([newTask, ...tasks]);
    setShowModal(false);
    setTitle('');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navTasks}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Field operations, worker labor hours, and completion tracking</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRecord}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Task Title</th>
                <th className="p-3.5">Field</th>
                <th className="p-3.5">Assigned Worker</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5">
                    <p className="font-bold text-gray-900">{task.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono">{task.task_type}</span>
                  </td>
                  <td className="p-3.5">{task.field_name}</td>
                  <td className="p-3.5 font-medium text-gray-800">{task.assigned_worker}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {task.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold hover:bg-emerald-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Create & Assign Field Task</h2>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Task Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weed Plot B Tomato beds"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Task Type</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="WEEDING">Weeding</option>
                      <option value="IRRIGATION">Irrigation</option>
                      <option value="FERTILIZING">Fertilizing</option>
                      <option value="SPRAYING">Spraying</option>
                      <option value="HARVESTING">Harvesting</option>
                      <option value="LAND_PREPARATION">Land Prep</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Field</label>
                  <input
                    required
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Assigned Worker</label>
                  <input
                    required
                    type="text"
                    value={worker}
                    onChange={(e) => setWorker(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border rounded-md text-gray-700"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-md font-semibold hover:bg-emerald-800"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
