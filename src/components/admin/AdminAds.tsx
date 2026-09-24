import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { SystemSettings } from '../../types/index.ts';
import {
  Tv,
  Megaphone,
  Save,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Clock,
  Coins,
  CheckCircle2
} from 'lucide-react';

export const AdminAds: React.FC = () => {
  const { settings, addToast, refreshUserData } = useApp();
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        mtAdsEnabled: settings.mtAdsEnabled,
        adAdsEnabled: settings.adAdsEnabled,
        defaultAdReward: settings.defaultAdReward,
        defaultDailyLimit: settings.defaultDailyLimit,
        adDurationSeconds: settings.adDurationSeconds,
        monetagZoneId: settings.monetagZoneId,
        adsterraDirectKey: settings.adsterraDirectKey,
        globalRewardMultiplier: settings.globalRewardMultiplier || 1.0,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.adminUpdateSettings({
        adminUsername: 'SuperAdmin',
        newSettings: formData,
      });
      await refreshUserData();
      addToast({
        type: 'success',
        title: 'Ad Configurations Saved',
        message: 'Monetag and Adsterra runtime settings updated successfully.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update ad settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGlobalPause = async (paused: boolean) => {
    const updated = {
      ...formData,
      mtAdsEnabled: !paused,
      adAdsEnabled: !paused,
    };
    setFormData(updated);
    try {
      await api.adminUpdateSettings({
        adminUsername: 'SuperAdmin',
        newSettings: updated,
      });
      await refreshUserData();
      addToast({
        type: paused ? 'warning' : 'success',
        title: paused ? 'Ad Rewards Globally Paused' : 'Ad Rewards Resumed',
        message: paused ? 'Both MT ADS and AD ADS have been paused.' : 'Ad networks are now live.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const isGloballyPaused = !formData.mtAdsEnabled && !formData.adAdsEnabled;

  return (
    <div className="space-y-6">
      {/* Global Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Advertising Traffic Controller</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure partner network keys, reward payouts, 15-second timers, and kill switches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGloballyPaused ? (
            <button
              onClick={() => handleGlobalPause(false)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume All Advertising</span>
            </button>
          ) : (
            <button
              onClick={() => handleGlobalPause(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Emergency Global Pause</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Two Dedicated Networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monetag (MT ADS) Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B35]">
                <Tv className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monetag Network (MT ADS)</h3>
                <span className="text-[11px] text-slate-400">Rewarded & Interstitial</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.mtAdsEnabled ?? true}
                onChange={(e) => setFormData({ ...formData, mtAdsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B35]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Monetag Zone ID / Placement ID
              </label>
              <input
                type="text"
                value={formData.monetagZoneId || ''}
                onChange={(e) => setFormData({ ...formData, monetagZoneId: e.target.value })}
                placeholder="MT-884920-REWARDED"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Reward per 15s View
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.defaultAdReward || 2}
                    onChange={(e) => setFormData({ ...formData, defaultAdReward: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">🍈</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Required Playback (Sec)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.adDurationSeconds || 15}
                    onChange={(e) => setFormData({ ...formData, adDurationSeconds: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">SEC</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Compliance & Anti-Fraud</span>
              <p>Monetag sessions enforce strict cryptographic start tickets. Any completion submitted in &lt;14 seconds is rejected automatically.</p>
            </div>
          </div>
        </div>

        {/* Adsterra (AD ADS) Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Megaphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Adsterra Network (AD ADS)</h3>
                <span className="text-[11px] text-slate-400">Direct Link & Native Banner</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.adAdsEnabled ?? true}
                onChange={(e) => setFormData({ ...formData, adAdsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Adsterra Direct Key / Domain Code
              </label>
              <input
                type="text"
                value={formData.adsterraDirectKey || ''}
                onChange={(e) => setFormData({ ...formData, adsterraDirectKey: e.target.value })}
                placeholder="ADST-991204-POP"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Default Daily Ad Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.defaultDailyLimit || 100}
                    onChange={(e) => setFormData({ ...formData, defaultDailyLimit: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">ADS</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Global Multiplier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.globalRewardMultiplier || 1.0}
                    onChange={(e) => setFormData({ ...formData, globalRewardMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">x</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Direct Link Safety</span>
              <p>Adsterra direct links open in sandbox preview mode without disrupting user navigation or violating network terms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Configurations...' : 'Save All Ad Configurations'}</span>
        </button>
      </div>
    </div>
  );
};
