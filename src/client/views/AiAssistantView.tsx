import React, { useState } from 'react';
import { Bot, Send, Sparkles, ShoppingBag, Package, DollarSign, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAssistantView: React.FC = () => {
  const { orders, products, expenses } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'হ্যালো! আমি Pureza AI সহকারী। আপনার ব্যবসায়িক সিদ্ধান্ত গ্রহণে সাহায্য করার জন্য আমি প্রস্তুত। আপনি অর্ডার, স্টক বা বিক্রির তথ্য নিয়ে প্রশ্ন করতে পারেন।',
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');

  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const timeNow = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const newMsgs: Message[] = [...messages, { sender: 'user', text: userText, time: timeNow }];
    setMessages(newMsgs);
    setInput('');

    // Generate smart response based on context
    setTimeout(() => {
      let aiResponse = '';
      const q = userText.toLowerCase();

      if (q.includes('বিক্রি') || q.includes('সেল') || q.includes('অর্ডার')) {
        aiResponse = `আপনার বর্তমানে মোট অর্ডার সংখ্যা ${totalOrdersCount} টি এবং মোট বিক্রির পরিমাণ ৳${totalSales.toLocaleString('bn-BD')}।`;
      } else if (q.includes('স্টক') || q.includes('পণ্য') || q.includes('ইনভেন্টরি')) {
        aiResponse = `আপনার সিস্টেমে মোট ${products.length} টি পণ্য নিবন্ধিত আছে। এর মধ্যে ${lowStockCount} টি পণ্যের স্টক কম বা শেষ হওয়ার পথে।`;
      } else if (q.includes('খরচ') || q.includes('লাভ')) {
        const estProfit = totalSales - totalExpenses;
        aiResponse = `আপনার মোট খরচ ৳${totalExpenses.toLocaleString('bn-BD')} এবং আনুমানিক লাভ ৳${estProfit.toLocaleString('bn-BD')}।`;
      } else {
        aiResponse = `ধন্যবাদ আপনার প্রশ্নের জন্য। Pureza ERP সিস্টেমে আপনার ${totalOrdersCount} টি অর্ডার ও ${products.length} টি পণ্য সংরক্ষিত রয়েছে। আপনি যেকোনো প্রশ্ন জিজ্ঞেস করতে পারেন।`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse, time: timeNow }]);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Pureza AI সহকারী
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          কৃত্রিম বুদ্ধিমত্তার মাধ্যমে আপনার ব্যবসার তথ্য বিশ্লেষণ ও পরামর্শ
        </p>
      </div>

      {/* Quick Business Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-teal-600 p-1.5 bg-teal-50 dark:bg-teal-950/80 rounded-xl shrink-0" />
          <div>
            <p className="text-slate-400 font-medium text-[10px]">মোট অর্ডার</p>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">{totalOrdersCount} টি</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl shrink-0" />
          <div>
            <p className="text-slate-400 font-medium text-[10px]">মোট বিক্রি</p>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">৳{totalSales.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Package className="w-8 h-8 text-amber-600 p-1.5 bg-amber-50 dark:bg-amber-950/80 rounded-xl shrink-0" />
          <div>
            <p className="text-slate-400 font-medium text-[10px]">লো স্টক পণ্য</p>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">{lowStockCount} টি</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-rose-600 p-1.5 bg-rose-50 dark:bg-rose-950/80 rounded-xl shrink-0" />
          <div>
            <p className="text-slate-400 font-medium text-[10px]">মোট খরচ</p>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">৳{totalExpenses.toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-[480px] flex flex-col overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                }`}
              >
                {m.sender === 'user' ? 'ইউ' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <span className={`block text-[9px] text-right opacity-70 ${m.sender === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI সহকারীর কাছে প্রশ্ন করুন (যেমন: আজকের মোট বিক্রি কত?)..."
            className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">পাঠান</span>
          </button>
        </form>
      </div>
    </div>
  );
};
