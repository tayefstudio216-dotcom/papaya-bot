import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  UserProfile,
  Transaction,
  Withdrawal,
  Task,
  SystemSettings,
  AuditLog,
  AdSession,
  BotNotification,
  AdminStatsOverview,
  PaymentMethod
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json());

// In-Memory / Persistent State
interface DatabaseState {
  users: Record<string, UserProfile>;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  tasks: Task[];
  completedTasks: Record<string, string[]>; // userId -> taskId[]
  adSessions: Record<string, AdSession>;
  notifications: BotNotification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  botName: 'Papaya Bot',
  botUsername: 'PapayaRewardBot',
  currencyName: 'Papaya',
  conversionRate: 10000, // 10,000 Papaya = $1 USD
  defaultAdReward: 2, // 2 Papaya per ad
  defaultDailyLimit: 100, // 100 ads/day
  minimumWithdrawal: 10000, // 10,000 Papaya
  adDurationSeconds: 15, // 15s per ad required
  referralReward: 50,
  referralPercentage: 5,
  maintenanceMode: false,
  registrationEnabled: true,
  withdrawalsEnabled: true,
  mtAdsEnabled: true,
  adAdsEnabled: true,
  monetagZoneId: 'MT-884920-REWARDED',
  adsterraDirectKey: 'ADST-991204-POP',
  timezone: 'UTC',
  supportedWithdrawalMethods: ['bKash', 'Nagad', 'PayPal', 'Payoneer', 'WebMoney', 'Payeer'],
  demoMode: true,
  globalRewardMultiplier: 1.0,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_tg_channel',
    title: 'Join Official Papaya Channel',
    description: 'Subscribe to our official Telegram announcements channel for promo codes and updates.',
    reward: 100,
    type: 'telegram_channel',
    actionUrl: 'https://t.me/PapayaChannel',
    requiredAction: 'Join Telegram Channel',
    status: 'active',
    remainingSlots: 9420,
    totalSlots: 10000,
    instructions: 'Open the link, join @PapayaChannel, then click Verify.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'task_tg_community',
    title: 'Join Global Discussion Group',
    description: 'Chat with other Papaya Bot community members and share payment proofs.',
    reward: 75,
    type: 'community',
    actionUrl: 'https://t.me/PapayaChatGroup',
    requiredAction: 'Join Telegram Group',
    status: 'active',
    remainingSlots: 4500,
    totalSlots: 5000,
    instructions: 'Join the chat and say hello to the community!',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'task_visit_partner',
    title: 'Explore Partner Crypto Hub',
    description: 'Visit our featured partner web hub and view their trending reward programs.',
    reward: 30,
    type: 'website_visit',
    actionUrl: 'https://telegram.org',
    requiredAction: 'Visit Partner Website (10s)',
    status: 'active',
    remainingSlots: 1820,
    totalSlots: 2000,
    instructions: 'Stay on the page for at least 10 seconds before returning.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'task_social_x',
    title: 'Follow Papaya Bot on X',
    description: 'Stay ahead with live payment drops and flash bonus events on X.',
    reward: 50,
    type: 'social_follow',
    actionUrl: 'https://x.com',
    requiredAction: 'Follow on X / Twitter',
    status: 'active',
    remainingSlots: 7100,
    totalSlots: 8000,
    instructions: 'Follow our account and interact with the pinned post.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task_feedback_survey',
    title: 'Complete 1-Minute User Survey',
    description: 'Help us improve the Papaya Bot experience and your payout speed.',
    reward: 60,
    type: 'survey',
    actionUrl: 'https://forms.google.com',
    requiredAction: 'Fill Brief Feedback Form',
    status: 'active',
    remainingSlots: 890,
    totalSlots: 1000,
    instructions: 'Answer 3 quick questions about your favorite withdrawal methods.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Seed realistic demo users
const SEED_USERS: Record<string, UserProfile> = {
  '987654321': {
    telegramId: '987654321',
    username: 'alex_papaya',
    firstName: 'Alex',
    lastName: 'Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex_papaya',
    balance: 2450,
    totalEarned: 14250,
    totalWithdrawn: 10000,
    completedTasksCount: 4,
    todayAdsCount: 13,
    lastAdDate: new Date().toISOString().split('T')[0],
    referralCode: 'PAPAYA_ALEX',
    referredBy: null,
    referralCount: 8,
    referralEarnings: 400,
    paymentAccounts: {
      bkash: '+8801712345678',
      paypal: 'alex.chen@example.com',
    },
    accountStatus: 'active',
    registeredAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  '554433221': {
    telegramId: '554433221',
    username: 'crypto_sam',
    firstName: 'Sam',
    lastName: 'Miller',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=crypto_sam',
    balance: 11200,
    totalEarned: 21200,
    totalWithdrawn: 10000,
    completedTasksCount: 5,
    todayAdsCount: 45,
    lastAdDate: new Date().toISOString().split('T')[0],
    referralCode: 'PAPAYA_SAM',
    referredBy: 'PAPAYA_ALEX',
    referralCount: 14,
    referralEarnings: 700,
    paymentAccounts: {
      nagad: '+8801898765432',
      payeer: 'P10982345',
    },
    accountStatus: 'active',
    registeredAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  '112233445': {
    telegramId: '112233445',
    username: 'fatima_dxb',
    firstName: 'Fatima',
    lastName: 'Noor',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=fatima_dxb',
    balance: 850,
    totalEarned: 850,
    totalWithdrawn: 0,
    completedTasksCount: 1,
    todayAdsCount: 8,
    lastAdDate: new Date().toISOString().split('T')[0],
    referralCode: 'PAPAYA_FATIMA',
    referredBy: 'PAPAYA_ALEX',
    referralCount: 2,
    referralEarnings: 100,
    paymentAccounts: {
      webmoney: 'Z892348123984',
    },
    accountStatus: 'active',
    registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  '667788990': {
    telegramId: '667788990',
    username: 'bot_spammer_x',
    firstName: 'Spammy',
    lastName: 'Automator',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=spam',
    balance: 40,
    totalEarned: 40,
    totalWithdrawn: 0,
    completedTasksCount: 0,
    todayAdsCount: 20,
    lastAdDate: new Date().toISOString().split('T')[0],
    referralCode: 'PAPAYA_SPAM',
    referredBy: null,
    referralCount: 0,
    referralEarnings: 0,
    paymentAccounts: {},
    accountStatus: 'flagged',
    fraudScore: 88,
    fraudFlags: ['Rapid 1-second ad submissions detected', 'Automated headless user-agent'],
    registeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
};

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_101',
    userId: '987654321',
    username: 'alex_papaya',
    type: 'ad_reward',
    amount: 2,
    balanceAfter: 2450,
    status: 'completed',
    description: 'Watched Monetag Ad (MT ADS)',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'tx_seed_102',
    userId: '987654321',
    username: 'alex_papaya',
    type: 'ad_reward',
    amount: 2,
    balanceAfter: 2448,
    status: 'completed',
    description: 'Watched Adsterra Ad (AD ADS)',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'tx_seed_103',
    userId: '987654321',
    username: 'alex_papaya',
    type: 'task_reward',
    amount: 100,
    balanceAfter: 2446,
    status: 'completed',
    description: 'Completed Task: Join Official Papaya Channel',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'tx_seed_104',
    userId: '987654321',
    username: 'alex_papaya',
    type: 'referral_reward',
    amount: 50,
    balanceAfter: 2346,
    status: 'completed',
    description: 'Referral reward from @fatima_dxb registration',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tx_seed_105',
    userId: '987654321',
    username: 'alex_papaya',
    type: 'withdrawal',
    amount: -10000,
    balanceAfter: 1250,
    status: 'completed',
    description: 'Withdrawal to bKash (+8801712345678) - $1.00 USD',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'tx_seed_106',
    userId: '554433221',
    username: 'crypto_sam',
    type: 'withdrawal',
    amount: -10000,
    balanceAfter: 11200,
    status: 'completed',
    description: 'Withdrawal to Nagad (+8801898765432) - $1.00 USD',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const SEED_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'WTH-994101',
    userId: '987654321',
    username: 'alex_papaya',
    firstName: 'Alex',
    method: 'bKash',
    accountInfo: '+8801712345678',
    papayaAmount: 10000,
    usdAmount: 1.00,
    status: 'paid',
    adminNote: 'Sent via bKash personal payment TrxID: 9BK49281',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6.8).toISOString(),
    txHashOrReceipt: 'TrxID: 9BK49281',
  },
  {
    id: 'WTH-994102',
    userId: '554433221',
    username: 'crypto_sam',
    firstName: 'Sam',
    method: 'Nagad',
    accountInfo: '+8801898765432',
    papayaAmount: 10000,
    usdAmount: 1.00,
    status: 'paid',
    adminNote: 'Processed via merchant gateway Nagad',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2.9).toISOString(),
    txHashOrReceipt: 'NAGAD-982144',
  },
  {
    id: 'WTH-994103',
    userId: '554433221',
    username: 'crypto_sam',
    firstName: 'Sam',
    method: 'Payeer',
    accountInfo: 'P10982345',
    papayaAmount: 10000,
    usdAmount: 1.00,
    status: 'pending',
    adminNote: 'Waiting for manual admin review',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_01',
    adminUsername: 'AdminSuper',
    action: 'WITHDRAWAL_PAID',
    targetUserId: '987654321',
    targetUserName: 'alex_papaya',
    details: 'Approved and marked Paid withdrawal WTH-994101 (10,000 Papaya = $1.00 USD to bKash)',
    createdAt: new Date(Date.now() - 86400000 * 6.8).toISOString(),
  },
  {
    id: 'audit_02',
    adminUsername: 'AdminSuper',
    action: 'USER_FLAGGED',
    targetUserId: '667788990',
    targetUserName: 'bot_spammer_x',
    details: 'Flagged account for suspicious 1s ad completion requests',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'audit_03',
    adminUsername: 'AdminSuper',
    action: 'SETTINGS_UPDATE',
    details: 'Updated default ad reward to 2 Papaya and verified conversion 10,000 Papaya = $1 USD',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  }
];

const db: DatabaseState = {
  users: { ...SEED_USERS },
  transactions: [...SEED_TRANSACTIONS],
  withdrawals: [...SEED_WITHDRAWALS],
  tasks: [...INITIAL_TASKS],
  completedTasks: {
    '987654321': ['task_tg_channel', 'task_tg_community', 'task_visit_partner', 'task_social_x'],
    '554433221': ['task_tg_channel', 'task_tg_community', 'task_visit_partner', 'task_social_x', 'task_feedback_survey'],
    '112233445': ['task_tg_channel'],
  },
  adSessions: {},
  notifications: [
    {
      id: 'notif_welcome',
      userId: '987654321',
      title: 'Welcome to Papaya Bot!',
      message: 'Start watching 15s ads and completing quick tasks to earn real Papaya points.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: 'notif_paid_wth',
      userId: '987654321',
      title: 'Withdrawal Approved & Paid',
      message: 'Your withdrawal of 10,000 Papaya ($1.00 USD) via bKash has been processed successfully.',
      type: 'withdrawal',
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 6.8).toISOString(),
    }
  ],
  auditLogs: [...SEED_AUDIT_LOGS],
  settings: { ...DEFAULT_SETTINGS },
};

