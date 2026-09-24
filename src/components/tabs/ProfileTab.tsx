import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import {
  User,
  ShieldCheck,
  CreditCard,
  Bell,
  Calendar,
  Wallet,
  TrendingUp,
  Award,
  CheckCircle2,
  Tv,
  Users,
  Save,
  Lock,
  ArrowLeft,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { user, refreshUserData, addToast, setActiveTab, formatPapaya, formatUsd, switchUser } = useApp();

  const [paymentAccounts, setPaymentAccounts] = useState({
    bkash: user?.paymentAccounts?.bkash || '',
    nagad: user?.paymentAccounts?.nagad || '',
    paypal: user?.paymentAccounts?.paypal || '',
    payoneer: user?.paymentAccounts?.payoneer || '',
    webmoney: user?.paymentAccounts?.webmoney || '',
    payeer: user?.paymentAccounts?.payeer || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePaymentInfo = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await api.updatePaymentInfo(user.telegramId, paymentAccounts);
      await refreshUserData();
      addToast({
        type: 'success',
        title: 'Payment Details Saved',
        message: 'Your payout addresses have been updated successfully.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save payment details.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (user?.accountStatus === 'banned') {
      return (
        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-600" /> Banned
        </span>
      );
    }
    if (user?.accountStatus === 'flagged') {
      return (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Flagged / Review
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active Verified
      </span>
    );
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

        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          User Profile
        </span>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md shadow-slate-900/5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-orange-100 border-2 border-orange-200/60 shrink-0 shadow-xs">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {user?.firstName} {user?.lastName || ''}
              </h2>
              {getStatusBadge()}
            </div>

            <div className="text-xs text-slate-500 font-medium mt-0.5">
              @{user?.username}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
              <span className="font-mono-numbers">ID: {user?.telegramId}</span>
              <span aria-hidden="true">·</span>
              <span>Joined {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Lifetime Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Papaya Balance</span>
            <span className="font-bold text-slate-900 font-mono-numbers text-xs mt-0.5 block">
              {formatPapaya(user?.balance || 0)} 🍈
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Earned</span>
            <span className="font-bold text-emerald-600 font-mono-numbers text-xs mt-0.5 block">
              +{formatPapaya(user?.totalEarned || 0)} 🍈
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Withdrawn</span>
            <span className="font-bold text-indigo-600 font-mono-numbers text-xs mt-0.5 block">
              {formatPapaya(user?.totalWithdrawn || 0)} 🍈
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Tasks Done</span>
            <span className="font-bold text-slate-900 font-mono-numbers text-xs mt-0.5 block">
              {user?.completedTasksCount || 0} tasks
            </span>
          </div>
        </div>
      </div>

      {/* Edit Payment Information Drawer / Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Default Payout Accounts
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Auto-filled in Cashout</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">bKash Number</label>
            <input
              type="text"
              value={paymentAccounts.bkash}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, bkash: e.target.value })}
              placeholder="+8801712345678"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nagad Number</label>
            <input
              type="text"
              value={paymentAccounts.nagad}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, nagad: e.target.value })}
              placeholder="+8801812345678"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">PayPal Email</label>
            <input
              type="text"
              value={paymentAccounts.paypal}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, paypal: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payoneer Email</label>
            <input
              type="text"
              value={paymentAccounts.payoneer}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, payoneer: e.target.value })}
              placeholder="payoneer@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">WebMoney WMZ</label>
            <input
              type="text"
              value={paymentAccounts.webmoney}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, webmoney: e.target.value })}
              placeholder="Z123456789012"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payeer Wallet</label>
            <input
              type="text"
              value={paymentAccounts.payeer}
              onChange={(e) => setPaymentAccounts({ ...paymentAccounts, payeer: e.target.value })}
              placeholder="P10293847"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSavePaymentInfo}
          disabled={isSaving}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Payment Accounts'}</span>
        </button>
      </div>

      {/* Account Security & Support Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs space-y-2 text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Telegram Identity & Security</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Your account is cryptographically bound to Telegram User ID <strong className="text-slate-700 font-mono-numbers">{user?.telegramId}</strong>. Balance, task approvals, and withdrawals are authenticated exclusively by the server.
        </p>
      </div>
    </div>
  );
};
