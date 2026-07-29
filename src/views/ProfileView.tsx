import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Clock,
  KeyRound,
  Edit2,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Save,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, logout, activityLogs, updateUserProfile, changeUserPassword } = useApp();

  // Profile Edit State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateUserProfile({
      name,
      email,
      phone,
      avatar,
    });

    setProfileSuccessMsg('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (!currentPassword) {
      setPassErrorMsg('বর্তমান পাসওয়ার্ড লিখুন!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErrorMsg('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    changeUserPassword(currentPassword, newPassword);
    setPassSuccessMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400/50 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/30">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser?.role || 'Admin'} এক্সেস অ্যাকাউন্ট</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentUser?.name || 'মাসুদুর রহমান'}</h2>
            <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-teal-400" /> {currentUser?.email || 'admin@pureza.com'}
            </p>
          </div>

          <div className="sm:ml-auto">
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form and Password Change Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserCheck className="w-4 h-4 text-teal-600" /> ইউজার পরিচিতি এডিট করুন
          </h3>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">ইমেইল ঠিকানা *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">মোবাইল নাম্বার</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">প্রোফাইল ছবি (URL)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-[11px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>প্রোফাইল সেভ করুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-amber-500" /> সিকিউরিটি পাসওয়ার্ড পরিবর্তন
          </h3>

          {passErrorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
              {passErrorMsg}
            </div>
          )}

          {passSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {passSuccessMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">বর্তমান পাসওয়ার্ড *</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">নতুন পাসওয়ার্ড *</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="অন্তত ৬ অক্ষরের পাসওয়ার্ড"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
              <input
                type="password"
                required
                placeholder="পুনরায় পাসওয়ার্ডটি লিখুন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>পাসওয়ার্ড আপডেট করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User Activity Logs */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-teal-600" /> আপনার সাম্প্রতিক অ্যাক্টিভিটি হিস্ট্রি
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {activityLogs.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-4">কোনো সাম্প্রতিক অ্যাক্টিভিটি পাওয়া যায়নি।</p>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-teal-600 dark:text-teal-400 block">{log.action}</span>
                  <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