// Helper: Check and reset daily limit if day has changed
function checkAndResetDailyLimit(user: UserProfile): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  if (user.lastAdDate !== todayStr) {
    user.todayAdsCount = 0;
    user.lastAdDate = todayStr;
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// TELEGRAM AUTH / START ROUTE
// -------------------------------------------------------------
app.post('/api/auth/telegram', (req: Request, res: Response) => {
  const { id, username, first_name, last_name, start_param } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Telegram user ID is required.' });
  }

  const telegramId = String(id);
  const now = new Date().toISOString();

  let user = db.users[telegramId];

  if (!user) {
    if (!db.settings.registrationEnabled) {
      return res.status(403).json({ error: 'New user registrations are currently disabled by administration.' });
    }

    // New user registration
    const refCode = `PAPAYA_${username ? username.toUpperCase() : telegramId.slice(-6)}`;
    let referrer: UserProfile | null = null;

    if (start_param && typeof start_param === 'string') {
      const cleanRef = start_param.trim().toUpperCase();
      // Find referrer user by code
      const found = Object.values(db.users).find(u => u.referralCode.toUpperCase() === cleanRef);
      if (found && found.telegramId !== telegramId) {
        referrer = found;
      }
    }

    user = {
      telegramId,
      username: username || `user_${telegramId.slice(-4)}`,
      firstName: first_name || 'Papaya User',
      lastName: last_name || '',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username || telegramId}`,
      balance: 10, // 10 Papaya welcome starter bonus
      totalEarned: 10,
      totalWithdrawn: 0,
      completedTasksCount: 0,
      todayAdsCount: 0,
      lastAdDate: now.split('T')[0],
      referralCode: refCode,
      referredBy: referrer ? referrer.referralCode : null,
      referralCount: 0,
      referralEarnings: 0,
      paymentAccounts: {},
      accountStatus: 'active',
      registeredAt: now,
      lastActiveAt: now,
    };

    db.users[telegramId] = user;
    db.completedTasks[telegramId] = [];

    // Starter welcome transaction
    db.transactions.unshift({
      id: `tx_welcome_${Date.now()}`,
      userId: telegramId,
      username: user.username,
      type: 'admin_adjustment',
      amount: 10,
      balanceAfter: 10,
      status: 'completed',
      description: 'Welcome bonus for joining Papaya Bot! 🎉',
      createdAt: now,
    });

    // Credit referrer if applicable
    if (referrer) {
      referrer.referralCount += 1;
      const refBonus = db.settings.referralReward;
      referrer.balance += refBonus;
      referrer.totalEarned += refBonus;
      referrer.referralEarnings += refBonus;

      db.transactions.unshift({
        id: `tx_ref_${Date.now()}`,
        userId: referrer.telegramId,
        username: referrer.username,
        type: 'referral_reward',
        amount: refBonus,
        balanceAfter: referrer.balance,
        status: 'completed',
        description: `Referral bonus from new member @${user.username}`,
        createdAt: now,
      });

      db.notifications.unshift({
        id: `notif_ref_${Date.now()}`,
        userId: referrer.telegramId,
        title: 'New Referral Joined! 👥',
        message: `@${user.username} joined via your referral link. +${refBonus} Papaya added to your balance!`,
        type: 'referral',
        read: false,
        createdAt: now,
      });
    }

    db.notifications.unshift({
      id: `notif_start_${Date.now()}`,
      userId: telegramId,
      title: 'Welcome to Papaya Bot! 🍈',
      message: 'Account created. You received a 10 Papaya welcome gift. Complete tasks or watch ads to earn more!',
      type: 'system',
      read: false,
      createdAt: now,
    });
  } else {
    // Existing user login
    user.lastActiveAt = now;
    if (username && user.username !== username) user.username = username;
    if (first_name) user.firstName = first_name;
    checkAndResetDailyLimit(user);
  }

  return res.json({
    user,
    settings: {
      botName: db.settings.botName,
      conversionRate: db.settings.conversionRate,
      defaultAdReward: db.settings.defaultAdReward,
      defaultDailyLimit: user.customDailyLimit || db.settings.defaultDailyLimit,
      minimumWithdrawal: db.settings.minimumWithdrawal,
      mtAdsEnabled: db.settings.mtAdsEnabled,
      adAdsEnabled: db.settings.adAdsEnabled,
      adDurationSeconds: db.settings.adDurationSeconds,
      demoMode: db.settings.demoMode,
    },
  });
});

// -------------------------------------------------------------
// USER PROFILE & PAYMENT DATA
// -------------------------------------------------------------
app.get('/api/user/profile', (req: Request, res: Response) => {
  const telegramId = String(req.query.userId || '');
  const user = db.users[telegramId];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  checkAndResetDailyLimit(user);
  return res.json({
    user,
    settings: db.settings,
  });
});

app.post('/api/user/payment-info', (req: Request, res: Response) => {
  const { userId, paymentAccounts } = req.body;
  const user = db.users[String(userId)];
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.paymentAccounts = {
    ...user.paymentAccounts,
    ...paymentAccounts,
  };

  return res.json({ success: true, paymentAccounts: user.paymentAccounts });
});

// -------------------------------------------------------------
// USER TRANSACTIONS & NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/user/transactions', (req: Request, res: Response) => {
  const userId = String(req.query.userId || '');
  const userTxs = db.transactions.filter(t => t.userId === userId);
  return res.json({ transactions: userTxs });
});

app.get('/api/user/notifications', (req: Request, res: Response) => {
  const userId = String(req.query.userId || '');
  const userNotifs = db.notifications.filter(n => n.userId === userId);
  return res.json({ notifications: userNotifs });
});

app.post('/api/user/notifications/mark-read', (req: Request, res: Response) => {
  const { userId, notificationId } = req.body;
  const notif = db.notifications.find(n => n.id === notificationId && n.userId === String(userId));
  if (notif) notif.read = true;
  return res.json({ success: true });
});

// -------------------------------------------------------------
// TASKS SYSTEM
// -------------------------------------------------------------
app.get('/api/tasks', (req: Request, res: Response) => {
  const userId = String(req.query.userId || '');
  const userCompleted = db.completedTasks[userId] || [];

  const tasksWithStatus = db.tasks.map(task => ({
    ...task,
    isCompleted: userCompleted.includes(task.id),
  }));

  return res.json({ tasks: tasksWithStatus });
});

app.post('/api/tasks/complete', (req: Request, res: Response) => {
  const { userId, taskId } = req.body;
  const user = db.users[String(userId)];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
    return res.status(403).json({ error: 'Account is restricted from completing tasks.' });
  }

  const task = db.tasks.find(t => t.id === taskId);
  if (!task || task.status !== 'active') {
    return res.status(400).json({ error: 'Task is inactive or does not exist.' });
  }

  if (task.remainingSlots <= 0) {
    return res.status(400).json({ error: 'Task slots are completely filled.' });
  }

  const userCompleted = db.completedTasks[user.telegramId] || [];
  if (userCompleted.includes(taskId)) {
    return res.status(400).json({ error: 'You have already completed this task.' });
  }

  // Award task reward
  const reward = Math.round(task.reward * (user.customMultiplier || db.settings.globalRewardMultiplier || 1.0));
  user.balance += reward;
  user.totalEarned += reward;
  user.completedTasksCount += 1;
  task.remainingSlots = Math.max(0, task.remainingSlots - 1);

  if (!db.completedTasks[user.telegramId]) {
    db.completedTasks[user.telegramId] = [];
  }
  db.completedTasks[user.telegramId].push(taskId);

  const tx: Transaction = {
    id: `tx_task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: user.telegramId,
    username: user.username,
    type: 'task_reward',
    amount: reward,
    balanceAfter: user.balance,
    status: 'completed',
    description: `Task completed: ${task.title}`,
    createdAt: new Date().toISOString(),
    metadata: { taskId: task.id },
  };
  db.transactions.unshift(tx);

  db.notifications.unshift({
    id: `notif_task_${Date.now()}`,
    userId: user.telegramId,
    title: 'Task Verified! 🎯',
    message: `You earned +${reward} Papaya for completing "${task.title}".`,
    type: 'reward',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    reward,
    newBalance: user.balance,
    completedTasksCount: user.completedTasksCount,
  });
});

