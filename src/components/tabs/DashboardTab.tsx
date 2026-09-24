import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BalanceCard } from '../telegram/BalanceCard.tsx';
import { QuickActions } from '../telegram/QuickActions.tsx';
import { DailyProgressCard } from '../telegram/DailyProgressCard.tsx';
import { RecentActivityList } from '../telegram/RecentActivityList.tsx';
import { Tv, Megaphone, ArrowUpRight, CheckSquare, Sparkles } from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const { setActiveTab, settings, user } = useApp();

  return (
    <div className="space-y-4">
      {/* 1. Main Balance Card */}
      <BalanceCard />

      {/* 2. Quick Actions Bar */}
      <QuickActions />

      {/* 3. Daily Ad Progress Tracker */}
      <DailyProgressCard />

      {/* 4. Interactive Ad Banners / Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* MT ADS Shortcut Card */}
        <div
          onClick={() => setActiveTab('mt_ads')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B35]">
              <Tv className="w-3.5 h-3.5" />
              <span>MT ADS (Monetag)</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-1">Watch 15s Sponsor Ad</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Earn +2 Papaya per completed view</p>
          </div>
          <span className="p-2 rounded-xl bg-orange-50 group-hover:bg-[#FF6B35] group-hover:text-white text-[#FF6B35] transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>

        {/* AD ADS Shortcut Card */}
        <div
          onClick={() => setActiveTab('ad_ads')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <Megaphone className="w-3.5 h-3.5" />
              <span>AD ADS (Adsterra)</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-1">Stream Native Partner Ad</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Earn +2 Papaya per completed view</p>
          </div>
          <span className="p-2 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-white text-amber-600 transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* 5. Recent Wallet Activity Ledger */}
      <RecentActivityList limit={5} />
    </div>
  );
};
