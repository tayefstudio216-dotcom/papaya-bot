import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Users, Copy, Check, Share2, Sparkles, Gift, ArrowLeft } from 'lucide-react';

export const ReferralTab: React.FC = () => {
  const { user, settings, addToast, setActiveTab, formatPapaya } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [refInfo, setRefInfo] = useState<{
    referralCode: string;
    referralUrl: string;
    referralCount: number;
    referralEarnings: number;
    rewardPerReferral: number;
    referredUsers: any[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getReferralInfo(user.telegramId)
      .then(res => setRefInfo(res))
      .catch(err => console.error(err));
  }, [user]);

  const botUsername = settings?.botUsername || 'PapayaRewardBot';
  const referralCode = refInfo?.referralCode || user?.referralCode || `PAPAYA_${user?.telegramId}`;
  const referralUrl = refInfo?.referralUrl || `https://t.me/${botUsername}?start=${referralCode}`;
  const rewardPerRef = refInfo?.rewardPerReferral || settings?.referralReward || 50;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Link Copied! 📋',
      message: 'Your personal referral link is copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `🍈 Join Papaya Bot to earn free cash watching 15s ads and completing quick tasks! Get a starter welcome bonus here: ${referralUrl}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          Referral Center
        </span>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Gift className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Papaya Partner Program
            </span>
          </div>
          <span className="text-xs font-extrabold text-amber-300 bg-white/10 px-2.5 py-1 rounded-full">
            +{rewardPerRef} Papaya / Friend
          </span>
        </div>

        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">
            Invite Friends & Earn Together
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Share your unique invite link with friends on Telegram. When they press START, you get +{rewardPerRef} Papaya instantly!
          </p>
        </div>

        {/* Link Bar with Copy */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between gap-2 border border-white/20">
          <span className="text-xs font-mono text-white/95 truncate px-2 select-all">
            {referralUrl}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-xs"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareTelegram}
              className="p-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white transition-colors shadow-xs"
              title="Share on Telegram"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
          <div>
            <div className="text-[11px] text-blue-200">Total Friends Invited</div>
            <div className="text-lg font-bold font-mono-numbers text-white mt-0.5">
              {refInfo?.referralCount ?? user?.referralCount ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-blue-200">Total Referral Earnings</div>
            <div className="text-lg font-bold font-mono-numbers text-amber-300 mt-0.5">
              +{formatPapaya(refInfo?.referralEarnings ?? user?.referralEarnings ?? 0)} 🍈
            </div>
          </div>
        </div>
      </div>

      {/* Friends List Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
          Your Invited Friends ({refInfo?.referredUsers?.length || 0})
        </h3>

        {!refInfo?.referredUsers || refInfo.referredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No referred friends yet. Share your link above to begin!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {refInfo.referredUsers.map((friend) => (
              <div key={friend.telegramId} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">@{friend.username}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Joined {new Date(friend.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    +{rewardPerRef} 🍈 Earned
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anti-Fraud Notice */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-700">Strict Referral Integrity Policy</div>
        <p className="text-[11px] leading-relaxed">
          Self-referrals, clone accounts, and automated emulators are automatically filtered and flagged by our anti-fraud checks.
        </p>
      </div>
    </div>
  );
};
