import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, SystemSettings, BotNotification } from '../types/index.ts';
import { api } from '../services/api.ts';

export type AppView = 'user' | 'admin' | 'bot_simulator';
export type AppTab = 'dashboard' | 'tasks' | 'mt_ads' | 'ad_ads' | 'withdraw' | 'profile' | 'referral';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  user: UserProfile | null;
  settings: SystemSettings | null;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshUserData: () => Promise<void>;
  updateUserLocally: (updater: (prev: UserProfile | null) => UserProfile | null) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  unreadNotifsCount: number;
  notifications: BotNotification[];
  loadNotifications: () => Promise<void>;
  isTelegramWebApp: boolean;
  switchUser: (telegramId: string, username?: string, firstName?: string) => Promise<void>;
  isDemoMode: boolean;
  formatPapaya: (amount: number) => string;
  formatUsd: (papayaAmount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('user');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<BotNotification[]>([]);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const initAuth = useCallback(async (customId?: string, customUsername?: string, customFirstName?: string) => {
    setIsLoading(true);
    try {
      // Check for Telegram WebApp environment
      const tg = (window as any).Telegram?.WebApp;
      let tgUser = tg?.initDataUnsafe?.user;

      if (tg && tgUser?.id) {
        setIsTelegramWebApp(true);
        try {
          tg.ready();
          tg.expand();
        } catch (e) {
          // ignore webapp error
        }
      }

      // Default demo user if not in Telegram WebApp
      const authPayload = customId
        ? {
            id: customId,
            username: customUsername || `user_${customId}`,
            first_name: customFirstName || 'Demo User',
          }
        : tgUser
        ? {
            id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            start_param: tg?.initDataUnsafe?.start_param,
          }
        : {
            id: '987654321',
            username: 'alex_papaya',
            first_name: 'Alex',
            last_name: 'Chen',
          };

      const res = await api.authenticateTelegram(authPayload);
      setUser(res.user);

      // Load full system settings
      const settingsRes = await api.getAdminSettings();
      setSettings(settingsRes.settings);

      // Load user notifications
      const notifsRes = await api.getUserNotifications(res.user.telegramId);
      setNotifications(notifsRes.notifications);
    } catch (err: any) {
      console.error('Initialization error:', err);
      addToast({
        type: 'error',
        title: 'Connection Issue',
        message: err.message || 'Could not connect to Papaya backend server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const res = await api.getUserProfile(user.telegramId);
      setUser(res.user);
      setSettings(res.settings);
      const notifsRes = await api.getUserNotifications(user.telegramId);
      setNotifications(notifsRes.notifications);
    } catch (err: any) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getUserNotifications(user.telegramId);
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  const switchUser = useCallback(
    async (telegramId: string, username?: string, firstName?: string) => {
      await initAuth(telegramId, username, firstName);
      addToast({
        type: 'info',
        title: 'Account Switched',
        message: `Now acting as @${username || telegramId}`,
      });
    },
    [initAuth, addToast]
  );

  const updateUserLocally = useCallback((updater: (prev: UserProfile | null) => UserProfile | null) => {
    setUser(updater);
  }, []);

  const formatPapaya = useCallback((amount: number): string => {
    return (amount || 0).toLocaleString();
  }, []);

  const formatUsd = useCallback(
    (papayaAmount: number): string => {
      const rate = settings?.conversionRate || 10000;
      const usd = (papayaAmount || 0) / rate;
      if (usd >= 1) {
        return `$${usd.toFixed(2)}`;
      }
      return `$${usd.toFixed(3)}`;
    },
    [settings?.conversionRate]
  );

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const isDemoMode = settings?.demoMode ?? true;

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        currentView,
        setCurrentView,
        activeTab,
        setActiveTab,
        isLoading,
        isRefreshing,
        refreshUserData,
        updateUserLocally,
        toasts,
        addToast,
        removeToast,
        unreadNotifsCount,
        notifications,
        loadNotifications,
        isTelegramWebApp,
        switchUser,
        isDemoMode,
        formatPapaya,
        formatUsd,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
