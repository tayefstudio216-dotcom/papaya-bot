import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Transaction } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { Tv, CheckSquare, Users, ArrowUpRight, RotateCcw, Sliders, ArrowDownRight } from 'lucide-react';

export const RecentActivityList: React.FC<{ limit?: number }> = ({ limit = 6 }) => {
  const { user, formatPapaya } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    api.getUserTransactions(user.telegramId)
      .then(res => setTransactions(res.transactions))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user, user?.balance]);

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'ads') return t.type === 'ad_reward';
    if (filter === 'tasks') return t.type === 'task_reward';
    if (filter === 'withdrawals') return t.type === 'withdrawal' || t.type === 'withdrawal_reversal';
    return true;
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'ad_reward':
        return <Tv className="w-3.5 h-3.5 text-[#FF6B35]" />;
      case 'task_reward':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'referral_reward':
        return <Users className="w-3.5 h-3.5 text-blue-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />;
      case 'withdrawal_reversal':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'admin_adjustment':
        return <Sliders className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <ArrowDownRight className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
          Wallet Activity
        </h3>

        {/* Filter buttons with touch target */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px]">
          {['all', 'ads', 'tasks', 'withdrawals'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-md font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading transactions...</div>
      ) : displayList.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No transactions found under this category.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {displayList.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-bold font-mono-numbers ${
                      isPositive ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isPositive ? `+${formatPapaya(tx.amount)}` : formatPapaya(tx.amount)} 🍈
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-numbers">
                    Bal: {formatPapaya(tx.balanceAfter)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
