import React, { useState } from 'react';
import { Store, Lock, Phone, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, settings } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone.trim()) {
      setErrorMsg('অনুগ্রহ করে মোবাইল নম্বর দিন।');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(phone, password);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message || 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে!');
      }
    }, 300);
  };

  const handleQuickFill = (p: string, pass: string) => {
    setPhone(p);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {settings.companyName || 'Pureza Business Management'}
          </h1>
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            লগইন প্যানেল (Phone & Password)
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Credentials Helper */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-xs space-y-2 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-teal-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> প্রধান এডমিন ডেমো লগইন:
            </span>
            <button
              type="button"
              onClick={() => handleQuickFill('01818585331', 'naem@pureza')}
              className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold rounded-lg border border-teal-500/30 transition-colors cursor-pointer"
            >
              স্বয়ংক্রিয় বসান
            </button>
          </div>
          <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
            <div>ফোন: <span className="text-white font-semibold">01818585331</span></div>
            <div>পাসওয়ার্ড: <span className="text-white font-semibold">naem@pureza</span></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              মোবাইল নম্বর <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="01818585331"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              পাসওয়ার্ড <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>প্রবেশ করা হচ্ছে...</span>
              </>
            ) : (
              <span>প্রবেশ করুন (Login)</span>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit সেশন এনক্রিপশন ও সিকিউরিটি প্রোটেকশন সক্রিয়</span>
        </div>
      </div>
    </div>
  );
};
