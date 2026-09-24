import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AuditLog, UserProfile } from '../../types/index.ts';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, UserX, Clock, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const AdminAuditLogs: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'fraud'>('fraud');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, fraudRes] = await Promise.all([
        api.getAdminAuditLogs(),
        api.getAdminAntiFraud(),
      ]);
      setLogs(logsRes.logs);
      setFlaggedUsers(fraudRes.flaggedUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveFlag = async (user: UserProfile, newStatus: 'active' | 'banned') => {
    try {
      await api.adminUpdateUserStatus({
        adminUsername: 'SuperAdmin',
        targetUserId: user.telegramId,
        status: newStatus,
        reason: `Anti-fraud flag resolved: set to ${newStatus}`,
      });
      addToast({
        type: 'success',
        title: 'Fraud Flag Resolved',
        message: `@${user.username} marked as ${newStatus}.`,
      });
      await loadData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Security Audit Trail & Fraud Mitigation
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Immutable log of balance adjustments, admin decisions, and algorithmic flags.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'fraud' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Fraud Flags ({flaggedUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Audit Trail ({logs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'fraud' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading flagged accounts...</div>
          ) : flaggedUsers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">Clean Account Health</div>
              <p className="text-slate-400 mt-0.5">No accounts currently flagged for rapid ad skipping or emulator abuse.</p>
            </div>
          ) : (
            flaggedUsers.map((user) => (
              <div
                key={user.telegramId}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">@{user.username}</span>
                    <span className="text-[11px] text-slate-400 font-mono-numbers">ID: {user.telegramId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Fraud Score: {user.fraudScore || 65}%
                    </span>
                  </div>

                  <div className="text-[11px] text-rose-700 font-medium space-y-0.5">
                    {(user.fraudFlags || ['Automated velocity anomaly detected']).map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveFlag(user, 'active')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Clear / Approve</span>
                  </button>
                  <button
                    onClick={() => handleResolveFlag(user, 'banned')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Ban Account</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.adminUsername}
                    </td>
                    <td className="py-3 px-4">
                      {log.targetUserName ? (
                        <span className="font-semibold text-slate-900">@{log.targetUserName}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono-numbers text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
