import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const DailyProgressCard: React.FC = () => {
  const { user, settings, setActiveTab } = useApp();

  const completed = user?.todayAdsCount ?? 0;
  const limit = user?.customDailyLimit || settings?.defaultDailyLimit || 100;
  const percentage = Math.min(100, Math.round((completed / limit) * 100));
  const remaining = Math.max(0, limit - completed);
  const isLimitReached = completed >= limit;

  // Potential earnings remaining today
  const potentialRemainingPapaya = remaining * (settings?.defaultAdReward ?? 2);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Today's Completed Ads
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 font-mono-numbers">
          <span className="text-[#FF6B35] font-bold">{completed}</span>
          <span className="text-slate-400">/</span>
          <span>{limit}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isLimitReached ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-400 to-[#FF6B35]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        {isLimitReached ? (
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Daily limit reached. Come back tomorrow!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>{remaining} ads left today</span>
            <span aria-hidden="true">·</span>
            <span className="text-orange-600 font-medium">+{potentialRemainingPapaya} Papaya waiting</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Resets 00:00 UTC</span>
        </div>
      </div>
    </div>
  );
};