// -------------------------------------------------------------
// AD VERIFICATION SYSTEM (MT ADS & AD ADS)
// -------------------------------------------------------------
app.post('/api/ads/start-session', (req: Request, res: Response) => {
  const { userId, adType } = req.body;
  const user = db.users[String(userId)];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
    return res.status(403).json({ error: 'Your account is restricted from viewing ads.' });
  }

  if (db.settings.maintenanceMode) {
    return res.status(503).json({ error: 'System is currently undergoing scheduled maintenance.' });
  }

  if (adType === 'monetag' && !db.settings.mtAdsEnabled) {
    return res.status(400).json({ error: 'MT Ads are temporarily paused by administration.' });
  }
  if (adType === 'adsterra' && !db.settings.adAdsEnabled) {
    return res.status(400).json({ error: 'AD Ads are temporarily paused by administration.' });
  }

  checkAndResetDailyLimit(user);

  const dailyLimit = user.customDailyLimit || db.settings.defaultDailyLimit;
  if (user.todayAdsCount >= dailyLimit) {
    return res.status(400).json({
      error: 'Daily limit reached. Come back tomorrow.',
      todayAdsCount: user.todayAdsCount,
      dailyLimit,
    });
  }

  const durationSeconds = db.settings.adDurationSeconds || 15;
  const baseReward = db.settings.defaultAdReward;
  const userMultiplier = user.customMultiplier || db.settings.globalRewardMultiplier || 1.0;
  const expectedReward = Math.max(1, Math.round(baseReward * userMultiplier));

  const sessionId = `ad_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const session: AdSession = {
    sessionId,
    userId: user.telegramId,
    adType: adType === 'adsterra' ? 'adsterra' : 'monetag',
    startedAt: Date.now(),
    minDurationSeconds: durationSeconds,
    expectedReward,
    isRedeemed: false,
  };

  db.adSessions[sessionId] = session;

  return res.json({
    sessionId,
    minDurationSeconds: durationSeconds,
    expectedReward,
    adType: session.adType,
    todayAdsCount: user.todayAdsCount,
    dailyLimit,
    dailyRemaining: Math.max(0, dailyLimit - user.todayAdsCount),
  });
});

app.post('/api/ads/verify-complete', (req: Request, res: Response) => {
  const { sessionId, userId } = req.body;
  const user = db.users[String(userId)];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const session = db.adSessions[sessionId];
  if (!session) {
    return res.status(400).json({ error: 'Invalid or expired ad session.' });
  }

  if (session.userId !== user.telegramId) {
    return res.status(403).json({ error: 'Session authorization mismatch.' });
  }

  if (session.isRedeemed) {
    return res.status(400).json({ error: 'This ad reward has already been claimed.' });
  }

  const elapsedMs = Date.now() - session.startedAt;
  const minRequiredMs = (session.minDurationSeconds - 1) * 1000; // 1s tolerance for network jitter

  if (elapsedMs < minRequiredMs) {
    // Suspicious rapid submission detection
    if (!user.fraudFlags) user.fraudFlags = [];
    user.fraudFlags.push(`Rapid ad submission: ${Math.round(elapsedMs / 1000)}s instead of ${session.minDurationSeconds}s`);
    user.fraudScore = (user.fraudScore || 0) + 15;

    if (user.fraudScore >= 50 && user.accountStatus !== 'banned') {
      user.accountStatus = 'flagged';
    }

    return res.status(400).json({
      error: `Ad playback was not completed for the required ${session.minDurationSeconds} seconds.`,
      elapsedSeconds: Math.round(elapsedMs / 1000),
    });
  }

  checkAndResetDailyLimit(user);
  const dailyLimit = user.customDailyLimit || db.settings.defaultDailyLimit;
  if (user.todayAdsCount >= dailyLimit) {
    return res.status(400).json({ error: 'Daily limit reached. Come back tomorrow.' });
  }

  // Mark session redeemed atomically
  session.isRedeemed = true;

  // Credit reward on backend
  const reward = session.expectedReward;
  user.balance += reward;
  user.totalEarned += reward;
  user.todayAdsCount += 1;

  const adLabel = session.adType === 'adsterra' ? 'AD ADS (Adsterra)' : 'MT ADS (Monetag)';
  const tx: Transaction = {
    id: `tx_ad_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: user.telegramId,
    username: user.username,
    type: 'ad_reward',
    amount: reward,
    balanceAfter: user.balance,
    status: 'completed',
    description: `Completed 15s advertisement on ${adLabel}`,
    createdAt: new Date().toISOString(),
  };
  db.transactions.unshift(tx);

  // If daily limit reached on this ad, send notification
  if (user.todayAdsCount >= dailyLimit) {
    db.notifications.unshift({
      id: `notif_limit_${Date.now()}`,
      userId: user.telegramId,
      title: 'Daily Limit Reached! 🎯',
      message: `You completed all ${dailyLimit} ads today. Your limit will reset at midnight UTC.`,
      type: 'limit',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    reward,
    newBalance: user.balance,
    todayAdsCount: user.todayAdsCount,
    dailyLimit,
    dailyRemaining: Math.max(0, dailyLimit - user.todayAdsCount),
    adLabel,
  });
});

