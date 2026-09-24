import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ASSETS } from '../../constants/assets.ts';
import { ArrowUpRight, TrendingUp, Sparkles, Wallet } from 'lucide-react';

export const BalanceCard: React.FC = () => {
  const { user, settings, setActiveTab, formatPapaya, formatUsd } = useApp();

  const balance = user?.balance ?? 0;
  const totalEarned = user?.totalEarned ?? 0;
  // Estimate today's earnings from today ads (2 Papaya each) + starter or tasks today
  const todayAdsEarnings = (user?.todayAdsCount ?? 0) * (settings?.defaultAdReward ?? 2);
  const conversionRate = settings?.conversionRate || 10000;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B35] via-[#FF7A00] to-[#E85D04] text-white p-6 shadow-xl shadow-orange-500/20 transition-all">
      {/* Background subtle glow shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />

      {/* Top row: Label & 3D Papaya Coin */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-orange-100 text-xs font-semibold tracking-wide uppercase">
            <Wallet className="w-3.5 h-3.5 text-white" />
            <span>Papaya Balance</span>
          </div>
          
          {/* Main Large Balance */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white font-mono-numbers">
              {formatPapaya(balance)}
            </span>
            <span className="text-orange-200 text-sm font-bold tracking-wider">
              PAPAYA
            </span>
          </div>

          {/* Informational USD Equivalent */}
          <div className="mt-1 flex items-center gap-2 text-xs font-medium text-orange-100">
            <span>≈ {formatUsd(balance)} USD</span>
            <span className="text-orange-300" aria-hidden="true">·</span>
            <span className="text-[11px] text-orange-200/90 font-mono-numbers">
              {conversionRate.toLocaleString()} 🍈 = $1
            </span>
          </div>
        </div>

        {/* 3D Coin Badge */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/30 bg-white/20 p-1 shrink-0 backdrop-blur-xs">
          <img
            src={ASSETS.papayaCoin}
            alt="Papaya Coin"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Bottom row: Today's Earnings, Total Earned & Withdraw Quick Action */}
      <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-5 text-xs">
          <div>
            <div className="text-[11px] text-orange-100/80 font-medium">Today's Earned</div>
            <div className="font-semibold text-white font-mono-numbers mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-300" />
              +{formatPapaya(todayAdsEarnings)} 🍈
            </div>
          </div>

          <div className="w-px h-7 bg-white/15" aria-hidden="true" />

          <div>
            <div className="text-[11px] text-orange-100/80 font-medium">Total Lifetime</div>
            <div className="font-semibold text-white font-mono-numbers mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              {formatPapaya(totalEarned)} 🍈
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('withdraw')}
          className="px-3.5 py-2 rounded-xl bg-white text-[#FF6B35] font-bold text-xs shadow-md hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <span>Cashout</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
