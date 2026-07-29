import React, { useState } from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { User, UserRole } from '../types';
import {
  UserCog,
  Plus,
  Search,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
} from 'lucide-react';

const availableTabs: { id: ActiveTab; label: string }[] = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড' },
  { id: 'new-order', label: 'নতুন অর্ডার' },
  { id: 'orders', label: 'সকল অর্ডার' },
  { id: 'customers', label: 'কাস্টমার' },
  { id: 'suppliers', label: 'সাপ্লায়ার' },
  { id: 'notes', label: 'নোটস (Keep)' },
  { id: 'products', label: 'পণ্য' },
  { id: 'categories', label: 'ক্যাটাগরি' },
  { id: 'inventory', label: 'ইনভেন্টরি' },
  { id: 'expenses', label: 'খরচ' },
  { id: 'expense-categories', label: 'খরচের ক্যাটাগরি' },
  { id: 'reports', label: 'রিপোর্ট' },
  { id: 'ai-assistant', label: 'AI সহকারী' },
  { id: 'users', label: 'ইউজার ও রোলস' },
  { id: 'settings', label: 'সেটিংস' },
  { id: 'profile', label: 'প্রোফাইল' },
];

export const UsersView: React.FC = () => {
  const { usersList, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    status: 'Active' | 'Inactive';
    permissions: string[];
  }>({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'Active',
    permissions: ['dashboard', 'orders', 'new-order', 'customers', 'notes', 'profile'],
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'Staff',
      status: 'Active',
      permissions: ['dashboard', 'orders', 'new-order', 'customers', 'notes', 'profile'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      password: user.password || '',
      role: user.role,
      status: user.status || 'Active',
      permissions: user.permissions || availableTabs.map((t) => t.id),
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (tabId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(tabId);
      const updated = exists
        ? prev.permissions.filter((p) => p !== tabId)
        : [...prev.permissions, tabId];
      return { ...prev, permissions: updated };
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: availableTabs.map((t) => t.id),
    }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: ['dashboard', 'profile'],
    }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    let defaultPerms: string[] = [];
    if (newRole === 'Admin') {
      defaultPerms = availableTabs.map((t) => t.id);
    } else if (newRole === 'Manager') {
      defaultPerms = [
        'dashboard',
        'orders',
        'new-order',
        'customers',
        'suppliers',
        'notes',
        'products',
        'categories',
        'inventory',
        'expenses',
        'reports',
        'profile',
      ];
    } else if (newRole === 'Staff') {
      defaultPerms = ['dashboard', 'orders', 'new-order', 'customers', 'notes', 'profile'];
    } else {
      defaultPerms = ['orders', 'new-order', 'profile'];
    }

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: defaultPerms,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('নাম এবং মোবাইল নম্বর আবশ্যিক!');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions,
      });
    } else {
      addUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password || '123456',
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (userId: string, name: string) => {
    if (userId === 'usr-1' || name.includes('Main Admin')) {
      alert('মেইন এডমিন অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়!');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিত '${name}' অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      deleteUser(userId);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            ইউজার ও রোল ভিত্তিক পারমিশন ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            অ্যাডমিন, ম্যানেজার ও স্টাফ তৈরি করুন এবং কোন স্টাফ কোন পেজে ঢুকতে পারবে নির্দিষ্ট করে দিন।
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ইউজার যোগ করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">ফিল্টার:</span>
          {['all', 'Admin', 'Manager', 'Staff', 'Courier'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                roleFilter === r
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r === 'all' ? 'সবাই' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isAdmin = user.role === 'Admin';
          const isManager = user.role === 'Manager';
          const isStaff = user.role === 'Staff';
          const isActive = user.status !== 'Inactive';

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : isManager
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {user.role}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> সক্রিয়
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-500" /> নিষ্ক্রিয়
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="ইউজার সংশোধন"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.id !== 'usr-1' && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl mb-4">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="font-semibold">{user.phone}</span>
                  </p>
                  {user.email && (
                    <p className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>পাসওয়ার্ড: <strong className="font-mono text-slate-700 dark:text-slate-200">{user.password || '••••••'}</strong></span>
                  </p>
                </div>

                {/* Allowed Permissions Preview */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    অ্যাক্সেসযোগ্য পেজসমূহ ({(user.permissions || availableTabs.map((t) => t.id)).length}):
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                    {user.role === 'Admin' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        ⚡ সম্পূর্ণ সিস্টেম অ্যাক্সেস (All Permissions)
                      </span>
                    ) : (
                      (user.permissions || []).map((p) => {
                        const tabLabel = availableTabs.find((t) => t.id === p)?.label || p;
                        return (
                          <span
                            key={p}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {tabLabel}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                {editingUser ? 'ইউজার তথ্য ও পারমিশন সংশোধন' : 'নতুন ইউজার যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইউজারের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: কামরুল ইসলাম"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর (লগইন আইডি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="গোপন পাসওয়ার্ড দিন"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@pureza.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইউজার রোল (User Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Admin">Admin (সম্পূর্ণ অ্যাক্সেস)</option>
                    <option value="Manager">Manager (ম্যানেজমেন্ট অ্যাক্সেস)</option>
                    <option value="Staff">Staff (সীমিত কাস্টম অ্যাক্সেস)</option>
                    <option value="Courier">Courier / Delivery (অর্ডার অ্যাক্সেস)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    অ্যাকাউন্ট স্ট্যাটাস
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Active">সক্রিয় (Active - লগইন করতে পারবে)</option>
                    <option value="Inactive">নিষ্ক্রিয় (Inactive - লগইন ব্লক থাকবে)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Control Checkboxes */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-teal-600" />
                    কোন কোন পেজ দেখার অনুমতি থাকবে (Tab Permissions):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      সব সিলেক্ট করুন
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      ক্লিয়ার করুন
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableTabs.map((tab) => {
                    const isChecked = formData.permissions.includes(tab.id);
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTogglePermission(tab.id)}
                        className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                >
                  {editingUser ? 'তথ্য সেভ করুন' : 'নতুন ইউজার তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
