import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Withdrawal } from '../../types/index.ts';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  X,
  CreditCard,
  FileCheck
} from 'lucide-react';

export const AdminWithdrawals: React.FC = () => {
  const { formatPapaya, addToast } = useApp();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected withdrawal for action modal
  const [activeWithdrawal, setActiveWithdrawal] = useState<Withdrawal | null>(null);
  const [actionType, setActionType] = useState<'pay' | 'reject' | 'process' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [txReceipt, setTxReceipt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminWithdrawals(statusFilter === 'all' ? undefined : statusFilter);
      setWithdrawals(res.withdrawals);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  const handleOpenActionModal = (wth: Withdrawal, type: 'pay' | 'reject' | 'process') => {
    setActiveWithdrawal(wth);
    setActionType(type);
    setAdminNote(wth.adminNote || '');
    setTxReceipt(wth.txHashOrReceipt || '');
  };

  const handleConfirmAction = async () => {
    if (!activeWithdrawal || !actionType) return;

    if (actionType === 'pay' && !txReceipt) {
      addToast({
        type: 'warning',
        title: 'Receipt ID Recommended',
        message: 'Providing a TrxID or receipt number is recommended for audit tracking.',
      });
    }

    if (actionType === 'reject' && !adminNote) {
      addToast({
        type: 'error',
        title: 'Rejection Reason Required',
        message: 'Please provide a clear rejection note explaining why points were refunded.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const targetStatus: Withdrawal['status'] =
        actionType === 'pay' ? 'paid' : actionType === 'reject' ? 'rejected' : 'processing';

      await api.adminUpdateWithdrawalStatus({
        adminUsername: 'SuperAdmin',
        withdrawalId: activeWithdrawal.id,
        status: targetStatus,
        note: adminNote.trim(),
        txReceipt: txReceipt.trim(),
      });

      addToast({
        type: 'success',
        title: `Withdrawal ${targetStatus.toUpperCase()}`,
        message: `ID ${activeWithdrawal.id} updated. Audit log recorded.`,
      });

      setActiveWithdrawal(null);
      setActionType(null);
      await loadWithdrawals();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update withdrawal status.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Withdrawal Requests Queue
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manual approval & payout disbursement workflow
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['all', 'pending', 'processing', 'paid', 'rejected'].map((st) => (
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

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Withdrawal ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Gateway & Account</th>
                <th className="py-3 px-4">Papaya Amount</th>
                <th className="py-3 px-4">USD Value</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading payout queue...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No withdrawals found in this view.</td>
                </tr>
              ) : (
                withdrawals.map((wth) => (
                  <tr key={wth.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {wth.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">@{wth.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono-numbers">ID: {wth.userId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{wth.method}</span>
                      <div className="text-[11px] text-slate-500 font-mono-numbers">{wth.accountInfo}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#FF6B35] font-mono-numbers">
                      {formatPapaya(wth.papayaAmount)} 🍈
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono-numbers">
                      ${wth.usdAmount.toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(wth.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      {wth.status === 'paid' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                        </span>
                      )}
                      {wth.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      )}
                      {wth.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-blue-600 animate-spin" /> Processing
                        </span>
                      )}
                      {wth.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {wth.status !== 'paid' && (
                          <button
                            onClick={() => handleOpenActionModal(wth, 'pay')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {wth.status === 'pending' && (
                          <button
                            onClick={() => handleOpenActionModal(wth, 'process')}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                          >
                            Process
                          </button>
                        )}
                        {wth.status !== 'rejected' && wth.status !== 'paid' && (
                          <button
                            onClick={() => handleOpenActionModal(wth, 'reject')}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors"
                          >
                            Reject & Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Processing Modal */}
      {activeWithdrawal && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {actionType === 'pay' && 'Confirm Mark Paid & Sent'}
                {actionType === 'reject' && 'Reject Withdrawal & Refund Balance'}
                {actionType === 'process' && 'Mark as In-Processing'}
              </h3>
              <button
                onClick={() => {
                  setActiveWithdrawal(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Withdrawal ID:</span>
                  <span className="font-mono font-bold text-slate-900">{activeWithdrawal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-slate-900">@{activeWithdrawal.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payout Details:</span>
                  <span className="font-bold text-slate-900 font-mono-numbers">
                    {activeWithdrawal.method} ({activeWithdrawal.accountInfo})
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400">Amount to send:</span>
                  <span className="font-extrabold text-[#FF6B35] font-mono-numbers text-sm">
                    ${activeWithdrawal.usdAmount.toFixed(2)} USD ({formatPapaya(activeWithdrawal.papayaAmount)} 🍈)
                  </span>
                </div>
              </div>

              {actionType === 'pay' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Transaction Hash / Receipt ID
                  </label>
                  <input
                    type="text"
                    value={txReceipt}
                    onChange={(e) => setTxReceipt(e.target.value)}
                    placeholder="e.g. bKash TrxID: 9BK49281 or PayPal TXN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Included in user's Telegram confirmation receipt.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Admin Note {actionType === 'reject' && '(Mandatory for refund)'}
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={actionType === 'reject' ? 'e.g. Invalid account number entered' : 'Internal notes...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {actionType === 'reject' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px] leading-relaxed">
                  <strong>Automatic Reversal:</strong> Rejecting will immediately refund {formatPapaya(activeWithdrawal.papayaAmount)} Papaya back to @{activeWithdrawal.username}'s wallet and record a reversal transaction.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveWithdrawal(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-colors ${
                  actionType === 'pay'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
