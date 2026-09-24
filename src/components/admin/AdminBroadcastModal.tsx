import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import { X, Send, Megaphone, AlertCircle } from 'lucide-react';

export const AdminBroadcastModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToast } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleProceed = () => {
    if (!title.trim() || !message.trim()) {
      addToast({ type: 'error', title: 'Missing Content', message: 'Title and broadcast message are required.' });
      return;
    }
    setShowConfirm(true);
  };

  const handleSendBroadcast = async () => {
    setIsSending(true);
    try {
      const res = await api.adminBroadcast({
        adminUsername: 'SuperAdmin',
        title: title.trim(),
        message: message.trim(),
      });
      addToast({
        type: 'success',
        title: 'Broadcast Dispatched! 📢',
        message: `Notification delivered to all ${res.recipientCount} active accounts.`,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Broadcast Failed', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-bold text-slate-900 text-sm">Broadcast Announcement</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showConfirm ? (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash 2x Weekend Ad Multiplier is LIVE! 🍈"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Message Body
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement to all Telegram users..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {/* Live Message Preview */}
            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 text-[11px] space-y-1">
              <span className="font-bold text-orange-900 block">Preview in User Notification Drawer:</span>
              <div className="font-semibold text-slate-900">{title || 'Your Title Here'}</div>
              <div className="text-slate-600 leading-snug">{message || 'Your broadcast message preview will appear here...'}</div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
              >
                Review & Confirm
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Confirm Global Broadcast</h4>
                <p className="text-[11px] mt-0.5 text-amber-800 leading-snug">
                  This will immediately deliver a push notification to every registered Telegram user's Papaya Bot tray.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e05622] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Confirm & Send to All'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
