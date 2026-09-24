import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ASSETS } from '../../constants/assets.ts';
import { api } from '../../services/api.ts';
import { Play, CheckCircle2, ShieldAlert, Sparkles, Clock, Volume2, VolumeX, AlertCircle, ArrowLeft } from 'lucide-react';

export const MtAdsTab: React.FC = () => {
  const { user, settings, refreshUserData, addToast, setActiveTab, formatPapaya } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastRewardClaimed, setLastRewardClaimed] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  const completed = user?.todayAdsCount ?? 0;
  const limit = user?.customDailyLimit || settings?.defaultDailyLimit || 100;
  const remaining = Math.max(0, limit - completed);
  const isLimitReached = remaining <= 0;
  const rewardAmount = (settings?.defaultAdReward ?? 2) * (user?.customMultiplier || settings?.globalRewardMultiplier || 1);
  const duration = settings?.adDurationSeconds || 15;

  const handleStartAd = async () => {
    if (!user) return;
    if (isLimitReached) {
      addToast({
        type: 'warning',
        title: 'Daily Limit Reached',
        message: 'You have reached today\'s ad allowance (100 ads). Resets at 00:00 UTC.',
      });
      return;
    }

    try {
      // Backend generates signed ad session ticket
      const session = await api.startAdSession(user.telegramId, 'monetag');
      setCurrentSessionId(session.sessionId);
      setCountdown(session.minDurationSeconds);
      setIsPlaying(true);
      setLastRewardClaimed(null);

      // Countdown loop
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
        message: err.message || 'Could not start MT ad session.',
      });
    }
  };

  const handleCompleteAd = async (sessionId: string) => {
    if (!user) return;
    setIsVerifying(true);
    try {
      // Backend validates that the full 15 seconds elapsed
      const result = await api.verifyAdComplete(user.telegramId, sessionId);
      setLastRewardClaimed(result.reward);
      setIsPlaying(false);
      await refreshUserData();
      addToast({
        type: 'success',
        title: 'Reward Credited! 🍈',
        message: `+${result.reward} Papaya successfully added to your balance.`,
      });
    } catch (err: any) {
      setIsPlaying(false);
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.message || 'Ad was not viewed for the full duration.',
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
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-[#FF6B35] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
          MT ADS (Monetag)
        </span>
      </div>

      {/* Hero Ad Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md shadow-slate-900/5 relative overflow-hidden">
        {/* Ad Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">Watch Advertisement</h2>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Reward</div>
            <div className="text-xs font-extrabold text-[#FF6B35] font-mono-numbers">
              +{rewardAmount} Papaya
            </div>
          </div>
        </div>

        {/* Ad Media Showcase Container */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-100 flex items-center justify-center group">
          <img
            src={ASSETS.monetagBanner}
            alt="Monetag Ad Partner"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-90' : 'opacity-80 group-hover:opacity-95'
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Active 15s Timer Screen */}
          {isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-white">
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
                    className="text-[#FF6B35]"
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

              <p className="text-xs font-semibold tracking-wide text-orange-200 animate-pulse">
                Viewing Sponsor Ad... Do not close window
              </p>
              <span className="text-[10px] text-white/60 mt-1">Official 15s verification active</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow-sm">
                Monetag Rewarded Placement
              </span>
              <span className="text-[10px] text-white/80 mt-0.5 font-medium">
                Zone: {settings?.monetagZoneId || 'MT-REWARD-884'} · 15 Seconds
              </span>
            </div>
          )}

          {/* Sound / Volume Control */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white/80 hover:text-white backdrop-blur-xs transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Daily Stats Grid */}
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
            disabled={isPlaying || isVerifying || isLimitReached}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              isLimitReached
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : isPlaying
                ? 'bg-orange-400 text-white cursor-wait'
                : 'bg-[#FF6B35] hover:bg-[#e85b27] text-white shadow-orange-500/20'
            }`}
          >
            {isLimitReached ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Daily Limit Reached (Come Back Tomorrow)</span>
              </>
            ) : isPlaying ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Playing Monetag Ad ({countdown}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start MT Advertisement (+{rewardAmount} Papaya)</span>
              </>
            )}
          </button>
        </div>

        {/* Success Banner if just rewarded */}
        {lastRewardClaimed && !isPlaying && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Verified & Credited:</span> +{lastRewardClaimed} Papaya has been added to your wallet!
            </div>
          </div>
        )}
      </div>

      {/* Compliance Policy Notice */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span>Official Monetag Policy Adherence</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          We strictly follow advertising network guidelines. Advertisements are never auto-clicked, forced, or artificially generated. Rewards are credited only after full server-side 15-second verification.
        </p>
      </div>
    </div>
  );
};
