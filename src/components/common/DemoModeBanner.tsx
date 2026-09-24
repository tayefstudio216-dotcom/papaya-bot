import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ShieldAlert, Users, Terminal, RefreshCw, LayoutDashboard } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { currentView, setCurrentView, switchUser, user, isDemoMode, refreshUserData, isRefreshing } = useApp();

  return (
    <aside aria-label="Demo mode warning and switcher" className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-300/40 text-amber-950 text-xs px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
          <ShieldAlert className="w-3 h-3" />
          DEMO MODE
        </span>
        <span className="hidden sm:inline text-slate-700">
          Simulated sandbox environment & ads player. Real backend calculations active.
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Toggle between User Mini App, Bot Simulator, and Admin */}
        <button
          onClick={() => setCurrentView(currentView === 'admin' ? 'user' : 'admin')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            currentView === 'admin'
              ? 'bg-[#FF6B35] text-white hover:bg-[#e05622]'
              : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          {currentView === 'admin' ? '📱 User App' : '⚡ Admin Panel'}
        </button>

        <button
          onClick={() => setCurrentView(currentView === 'bot_simulator' ? 'user' : 'bot_simulator')}
          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
            currentView === 'bot_simulator'
              ? 'bg-slate-900 text-white'
              : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
          }`}
          title="Open interactive Telegram Bot Chat"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Bot Chat</span>
        </button>

        {/* Demo User Switcher Dropdown */}
        <div className="relative group">
          <button
            className="px-2 py-1 rounded-lg text-xs font-medium bg-white/80 hover:bg-white text-slate-700 border border-slate-200 flex items-center gap-1"
            title="Switch demo test accounts"
          >
            <Users className="w-3 h-3 text-[#FF6B35]" />
            <span className="max-w-[70px] truncate">@{user?.username || 'user'}</span>
          </button>
          <div className="hidden group-hover:flex group-focus-within:flex flex-col absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">Switch Demo Account</div>
            <button
              onClick={() => switchUser('987654321', 'alex_papaya', 'Alex')}
              className="text-left px-3 py-1.5 hover:bg-orange-50 text-xs font-medium text-slate-800 flex items-center justify-between"
            >
              <span>@alex_papaya (Normal)</span>
              <span className="text-[10px] text-slate-400">2,450 🍈</span>
            </button>
            <button
              onClick={() => switchUser('554433221', 'crypto_sam', 'Sam')}
              className="text-left px-3 py-1.5 hover:bg-orange-50 text-xs font-medium text-slate-800 flex items-center justify-between"
            >
              <span>@crypto_sam (High)</span>
              <span className="text-[10px] text-slate-400">11,200 🍈</span>
            </button>
            <button
              onClick={() => switchUser('112233445', 'fatima_dxb', 'Fatima')}
              className="text-left px-3 py-1.5 hover:bg-orange-50 text-xs font-medium text-slate-800 flex items-center justify-between"
            >
              <span>@fatima_dxb (New)</span>
              <span className="text-[10px] text-slate-400">850 🍈</span>
            </button>
            <button
              onClick={() => switchUser('667788990', 'bot_spammer_x', 'Spammy')}
              className="text-left px-3 py-1.5 hover:bg-rose-50 text-xs font-medium text-rose-700 flex items-center justify-between"
            >
              <span>@bot_spammer_x (Flagged)</span>
              <span className="text-[10px] text-rose-500">Fraud</span>
            </button>
          </div>
        </div>

        <button
          onClick={refreshUserData}
          disabled={isRefreshing}
          className="p-1 rounded-lg text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF6B35]' : ''}`} />
        </button>
      </div>
    </aside>
  );
};
