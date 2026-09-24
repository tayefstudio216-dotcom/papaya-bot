import React, { useState, useRef, useEffect } from 'react';
import { useApp, AppTab } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ASSETS } from '../../constants/assets.ts';
import { Send, ArrowLeft, Terminal, Bot, Sparkles, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  buttons?: { text: string; action?: string; url?: string }[];
}

export const TelegramBotChatSimulator: React.FC = () => {
  const { user, setCurrentView, setActiveTab, settings } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `🍈 *Papaya Bot online!*\n\nWelcome to Papaya Bot. Tap /start or click any quick action below to interact with the bot.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buttons: [
        { text: '🚀 Open Mini App', action: 'open_app' },
        { text: '💰 /balance', action: 'cmd_balance' },
        { text: '🎯 /tasks', action: 'cmd_tasks' },
        { text: 'ℹ️ /help', action: 'cmd_help' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !user) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await api.sendBotCommand(user.telegramId, text);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: res.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        buttons: res.inlineButtons,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Error executing command: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleButtonClick = (action?: string) => {
    if (!action) return;
    if (action === 'open_app') {
      setCurrentView('user');
      setActiveTab('dashboard');
    } else if (action === 'withdraw') {
      setCurrentView('user');
      setActiveTab('withdraw');
    } else if (action === 'tasks') {
      setCurrentView('user');
      setActiveTab('tasks');
    } else if (action === 'mt_ads') {
      setCurrentView('user');
      setActiveTab('mt_ads');
    } else if (action === 'ad_ads') {
      setCurrentView('user');
      setActiveTab('ad_ads');
    } else if (action === 'share_referral') {
      setCurrentView('user');
      setActiveTab('referral');
    } else if (action.startsWith('cmd_')) {
      const cmd = `/${action.replace('cmd_', '')}`;
      handleSendMessage(cmd);
    }
  };

  const quickCommands = ['/start', '/balance', '/tasks', '/withdraw', '/referral', '/help'];

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[82vh]">
      {/* Telegram Chat Header */}
      <div className="bg-[#242F3D] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('user')}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Back to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 shrink-0 border border-white/20">
            <img
              src={ASSETS.papayaLogo}
              alt="Papaya Bot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
              <span>{settings?.botName || 'Papaya Bot'}</span>
              <Bot className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-[11px] text-emerald-400 font-medium leading-none mt-0.5">
              bot · online
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('user')}
          className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors"
        >
          Open Mini App
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0E1621] text-slate-100">
        <div className="text-center my-2">
          <span className="text-[11px] bg-[#182533] text-slate-400 px-3 py-1 rounded-full font-medium">
            Simulated Telegram Bot Interface
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#2B5278] text-white rounded-br-xs'
                  : 'bg-[#182533] text-slate-100 rounded-bl-xs border border-white/5'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              <div className="text-[10px] text-white/50 text-right mt-1 font-mono-numbers">
                {m.timestamp}
              </div>
            </div>

            {/* Inline Buttons under Bot Message */}
            {m.buttons && m.buttons.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 w-full max-w-[85%]">
                {m.buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleButtonClick(btn.action)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#2B5278]/80 hover:bg-[#2B5278] text-white font-medium text-[11px] transition-colors text-center border border-white/10 truncate active:scale-95"
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 italic bg-[#182533] max-w-[120px] p-2 rounded-xl">
            <span className="animate-pulse">Bot is typing...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Command Pills */}
      <div className="px-3 py-2 bg-[#17212B] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleSendMessage(cmd)}
            className="px-2.5 py-1 rounded-lg bg-[#242F3D] hover:bg-[#2B5278] text-slate-300 text-[11px] font-mono whitespace-nowrap transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#17212B] border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message or send command (e.g. /start, /balance)..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#242F3D] text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/5"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
