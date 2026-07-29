import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  ListOrdered,
  Users,
  Package,
  FolderTree,
  Boxes,
  Receipt,
  Tags,
  BarChart3,
  Bot,
  Settings,
  UserCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  Store,
  Truck,
  StickyNote,
  UserCog,
} from 'lucide-react';
import { ActiveTab, useApp } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, orders, products, logout, settings, currentUser } = useApp();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'New' || o.orderStatus === 'Confirmed').length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const allMenuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'new-order', label: 'নতুন অর্ডার', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'orders', label: 'সকল অর্ডার', icon: <ListOrdered className="w-5 h-5" />, badge: pendingOrdersCount, badgeColor: 'bg-amber-500' },
    { id: 'customers', label: 'কাস্টমার', icon: <Users className="w-5 h-5" /> },
    { id: 'suppliers', label: 'সাপ্লায়ার', icon: <Truck className="w-5 h-5" /> },
    { id: 'notes', label: 'নোটস (Keep)', icon: <StickyNote className="w-5 h-5 text-amber-400" /> },
    { id: 'products', label: 'পণ্য', icon: <Package className="w-5 h-5" /> },
    { id: 'categories', label: 'ক্যাটাগরি', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'inventory', label: 'ইনভেন্টরি', icon: <Boxes className="w-5 h-5" />, badge: lowStockCount, badgeColor: 'bg-rose-500' },
    { id: 'expenses', label: 'খরচ', icon: <Receipt className="w-5 h-5" /> },
    { id: 'expense-categories', label: 'খরচের ক্যাটাগরি', icon: <Tags className="w-5 h-5" /> },
    { id: 'reports', label: 'রিপোর্ট', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'ai-assistant', label: 'AI সহকারী', icon: <Bot className="w-5 h-5 text-emerald-500 animate-pulse" /> },
    { id: 'users', label: 'ইউজার ও রোলস', icon: <UserCog className="w-5 h-5 text-cyan-400" /> },
    { id: 'settings', label: 'সেটিংস', icon: <Settings className="w-5 h-5" /> },
    { id: 'profile', label: 'প্রোফাইল', icon: <UserCheck className="w-5 h-5" /> },
  ];

  // Role Based Permission Filter
  const menuItems = allMenuItems.filter((item) => {
    if (!currentUser) return true;
    if (currentUser.role === 'Admin') return true;
    if (item.id === 'profile' || item.id === 'dashboard') return true;
    if (currentUser.permissions && currentUser.permissions.length > 0) {
      return currentUser.permissions.includes(item.id);
    }
    return true;
  });

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center space-x-3 gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide text-white font-serif truncate max-w-[150px]">
                  {settings.companyName || settings.businessName || 'Pureza PBMS'}
                </h1>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> বিজনেস প্যানেল
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              মেনু নির্দেশিকা
            </div>

            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 gap-2.5">
                    <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 gap-1">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${
                          item.badgeColor || 'bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User, Logout & Copyright */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <div className="flex items-center space-x-3 gap-2">
              <LogOut className="w-4 h-4" />
              <span>লগআউট করুন</span>
            </div>
          </button>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Powered by{' '}
              <a
                href="https://NaemSoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 font-bold hover:underline hover:text-teal-300 transition-colors"
              >
                NaemSoft LTD
              </a>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
