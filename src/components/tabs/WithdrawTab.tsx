import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PaymentMethod, Withdrawal } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  X
} from 'lucide-react';

export const WithdrawTab: React.FC = () => {
  const { user, settings, refreshUserData, addToast, setActiveTab, formatPapaya, formatUsd } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');
  const [amountPapaya, setAmountPapaya] = useState<string>('10000');
  const [accountInfo, setAccountInfo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [userWithdrawals, setUserWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const balance = user?.balance ?? 0;
  const conversionRate = settings?.conversionRate || 10000;
  const minWithdrawal = settings?.minimumWithdrawal || 10000;
  const numAmount = parseInt(amountPapaya, 10) || 0;
  const usdEquiv = (numAmount / conversionRate).toFixed(3);

  // Pre-fill user's saved account info when method changes
  useEffect(() => {
    if (!user?.paymentAccounts) return;
    const key = selectedMethod.toLowerCase() as keyof typeof user.paymentAccounts;
    const saved = user.paymentAccounts[key];
    if (saved) {
      setAccountInfo(saved);
    } else {
      setAccountInfo('');
    }
  }, [selectedMethod, user]);

  const loadWithdrawalHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const res = await api.getUserWithdrawals(user.telegramId);
      setUserWithdrawals(res.withdrawals);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadWithdrawalHistory();
  }, [user]);

  const getMethodPlaceholder = (method: PaymentMethod): { label: string; placeholder: string; helper: string } => {
    switch (method) {
      case 'bKash':
        return {
          label: 'bKash Mobile Number',
          placeholder: 'e.g. +8801712345678 (Personal)',
          helper: 'Enter 11-digit Bangladeshi mobile number',
        };
      case 'Nagad':
        return {
          label: 'Nagad Mobile Number',
          placeholder: 'e.g. +8801812345678 (Personal)',
          helper: 'Enter 11-digit Nagad registered number',
        };
      case 'PayPal':
        return {
          label: 'PayPal Email Address',
          placeholder: 'e.g. your.email@example.com',
          helper: 'USD will be sent via PayPal Friends & Family / Goods',
        };
      case 'Payoneer':
        return {
          label: 'Payoneer Email / Customer ID',
          placeholder: 'e.g. payoneer.account@domain.com',
          helper: 'Make sure your Payoneer email can receive in-network USD',
        };
      case 'WebMoney':
        return {
          label: 'WebMoney WMZ Purse ID',
          placeholder: 'e.g. Z123456789012',
          helper: '12-digit WMZ wallet number starting with Z',
        };
      case 'Payeer':
        return {
          label: 'Payeer Account Number',
          placeholder: 'e.g. P10123456',
          helper: 'Payeer wallet identifier starting with P',
        };
    }
  };

  const handleValidateAndOpenModal = () => {
    if (!settings?.withdrawalsEnabled) {
      addToast({
        type: 'warning',
        title: 'Withdrawals Paused',
        message: 'Withdrawals are temporarily paused for maintenance.',
      });
      return;
    }

    if (numAmount < minWithdrawal) {
      addToast({
        type: 'error',
        title: 'Below Minimum',
        message: `Minimum cashout threshold is ${minWithdrawal.toLocaleString()} Papaya.`,
      });
      return;
    }

    if (numAmount > balance) {
      addToast({
        type: 'error',
        title: 'Insufficient Balance',
        message: `You only have ${balance.toLocaleString()} Papaya available.`,
      });
      return;
    }

    if (!accountInfo || accountInfo.trim().length < 3) {
      addToast({
        type: 'error',
        title: 'Missing Account Detail',
        message: 'Please provide valid account number or email for payout.',
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitWithdrawal({
        userId: user.telegramId,
        method: selectedMethod,
        accountInfo: accountInfo.trim(),
        papayaAmount: numAmount,
      });

      setShowConfirmModal(false);
      await refreshUserData();
      await loadWithdrawalHistory();

      addToast({
        type: 'success',
        title: 'Withdrawal Queued! 💰',
        message: `Request for ${numAmount.toLocaleString()} Papaya ($${usdEquiv} USD) is now Pending admin review.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Withdrawal Failed',
        message: err.message || 'Could not submit withdrawal.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Withdrawal['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
          </span>
        );
      case 'processing':
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" /> Processing
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected (Refunded)
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        );
    }
  };

  const currentField = getMethodPlaceholder(selectedMethod);

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

        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          Cashout Desk
        </span>
      </div>

      {/* Main Cashout Form Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md shadow-slate-900/5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Request Cashout</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Available: <span className="font-bold text-[#FF6B35] font-mono-numbers">{formatPapaya(balance)} Papaya</span> ({formatUsd(balance)})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Conversion Rate</span>
            <span className="text-xs font-bold text-slate-800 font-mono-numbers">
              {conversionRate.toLocaleString()} 🍈 = $1.00 USD
            </span>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Select Payout Gateway
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(settings?.supportedWithdrawalMethods || ['bKash', 'Nagad', 'PayPal', 'Payoneer', 'WebMoney', 'Payeer']).map(
              (method) => {
                const isSelected = selectedMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-center transition-all min-h-[44px] flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">{method}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Account Info Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {currentField.label}
          </label>
          <input
            type="text"
            value={accountInfo}
            onChange={(e) => setAccountInfo(e.target.value)}
            placeholder={currentField.placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] text-xs font-medium placeholder:text-slate-400 bg-slate-50/50"
          />
          <p className="text-[11px] text-slate-400 mt-1">{currentField.helper}</p>
        </div>

        {/* Amount Input & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Withdraw Amount (Papaya)</label>
            <button
              type="button"
              onClick={() => setAmountPapaya(String(balance))}
              className="text-[11px] text-[#FF6B35] font-bold hover:underline"
            >
              Use Max Balance
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="1000"
              value={amountPapaya}
              onChange={(e) => setAmountPapaya(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] text-xs font-bold font-mono-numbers text-slate-900 bg-slate-50/50"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
              PAPAYA
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            {[10000, 20000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountPapaya(String(preset))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 transition-colors font-mono-numbers"
              >
                {preset.toLocaleString()} 🍈
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Calculation Summary Box */}
        <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/15 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Estimated USD Equivalent</div>
            <div className="text-base font-extrabold text-[#FF6B35] font-mono-numbers">
              ≈ ${usdEquiv} USD
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            <div>Min: {minWithdrawal.toLocaleString()} Papaya</div>
            <div>Fee: $0.00 (Zero Fee)</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleValidateAndOpenModal}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <span>Continue to Confirmation</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          Withdrawals are reviewed and dispatched manually by administrators within 24–48 hours.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Confirm Withdrawal</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                <span className="text-[11px] text-slate-500">You are withdrawing:</span>
                <div className="text-lg font-extrabold text-[#FF6B35] font-mono-numbers mt-0.5">
                  {numAmount.toLocaleString()} Papaya = ${usdEquiv} USD
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="font-semibold text-slate-900">{selectedMethod}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-400">Recipient Info</span>
                  <span className="font-semibold text-slate-900 font-mono-numbers">{accountInfo}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-400">Balance After</span>
                  <span className="font-semibold text-slate-900 font-mono-numbers">
                    {formatPapaya(balance - numAmount)} Papaya
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Your Papaya points will be deducted immediately and held in escrow while the administrator processes the payment.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e05622] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
          Your Withdrawal History
        </h3>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
        ) : userWithdrawals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No withdrawal requests made yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userWithdrawals.map((wth) => (
              <div key={wth.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{wth.method}</span>
                    <span className="text-slate-400 font-mono-numbers text-[11px]">
                      ({wth.accountInfo})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(wth.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })} · ID: {wth.id}
                  </div>
                  {wth.adminNote && (
                    <div className="text-[11px] text-slate-500 mt-0.5 italic">
                      Note: {wth.adminNote}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 font-mono-numbers">
                    {formatPapaya(wth.papayaAmount)} 🍈 (${wth.usdAmount})
                  </div>
                  <div className="mt-1 flex justify-end">{getStatusBadge(wth.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