// -------------------------------------------------------------
// WITHDRAWALS SYSTEM
// -------------------------------------------------------------
app.get('/api/withdrawals', (req: Request, res: Response) => {
  const userId = String(req.query.userId || '');
  const userWths = db.withdrawals.filter(w => w.userId === userId);
  return res.json({ withdrawals: userWths });
});

app.post('/api/withdrawals', (req: Request, res: Response) => {
  const { userId, method, accountInfo, papayaAmount } = req.body;
  const user = db.users[String(userId)];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
    return res.status(403).json({ error: 'Account is restricted from withdrawing funds.' });
  }

  if (!db.settings.withdrawalsEnabled) {
    return res.status(400).json({ error: 'Withdrawals are currently paused by administration.' });
  }

  const requestedPapaya = parseInt(papayaAmount, 10);
  if (isNaN(requestedPapaya) || requestedPapaya <= 0) {
    return res.status(400).json({ error: 'Invalid Papaya amount.' });
  }

  if (requestedPapaya < db.settings.minimumWithdrawal) {
    return res.status(400).json({
      error: `Minimum withdrawal is ${db.settings.minimumWithdrawal.toLocaleString()} Papaya.`,
      minimumWithdrawal: db.settings.minimumWithdrawal,
    });
  }

  if (user.balance < requestedPapaya) {
    return res.status(400).json({
      error: `Insufficient balance. Available: ${user.balance.toLocaleString()} Papaya.`,
    });
  }

  if (!accountInfo || typeof accountInfo !== 'string' || accountInfo.trim().length < 3) {
    return res.status(400).json({ error: 'Please enter a valid payment account identifier.' });
  }

  const conversionRate = db.settings.conversionRate || 10000;
  const usdAmount = Number((requestedPapaya / conversionRate).toFixed(3));

  // Atomic lock/deduction
  user.balance -= requestedPapaya;
  user.totalWithdrawn += requestedPapaya;

  // Save payout info for convenience
  const methodKey = method.toLowerCase() as keyof typeof user.paymentAccounts;
  if (user.paymentAccounts) {
    user.paymentAccounts[methodKey] = accountInfo.trim();
  }

  const withdrawalId = `WTH-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
  const now = new Date().toISOString();

  const withdrawal: Withdrawal = {
    id: withdrawalId,
    userId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    method: method as PaymentMethod,
    accountInfo: accountInfo.trim(),
    papayaAmount: requestedPapaya,
    usdAmount,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    adminNote: 'Submitted and queued for admin review',
  };

  db.withdrawals.unshift(withdrawal);

  // Record transaction
  const tx: Transaction = {
    id: `tx_wth_${Date.now()}`,
    userId: user.telegramId,
    username: user.username,
    type: 'withdrawal',
    amount: -requestedPapaya,
    balanceAfter: user.balance,
    status: 'pending',
    description: `Withdrawal request to ${method} (${accountInfo.trim()}) - $${usdAmount} USD`,
    createdAt: now,
    metadata: { withdrawalId },
  };
  db.transactions.unshift(tx);

  // User notification
  db.notifications.unshift({
    id: `notif_wth_${Date.now()}`,
    userId: user.telegramId,
    title: 'Withdrawal Submitted 💰',
    message: `Your request for ${requestedPapaya.toLocaleString()} Papaya ($${usdAmount} USD) via ${method} is Pending admin review.`,
    type: 'withdrawal',
    read: false,
    createdAt: now,
  });

  return res.json({
    success: true,
    withdrawal,
    newBalance: user.balance,
  });
});

// -------------------------------------------------------------
// REFERRAL SYSTEM
// -------------------------------------------------------------
app.get('/api/referrals', (req: Request, res: Response) => {
  const userId = String(req.query.userId || '');
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const referredUsers = Object.values(db.users)
    .filter(u => u.referredBy === user.referralCode)
    .map(u => ({
      telegramId: u.telegramId,
      username: u.username,
      firstName: u.firstName,
      registeredAt: u.registeredAt,
      completedAds: u.todayAdsCount,
      completedTasks: u.completedTasksCount,
    }));

  const botUsername = db.settings.botUsername || 'PapayaRewardBot';
  const referralUrl = `https://t.me/${botUsername}?start=${user.referralCode}`;

  return res.json({
    referralCode: user.referralCode,
    referralUrl,
    referralCount: referredUsers.length,
    referralEarnings: user.referralEarnings,
    rewardPerReferral: db.settings.referralReward,
    referredUsers,
  });
});

