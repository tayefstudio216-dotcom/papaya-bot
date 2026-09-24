export type AccountStatus = 'active' | 'suspended' | 'banned' | 'flagged';

export interface UserProfile {
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  balance: number; // in Papaya
  totalEarned: number;
  totalWithdrawn: number;
  completedTasksCount: number;
  todayAdsCount: number;
  lastAdDate: string; // YYYY-MM-DD
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  referralEarnings: number;
  paymentAccounts: {
    bkash?: string;
    nagad?: string;
    paypal?: string;
    payoneer?: string;
    webmoney?: string;
    payeer?: string;
  };
  accountStatus: AccountStatus;
  customDailyLimit?: number;
  customMultiplier?: number;
  registeredAt: string;
  lastActiveAt: string;
  fraudScore?: number;
  fraudFlags?: string[];
}

export type TransactionType =
  | 'ad_reward'
  | 'task_reward'
  | 'referral_reward'
  | 'admin_adjustment'
  | 'withdrawal'
  | 'withdrawal_reversal';

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: TransactionType;
  amount: number; // positive or negative
  balanceAfter: number;
  status: 'completed' | 'pending' | 'reversed';
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'paid' | 'rejected' | 'cancelled';

export type PaymentMethod = 'bKash' | 'Nagad' | 'PayPal' | 'Payoneer' | 'WebMoney' | 'Payeer';

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  method: PaymentMethod;
  accountInfo: string;
  papayaAmount: number;
  usdAmount: number;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  txHashOrReceipt?: string;
}

export type TaskType =
  | 'telegram_channel'
  | 'website_visit'
  | 'social_follow'
  | 'community'
  | 'survey';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number; // in Papaya
  type: TaskType;
  actionUrl: string;
  requiredAction: string;
  status: 'active' | 'inactive';
  remainingSlots: number;
  totalSlots: number;
  instructions: string;
  createdAt: string;
  isCompleted?: boolean;
}

export interface SystemSettings {
  botName: string;
  botUsername: string;
  currencyName: string;
  conversionRate: number; // e.g. 10000 Papaya = $1 USD
  defaultAdReward: number; // e.g. 2 Papaya
  defaultDailyLimit: number; // e.g. 100 ads/day
  minimumWithdrawal: number; // e.g. 10000 Papaya
  adDurationSeconds: number; // e.g. 15 seconds
  referralReward: number; // e.g. 50 Papaya
  referralPercentage: number; // e.g. 5%
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  withdrawalsEnabled: boolean;
  mtAdsEnabled: boolean;
  adAdsEnabled: boolean;
  monetagZoneId: string;
  adsterraDirectKey: string;
  timezone: string;
  supportedWithdrawalMethods: PaymentMethod[];
  demoMode: boolean;
  globalRewardMultiplier: number;
}

export interface AuditLog {
  id: string;
  adminUsername: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  createdAt: string;
}

export interface AdSession {
  sessionId: string;
  userId: string;
  adType: 'monetag' | 'adsterra';
  startedAt: number; // timestamp ms
  minDurationSeconds: number;
  expectedReward: number;
  isRedeemed: boolean;
}

export interface BotNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reward' | 'withdrawal' | 'system' | 'referral' | 'limit';
  read: boolean;
  createdAt: string;
}

export interface AdminStatsOverview {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalPapayaDistributed: number;
  totalWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
  paidWithdrawalsCount: number;
  rejectedWithdrawalsCount: number;
  totalAdCompletions: number;
  totalTasksCompleted: number;
  dailyEarningsHistory: { date: string; amount: number; ads: number }[];
  userGrowthHistory: { date: string; users: number }[];
}
