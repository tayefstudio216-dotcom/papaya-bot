import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ASSETS } from '../../constants/assets.ts';
import { Bell, Settings, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.ts';

export const TelegramHeader: React.FC = () => {
  const { user, unreadNotifsCount, notifications, setActiveTab, loadNotifications, isTelegramWebApp } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleMarkAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      await api.markNotificationRead(user.telegramId, notifId);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 flex items-center justify-between transition-colors">
        {/* Left: Papaya Bot Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-orange-100 bg-[#FF6B35]/10 flex items-center justify-center shrink-0">
            <img
              src={ASSETS.papayaLogo}
              alt="Papaya Bot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to text logo if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-base select-none">🍈</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-tight text-slate-900 leading-none">
                Papaya Bot
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
              Rewards Platform
            </p>
          </div>
        </div>

        {/* Center/Right: User Avatar, Username, Notification & Settings */}
        <div className="flex items-center gap-2">
          {/* User profile trigger */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors min-h-[38px]"
            title="Open Profile"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-100 shrink-0 border border-white">
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
                alt={user?.username || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate">
              @{user?.username || 'user'}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B35] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] mt-12 animate-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                <span className="text-[11px] text-slate-400">Activity and payout alerts</span>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`pt-2 pb-1.5 px-2 rounded-xl transition-colors ${
                      n.read ? 'opacity-70 bg-transparent' : 'bg-orange-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-[10px] text-[#FF6B35] hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                    <div className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">App Preferences</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Telegram WebApp Status</p>
                  <p className="text-slate-400 text-[11px]">
                    {isTelegramWebApp ? 'Running inside Telegram' : 'Standalone Browser Mode'}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ready
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Official Telegram Bot</p>
                  <p className="text-slate-400 text-[11px]">@PapayaRewardBot</p>
                </div>
                <a
                  href="https://t.me/telegram"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FF6B35] font-semibold hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setActiveTab('profile');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
                >
                  Manage Payment Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