// -------------------------------------------------------------
// BOT COMMAND SIMULATION (For Telegram Bot interactive view)
// -------------------------------------------------------------
app.post('/api/bot/command', (req: Request, res: Response) => {
  const { command, userId } = req.body;
  const user = db.users[String(userId)] || Object.values(db.users)[0];

  const rate = db.settings.conversionRate;
  const usdEquiv = (user.balance / rate).toFixed(3);

  let replyText = '';
  let inlineButtons: { text: string; action?: string; url?: string }[] = [];

  switch (command) {
    case '/start':
      replyText = `🌟 *Welcome to Papaya Bot!* 🍈\n\nEarn real rewards by watching quick 15s sponsor advertisements, completing community tasks, and inviting your friends.\n\n*Your Stats:*\n💰 Balance: *${user.balance.toLocaleString()} Papaya* (~$${usdEquiv} USD)\n📺 Today's Ads: *${user.todayAdsCount} / ${db.settings.defaultDailyLimit}*\n\nTap below to open the Mini App!`;
      inlineButtons = [
        { text: '🚀 Open Papaya Mini App', action: 'open_app' },
        { text: '📺 Watch MT Ads', action: 'mt_ads' },
        { text: '📢 Watch AD Ads', action: 'ad_ads' },
        { text: '💰 Withdraw', action: 'withdraw' },
      ];
      break;
    case '/balance':
      replyText = `💳 *Papaya Wallet Balance*\n\nPapaya: *${user.balance.toLocaleString()} PAPAYA*\nUSD Equivalent: *~$${usdEquiv} USD*\nTotal Earned: *${user.totalEarned.toLocaleString()} PAPAYA*\nTotal Withdrawn: *${user.totalWithdrawn.toLocaleString()} PAPAYA*`;
      inlineButtons = [
        { text: '💰 Request Withdrawal', action: 'withdraw' },
        { text: '📜 View Transactions', action: 'transactions' },
      ];
      break;
    case '/tasks':
      replyText = `🎯 *Available Tasks*\n\nComplete community tasks to earn up to 100 Papaya each!\n\n• Join Papaya Channel (+100 Papaya)\n• Join Global Community (+75 Papaya)\n• Follow on X (+50 Papaya)\n• User Survey (+60 Papaya)\n\nOpen the Mini App to start tasks.`;
      inlineButtons = [
        { text: '🎯 View Tasks in App', action: 'tasks' },
      ];
      break;
    case '/withdraw':
      replyText = `💰 *Withdrawal Center*\n\nConversion: *${rate.toLocaleString()} Papaya = $1.00 USD*\nMinimum Withdrawal: *${db.settings.minimumWithdrawal.toLocaleString()} Papaya*\n\nSupported Methods:\n• bKash\n• Nagad\n• PayPal\n• Payoneer\n• WebMoney\n• Payeer\n\nYour current balance: *${user.balance.toLocaleString()} Papaya*`;
      inlineButtons = [
        { text: '💳 Open Cashout Form', action: 'withdraw' },
      ];
      break;
    case '/referral':
      replyText = `👥 *Papaya Referral Program*\n\nInvite friends and earn *+${db.settings.referralReward} Papaya* per friend who joins!\n\nYour Referral Link:\n\`https://t.me/${db.settings.botUsername}?start=${user.referralCode}\`\n\nInvited: *${user.referralCount} friends*\nTotal Referral Earnings: *${user.referralEarnings} Papaya*`;
      inlineButtons = [
        { text: '🔗 Share Link', action: 'share_referral' },
      ];
      break;
    case '/help':
      replyText = `ℹ️ *Papaya Bot Help & Rules*\n\n• *Ads Rule:* 15 seconds required per ad completion.\n• *Daily Limit:* ${db.settings.defaultDailyLimit} ads per 24 hours.\n• *Rate:* ${rate.toLocaleString()} Papaya = $1.00 USD.\n• *Payout Speed:* Within 24-48 hours after admin review.\n\nNeed assistance? Contact our official support @PapayaSupport`;
      break;
    default:
      replyText = `Unknown command. Type /menu or /start to see available options.`;
  }

  return res.json({ replyText, inlineButtons });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT ROUTES
// -------------------------------------------------------------
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const usersList = Object.values(db.users);
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.accountStatus === 'active').length;
  const newUsersToday = usersList.filter(u => {
    const regDate = u.registeredAt.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return regDate === today;
  }).length;

  const totalPapayaDistributed = usersList.reduce((acc, u) => acc + u.totalEarned, 0);
  const totalWithdrawalsAmount = db.withdrawals
    .filter(w => w.status === 'paid')
    .reduce((acc, w) => acc + w.papayaAmount, 0);

  const pendingWithdrawalsCount = db.withdrawals.filter(w => w.status === 'pending').length;
  const paidWithdrawalsCount = db.withdrawals.filter(w => w.status === 'paid').length;
  const rejectedWithdrawalsCount = db.withdrawals.filter(w => w.status === 'rejected').length;

  const totalAdCompletions = db.transactions.filter(t => t.type === 'ad_reward').length;
  const totalTasksCompleted = db.transactions.filter(t => t.type === 'task_reward').length;

  // 7-day daily activity
  const dailyEarningsHistory = [
    { date: 'Sep 18', amount: 3200, ads: 120 },
    { date: 'Sep 19', amount: 4800, ads: 180 },
    { date: 'Sep 20', amount: 5600, ads: 210 },
    { date: 'Sep 21', amount: 7400, ads: 290 },
    { date: 'Sep 22', amount: 8900, ads: 340 },
    { date: 'Sep 23', amount: 11200, ads: 420 },
    { date: 'Sep 24 (Today)', amount: 14250, ads: 485 },
  ];

  const userGrowthHistory = [
    { date: 'Sep 18', users: 140 },
    { date: 'Sep 19', users: 210 },
    { date: 'Sep 20', users: 320 },
    { date: 'Sep 21', users: 480 },
    { date: 'Sep 22', users: 650 },
    { date: 'Sep 23', users: 890 },
    { date: 'Sep 24', users: 1240 },
  ];

  const stats: AdminStatsOverview = {
    totalUsers,
    activeUsers,
    newUsersToday,
    totalPapayaDistributed,
    totalWithdrawalsAmount,
    pendingWithdrawalsCount,
    paidWithdrawalsCount,
    rejectedWithdrawalsCount,
    totalAdCompletions,
    totalTasksCompleted,
    dailyEarningsHistory,
    userGrowthHistory,
  };

  return res.json({ stats, settings: db.settings });
});

