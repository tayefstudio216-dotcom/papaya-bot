import {
  UserProfile,
  Transaction,
  Withdrawal,
  Task,
  SystemSettings,
  BotNotification,
  AdminStatsOverview,
  PaymentMethod,
  AuditLog,
} from '../types/index.ts';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth & Profile
  authenticateTelegram: (params: {
    id: string | number;
    username?: string;
    first_name?: string;
    last_name?: string;
    start_param?: string;
  }) =>
    fetchJson<{ user: UserProfile; settings: Partial<SystemSettings> }>(
      `${API_BASE}/auth/telegram`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  getUserProfile: (userId: string) =>
    fetchJson<{ user: UserProfile; settings: SystemSettings }>(
      `${API_BASE}/user/profile?userId=${encodeURIComponent(userId)}`
    ),

  updatePaymentInfo: (userId: string, paymentAccounts: Partial<UserProfile['paymentAccounts']>) =>
    fetchJson<{ success: boolean; paymentAccounts: UserProfile['paymentAccounts'] }>(
      `${API_BASE}/user/payment-info`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, paymentAccounts }),
      }
    ),

  getUserTransactions: (userId: string) =>
    fetchJson<{ transactions: Transaction[] }>(
      `${API_BASE}/user/transactions?userId=${encodeURIComponent(userId)}`
    ),

  getUserNotifications: (userId: string) =>
    fetchJson<{ notifications: BotNotification[] }>(
      `${API_BASE}/user/notifications?userId=${encodeURIComponent(userId)}`
    ),

  markNotificationRead: (userId: string, notificationId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/user/notifications/mark-read`, {
      method: 'POST',
      body: JSON.stringify({ userId, notificationId }),
    }),

  // Tasks
  getTasks: (userId: string) =>
    fetchJson<{ tasks: Task[] }>(`${API_BASE}/tasks?userId=${encodeURIComponent(userId)}`),

  completeTask: (userId: string, taskId: string) =>
    fetchJson<{ success: boolean; reward: number; newBalance: number; completedTasksCount: number }>(
      `${API_BASE}/tasks/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, taskId }),
      }
    ),

  // Ads Verification (MT ADS & AD ADS)
  startAdSession: (userId: string, adType: 'monetag' | 'adsterra') =>
    fetchJson<{
      sessionId: string;
      minDurationSeconds: number;
      expectedReward: number;
      adType: 'monetag' | 'adsterra';
      todayAdsCount: number;
      dailyLimit: number;
      dailyRemaining: number;
    }>(`${API_BASE}/ads/start-session`, {
      method: 'POST',
      body: JSON.stringify({ userId, adType }),
    }),

  verifyAdComplete: (userId: string, sessionId: string) =>
    fetchJson<{
      success: boolean;
      reward: number;
      newBalance: number;
      todayAdsCount: number;
      dailyLimit: number;
      dailyRemaining: number;
      adLabel: string;
    }>(`${API_BASE}/ads/verify-complete`, {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId }),
    }),

  // Withdrawals
  getUserWithdrawals: (userId: string) =>
    fetchJson<{ withdrawals: Withdrawal[] }>(
      `${API_BASE}/withdrawals?userId=${encodeURIComponent(userId)}`
    ),

  submitWithdrawal: (params: {
    userId: string;
    method: PaymentMethod;
    accountInfo: string;
    papayaAmount: number;
  }) =>
    fetchJson<{ success: boolean; withdrawal: Withdrawal; newBalance: number }>(
      `${API_BASE}/withdrawals`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  // Referrals
  getReferralInfo: (userId: string) =>
    fetchJson<{
      referralCode: string;
      referralUrl: string;
      referralCount: number;
      referralEarnings: number;
      rewardPerReferral: number;
      referredUsers: any[];
    }>(`${API_BASE}/referrals?userId=${encodeURIComponent(userId)}`),

  // Telegram Bot Simulator
  sendBotCommand: (userId: string, command: string) =>
    fetchJson<{
      replyText: string;
      inlineButtons: { text: string; action?: string; url?: string }[];
    }>(`${API_BASE}/bot/command`, {
      method: 'POST',
      body: JSON.stringify({ userId, command }),
    }),

  // Admin APIs
  getAdminOverview: () =>
    fetchJson<{ stats: AdminStatsOverview; settings: SystemSettings }>(`${API_BASE}/admin/overview`),

  getAdminUsers: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    return fetchJson<{ users: UserProfile[] }>(`${API_BASE}/admin/users?${q.toString()}`);
  },

  adminAdjustBalance: (params: {
    adminUsername: string;
    targetUserId: string;
    amount: number;
    reason: string;
  }) =>
    fetchJson<{ success: boolean; newBalance: number }>(
      `${API_BASE}/admin/users/adjust-balance`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  adminUpdateUserStatus: (params: {
    adminUsername: string;
    targetUserId: string;
    status: UserProfile['accountStatus'];
    reason?: string;
  }) =>
    fetchJson<{ success: boolean; status: string }>(`${API_BASE}/admin/users/status`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  adminSetCustomLimits: (params: {
    adminUsername: string;
    targetUserId: string;
    customDailyLimit?: number;
    customMultiplier?: number;
  }) =>
    fetchJson<{ success: boolean; user: UserProfile }>(
      `${API_BASE}/admin/users/custom-limits`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  adminResetDailyLimit: (params: { adminUsername: string; targetUserId: string }) =>
    fetchJson<{ success: boolean; todayAdsCount: number }>(
      `${API_BASE}/admin/users/reset-daily`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  getAdminWithdrawals: (status?: string) =>
    fetchJson<{ withdrawals: Withdrawal[] }>(
      `${API_BASE}/admin/withdrawals${status ? `?status=${status}` : ''}`
    ),

  adminUpdateWithdrawalStatus: (params: {
    adminUsername: string;
    withdrawalId: string;
    status: Withdrawal['status'];
    note?: string;
    txReceipt?: string;
  }) =>
    fetchJson<{ success: boolean; withdrawal: Withdrawal }>(
      `${API_BASE}/admin/withdrawals/status`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  getAdminTasks: () => fetchJson<{ tasks: Task[] }>(`${API_BASE}/admin/tasks`),

  adminCreateTask: (taskData: any) =>
    fetchJson<{ success: boolean; task: Task }>(`${API_BASE}/admin/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  adminUpdateTask: (taskId: string, taskData: any) =>
    fetchJson<{ success: boolean; task: Task }>(`${API_BASE}/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  adminDeleteTask: (taskId: string) =>
    fetchJson<{ success: boolean; deletedTaskId: string }>(`${API_BASE}/admin/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  getAdminSettings: () => fetchJson<{ settings: SystemSettings }>(`${API_BASE}/admin/settings`),

  adminUpdateSettings: (params: { adminUsername: string; newSettings: Partial<SystemSettings> }) =>
    fetchJson<{ success: boolean; settings: SystemSettings }>(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(params),
    }),

  adminBroadcast: (params: { adminUsername: string; title: string; message: string }) =>
    fetchJson<{ success: boolean; recipientCount: number }>(`${API_BASE}/admin/broadcast`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getAdminAuditLogs: () => fetchJson<{ logs: AuditLog[] }>(`${API_BASE}/admin/audit-logs`),

  getAdminAntiFraud: () =>
    fetchJson<{ flaggedUsers: UserProfile[] }>(`${API_BASE}/admin/anti-fraud`),
};
