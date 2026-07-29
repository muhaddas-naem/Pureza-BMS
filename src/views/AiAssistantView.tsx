import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Lightbulb,
  Zap,
  Copy,
  Check,
  TrendingUp,
  Package,
  MessageSquare,
  BarChart3,
  Trash2,
  PieChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AiAssistantView: React.FC = () => {
  const { orders, products, expenses, customers } = useApp();

  const totalSales = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'user' | 'ai'; text: string; time: string }>
  >([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি **Pureza AI বিজনেস অ্যাডভাইজার** 🤖।\n\nআমি আপনার রিয়েলটাইম সেলস, ইনভেন্টরি, কাস্টমার অর্ডার এবং খরচ ডাটাবেজ বিশ্লেষণ করে ব্যবসায়িক সিদ্ধান্ত নিতে সাহায্য করতে পারি।\n\nনিচের কুইক প্রম্পট ক্যাটাগরিগুলো থেকে বেছে নিন অথবা যেকোনো প্রশ্ন লিখুন!',
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'sales' | 'inventory' | 'support' | 'marketing'>('all');

  const promptCategories = [
    {
      id: 'sales',
      label: '📊 সেলস ও লাভ এনালাইসিস',
      prompts: [
        'আমার অর্ডারের ডেটা অনুযায়ী বর্তমান সেলস পারফরম্যান্স ও লাভের হিসাব দাও',
        'ঢাকায় ও ঢাকার বাইরে বিক্রি এবং কুরিয়ার ডেলিভারি চার্জের সামারি বিশ্লেষণ করো',
        'সবচেয়ে বেশি বিক্রি হওয়া টপ প্রফিটেবল আইটেম কোনগুলো?',
      ],
    },
    {
      id: 'inventory',
      label: '📦 স্টক ও রিস্টক গাইড',
      prompts: [
        'কোন প্রোডাক্টের স্টক কমে গেছে এবং কত পিস রিস্টক করা দরকার?',
        'ইনভেন্টরির বর্তমান মোট বিক্রয়মূল্য ও কেনা মূল্যের হিসাব দাও',
        'স্টকে পড়ে থাকা মন্থর বিক্রির প্রোডাক্টগুলোর জন্য কৌশল দাও',
      ],
    },
    {
      id: 'support',
      label: '💬 কাস্টমার মেসেজ টেমপ্লেট',
      prompts: [
        'কাস্টমারকে কুরিয়ার ট্র্যাকিং কোড পাঠানোর একটি মার্জিত থ্যাঙ্ক ইউ মেসেজ লিখে দাও',
        'লেট ডেলিভারি হলে কাস্টমারের রাগ প্রশমনের জন্য অমায়িক ক্ষমা প্রার্থনার টেক্সট দাও',
        'বিকাশ/নগদে এডভান্স পেমেন্ট করার অনুরোধ জানিয়ে সুন্দর মেসেজ বানাও',
      ],
    },
    {
      id: 'marketing',
      label: '🎯 অফার ও মার্কেটিং আইডিয়া',
      prompts: [
        'ফেসবুক ও ইনস্টাগ্রামের জন্য নতুন ডিসকাউন্ট অফারের ক্যাপশন ও কুপন কোড দাও',
        'প্রোডাক্ট রিটেনশন বাড়ানোর জন্য আগের কাস্টমারদের কিভাবে রি-টার্গেট করবো?',
        'কম খরচে অর্গানিক রিচ ও পেজ এঙ্গেজমেন্ট বাড়ানোর ৩টি সিক্রেট টিপস দাও',
      ],
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const msgId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      { id: 'user-' + msgId, sender: 'user', text: query, time: userTime },
    ]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          context: {
            totalOrders: orders.length,
            totalSales,
            totalExpenses,
            netProfitEstimate: totalSales - totalExpenses,
            productCount: products.length,
            lowStockProducts: products
              .filter((p) => p.currentStock <= p.minStock)
              .map((p) => ({ name: p.name, currentStock: p.currentStock, minStock: p.minStock })),
            customerCount: customers.length,
            recentOrders: orders.slice(0, 10).map((o) => ({
              number: o.orderNumber,
              total: o.grandTotal,
              district: o.district,
              status: o.orderStatus,
              courier: o.courier,
            })),
          },
        }),
      });

      const data = await response.json();
      const aiTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + msgId,
          sender: 'ai',
          text: data.reply || data.text || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।',
          time: aiTime,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + msgId,
          sender: 'ai',
          text: 'এআই সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার পাঠান।',
          time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown-like simple formatting (bold, bullets)
  const formatAiMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line;

      // Handle bold text **bold**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={i} className="min-h-[1.2rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-teal-300 dark:text-teal-200">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 rounded-3xl text-white shadow-xl border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 font-bold text-xs rounded-full border border-teal-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Gemini 3.6 Flash Realtime AI
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
            Pureza Smart Business AI Advisor 🤖
          </h2>
          <p className="text-xs text-slate-300">
            আপনার ডাটাবেজের রিয়েলটাইম ইনভেন্টরি, বিক্রি ও খরচ বিশ্লেষণ করে সরাসরি ব্যবসায়িক সিদ্ধান্ত নিন
          </p>
        </div>

        <button
          onClick={() =>
            handleSend(
              'আমার সম্পূর্ণ ব্যবসার একটি পূর্ণাঙ্গ অডিট ও সমসাময়িক পারফরম্যান্স রিপোর্ট দাও'
            )
          }
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer shrink-0 transition-transform active:scale-95"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>১-ক্লিকে ফুল বিজনেস অডিট</span>
        </button>
      </div>

      {/* Live Business Data Context Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">মোট অর্ডার</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white">
              {orders.length} টি
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            🛒
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">মোট বিক্রি</span>
            <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
              ৳{totalSales.toLocaleString('bn-BD')}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            💰
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">লো স্টক সতর্কতা</span>
            <span
              className={`text-base font-extrabold ${
                lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              {lowStockCount} টি
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">মোট কাস্টমার</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white">
              {customers.length} জন
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            👥
          </div>
        </div>
      </div>

      {/* Prompt Category Tabs & Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" /> স্মার্ট এআই প্রম্পট ক্যাটাগরি:
          </span>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset-' + Date.now(),
                  sender: 'ai',
                  text: 'চ্যাট ইতিহাস রিসেট করা হয়েছে। আপনার নতুন প্রশ্ন করুন!',
                  time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> চ্যাট রিফ্রেশ
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {promptCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2 shadow-xs"
            >
              <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1">
                {cat.label}
              </h4>
              <div className="space-y-1.5">
                {cat.prompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{p}</span>
                    <span className="text-[10px] text-teal-500 opacity-0 group-hover:opacity-100 font-bold shrink-0">
                      পাঠান →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 h-[480px] overflow-y-auto space-y-4 shadow-sm relative">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gradient-to-tr from-teal-900 to-emerald-800 text-teal-200 border border-teal-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-teal-300" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="space-y-1">{formatAiMessage(msg.text)}</div>

              <div className="flex items-center justify-between pt-1 border-t border-black/10 dark:border-white/10 text-[9px] opacity-70">
                <span>{msg.time}</span>

                {msg.sender === 'ai' && (
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.text)}
                    className="hover:text-teal-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> কপি হয়েছে
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> কপি করুন
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-teal-500 font-bold p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Pureza AI রিয়েলটাইম ইনভেন্টরি ও সেলস ডাটাবেজ বিশ্লেষণ করে উত্তর প্রস্তুত করছে...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="আপনার ব্যবসা, স্টক বা নতুন প্রচারণার বিষয়ে যেকোনো প্রশ্ন করুন..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>পাঠান</span>
        </button>
      </div>
    </div>
  );
};