// Admin Users List & Actions
app.get('/api/admin/users', (req: Request, res: Response) => {
  const { search, status } = req.query;
  let list = Object.values(db.users);

  if (status && status !== 'all') {
    list = list.filter(u => u.accountStatus === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.telegramId.includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q)
    );
  }

  return res.json({ users: list });
});

app.post('/api/admin/users/adjust-balance', (req: Request, res: Response) => {
  const { adminUsername, targetUserId, amount, reason } = req.body;
  const user = db.users[String(targetUserId)];
  if (!user) return res.status(404).json({ error: 'Target user not found' });

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount === 0) {
    return res.status(400).json({ error: 'Invalid balance adjustment amount' });
  }

  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ error: 'Audit note / reason is required for balance adjustments' });
  }

  user.balance += numAmount;
  if (numAmount > 0) user.totalEarned += numAmount;

  const now = new Date().toISOString();
  db.transactions.unshift({
    id: `tx_adj_${Date.now()}`,
    userId: user.telegramId,
    username: user.username,
    type: 'admin_adjustment',
    amount: numAmount,
    balanceAfter: user.balance,
    status: 'completed',
    description: `Admin adjustment by ${adminUsername || 'Admin'}: ${reason}`,
    createdAt: now,
  });

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'BALANCE_ADJUSTMENT',
    targetUserId: user.telegramId,
    targetUserName: user.username,
    details: `Adjusted balance by ${numAmount > 0 ? '+' : ''}${numAmount} Papaya. New balance: ${user.balance}. Reason: ${reason}`,
    createdAt: now,
  });

  return res.json({ success: true, newBalance: user.balance });
});

