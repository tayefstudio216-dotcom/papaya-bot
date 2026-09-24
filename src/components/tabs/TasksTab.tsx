import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Task } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CheckSquare, ExternalLink, CheckCircle2, Clock, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

export const TasksTab: React.FC = () => {
  const { user, refreshUserData, addToast, setActiveTab, formatPapaya } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const loadTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.getTasks(user.telegramId);
      setTasks(res.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleStartTask = (task: Task) => {
    if (task.isCompleted) return;

    // Open task action url
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
    }

    // Start verification timer (10s countdown for realistic external action check)
    setVerifyingTaskId(task.id);
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTaskVerification(task.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTaskVerification = async (taskId: string) => {
    if (!user) return;
    try {
      const res = await api.completeTask(user.telegramId, taskId);
      await refreshUserData();
      await loadTasks();
      addToast({
        type: 'success',
        title: 'Task Verified! 🎯',
        message: `You received +${res.reward} Papaya!`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Task Verification Incomplete',
        message: err.message || 'Could not verify task completion.',
      });
    } finally {
      setVerifyingTaskId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Reward Tasks
        </span>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Community & Partner Tasks</h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Complete quick social actions, channel joins, and surveys to earn larger batches of Papaya. Each task is verified on the backend.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No active tasks available right now.</div>
        ) : (
          tasks.map((task) => {
            const isVerifying = verifyingTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  task.isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {task.title}
                      </h3>
                      {task.isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 shrink-0">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      {task.description}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Action: {task.requiredAction}</span>
                      <span aria-hidden="true">·</span>
                      <span>Slots: {task.remainingSlots.toLocaleString()} left</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600 font-mono-numbers">
                      +{formatPapaya(task.reward)} 🍈
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {task.instructions}
                  </span>

                  {task.isCompleted ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center gap-1 cursor-default shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </button>
                  ) : isVerifying ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 animate-pulse"
                    >
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying ({countdown}s)...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      disabled={verifyingTaskId !== null}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors active:scale-95 shadow-xs"
                    >
                      <span>Start Task</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
