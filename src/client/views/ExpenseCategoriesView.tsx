import React, { useState } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ExpenseCategoriesView: React.FC = () => {
  const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, expenses } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: { id: string; name: string; description?: string }) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateExpenseCategory(editingId, name.trim(), description.trim());
    } else {
      addExpenseCategory(name.trim(), description.trim());
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-teal-600" />
            খরচের ক্যাটাগরি তালিকা
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট ক্যাটাগরি: <strong className="text-teal-600 dark:text-teal-400">{expenseCategories.length}</strong> টি
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খরচের খাত</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseCategories.map((cat) => {
          const totalCategoryExpense = expenses
            .filter((e) => e.category === cat.name || e.categoryName === cat.name)
            .reduce((acc, e) => acc + e.amount, 0);

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    মোট খরচ: ৳{totalCategoryExpense.toLocaleString('bn-BD')}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteExpenseCategory(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cat.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {editingId ? 'খরচের খাত পরিবর্তন' : 'নতুন খরচের খাত এন্ট্রি'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">খাতের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md">
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