app.post('/api/admin/users/status', (req: Request, res: Response) => {
  const { adminUsername, targetUserId, status, reason } = req.body;
  const user = db.users[String(targetUserId)];
  if (!user) return res.status(404).json({ error: 'Target user not found' });

  const oldStatus = user.accountStatus;
  user.accountStatus = status;

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'USER_STATUS_CHANGE',
    targetUserId: user.telegramId,
    targetUserName: user.username,
    details: `Changed status from ${oldStatus} to ${status}. Reason: ${reason || 'Admin action'}`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, status: user.accountStatus });
});

app.post('/api/admin/users/custom-limits', (req: Request, res: Response) => {
  const { adminUsername, targetUserId, customDailyLimit, customMultiplier } = req.body;
  const user = db.users[String(targetUserId)];
  if (!user) return res.status(404).json({ error: 'Target user not found' });

  if (customDailyLimit !== undefined) user.customDailyLimit = Number(customDailyLimit);
  if (customMultiplier !== undefined) user.customMultiplier = Number(customMultiplier);

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'USER_LIMITS_UPDATE',
    targetUserId: user.telegramId,
    targetUserName: user.username,
    details: `Custom daily limit: ${user.customDailyLimit || 'default'}, Multiplier: ${user.customMultiplier || 1.0}`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, user });
});

app.post('/api/admin/users/reset-daily', (req: Request, res: Response) => {
  const { adminUsername, targetUserId } = req.body;
  const user = db.users[String(targetUserId)];
  if (!user) return res.status(404).json({ error: 'Target user not found' });

  user.todayAdsCount = 0;
  user.lastAdDate = new Date().toISOString().split('T')[0];

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'USER_DAILY_RESET',
    targetUserId: user.telegramId,
    targetUserName: user.username,
    details: 'Reset daily ad counter to 0',
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, todayAdsCount: user.todayAdsCount });
});

// Admin Withdrawals
app.get('/api/admin/withdrawals', (req: Request, res: Response) => {
  const { status } = req.query;
  let list = db.withdrawals;
  if (status && status !== 'all') {
    list = list.filter(w => w.status === status);
  }
  return res.json({ withdrawals: list });
});

