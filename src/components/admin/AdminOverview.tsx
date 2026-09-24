import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { AdminStatsOverview } from '../../types/index.ts';
import { AdminSection } from './AdminLayout.tsx';
import {
  Users,
  Coins,
  ArrowUpRight,
  Tv,
  CheckSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Send
} from 'lucide-react';
import { AdminBroadcastModal } from './AdminBroadcastModal.tsx';

export const AdminOverview: React.FC<{ onNavigate: (section: AdminSection) => void }> = ({ onNavigate }) => {
  const { formatPapaya, formatUsd, settings } = useApp();
  const [stats, setStats] = useState<AdminStatsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminOverview()
      .then(res => setStats(res.stats))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading system metrics...</div>;
  }

  const conversionRate = settings?.conversionRate || 10000;
  const distributedUsd = (stats.totalPapayaDistributed / conversionRate).toFixed(2);
  const withdrawnUsd = (stats.totalWithdrawalsAmount / conversionRate).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Broadcast Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Papaya Bot Network Statistics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active rate: {conversionRate.toLocaleString()} Papaya = $1.00 USD · Timezone: {settings?.timezone || 'UTC'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-orange-400" />
            <span>Broadcast Message</span>
          </button>
        </div>
      </div>

      {/* 9 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-numbers mt-2">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+{stats.newUsersToday} today</span>
            <span aria-hidden="true">·</span>
            <span>{stats.activeUsers} active</span>
          </div>
        </div>

        {/* Papaya Distributed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Papaya Distributed</span>
            <Coins className="w-4 h-4 text-[#FF6B35]" />
          </div>
          <div className="text-2xl font-extrabold text-[#FF6B35] font-mono-numbers mt-2">
            {formatPapaya(stats.totalPapayaDistributed)} 🍈
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ≈ ${distributedUsd} USD distributed
          </div>
        </div>

        {/* Total Withdrawals Paid */}
        <div
          onClick={() => onNavigate('withdrawals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Paid Out</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-numbers mt-2">
            ${withdrawnUsd} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.paidWithdrawalsCount} successful payouts
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div
          onClick={() => onNavigate('withdrawals')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer bg-amber-50/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono-numbers mt-2">
            {stats.pendingWithdrawalsCount}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 font-medium">
            Requires admin action
          </div>
        </div>

        {/* Total Ad Completions */}
        <div
          onClick={() => onNavigate('ads')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Ad Completions</span>
            <Tv className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-numbers mt-2">
            {stats.totalAdCompletions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Monetag & Adsterra 15s sessions
          </div>
        </div>

        {/* Total Tasks Completed */}
        <div
          onClick={() => onNavigate('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tasks Completed</span>
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-numbers mt-2">
            {stats.totalTasksCompleted.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Social & community submissions
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings & Ad Completions Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Daily Distributed Papaya (Last 7 Days)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Points claimed by users</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 font-mono-numbers">
              +14,250 Today
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {stats.dailyEarningsHistory.map((item, idx) => {
              const maxAmt = 16000;
              const heightPct = Math.min(100, Math.round((item.amount / maxAmt) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 font-mono-numbers opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.amount}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-orange-500 to-[#FF6B35] rounded-t-lg transition-all group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    {item.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Registered Telegram Users
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Cumulative account registrations</p>
            </div>
            <span className="text-xs font-bold text-blue-600 font-mono-numbers">
              1,240 Total
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {stats.userGrowthHistory.map((item, idx) => {
              const maxUsers = 1500;
              const heightPct = Math.min(100, Math.round((item.users / maxUsers) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 font-mono-numbers opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.users}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    {item.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showBroadcastModal && (
        <AdminBroadcastModal onClose={() => setShowBroadcastModal(false)} />
      )}
    </div>
  );
};
