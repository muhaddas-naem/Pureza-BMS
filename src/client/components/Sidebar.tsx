import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingCart,
  Users,
  Building2,
  FileText,
  Package,
  Tags,
  Layers,
  Receipt,
  FolderKanban,
  BarChart3,
  Bot,
  ShieldCheck,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp, ActiveTab } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    settings,
    toggleDarkMode,
  } = useApp();

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.phone === '01818585331';

  // Check if current user has permission for a specific tab
  const hasPermission = (tabId: ActiveTab): boolean => {
    if (isAdmin) return true;
    if (currentUser?.permissions && currentUser.permissions.length > 0) {
      return currentUser.permissions.includes(tabId);
    }
    // Default fallback allowed tabs for non-admin without explicit permissions
    if (currentUser?.role === 'Manager') {
      return tabId !== 'users' && tabId !== 'settings';
    }
    if (currentUser?.role === 'Staff') {
      return ['dashboard', 'orders', 'new-order', 'customers', 'products', 'inventory', 'notes', 'profile'].includes(tabId);
    }
    if (currentUser?.role === 'Courier') {
      return ['dashboard', 'orders', 'profile'].includes(tabId);
    }
    return true;
  };

  const menuGroups: MenuGroup[] = [
    {
      title: 'প্রধান সেকশন',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        { id: 'new-order', label: 'নতুন অর্ডার', icon: PlusCircle, badge: 'NEW', badgeColor: 'bg-emerald-500' },
        { id: 'orders', label: 'সকল অর্ডার', icon: ShoppingCart },
        { id: 'customers', label: 'কাস্টমার তালিকা', icon: Users },
        { id: 'suppliers', label: 'সাপ্লায়ার ডিরেক্টরি', icon: Building2 },
        { id: 'notes', label: 'ব্যবসার নোটস', icon: FileText },
      ],
    },
    {
      title: 'ইনভেন্টরি ও পণ্য',
      items: [
        { id: 'products', label: 'পণ্য ম্যানেজমেন্ট', icon: Package },
        { id: 'categories', label: 'পণ্য ক্যাটাগরি', icon: Tags },
        { id: 'inventory', label: 'ইনভেন্টরি ও স্টক', icon: Layers },
      ],
    },
    {
      title: 'হিসাব ও রিপোর্ট',
      items: [
        { id: 'expenses', label: 'ব্যবসার খরচ', icon: Receipt },
        { id: 'expense-categories', label: 'খরচের ক্যাটাগরি', icon: FolderKanban },
        { id: 'reports', label: 'রিপোর্ট ও বিশ্লেষণ', icon: BarChart3 },
      ],
    },
    {
      title: 'সিস্টেম ও এডমিন',
      items: [
        { id: 'users', label: 'ইউজার ও পারমিশন', icon: ShieldCheck },
        { id: 'settings', label: 'ব্যবসার সেটিংস', icon: Settings },
        { id: 'profile', label: 'ইউজার প্রোফাইল', icon: User },
      ],
    },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-teal-600 dark:to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {settings.companyName ? settings.companyName.charAt(0) : 'P'}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                {settings.companyName || 'Pureza Skincare'}
              </h1>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">
                {settings.tagline || 'Business ERP System'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => hasPermission(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </h3>

                <div className="space-y-0.5 mt-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-extrabold text-white rounded-full ${
                                isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-teal-500'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom System Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition-all cursor-pointer"
            title="লগআউট করুন"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">লগআউট</span>
          </button>
        </div>
      </aside>
    </>
  );
};
