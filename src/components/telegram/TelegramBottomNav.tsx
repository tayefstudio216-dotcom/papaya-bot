import React from 'react';
import { useApp, AppTab } from '../../context/AppContext.tsx';
import { Home, CheckSquare, Tv, Megaphone, ArrowUpRight, Users } from 'lucide-react';

export const TelegramBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'mt_ads', label: 'MT Ads', icon: <Tv className="w-5 h-5" /> },
    { id: 'ad_ads', label: 'AD Ads', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'withdraw', label: 'Cashout', icon: <ArrowUpRight className="w-5 h-5" /> },
    { id: 'referral', label: 'Referral', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-2 py-1 max-w-lg mx-auto">
      <div className="grid grid-cols-6 items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] ${
                isActive ? 'text-[#FF6B35]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B35]" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
