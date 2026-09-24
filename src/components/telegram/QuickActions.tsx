import React from 'react';
import { useApp, AppTab } from '../../context/AppContext.tsx';
import { CheckSquare, Tv, Megaphone, ArrowUpRight, User } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const actions: { id: AppTab; label: string; sub: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'tasks',
      label: 'TASK',
      sub: 'Social & Bonus',
      icon: <CheckSquare className="w-5 h-5 text-emerald-600" />,
      badge: '5 Available',
    },
    {
      id: 'mt_ads',
      label: 'MT ADS',
      sub: 'Monetag (15s)',
      icon: <Tv className="w-5 h-5 text-[#FF6B35]" />,
      badge: '+2 🍈',
    },
    {
      id: 'ad_ads',
      label: 'AD ADS',
      sub: 'Adsterra (15s)',
      icon: <Megaphone className="w-5 h-5 text-amber-600" />,
      badge: '+2 🍈',
    },
    {
      id: 'withdraw',
      label: 'WITHDRAW',
      sub: 'bKash, PayPal...',
      icon: <ArrowUpRight className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'profile',
      label: 'PROFILE',
      sub: 'Wallet & Payouts',
      icon: <User className="w-5 h-5 text-slate-700" />,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">Quick Actions</h3>
        <span className="text-[11px] text-slate-400 font-medium">Select action</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const isActive = activeTab === act.id;
          return (
            <button
              key={act.id}
              onClick={() => setActiveTab(act.id)}
              className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all min-h-[74px] active:scale-[0.98] ${
                isActive
                  ? 'bg-white border-[#FF6B35] shadow-md shadow-orange-500/10 ring-1 ring-[#FF6B35]'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80">
                  {act.icon}
                </div>
                {act.badge && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                    {act.badge}
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <div className="text-xs font-bold text-slate-900 leading-tight tracking-tight">
                  {act.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {act.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
