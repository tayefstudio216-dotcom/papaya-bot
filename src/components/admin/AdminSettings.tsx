import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { SystemSettings, PaymentMethod } from '../../types/index.ts';
import { Save, Settings, ShieldCheck, Check, DollarSign, Clock, Users, Globe } from 'lucide-react';

const ALL_METHODS: PaymentMethod[] = ['bKash', 'Nagad', 'PayPal', 'Payoneer', 'WebMoney', 'Payeer'];

export const AdminSettings: React.FC = () => {
  const { settings, addToast, refreshUserData } = useApp();
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const handleToggleMethod = (method: PaymentMethod) => {
    const current = formData.supportedWithdrawalMethods || ALL_METHODS;
    if (current.includes(method)) {
      if (current.length === 1) {
        addToast({ type: 'warning', title: 'At Least One Method', message: 'You must support at least 1 payout method.' });
        return;
      }
      setFormData({ ...formData, supportedWithdrawalMethods: current.filter(m => m !== method) });
    } else {
      setFormData({ ...formData, supportedWithdrawalMethods: [...current, method] });
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await api.adminUpdateSettings({
        adminUsername: 'SuperAdmin',
        newSettings: formData,
      });
      await refreshUserData();
      addToast({
        type: 'success',
        title: 'Settings Saved! ⚙️',
        message: 'System parameters and conversion rate updated across platform.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Platform Global Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time control over economy, points conversion, daily limitations, and gateways.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Economy & Currency */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-bold text-slate-900 text-sm">Economy & Currency Conversion</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Conversion Rate (Points = $1.00 USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.conversionRate || 10000}
                  onChange={(e) => setFormData({ ...formData, conversionRate: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">
                  PAPAYA = $1 USD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Changing this immediately updates USD conversion values on user dashboards without redeploying code.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Default Ad Reward
                </label>
                <input
                  type="number"
                  value={formData.defaultAdReward || 2}
                  onChange={(e) => setFormData({ ...formData, defaultAdReward: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Default Daily Ad Limit
                </label>
                <input
                  type="number"
                  value={formData.defaultDailyLimit || 100}
                  onChange={(e) => setFormData({ ...formData, defaultDailyLimit: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Min Withdrawal (Papaya)
                </label>
                <input
                  type="number"
                  value={formData.minimumWithdrawal || 10000}
                  onChange={(e) => setFormData({ ...formData, minimumWithdrawal: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Referral Bonus (Papaya)
                </label>
                <input
                  type="number"
                  value={formData.referralReward || 50}
                  onChange={(e) => setFormData({ ...formData, referralReward: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono-numbers font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Toggles & Maintenance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">System Operations & Gates</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-900">Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Temporarily disables ad views & actions</div>
              </div>
              <input
                type="checkbox"
                checked={formData.maintenanceMode ?? false}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-4 h-4 accent-[#FF6B35]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-900">User Registrations</div>
                <div className="text-[11px] text-slate-400">Allow new Telegram users to sign up via /start</div>
              </div>
              <input
                type="checkbox"
                checked={formData.registrationEnabled ?? true}
                onChange={(e) => setFormData({ ...formData, registrationEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FF6B35]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-900">Withdrawals Enabled</div>
                <div className="text-[11px] text-slate-400">Allow cashout submissions in Cashout tab</div>
              </div>
              <input
                type="checkbox"
                checked={formData.withdrawalsEnabled ?? true}
                onChange={(e) => setFormData({ ...formData, withdrawalsEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FF6B35]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-900">Demo Sandbox Mode</div>
                <div className="text-[11px] text-slate-400">Shows DEMO MODE banner with test controls</div>
              </div>
              <input
                type="checkbox"
                checked={formData.demoMode ?? true}
                onChange={(e) => setFormData({ ...formData, demoMode: e.target.checked })}
                className="w-4 h-4 accent-[#FF6B35]"
              />
            </div>
          </div>
        </div>

        {/* Supported Payment Gateways */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Supported Payout Gateways</h3>
            <span className="text-[11px] text-slate-400">Toggle gateways available in Cashout tab</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_METHODS.map((method) => {
              const isEnabled = (formData.supportedWithdrawalMethods || ALL_METHODS).includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleToggleMethod(method)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isEnabled
                      ? 'border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{method}</span>
                  <span className="text-[10px] font-semibold">{isEnabled ? '✓ Active' : 'Off'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
