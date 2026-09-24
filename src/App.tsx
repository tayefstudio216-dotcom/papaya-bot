import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { DemoModeBanner } from './components/common/DemoModeBanner.tsx';
import { TelegramHeader } from './components/telegram/TelegramHeader.tsx';
import { TelegramBottomNav } from './components/telegram/TelegramBottomNav.tsx';
import { DashboardTab } from './components/tabs/DashboardTab.tsx';
import { TasksTab } from './components/tabs/TasksTab.tsx';
import { MtAdsTab } from './components/tabs/MtAdsTab.tsx';
import { AdAdsTab } from './components/tabs/AdAdsTab.tsx';
import { WithdrawTab } from './components/tabs/WithdrawTab.tsx';
import { ProfileTab } from './components/tabs/ProfileTab.tsx';
import { ReferralTab } from './components/tabs/ReferralTab.tsx';
import { TelegramBotChatSimulator } from './components/telegram/TelegramBotChatSimulator.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { ASSETS } from './constants/assets.ts';

const MainContent: React.FC = () => {
  const { currentView, activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-orange-200 bg-orange-100 p-1 mb-4 animate-pulse">
          <img
            src={ASSETS.papayaLogo}
            alt="Papaya Bot"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="font-display font-bold text-lg text-slate-900">Papaya Bot</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Telegram session...</p>
      </div>
    );
  }

  // 1. ADMIN PANEL VIEW
  if (currentView === 'admin') {
    return (
      <>
        <DemoModeBanner />
        <AdminLayout />
      </>
    );
  }

  // 2. TELEGRAM BOT CHAT SIMULATOR VIEW
  if (currentView === 'bot_simulator') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4">
        <DemoModeBanner />
        <div className="w-full max-w-lg mt-3">
          <TelegramBotChatSimulator />
        </div>
      </div>
    );
  }

  // 3. USER TELEGRAM MINI APP VIEW (Mobile-first)
  return (
    <div className="min-h-screen bg-[#F1F3F5] text-slate-900 flex flex-col items-center">
      {/* Top Demo Bar */}
      <DemoModeBanner />

      {/* Main Telegram Mini App Mobile Viewport */}
      <div className="w-full max-w-md bg-[#F8F9FA] min-h-screen shadow-2xl flex flex-col pb-24 relative border-x border-slate-200/60">
        {/* Telegram App Header */}
        <TelegramHeader />

        {/* Dynamic Tab Contents */}
        <main className="p-4 flex-1">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'mt_ads' && <MtAdsTab />}
          {activeTab === 'ad_ads' && <AdAdsTab />}
          {activeTab === 'withdraw' && <WithdrawTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'referral' && <ReferralTab />}
        </main>

        {/* Telegram Bottom Navigation */}
        <TelegramBottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastContainer />
      <MainContent />
    </AppProvider>
  );
}
