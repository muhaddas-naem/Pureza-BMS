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
  Maximize,
  Minimize,
  ShoppingBag,
  Package,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCheck,
  Trash2,
  Filter,
  Layers,
  Sparkles,
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
    activityLogs,
    searchTerm,
    setSearchTerm,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Notification Filtering States
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<'all' | 'order' | 'product' | 'expense' | 'user'>('all');
  const [notifSearch, setNotifSearch] = useState('');

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.phone === '01818585331';

  // Role-based visible logs calculation:
  // Admin sees ALL logs (all users + system). Non-Admin sees ONLY their own actions or system updates.
  const userVisibleLogs = activityLogs.filter((log) => {
    if (isAdmin) return true; // Main Admin gets all notifications
    // Regular users see logs they created or system logs
    const isOwnAction =
      (log.userId && currentUser?.id && log.userId === currentUser.id) ||
      (log.userName && currentUser?.name && log.userName.toLowerCase() === currentUser.name.toLowerCase());
    const isSystemCategory = log.category === 'system';
    return isOwnAction || isSystemCategory;
  });

  // Filtered by internal notification search & category
  const filteredNotifications = userVisibleLogs.filter((log) => {
    // Category filter
    if (notifCategoryFilter === 'order' && log.category !== 'order') return false;
    if (notifCategoryFilter === 'product' && log.category !== 'product' && log.category !== 'inventory') return false;
    if (notifCategoryFilter === 'expense' && log.category !== 'expense') return false;
    if (notifCategoryFilter === 'user' && log.category !== 'user') return false;

    // Search filter
    if (notifSearch.trim()) {
      const q = notifSearch.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchUser = log.userName.toLowerCase().includes(q);
      return matchAction || matchDetails || matchUser;
    }

    return true;
  });

  const unreadCount = userVisibleLogs.filter((log) => !log.isRead).length;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Full screen failed: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error(`Exit full screen failed: ${err.message}`);
        });
      }
    }
  };

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

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'product':
      case 'inventory':
        return <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'expense':
        return <DollarSign className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'user':
        return <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
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

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন (Normal View)' : 'ফুলস্ক্রিন মনিটর মোড (Full Screen View)'}
        >
          {isFullscreen ? <Minimize className="w-5 h-5 text-teal-600 dark:text-teal-400" /> : <Maximize className="w-5 h-5" />}
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
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative cursor-pointer"
            title="নোটিফিকেশন সেন্টার"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] leading-none animate-pulse shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3.5 z-50 animate-fade-in font-sans">
                
                {/* Header */}
                <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-teal-600" /> নোটিফিকেশন সেন্টার
                        {isAdmin && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            মেইন এডমিন ভিউ (All Users)
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isAdmin
                          ? 'সকল ইউজারের কার্যকলাপ ও সিস্টেম অ্যালার্ট'
                          : 'আপনার সম্পাদন করা কাজ ও সিস্টেম আপডেটসমূহ'}
                      </p>
                    </div>

                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions bar (Mark All Read & Clear) */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      মোট: <strong className="text-teal-600">{userVisibleLogs.length}</strong> টি
                      {unreadCount > 0 && <span className="text-rose-500 ml-1">({unreadCount} অদেখা)</span>}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>সব পঠিত</span>
                        </button>
                      )}
                      {userVisibleLogs.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>মুছে ফেলুন</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search inside Notification popover */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      placeholder="নোটিফিকেশন খুঁজুন (ইউজার, অ্যাকশন)..."
                      className="w-full pl-8 pr-7 py-1 text-[11px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                    {notifSearch && (
                      <button
                        onClick={() => setNotifSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1 pt-1 text-[10px] font-bold">
                    <button
                      onClick={() => setNotifCategoryFilter('all')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        notifCategoryFilter === 'all'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      সকল
                    </button>
                    <button
                      onClick={() => setNotifCategoryFilter('order')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        notifCategoryFilter === 'order'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      অর্ডার
                    </button>
                    <button
                      onClick={() => setNotifCategoryFilter('product')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        notifCategoryFilter === 'product'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      স্টক/পণ্য
                    </button>
                    <button
                      onClick={() => setNotifCategoryFilter('expense')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        notifCategoryFilter === 'expense'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      খরচ
                    </button>
                    <button
                      onClick={() => setNotifCategoryFilter('user')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        notifCategoryFilter === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ইউজার
                    </button>
                  </div>
                </div>

                {/* Log List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 px-4 text-xs text-slate-400 space-y-1">
                      <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
                      <p>কোনো নোটিফিকেশন পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    filteredNotifications.map((log) => {
                      const isUnread = !log.isRead;
                      return (
                        <div
                          key={log.id}
                          onClick={() => markNotificationAsRead(log.id)}
                          className={`p-3.5 transition-colors cursor-pointer ${
                            isUnread
                              ? 'bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                              {getCategoryIcon(log.category)}
                              <span>{log.action}</span>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {log.details}
                          </p>

                          {/* Performed By User Pill */}
                          <div className="mt-2 pt-1 border-t border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-teal-600" />
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {log.userName}
                              </span>
                              {log.userRole && (
                                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[9px] text-slate-600 dark:text-slate-300">
                                  {log.userRole}
                                </span>
                              )}
                            </span>

                            {log.category === 'order' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotificationsOpen(false);
                                  setActiveTab('orders');
                                }}
                                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                              >
                                অর্ডার দেখুন →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('inventory');
                    }}
                    className="text-[11px] text-teal-600 dark:text-teal-400 font-bold hover:underline"
                  >
                    স্টক হিস্ট্রি ফ্ল্যাট লগ →
                  </button>

                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('settings');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    সেটিংস
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
