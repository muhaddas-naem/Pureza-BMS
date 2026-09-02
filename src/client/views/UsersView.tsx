import React, { useState } from 'react';
import { ShieldCheck, Plus, UserCheck, Trash2, Edit2, X, Phone, Shield, Lock, CheckCircle2, Circle } from 'lucide-react';
import { useApp, ActiveTab } from '../context/AppContext';
import { User, UserRole } from '../../types';

const ALL_MODULES: { id: ActiveTab; name: string }[] = [
  { id: 'dashboard', name: 'ড্যাশবোর্ড' },
  { id: 'orders', name: 'অর্ডার তালিকা' },
  { id: 'new-order', name: 'নতুন অর্ডার ক্রিয়েট' },
  { id: 'customers', name: 'কাস্টমার তালিকা' },
  { id: 'suppliers', name: 'সাপ্লায়ার ডিরেক্টরি' },
  { id: 'products', name: 'প্রোডাক্ট ক্যাটালগ' },
  { id: 'inventory', name: 'স্টক ম্যানেজমেন্ট' },
  { id: 'expenses', name: 'খরচ ও আয় হিসাব' },
  { id: 'reports', name: 'রিপোর্ট ও বিশ্লেষণ' },
  { id: 'notes', name: 'নোট ও খসড়া' },
  { id: 'users', name: 'ইউজার ও রোলস' },
  { id: 'settings', name: 'সিস্টেম সেটিংস' },
];

export const UsersView: React.FC = () => {
  const { usersList, addUser, updateUser, deleteUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [permissions, setPermissions] = useState<string[]>([
    'dashboard',
    'orders',
    'new-order',
    'customers',
    'products',
  ]);

  const openAdd = () => {
    setEditingUser(null);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('123456');
    setRole('Staff');
    setStatus('Active');
    setPermissions(['dashboard', 'orders', 'new-order', 'customers', 'products']);
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setPhone(user.phone);
    setEmail(user.email || '');
    setPassword(user.password || '');
    setRole(user.role);
    setStatus(user.status || 'Active');
    setPermissions(user.permissions || ALL_MODULES.map((m) => m.id));
    setIsModalOpen(true);
  };

  const togglePermission = (modId: string) => {
    if (permissions.includes(modId)) {
      setPermissions(permissions.filter((p) => p !== modId));
    } else {
      setPermissions([...permissions, modId]);
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setPermissions(ALL_MODULES.map((m) => m.id));
    } else if (selectedRole === 'Manager') {
      setPermissions([
        'dashboard',
        'orders',
        'new-order',
        'customers',
        'suppliers',
        'products',
        'categories',
        'inventory',
        'expenses',
        'reports',
        'notes',
      ]);
    } else if (selectedRole === 'Courier') {
      setPermissions(['dashboard', 'orders']);
    } else {
      setPermissions(['dashboard', 'orders', 'new-order', 'customers', 'products']);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password || editingUser.password,
        role,
        status,
        permissions,
      });
    } else {
      addUser({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password || '123456',
        role,
        status,
        permissions,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-teal-600" />
            ইউজার ও রোল পারমিশন সিস্টেম
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট ইউজার: <strong className="text-teal-600 dark:text-teal-400">{usersList.length}</strong> জন | প্রতিটি রোল অনুযায়ী মডিউল পারমিশন নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ইউজার তৈরি</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersList.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {user.name}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.status === 'Inactive' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({user.status || 'Active'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(user)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 cursor-pointer"
                  title="এডিট"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="ডিলেট"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <p className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {user.phone}
              </p>
              {user.email && <p className="text-slate-400 pl-5">{user.email}</p>}
            </div>

            {/* Allowed Module Badges */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">এক্সেস মডিউলসমূহ:</span>
              <div className="flex flex-wrap gap-1">
                {user.role === 'Admin' ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold">
                    সব মডিউল পারমিশন (Full Admin)
                  </span>
                ) : user.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((p) => {
                    const modName = ALL_MODULES.find((m) => m.id === p)?.name || p;
                    return (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-medium"
                      >
                        {modName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[10px] text-slate-400 italic">কোন মডিউল সিলেক্ট করা নেই</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {editingUser ? 'ইউজার ও এক্সেস সংশোধন' : 'নতুন ইউজার ও রোল তৈরি'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইউজারের নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ফোন নম্বর (লগইন আইডি) *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ডিফল্ট: 123456"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">রোল (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="Admin">Admin (সব সুবিধা)</option>
                    <option value="Manager">Manager (ম্যানেজমেন্ট)</option>
                    <option value="Staff">Staff (সাধারণ এন্ট্রি)</option>
                    <option value="Courier">Courier (ডেলিভারি)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">স্ট্যাটাস</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="Active">Active (সক্রিয়)</option>
                    <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              {/* Specific Module Permissions */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  অনুমোদিত মডিউলসমূহ (Permissions):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {ALL_MODULES.map((mod) => {
                    const isChecked = permissions.includes(mod.id) || role === 'Admin';
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        disabled={role === 'Admin'}
                        onClick={() => togglePermission(mod.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className="text-[11px]">{mod.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

