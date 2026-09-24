import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { UserProfile, Transaction, Withdrawal } from '../../types/index.ts';
import {
  Search,
  Sliders,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  CreditCard,
  UserX,
  AlertTriangle,
  Coins
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { formatPapaya, formatUsd, addToast } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected user modal for details & adjustments
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<Withdrawal[]>([]);

  // Adjustment fields
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Custom limits fields
  const [customDailyLimit, setCustomDailyLimit] = useState('');
  const [customMultiplier, setCustomMultiplier] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminUsers({ search: searchTerm, status: statusFilter });
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, statusFilter]);

  const handleSelectUser = async (u: UserProfile) => {
    setSelectedUser(u);
    setCustomDailyLimit(String(u.customDailyLimit || ''));
    setCustomMultiplier(String(u.customMultiplier || ''));
    setAdjustAmount('');
    setAdjustReason('');
    try {
      const [txRes, wthRes] = await Promise.all([
        api.getUserTransactions(u.telegramId),
        api.getUserWithdrawals(u.telegramId),
      ]);
      setUserTransactions(txRes.transactions);
      setUserWithdrawals(wthRes.withdrawals);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    const num = parseInt(adjustAmount, 10);
    if (isNaN(num) || num === 0) {
      addToast({ type: 'error', title: 'Invalid Amount', message: 'Enter a valid non-zero Papaya integer.' });
      return;
    }
    if (!adjustReason || adjustReason.trim().length < 3) {
      addToast({ type: 'error', title: 'Reason Required', message: 'Audit reason is mandatory for manual balance adjustments.' });
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await api.adminAdjustBalance({
        adminUsername: 'SuperAdmin',
        targetUserId: selectedUser.telegramId,
        amount: num,
        reason: adjustReason.trim(),
      });

      addToast({
        type: 'success',
        title: 'Balance Adjusted',
        message: `Updated to ${res.newBalance} Papaya. Audit log created.`,
      });

      setSelectedUser(prev => prev ? { ...prev, balance: res.newBalance } : null);
      setAdjustAmount('');
      setAdjustReason('');
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Adjustment Failed', message: err.message });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleUpdateStatus = async (status: UserProfile['accountStatus']) => {
    if (!selectedUser) return;
    try {
      await api.adminUpdateUserStatus({
        adminUsername: 'SuperAdmin',
        targetUserId: selectedUser.telegramId,
        status,
        reason: `Admin updated status to ${status}`,
      });
      setSelectedUser(prev => prev ? { ...prev, accountStatus: status } : null);
      addToast({ type: 'info', title: 'Status Updated', message: `User is now ${status}` });
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Status Update Failed', message: err.message });
    }
  };

  const handleResetDaily = async () => {
    if (!selectedUser) return;
    try {
      await api.adminResetDailyLimit({
        adminUsername: 'SuperAdmin',
        targetUserId: selectedUser.telegramId,
      });
      setSelectedUser(prev => prev ? { ...prev, todayAdsCount: 0 } : null);
      addToast({ type: 'success', title: 'Daily Limit Reset', message: 'User daily ad count set to 0.' });
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Reset Failed', message: err.message });
    }
  };

  const handleSaveCustomLimits = async () => {
    if (!selectedUser) return;
    try {
      await api.adminSetCustomLimits({
        adminUsername: 'SuperAdmin',
        targetUserId: selectedUser.telegramId,
        customDailyLimit: customDailyLimit ? parseInt(customDailyLimit, 10) : undefined,
        customMultiplier: customMultiplier ? parseFloat(customMultiplier) : undefined,
      });
      addToast({ type: 'success', title: 'Limits Updated', message: 'Custom user settings saved.' });
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username, Telegram ID, name, or referral code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['all', 'active', 'flagged', 'suspended', 'banned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Telegram ID</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Earned / Withdrawn</th>
                <th className="py-3 px-4">Today Ads</th>
                <th className="py-3 px-4">Tasks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading user database...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No matching users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.telegramId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-7 h-7 rounded-full bg-orange-100"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">@{u.username}</div>
                          <div className="text-[10px] text-slate-400">{u.firstName} {u.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600">
                      {u.telegramId}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#FF6B35] font-mono-numbers">
                      {formatPapaya(u.balance)} 🍈
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600">
                      +{formatPapaya(u.totalEarned)} / -{formatPapaya(u.totalWithdrawn)}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers">
                      <span className="font-bold text-slate-900">{u.todayAdsCount}</span> / {u.customDailyLimit || 100}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers">
                      {u.completedTasksCount}
                    </td>
                    <td className="py-3 px-4">
                      {u.accountStatus === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      )}
                      {u.accountStatus === 'flagged' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          Flagged
                        </span>
                      )}
                      {u.accountStatus === 'banned' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          Banned
                        </span>
                      )}
                      {u.accountStatus === 'suspended' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSelectUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Drawer Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.username}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl bg-orange-100"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">@{selectedUser.username}</h3>
                  <p className="text-xs text-slate-400 font-mono-numbers">
                    Telegram ID: {selectedUser.telegramId} · Ref: {selectedUser.referralCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Balances & State Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <span className="text-[10px] text-orange-800 font-bold uppercase block">Current Balance</span>
                <span className="text-base font-extrabold text-[#FF6B35] font-mono-numbers mt-0.5 block">
                  {formatPapaya(selectedUser.balance)} 🍈
                </span>
                <span className="text-[10px] text-slate-500 font-mono-numbers">
                  ≈ {formatUsd(selectedUser.balance)} USD
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Ads</span>
                <span className="text-base font-extrabold text-slate-900 font-mono-numbers mt-0.5 block">
                  {selectedUser.todayAdsCount} / {selectedUser.customDailyLimit || 100}
                </span>
                <button
                  onClick={handleResetDaily}
                  className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 mt-0.5"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset Today
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Referrals</span>
                <span className="text-base font-extrabold text-slate-900 font-mono-numbers mt-0.5 block">
                  {selectedUser.referralCount} Users
                </span>
                <span className="text-[10px] text-emerald-600 font-mono-numbers">
                  +{formatPapaya(selectedUser.referralEarnings)} 🍈
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <span className="text-sm font-bold text-slate-900 capitalize mt-1 block">
                  {selectedUser.accountStatus}
                </span>
              </div>
            </div>

            {/* Manual Balance Adjustment Form (Mandatory Audit Note) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Coins className="w-4 h-4 text-[#FF6B35]" />
                <span>Adjust Balance (Creates Immutable Audit Log)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Amount Delta (e.g. +500 or -200)
                  </label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="+1000 or -500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono-numbers font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Audit Reason / Note (Required)
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Compensation for partner task glitch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleAdjustBalance}
                disabled={isAdjusting}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                {isAdjusting ? 'Applying...' : 'Apply Balance Adjustment'}
              </button>
            </div>

            {/* Custom Limits Configuration */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Custom User Limits & Multipliers</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Custom Daily Limit</label>
                  <input
                    type="number"
                    value={customDailyLimit}
                    onChange={(e) => setCustomDailyLimit(e.target.value)}
                    placeholder="Default (100)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Reward Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customMultiplier}
                    onChange={(e) => setCustomMultiplier(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCustomLimits}
                className="w-full py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-800 transition-colors"
              >
                Save Custom Limits
              </button>
            </div>

            {/* Account Moderation Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700">Account Action:</span>
              <div className="flex items-center gap-2">
                {selectedUser.accountStatus !== 'active' && (
                  <button
                    onClick={() => handleUpdateStatus('active')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                  >
                    Unban / Set Active
                  </button>
                )}
                {selectedUser.accountStatus !== 'suspended' && (
                  <button
                    onClick={() => handleUpdateStatus('suspended')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-500"
                  >
                    Suspend
                  </button>
                )}
                {selectedUser.accountStatus !== 'banned' && (
                  <button
                    onClick={() => handleUpdateStatus('banned')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500"
                  >
                    Ban User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
