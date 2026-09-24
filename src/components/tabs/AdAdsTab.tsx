import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ASSETS } from '../../constants/assets.ts';
import { api } from '../../services/api.ts';
import { Play, CheckCircle2, ShieldAlert, Sparkles, Clock, AlertCircle, ArrowLeft, Volume2, VolumeX, Eye } from 'lucide-react';

export const AdAdsTab: React.FC = () => {
  const { user, settings, refreshUserData, addToast, setActiveTab, formatPapaya } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastRewardClaimed, setLastRewardClaimed] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const completed = user?.todayAdsCount ?? 0;
  const limit = user?.customDailyLimit || settings?.defaultDailyLimit || 100;
  const remaining = Math.max(0, limit - completed);
  const isLimitReached = remaining <= 0;
  const isSectionEnabled = settings?.adAdsEnabled ?? true;
  const rewardAmount = (settings?.defaultAdReward ?? 2) * (user?.customMultiplier || settings?.globalRewardMultiplier || 1);
  const duration = settings?.adDurationSeconds || 15;

  const handleStartAd = async () => {
    if (!user) return;
    if (!isSectionEnabled) {
      addToast({
        type: 'warning',
        title: 'Section Paused',
        message: 'AD Ads are temporarily paused by administration.',
      });
      return;
    }
    if (isLimitReached) {
      addToast({
        type: 'warning',
        title: 'Daily Limit Reached',
        message: 'You have completed the maximum 100 daily ads allowance. Resets at 00:00 UTC.',
      });
      return;
    }

    try {
      const session = await api.startAdSession(user.telegramId, 'adsterra');
      setCurrentSessionId(session.sessionId);
      setCountdown(session.minDurationSeconds);
      setIsPlaying(true);
      setLastRewardClaimed(null);

      let timeLeft = session.minDurationSeconds;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerRef.current);
          handleCompleteAd(session.sessionId);
        }
      }, 1000);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ad Unavailable',
        message: err.message || 'Could not initialize Adsterra session.',
      });
    }
  };

  const handleCompleteAd = async (sessionId: string) => {
    if (!user) return;
    setIsVerifying(true);
    try {
      const result = await api.verifyAdComplete(user.telegramId, sessionId);
      setLastRewardClaimed(result.reward);
      setIsPlaying(false);
      await refreshUserData();
      addToast({
        type: 'success',
        title: 'Reward Credited! 🍈',
        message: `+${result.reward} Papaya added to your balance.`,
      });
    } catch (err: any) {
      setIsPlaying(false);
      addToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message || 'Could not verify ad completion.',
      });
    } finally {
      setIsVerifying(false);
      setCurrentSessionId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          AD ADS (Adsterra)
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md shadow-slate-900/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">Adsterra Direct Stream</h2>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Reward</div>
            <div className="text-xs font-extrabold text-amber-600 font-mono-numbers">
              +{rewardAmount} Papaya
            </div>
          </div>
        </div>

        {/* Media Preview Container */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-100 flex items-center justify-center group">
          <img
            src={ASSETS.adsterraBanner}
            alt="Adsterra Sponsor Media"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-90' : 'opacity-80 group-hover:opacity-95'
            }`}
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/65 backdrop-blur-xs text-white">
              <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/20"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeDasharray={`${((duration - countdown) / duration) * 100}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-display text-2xl font-bold font-mono-numbers text-white">
                  {countdown}s
                </span>
              </div>

              <p className="text-xs font-semibold tracking-wide text-amber-200 animate-pulse">
                Adsterra Sponsor Active... Verification in progress
              </p>
              <span className="text-[10px] text-white/60 mt-1">15s verified view requirement</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow-sm">
                Adsterra Official Direct Link / Native Ad
              </span>
              <span className="text-[10px] text-white/80 mt-0.5 font-medium">
                Key: {settings?.adsterraDirectKey || 'ADST-KEY-8812'} · 15 Seconds
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium">Daily Remaining</div>
            <div className="text-sm font-bold text-slate-900 font-mono-numbers mt-0.5">
              {remaining} / {limit}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium">Reward Value</div>
            <div className="text-sm font-bold text-emerald-600 font-mono-numbers mt-0.5">
              +{rewardAmount} Papaya
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={handleStartAd}
            disabled={isPlaying || isVerifying || isLimitReached || !isSectionEnabled}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              !isSectionEnabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : isLimitReached
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : isPlaying
                ? 'bg-amber-500 text-white cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-[#FF6B35] hover:from-amber-600 hover:to-[#e85b27] text-white shadow-amber-500/20'
            }`}
          >
            {!isSectionEnabled ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>AD ADS Temporarily Paused by Admin</span>
              </>
            ) : isLimitReached ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Daily Limit Reached (Come Back Tomorrow)</span>
              </>
            ) : isPlaying ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Watching Adsterra Ad ({countdown}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start AD Advertisement (+{rewardAmount} Papaya)</span>
              </>
            )}
          </button>
        </div>

        {lastRewardClaimed && !isPlaying && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Verified & Credited:</span> +{lastRewardClaimed} Papaya has been added to your wallet!
            </div>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Official Adsterra Network Compliance</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Adsterra integration strictly avoids artificial traffic, forced clicks, or duplicate views. Ad timers run independently on the backend with verification tokens.
        </p>
      </div>
    </div>
  );
};
