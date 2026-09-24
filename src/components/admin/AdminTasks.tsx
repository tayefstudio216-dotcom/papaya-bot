import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Task, TaskType } from '../../types/index.ts';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  Users
} from 'lucide-react';

export const AdminTasks: React.FC = () => {
  const { formatPapaya, addToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create Modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReward, setFormReward] = useState('50');
  const [formType, setFormType] = useState<TaskType>('website_visit');
  const [formActionUrl, setFormActionUrl] = useState('');
  const [formRequiredAction, setFormRequiredAction] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formTotalSlots, setFormTotalSlots] = useState('1000');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [isSaving, setIsSaving] = useState(false);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsCreating(true);
    setFormTitle('');
    setFormDescription('');
    setFormReward('50');
    setFormType('website_visit');
    setFormActionUrl('https://');
    setFormRequiredAction('Visit Partner Website');
    setFormInstructions('Stay on page for at least 10 seconds.');
    setFormTotalSlots('1000');
    setFormStatus('active');
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreating(false);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormReward(String(task.reward));
    setFormType(task.type);
    setFormActionUrl(task.actionUrl);
    setFormRequiredAction(task.requiredAction);
    setFormInstructions(task.instructions);
    setFormTotalSlots(String(task.totalSlots));
    setFormStatus(task.status);
  };

  const handleSaveTask = async () => {
    if (!formTitle || !formActionUrl) {
      addToast({ type: 'error', title: 'Missing Fields', message: 'Title and Action URL are required.' });
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        await api.adminCreateTask({
          adminUsername: 'SuperAdmin',
          title: formTitle,
          description: formDescription,
          reward: parseInt(formReward, 10) || 50,
          type: formType,
          actionUrl: formActionUrl,
          requiredAction: formRequiredAction,
          instructions: formInstructions,
          totalSlots: parseInt(formTotalSlots, 10) || 1000,
        });
        addToast({ type: 'success', title: 'Task Created', message: `"${formTitle}" is now live.` });
      } else if (editingTask) {
        await api.adminUpdateTask(editingTask.id, {
          title: formTitle,
          description: formDescription,
          reward: parseInt(formReward, 10),
          type: formType,
          actionUrl: formActionUrl,
          requiredAction: formRequiredAction,
          instructions: formInstructions,
          status: formStatus,
        });
        addToast({ type: 'success', title: 'Task Updated', message: 'Changes saved successfully.' });
      }

      setEditingTask(null);
      setIsCreating(false);
      await loadTasks();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete task "${title}"?`)) return;
    try {
      await api.adminDeleteTask(taskId);
      addToast({ type: 'info', title: 'Task Deleted', message: `Removed "${title}".` });
      await loadTasks();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Available Reward Tasks ({tasks.length})
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure partner tasks, channel subscriptions, and custom surveys.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#e05622] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Slots Remaining</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading tasks...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No tasks created yet.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{task.description}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-600">
                      {task.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 font-mono-numbers">
                      +{formatPapaya(task.reward)} 🍈
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600">
                      {task.remainingSlots.toLocaleString()} / {task.totalSlots.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {task.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Create New Reward Task' : 'Edit Reward Task'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTask(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Join Papaya VIP Telegram Channel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short explanation for users..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Reward (Papaya)</label>
                  <input
                    type="number"
                    value={formReward}
                    onChange={(e) => setFormReward(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Task Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
                  >
                    <option value="telegram_channel">Telegram Channel Join</option>
                    <option value="community">Community Group Join</option>
                    <option value="website_visit">Website Visit (10s)</option>
                    <option value="social_follow">Social Follow (X/Insta)</option>
                    <option value="survey">User Survey / Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Action URL (Destination)</label>
                <input
                  type="url"
                  value={formActionUrl}
                  onChange={(e) => setFormActionUrl(e.target.value)}
                  placeholder="https://t.me/your_channel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Instructions for User</label>
                <input
                  type="text"
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Join the channel and stay for at least 24 hours."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Available Slots</label>
                  <input
                    type="number"
                    value={formTotalSlots}
                    onChange={(e) => setFormTotalSlots(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTask(null);
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                disabled={isSaving}
                className="flex-1 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#e05622] text-white font-bold text-xs shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
