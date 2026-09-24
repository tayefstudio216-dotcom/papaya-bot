import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ASSETS } from '../../constants/assets.ts';
import {
  LayoutDashboard,
  Users,
  ArrowUpRight,
  Tv,
  CheckSquare,
  Settings,
  ShieldAlert,
  FileText,
  Megaphone,
  Smartphone,
  LogOut,
  Bell
} from 'lucide-react';
import { AdminOverview } from './AdminOverview.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminWithdrawals } from './AdminWithdrawals.tsx';
import { AdminTasks } from './AdminTasks.tsx';
import { AdminAds } from './AdminAds.tsx';
import { AdminSettings } from './AdminSettings.tsx';
import { AdminAuditLogs } from './AdminAuditLogs.tsx';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'withdrawals'
  | 'tasks'
  | 'ads'
  | 'settings'
  | 'audit';

export const AdminLayout: React.FC = () => {
  const { setCurrentView } = useApp();
  const [section, setSection] = useState<AdminSection>('overview');

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users Management', icon: <Users className="w-4 h-4" /> },
    { id: 'withdrawals', label: 'Withdrawals Desk', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'tasks', label: 'Task Center', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'ads', label: 'Ads (MT & AD)', icon: <Tv className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs & Fraud', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop/Tablet Sidebar */}
      <aside aria-label="Admin Navigation" className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col border-r border-slate-800">
        {/* Brand Lockup */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#FF6B35]/20 border border-orange-400/30 flex items-center justify-center shrink-0">
              <img
                src={ASSETS.papayaLogo}
                alt="Papaya Admin"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Papaya Admin</span>
              </div>
              <p className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase">
                Control Center
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Admin Navigation Links" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF6B35] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Switcher back to User App */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setCurrentView('user')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Smartphone className="w-4 h-4 text-[#FF6B35]" />
            <span>Switch to User Mini App</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 capitalize">
              {section === 'overview' && 'System Overview & Analytics'}
              {section === 'users' && 'User Accounts & Balances'}
              {section === 'withdrawals' && 'Payout Requests & Approval'}
              {section === 'tasks' && 'Tasks Management'}
              {section === 'ads' && 'Monetag & Adsterra Configuration'}
              {section === 'settings' && 'Global App & Currency Settings'}
              {section === 'audit' && 'Security Audit & Anti-Fraud Logs'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Admin: <strong>SuperAdmin</strong></span>
            </div>

            <button
              onClick={() => setCurrentView('user')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>User App</span>
            </button>
          </div>
        </header>

        {/* Section View */}
        <div className="p-6">
          {section === 'overview' && <AdminOverview onNavigate={setSection} />}
          {section === 'users' && <AdminUsers />}
          {section === 'withdrawals' && <AdminWithdrawals />}
          {section === 'tasks' && <AdminTasks />}
          {section === 'ads' && <AdminAds />}
          {section === 'settings' && <AdminSettings />}
          {section === 'audit' && <AdminAuditLogs />}
        </div>
      </main>
    </div>
  );
};
