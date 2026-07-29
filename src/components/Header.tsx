import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  Plus,
  Bot,
  User,
  CheckCircle2,
  Clock,
  X,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    settings,
    toggleDarkMode,
    activityLogs,
    searchTerm,
    setSearchTerm,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Automatically close notifications panel when changing pages or tabs
  useEffect(() => {
    setNotificationsOpen(false);
  }, [activeTab]);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'ড্যাশবোর্ড ওভারভিউ';
      case 'orders':
        return 'সকল অর্ডার তালিকা';
      case 'new-order':
        return 'নতুন অর্ডার তৈরি';
      case 'customers':
        return 'কাস্টমার ডিরেক্টরি';
      case 'suppliers':
        return 'সাপ্লায়ার ম্যানেজমেন্ট 🏭';
      case 'notes':
        return 'ব্যবসার প্রয়োজনীয় নোটস 📝';
      case 'users':
        return 'ইউজার ও রোল ম্যানেজমেন্ট 👥';
      case 'products':
        return 'পণ্য ম্যানেজমেন্ট';
      case 'categories':
        return 'পণ্য ক্যাটাগরি';
      case 'inventory':
        return 'ইনভেন্টরি ও স্টক ট্র্যাক';
      case 'expenses':
        return 'ব্যবসার খরচের হিসাব';
      case 'expense-categories':
        return 'খরচের ক্যাটাগরি তালিকা';
      case 'reports':
        return 'বিক্রি ও লাভের রিপোর্ট';
      case 'ai-assistant':
        return 'Pureza AI সহকারী 🤖';
      case 'settings':
        return 'ব্যবসার সেটিংস';
      case 'profile':
        return 'ইউজার প্রোফাইল';
      default:
        return 'ড্যাশবোর্ড';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors px-4 lg:px-8 flex items-center justify-between">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center space-x-3 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            {getTitle()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Pureza Business Management System
          </p>
        </div>
      </div>

      {/* Middle Quick Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value && activeTab !== 'orders') {
                setActiveTab('orders');
              }
            }}
            placeholder="অর্ডার আইডি, ফোন বা কাস্টমারের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3 gap-1 sm:gap-2">
        {/* Quick Add Order Button */}
        <button
          onClick={() => setActiveTab('new-order')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন অর্ডার</span>
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all relative group"
          title="Pureza AI সহকারী"
        >
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>

        {/* Notifications Popover Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {activityLogs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500"></span>
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" /> সাম্প্রতিক অ্যাক্টিভিটি নোটিফিকেশন
                </h4>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {activityLogs.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">কোনো সাম্প্রতিক অ্যাক্টিভিটি নেই</p>
                ) : (
                  activityLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-teal-700 dark:text-teal-400">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                        {log.details}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> {log.userName}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    setActiveTab('settings');
                  }}
                  className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                >
                  কোর ডাটাবেস এক্সপোর্ট করতে সেটিংস দেখুন →
                </button>
              </div>
            </div>
          </>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-2.5 gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {currentUser?.name ? currentUser.name.charAt(0) : 'P'}
          </div>
          <div className="hidden xl:block text-left">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {currentUser?.name || 'মাসুদুর রহমান'}
            </h4>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
