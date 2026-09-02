import React, { useState } from 'react';
import { User as UserIcon, Lock, Key, Save, CheckCircle, Shield, History, Activity, Phone, Mail, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile, changeUserPassword, activityLogs } = useApp();
  const [profileSaved, setProfileSaved] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const [name, setName] = useState(currentUser?.name || 'নাঈম ইসলাম');
  const [email, setEmail] = useState(currentUser?.email || 'naem@pureza.com.bd');
  const [phone, setPhone] = useState(currentUser?.phone || '01818585331');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPass !== confirmPass) {
      setPassError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }
    if (newPass.length < 4) {
      setPassError('পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে');
      return;
    }

    const success = changeUserPassword(currentPass, newPass);
    if (success) {
      setPassSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      setPassError('বর্তমান পাসওয়ার্ড ভুল দেওয়া হয়েছে');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-teal-600" />
          ইউজার প্রোফাইল ও অ্যাক্টিভিটি
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          আপনার অ্যাকাউন্ট তথ্য, পাসওয়ার্ড নিরাপত্তা ও সাম্প্রতিক অ্যাক্টিভিটি লগ
        </p>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-600/20">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {currentUser?.name || 'মাসুদুর রহমান'}
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-extrabold">
                {currentUser?.role || 'Admin'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
              <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {currentUser?.phone} |
              <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6">
          <p className="flex items-center gap-1 sm:justify-end font-semibold text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            স্ট্যাটাস: <strong className="text-emerald-600">Active (সক্রিয়)</strong>
          </p>
          <p className="text-[11px] text-slate-400">লাস্ট অ্যাক্টিভ: {currentUser?.lastActive || 'এখনই'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-teal-600" />
            ব্যক্তিগত তথ্য আপডেট
          </h3>

          {profileSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ফোন নম্বর (লগইন আইডি)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">রোল ও এক্সেস</label>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {currentUser?.role || 'Admin'} (সর্বোচ্চ ক্ষমতা)
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>প্রোফাইল সেভ করুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600" />
            পাসওয়ার্ড পরিবর্তন
          </h3>

          {passError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              পাসওয়ার্ড পরিবর্তন সফল হয়েছে!
            </div>
          )}

          <form onSubmit={handleChangePass} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বর্তমান পাসওয়ার্ড</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">নতুন পাসওয়ার্ড</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">কনফার্ম নতুন পাসওয়ার্ড</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User Activity Logs Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            আপনার সিস্টেমে সম্প্রতি করা কাজ ও লগ (Activity History)
          </span>
          <span className="text-slate-400 font-normal text-[11px]">মোট {activityLogs.length} টি রেকর্ড</span>
        </h3>

        <div className="space-y-3">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="font-extrabold text-teal-600 dark:text-teal-400 block">{log.action}</span>
                <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