app.post('/api/admin/withdrawals/status', (req: Request, res: Response) => {
  const { adminUsername, withdrawalId, status, note, txReceipt } = req.body;
  const wth = db.withdrawals.find(w => w.id === withdrawalId);
  if (!wth) return res.status(404).json({ error: 'Withdrawal not found' });

  const oldStatus = wth.status;
  wth.status = status;
  wth.updatedAt = new Date().toISOString();
  if (note) wth.adminNote = note;
  if (txReceipt) wth.txHashOrReceipt = txReceipt;

  const targetUser = db.users[wth.userId];

  // If rejected, refund the Papaya amount back to user's balance
  if (status === 'rejected' && oldStatus !== 'rejected') {
    if (targetUser) {
      targetUser.balance += wth.papayaAmount;
      targetUser.totalWithdrawn = Math.max(0, targetUser.totalWithdrawn - wth.papayaAmount);

      db.transactions.unshift({
        id: `tx_rev_${Date.now()}`,
        userId: targetUser.telegramId,
        username: targetUser.username,
        type: 'withdrawal_reversal',
        amount: wth.papayaAmount,
        balanceAfter: targetUser.balance,
        status: 'completed',
        description: `Refund for rejected withdrawal ${wth.id}. Reason: ${note || 'Admin rejection'}`,
        createdAt: new Date().toISOString(),
      });

      db.notifications.unshift({
        id: `notif_wth_rej_${Date.now()}`,
        userId: targetUser.telegramId,
        title: 'Withdrawal Rejected & Refunded',
        message: `Your withdrawal ${wth.id} was rejected. ${wth.papayaAmount.toLocaleString()} Papaya has been refunded to your wallet. Reason: ${note || 'Contact support'}`,
        type: 'withdrawal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  } else if (status === 'paid') {
    if (targetUser) {
      db.notifications.unshift({
        id: `notif_wth_paid_${Date.now()}`,
        userId: targetUser.telegramId,
        title: 'Payment Dispatched! 💸',
        message: `Your withdrawal ${wth.id} of $${wth.usdAmount} via ${wth.method} has been marked Paid. ${txReceipt ? `Receipt: ${txReceipt}` : ''}`,
        type: 'withdrawal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: `WITHDRAWAL_${status.toUpperCase()}`,
    targetUserId: wth.userId,
    targetUserName: wth.username,
    details: `Updated withdrawal ${wth.id} (${wth.papayaAmount} Papaya) to ${status}. Note: ${note || 'None'}. Receipt: ${txReceipt || 'None'}`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, withdrawal: wth });
});

// Admin Tasks Management
app.get('/api/admin/tasks', (req: Request, res: Response) => {
  return res.json({ tasks: db.tasks });
});

app.post('/api/admin/tasks', (req: Request, res: Response) => {
  const { adminUsername, title, description, reward, type, actionUrl, requiredAction, instructions, totalSlots } = req.body;
  if (!title || !reward || !actionUrl) {
    return res.status(400).json({ error: 'Title, reward, and action URL are required' });
  }

  const newTask: Task = {
    id: `task_${Date.now()}`,
    title,
    description: description || '',
    reward: parseInt(reward, 10) || 50,
    type: type || 'website_visit',
    actionUrl,
    requiredAction: requiredAction || 'Complete Action',
    status: 'active',
    totalSlots: parseInt(totalSlots, 10) || 1000,
    remainingSlots: parseInt(totalSlots, 10) || 1000,
    instructions: instructions || 'Follow the instructions and verify upon completion.',
    createdAt: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'TASK_CREATED',
    details: `Created task "${newTask.title}" with reward ${newTask.reward} Papaya`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, task: newTask });
});

app.put('/api/admin/tasks/:id', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const task = db.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, reward, type, actionUrl, requiredAction, status, instructions } = req.body;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (reward !== undefined) task.reward = parseInt(reward, 10);
  if (type) task.type = type;
  if (actionUrl) task.actionUrl = actionUrl;
  if (requiredAction) task.requiredAction = requiredAction;
  if (status) task.status = status;
  if (instructions !== undefined) task.instructions = instructions;

  return res.json({ success: true, task });
});

app.delete('/api/admin/tasks/:id', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const index = db.tasks.findIndex(t => t.id === taskId);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const deleted = db.tasks.splice(index, 1)[0];
  return res.json({ success: true, deletedTaskId: deleted.id });
});

// Admin System Settings
app.get('/api/admin/settings', (req: Request, res: Response) => {
  return res.json({ settings: db.settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const { adminUsername, newSettings } = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings payload' });
  }

  const prevSettings = { ...db.settings };
  db.settings = {
    ...db.settings,
    ...newSettings,
  };

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'SETTINGS_MODIFIED',
    details: `Updated system settings: conversion=${db.settings.conversionRate}, dailyLimit=${db.settings.defaultDailyLimit}, adReward=${db.settings.defaultAdReward}, maintenance=${db.settings.maintenanceMode}`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, settings: db.settings });
});

// Admin Broadcast Notification
app.post('/api/admin/broadcast', (req: Request, res: Response) => {
  const { adminUsername, title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required for broadcast' });
  }

  const allUserIds = Object.keys(db.users);
  const now = new Date().toISOString();

  allUserIds.forEach(userId => {
    db.notifications.unshift({
      id: `notif_broad_${Date.now()}_${userId}`,
      userId,
      title: `📢 ${title}`,
      message,
      type: 'system',
      read: false,
      createdAt: now,
    });
  });

  db.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminUsername: adminUsername || 'Admin',
    action: 'BROADCAST_SENT',
    details: `Broadcast "${title}" sent to ${allUserIds.length} users.`,
    createdAt: now,
  });

  return res.json({ success: true, recipientCount: allUserIds.length });
});

// Admin Audit Logs & Anti-Fraud
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  return res.json({ logs: db.auditLogs });
});

app.get('/api/admin/anti-fraud', (req: Request, res: Response) => {
  const flaggedUsers = Object.values(db.users).filter(
    u => u.accountStatus === 'flagged' || (u.fraudScore && u.fraudScore > 0)
  );
  return res.json({ flaggedUsers });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Papaya Bot] Full-Stack server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
